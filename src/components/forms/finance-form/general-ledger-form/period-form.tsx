
'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
    createFinancialPeriod,
    updateFinancialPeriod,
    closePeriod,
    openPeriod,
} from '@/lib/features/fi/general-ledger/actions/periods'
import {
    lockPeriodSchema,
    openPeriodSchema,
    closePeriodSchema,
    updatePeriodSchema,
    createPeriodSchema
} from '@/lib/schemas/fi/general-ledger/period'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Loader2, CalendarIcon, Lock, Unlock, Play, Pause } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { PeriodStatus, PeriodType } from '../../../../generated/prisma/enums'

// ========== Schema ==========

const periodFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    periodNumber: z.number().min(1).max(12),
    fiscalYear: z.number().min(2020).max(2099),
    startDate: z.date().min(new Date('2000-01-01'), 'Start date is required'),
    endDate: z.date().min(new Date('2000-01-01'), 'End date is required'),
    periodType: z.enum(['MONTH', 'QUARTER', 'HALF_YEAR', 'YEAR', 'CUSTOM']),
}).refine(
    (data) => data.endDate > data.startDate,
    { message: 'End date must be after start date', path: ['endDate'] }
)

type PeriodFormValues = z.infer<typeof periodFormSchema>

// ========== Types ==========

type Period = {
    id: string
    name: string
    periodNumber: number
    fiscalYear: number
    startDate: Date
    endDate: Date
    status: 'OPEN' | 'CLOSED' | 'LOCKED' | 'FUTURE'
    periodType: string
}

type Props = {
    existingPeriod?: Period
    agencyId: string
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

// ========== Component ==========

export function PeriodForm({
    existingPeriod,
    agencyId,
    open,
    onOpenChange,
    onSuccess,
}: Props) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const form = useForm<PeriodFormValues>({
        resolver: zodResolver(periodFormSchema),
        defaultValues: existingPeriod
            ? {
                name: existingPeriod.name,
                periodNumber: existingPeriod.periodNumber,
                fiscalYear: existingPeriod.fiscalYear,
                startDate: new Date(existingPeriod.startDate),
                endDate: new Date(existingPeriod.endDate),
                periodType: existingPeriod.periodType as     'MONTH' | 'QUARTER' | 'HALF_YEAR' | 'YEAR' | 'CUSTOM',
             
            }
            : {
                name: '',
                periodNumber: 1,
                fiscalYear: new Date().getFullYear(),
                periodType: 'MONTH',
                startDate: new Date(),
                endDate: new Date(),
            },
    })

    const onSubmit = (data: PeriodFormValues) => {
        startTransition(async () => {
            try {
                const result = await createFinancialPeriod({
                    name: data.name,
                    periodType: data.periodType as PeriodType,
                    fiscalYear: data.fiscalYear,
                    fiscalPeriod: data.periodNumber,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    isYearEnd: data.periodType === 'YEAR',
                })

                if (result.success) {
                    toast.success('Period created successfully')
                    form.reset()
                    onOpenChange(false)
                    router.refresh()
                    onSuccess?.()
                } else {
                    toast.error(result.error ?? 'Failed to create period')
                }
            } catch (error) {
                toast.error('An error occurred')
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {existingPeriod ? 'Edit Period' : 'Create Financial Period'}
                    </DialogTitle>
                    <DialogDescription>
                        Define a new accounting period for your fiscal year
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Period Name */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Period Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="January 2025" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            {/* Fiscal Year */}
                            <FormField
                                control={form.control}
                                name="fiscalYear"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fiscal Year</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Period Number */}
                            <FormField
                                control={form.control}
                                name="periodNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Period Number</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={12}
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Period Type */}
                        <FormField
                            control={form.control}
                            name="periodType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Period Type</FormLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="MONTH">Monthly</SelectItem>
                                            <SelectItem value="QUARTER">Quarterly</SelectItem>
                                            <SelectItem value="YEAR">Annual</SelectItem>
                                            <SelectItem value="HALF_YEAR">Half-Yearly</SelectItem>
                                            <SelectItem value="CUSTOM">Custom</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            {/* Start Date */}
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Start Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            'w-full pl-3 text-left font-normal',
                                                            !field.value && 'text-muted-foreground'
                                                        )}
                                                    >
                                                        {field.value ? format(field.value, 'PP') : 'Pick'}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* End Date */}
                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>End Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            'w-full pl-3 text-left font-normal',
                                                            !field.value && 'text-muted-foreground'
                                                        )}
                                                    >
                                                        {field.value ? format(field.value, 'PP') : 'Pick'}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {existingPeriod ? 'Update' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

// ========== Period Status Actions Component ==========

export function PeriodStatusActions({
    period,
    onSuccess,
}: {
    period: Period
    onSuccess?: () => void
}) {
    const [isPending, startTransition] = useTransition()

    const handleClose = () => {
        startTransition(async () => {
            const result = await closePeriod(period.id)
            if (result.success) {
                toast.success('Period closed successfully')
                onSuccess?.()
            } else {
                toast.error(result.error ?? 'Failed to close period')
            }
        })
    }

    const handleReopen = () => {
        startTransition(async () => {
            const result = await openPeriod(period.id)
            if (result.success) {
                toast.success('Period reopened successfully')
                onSuccess?.()
            } else {
                toast.error(result.error ?? 'Failed to reopen period')
            }
        })
    }

    const handleStatusChange = (status: PeriodStatus) => {
        startTransition(async () => {
            const result = await updateFinancialPeriod({
                id: period.id,
            })
            if (result.success) {
                toast.success(`Period status updated to ${status}`)
                onSuccess?.()
            } else {
                toast.error(result.error ?? 'Failed to update status')
            }
        })
    }

    return (
        <div className="flex items-center gap-2">
            <Badge
                variant={
                    period.status === 'OPEN'
                        ? 'default'
                        : period.status === 'CLOSED'
                            ? 'secondary'
                            : period.status === 'LOCKED'
                                ? 'destructive'
                                : 'outline'
                }
            >
                {period.status}
            </Badge>

            {period.status === 'OPEN' && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" disabled={isPending}>
                            <Lock className="h-4 w-4 mr-1" />
                            Close
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Close Period?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Closing this period will prevent new journal entries from being posted.
                                This action can be reversed by reopening the period.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleClose}>Close Period</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            {period.status === 'CLOSED' && (
                <Button variant="outline" size="sm" onClick={handleReopen} disabled={isPending}>
                    {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <Unlock className="h-4 w-4 mr-1" />
                            Reopen
                        </>
                    )}
                </Button>
            )}

            {period.status === 'FUTURE' && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange('OPEN')}
                    disabled={isPending}
                >
                    {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <Play className="h-4 w-4 mr-1" />
                            Open
                        </>
                    )}
                </Button>
            )}
        </div>
    )
}