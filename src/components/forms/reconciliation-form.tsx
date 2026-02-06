
'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  createReconciliation,
  updateReconciliation,
  completeReconciliation,
} from '@/lib/features/fi/general-ledger/actions/reconciliation'
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
import { Textarea } from '@/components/ui/textarea'
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Loader2, CalendarIcon, CheckCircle, AlertCircle } from 'lucide-react'
import {  formatCurrency } from '@/lib/features/fi/general-ledger/utils/helpers'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

// ========== Schema ==========

const reconciliationFormSchema = z.object({
  accountId: z.string().min(1, 'Account is required'),
  periodId: z.string().min(1, 'Period is required'),
  statementDate: z.date({ error: 'Statement date is required' }),
  statementBalance: z.number({ error: 'Statement balance is required' }),
  notes: z.string().optional(),
})

type ReconciliationFormValues = z.infer<typeof reconciliationFormSchema>

// ========== Types ==========

type Account = {
  id: string
  accountCode: string
  accountName: string
  currentBalance: number
}

type Period = {
  id: string
  name: string
  status: string
}

type Reconciliation = {
  id: string
  accountId: string
  periodId: string
  statementDate: Date
  statementBalance: number
  glBalance: number
  difference: number
  status: string
  notes?: string
}

type Props = {
  accounts: Account[]
  periods: Period[]
  existingReconciliation?: Reconciliation
  agencyId: string
  onSuccess?: () => void
}

// ========== Component ==========

export function ReconciliationForm({
  accounts,
  periods,
  existingReconciliation,
  agencyId,
  onSuccess,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(
    existingReconciliation
      ? accounts.find((a) => a.id === existingReconciliation.accountId) ?? null
      : null
  )

  const form = useForm<ReconciliationFormValues>({
    resolver: zodResolver(reconciliationFormSchema),
    defaultValues: existingReconciliation
      ? {
          accountId: existingReconciliation.accountId,
          periodId: existingReconciliation.periodId,
          statementDate: new Date(existingReconciliation.statementDate),
          statementBalance: existingReconciliation.statementBalance,
          notes: existingReconciliation.notes ?? '',
        }
      : {
          accountId: '',
          periodId: '',
          statementBalance: 0,
          notes: '',
        },
  })

  const watchAccountId = form.watch('accountId')
  const watchStatementBalance = form.watch('statementBalance')

  // Calculate difference
  const glBalance = selectedAccount?.currentBalance ?? 0
  const difference = watchStatementBalance - glBalance

  const onSubmit = (data: ReconciliationFormValues) => {
    startTransition(async () => {
      try {
        const result = existingReconciliation
          ? await updateReconciliation(existingReconciliation.id, {
              statementDate: data.statementDate,
              statementBalance: data.statementBalance,
              bookBalance: glBalance,
              notes: data.notes,
            })
          : await createReconciliation({
              accountId: data.accountId,
              periodId: data.periodId,
              statementDate: data.statementDate,
              statementBalance: data.statementBalance,
              bookBalance: glBalance,
              notes: data.notes,
            })

        if (result.success) {
          toast.success(
            existingReconciliation
              ? 'Reconciliation updated'
              : 'Reconciliation created'
          )
          router.refresh()
          onSuccess?.()
        } else {
          toast.error(result.error ?? 'Failed to save reconciliation')
        }
      } catch (error) {
        toast.error('An error occurred')
      }
    })
  }

  const handleComplete = () => {
    if (!existingReconciliation) return

    startTransition(async () => {
      try {
        const result = await completeReconciliation(existingReconciliation.id)

        if (result.success) {
          toast.success('Reconciliation completed')
          router.refresh()
          onSuccess?.()
        } else {
          toast.error(result.error ?? 'Failed to complete reconciliation')
        }
      } catch (error) {
        toast.error('An error occurred')
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {existingReconciliation ? 'Edit Reconciliation' : 'New Reconciliation'}
            </CardTitle>
            <CardDescription>
              Reconcile account balances with external statements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Account Selection */}
            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value)
                      setSelectedAccount(accounts.find((a) => a.id === value) ?? null)
                    }}
                    disabled={!!existingReconciliation}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account to reconcile" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.accountCode} - {account.accountName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Period Selection */}
            <FormField
              control={form.control}
              name="periodId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Period</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!!existingReconciliation}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {periods
                        .filter((p) => p.status !== 'CLOSED')
                        .map((period) => (
                          <SelectItem key={period.id} value={period.id}>
                            {period.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Statement Date */}
            <FormField
              control={form.control}
              name="statementDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Statement Date</FormLabel>
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
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
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

            {/* Statement Balance */}
            <FormField
              control={form.control}
              name="statementBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statement Balance</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    The balance shown on the external statement
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Balance Comparison */}
            {selectedAccount && (
              <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">GL Balance</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(glBalance, 'USD')}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Statement Balance</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(watchStatementBalance, 'USD')}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Difference</p>
                  <p
                    className={cn(
                      'text-lg font-semibold',
                      Math.abs(difference) < 0.01
                        ? 'text-green-600'
                        : 'text-red-600'
                    )}
                  >
                    {formatCurrency(difference, 'USD')}
                  </p>
                </div>
              </div>
            )}

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Add reconciliation notes..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {existingReconciliation ? 'Update' : 'Create'}
              </Button>
              {existingReconciliation && Math.abs(difference) < 0.01 && (
                <Button
                  type="button"
                  variant="default"
                  onClick={handleComplete}
                  disabled={isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
} 