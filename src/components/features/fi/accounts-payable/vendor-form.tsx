'use client'

import * as React from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CreditCard,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  Settings,
  User,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

// ========== Form Schema ==========

const vendorFormSchema = z.object({
  // Basic Info
  code: z.string().min(1, 'Vendor code is required').max(64),
  name: z.string().min(1, 'Vendor name is required').max(255),
  legalName: z.string().max(255).optional().or(z.literal('')),
  taxId: z.string().max(64).optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(32).optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  
  // Address
  addressLine1: z.string().max(255).optional().or(z.literal('')),
  addressLine2: z.string().max(255).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().max(100).optional().or(z.literal('')),
  postalCode: z.string().max(20).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  
  // Payment Terms
  paymentTermDays: z.coerce.number().int().nonnegative().default(30),
  currency: z.string().length(3).default('MYR'),
  creditLimit: z.coerce.number().nonnegative().optional(),
  preferredPaymentMethod: z.enum(['ACH', 'WIRE', 'CHECK', 'CREDIT_CARD', 'CASH', 'OTHER']).optional(),
  paymentHold: z.boolean().default(false),
  paymentHoldReason: z.string().max(500).optional().or(z.literal('')),
  
  // Bank Details
  bankName: z.string().max(255).optional().or(z.literal('')),
  bankAccount: z.string().max(128).optional().or(z.literal('')),
  bankSwiftCode: z.string().max(32).optional().or(z.literal('')),
  bankIban: z.string().max(64).optional().or(z.literal('')),
  bankRoutingNumber: z.string().max(64).optional().or(z.literal('')),
  bankCountryCode: z.string().length(2).optional().or(z.literal('')),
  
  // Additional
  invoiceEmail: z.string().email().optional().or(z.literal('')),
  remittanceEmail: z.string().email().optional().or(z.literal('')),
  notes: z.string().max(5000).optional().or(z.literal('')),
})

type VendorFormValues = z.infer<typeof vendorFormSchema>

// ========== Types ==========

interface VendorFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues?: Partial<VendorFormValues>
  onSubmit: (values: VendorFormValues) => Promise<void>
  mode?: 'create' | 'edit'
}

interface StepInfo {
  id: string
  title: string
  description: string
  icon: React.ElementType
}

// ========== Steps Config ==========

const steps: StepInfo[] = [
  { id: 'basic', title: 'Basic Info', description: 'Vendor identification', icon: User },
  { id: 'address', title: 'Address', description: 'Contact address', icon: MapPin },
  { id: 'payment', title: 'Payment', description: 'Terms and methods', icon: CreditCard },
  { id: 'bank', title: 'Bank Details', description: 'Banking information', icon: Building2 },
]

// ========== Step Components ==========

function BasicInfoStep({ form }: { form: ReturnType<typeof useForm<VendorFormValues>> }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Vendor Code *</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="VND-001" 
                  className="h-12 text-base font-mono"
                />
              </FormControl>
              <FormDescription>Unique identifier for this vendor</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="taxId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Tax ID</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Tax registration number" className="h-12 text-base" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Vendor Name *</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Acme Corporation" className="h-12 text-base" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="legalName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Legal Name</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Registered legal name" className="h-12 text-base" />
            </FormControl>
            <FormDescription>Official registered company name if different</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input {...field} type="email" placeholder="vendor@example.com" className="h-12 pl-10 text-base" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Phone</FormLabel>
              <FormControl>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input {...field} type="tel" placeholder="+60 12-345 6789" className="h-12 pl-10 text-base" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="isActive"
        render={({ field }) => (
          <FormItem className="flex items-center gap-3 space-y-0 rounded-lg border border-white/10 p-4">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-0.5">
              <FormLabel className="text-base">Active Vendor</FormLabel>
              <FormDescription>
                Inactive vendors cannot create new invoices or payments
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
    </div>
  )
}

function AddressStep({ form }: { form: ReturnType<typeof useForm<VendorFormValues>> }) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="addressLine1"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Address Line 1</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Street address" className="h-12 text-base" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="addressLine2"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Address Line 2</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Suite, floor, building" className="h-12 text-base" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">City</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Kuala Lumpur" className="h-12 text-base" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">State / Province</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Selangor" className="h-12 text-base" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="postalCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Postal / ZIP Code</FormLabel>
              <FormControl>
                <Input {...field} placeholder="50450" className="h-12 text-base" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Country</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Malaysia" className="h-12 text-base" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

function PaymentStep({ form }: { form: ReturnType<typeof useForm<VendorFormValues>> }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="paymentTermDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Payment Terms (Days)</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number" 
                  min={0}
                  placeholder="30" 
                  className="h-12 text-base"
                />
              </FormControl>
              <FormDescription>Net payment days from invoice date</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Currency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="MYR">MYR - Malaysian Ringgit</SelectItem>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="creditLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Credit Limit</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number" 
                  min={0}
                  step={0.01}
                  placeholder="0.00" 
                  className="h-12 text-base"
                />
              </FormControl>
              <FormDescription>Maximum outstanding balance allowed</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="preferredPaymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Payment Method</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ACH">ACH / Bank Transfer</SelectItem>
                  <SelectItem value="WIRE">Wire Transfer</SelectItem>
                  <SelectItem value="CHECK">Check</SelectItem>
                  <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="invoiceEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Invoice Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input {...field} type="email" placeholder="ap@vendor.com" className="h-12 pl-10 text-base" />
                </div>
              </FormControl>
              <FormDescription>Where invoices are sent from</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="remittanceEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Remittance Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input {...field} type="email" placeholder="remit@vendor.com" className="h-12 pl-10 text-base" />
                </div>
              </FormControl>
              <FormDescription>Where payment advice is sent</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="paymentHold"
        render={({ field }) => (
          <FormItem className="flex items-start gap-3 space-y-0 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-0.5">
              <FormLabel className="text-base text-amber-400">Payment Hold</FormLabel>
              <FormDescription>
                Block all payments to this vendor until hold is released
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      {form.watch('paymentHold') && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <FormField
            control={form.control}
            name="paymentHoldReason"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">Hold Reason</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Reason for payment hold..." className="min-h-[100px] text-base" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>
      )}
    </div>
  )
}

function BankStep({ form }: { form: ReturnType<typeof useForm<VendorFormValues>> }) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="bankName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Bank Name</FormLabel>
            <FormControl>
              <Input {...field} placeholder="CIMB Bank" className="h-12 text-base" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="bankAccount"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Account Number</FormLabel>
            <FormControl>
              <Input {...field} placeholder="1234567890" className="h-12 text-base font-mono" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="bankSwiftCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">SWIFT / BIC Code</FormLabel>
              <FormControl>
                <Input {...field} placeholder="CIBBMYKL" className="h-12 text-base font-mono uppercase" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bankCountryCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Bank Country</FormLabel>
              <FormControl>
                <Input {...field} placeholder="MY" className="h-12 text-base font-mono uppercase" maxLength={2} />
              </FormControl>
              <FormDescription>2-letter ISO country code</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="bankIban"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">IBAN</FormLabel>
            <FormControl>
              <Input {...field} placeholder="International Bank Account Number" className="h-12 text-base font-mono" />
            </FormControl>
            <FormDescription>Required for international payments</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="bankRoutingNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Routing / Sort Number</FormLabel>
            <FormControl>
              <Input {...field} placeholder="021000021" className="h-12 text-base font-mono" />
            </FormControl>
            <FormDescription>US ACH routing or UK sort code</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Notes</FormLabel>
            <FormControl>
              <Textarea {...field} placeholder="Additional notes about this vendor..." className="min-h-[120px] text-base" />
            </FormControl>
            <FormDescription>Internal notes (not visible to vendor)</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

// ========== Main Component ==========

export function VendorForm({ open, onOpenChange, defaultValues, onSubmit, mode = 'create' }: VendorFormProps) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema) as Resolver<VendorFormValues>,
    defaultValues: {
      code: '',
      name: '',
      legalName: '',
      taxId: '',
      email: '',
      phone: '',
      isActive: true,
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      paymentTermDays: 30,
      currency: 'MYR',
      creditLimit: undefined,
      paymentHold: false,
      paymentHoldReason: '',
      bankName: '',
      bankAccount: '',
      bankSwiftCode: '',
      bankIban: '',
      bankRoutingNumber: '',
      bankCountryCode: '',
      invoiceEmail: '',
      remittanceEmail: '',
      notes: '',
      ...defaultValues,
    },
  })

  // Reset form when opened/closed
  React.useEffect(() => {
    if (open) {
      setCurrentStep(0)
      form.reset({
        code: '',
        name: '',
        legalName: '',
        taxId: '',
        email: '',
        phone: '',
        isActive: true,
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        paymentTermDays: 30,
        currency: 'MYR',
        creditLimit: undefined,
        paymentHold: false,
        paymentHoldReason: '',
        bankName: '',
        bankAccount: '',
        bankSwiftCode: '',
        bankIban: '',
        bankRoutingNumber: '',
        bankCountryCode: '',
        invoiceEmail: '',
        remittanceEmail: '',
        notes: '',
        ...defaultValues,
      })
    }
  }, [open, defaultValues, form])

  const handleSubmit = async (values: VendorFormValues) => {
    setIsSubmitting(true)
    try {
      await onSubmit(values)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = async () => {
    // Validate current step fields
    const fieldsToValidate = getFieldsForStep(currentStep)
    const isValid = await form.trigger(fieldsToValidate)
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const getFieldsForStep = (step: number): (keyof VendorFormValues)[] => {
    switch (step) {
      case 0:
        return ['code', 'name', 'legalName', 'taxId', 'email', 'phone', 'isActive']
      case 1:
        return ['addressLine1', 'addressLine2', 'city', 'state', 'postalCode', 'country']
      case 2:
        return ['paymentTermDays', 'currency', 'creditLimit', 'preferredPaymentMethod', 'invoiceEmail', 'remittanceEmail', 'paymentHold', 'paymentHoldReason']
      case 3:
        return ['bankName', 'bankAccount', 'bankSwiftCode', 'bankIban', 'bankRoutingNumber', 'bankCountryCode', 'notes']
      default:
        return []
    }
  }

  const currentStepInfo = steps[currentStep]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader className="space-y-4">
          <SheetTitle className="text-2xl">
            {mode === 'create' ? 'Create Vendor' : 'Edit Vendor'}
          </SheetTitle>
          <SheetDescription>
            {mode === 'create'
              ? 'Add a new vendor to your accounts payable'
              : 'Update vendor information'}
          </SheetDescription>
        </SheetHeader>

        {/* Step Indicator */}
        <div className="my-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              const isCompleted = index < currentStep
              const isCurrent = index === currentStep

              return (
                <React.Fragment key={step.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (index < currentStep) setCurrentStep(index)
                    }}
                    disabled={index > currentStep}
                    className={cn(
                      'flex flex-col items-center gap-2 transition-colors',
                      index <= currentStep ? 'cursor-pointer' : 'cursor-default',
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all',
                        isCompleted && 'border-emerald-500 bg-emerald-500/20',
                        isCurrent && 'border-blue-500 bg-blue-500/20',
                        !isCompleted && !isCurrent && 'border-white/20 bg-white/5',
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <StepIcon
                          className={cn(
                            'h-5 w-5',
                            isCurrent ? 'text-blue-400' : 'text-muted-foreground',
                          )}
                        />
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-xs font-medium',
                        isCurrent ? 'text-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {step.title}
                    </span>
                  </button>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        'h-0.5 flex-1 mx-2',
                        index < currentStep ? 'bg-emerald-500' : 'bg-white/20',
                      )}
                    />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>

        {/* Form Content */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <Card className="border-white/10 bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <currentStepInfo.icon className="h-5 w-5 text-blue-400" />
                  {currentStepInfo.title}
                </CardTitle>
                <CardDescription>{currentStepInfo.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {currentStep === 0 && <BasicInfoStep form={form} />}
                    {currentStep === 1 && <AddressStep form={form} />}
                    {currentStep === 2 && <PaymentStep form={form} />}
                    {currentStep === 3 && <BankStep form={form} />}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={nextStep} className="gap-2">
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {mode === 'create' ? 'Create Vendor' : 'Save Changes'}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
