'use client'

import * as React from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertCircle,
  Building2,
  Check,
  ChevronRight,
  CreditCard,
  Globe,
  Loader2,
  Settings,
  Shield,
  Wallet,
  Zap,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// ========== Schema ==========

const bankAccountFormSchema = z.object({
  // Basic Info
  accountCode: z.string().min(1, 'Account code is required').max(20),
  accountName: z.string().min(1, 'Account name is required').max(100),
  description: z.string().max(500).optional(),

  // Bank Details
  bankName: z.string().min(1, 'Bank name is required').max(100),
  accountNumber: z.string().min(1, 'Account number is required').max(50),
  iban: z.string().max(34).optional(),
  swiftBic: z.string().min(8).max(11).optional(),
  routingNumber: z.string().max(20).optional(),
  sortCode: z.string().max(8).optional(),
  branchCode: z.string().max(20).optional(),
  branchName: z.string().max(100).optional(),

  // Account Configuration
  accountType: z.enum([
    'OPERATING',
    'SAVINGS',
    'MONEY_MARKET',
    'PAYROLL',
    'TAX',
    'ESCROW',
    'PETTY_CASH',
    'MERCHANT',
    'INVESTMENT',
    'FOREIGN',
    'VIRTUAL',
    'CREDIT_LINE',
  ]),
  currencyCode: z.string().length(3, 'Currency code must be 3 characters'),
  glAccountId: z.string().uuid('Select a valid GL account').optional(),

  // Connection
  connectionType: z.enum([
    'MANUAL',
    'FILE_IMPORT',
    'OPEN_BANKING',
    'PLAID',
    'YODLEE',
    'STRIPE',
    'DIRECT_API',
    'SWIFT',
    'BACS',
    'ACH',
    'SEPA',
  ]),
  autoSync: z.boolean().default(false),

  // Limits
  overdraftLimit: z.coerce.number().min(0).optional(),
  dailyPaymentLimit: z.coerce.number().min(0).optional(),
  singlePaymentLimit: z.coerce.number().min(0).optional(),

  // Account Holder
  accountHolderName: z.string().min(1, 'Account holder name is required').max(100),
  accountHolderType: z.enum(['BUSINESS', 'INDIVIDUAL']).default('BUSINESS'),

  // Settings
  isDefault: z.boolean().default(false),
  isPrimaryOperating: z.boolean().default(false),
  requiresDualApproval: z.boolean().default(false),

  // Bank Address (optional)
  bankAddressLine1: z.string().max(100).optional(),
  bankAddressLine2: z.string().max(100).optional(),
  bankCity: z.string().max(50).optional(),
  bankState: z.string().max(50).optional(),
  bankPostalCode: z.string().max(20).optional(),
  bankCountry: z.string().length(2).optional(),
})

type BankAccountFormValues = z.infer<typeof bankAccountFormSchema>

// ========== Types ==========

interface BankAccountFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  initialData?: Partial<BankAccountFormValues>
  glAccounts?: { id: string; code: string; name: string }[]
  onSubmit: (data: BankAccountFormValues) => Promise<void>
}

// ========== Constants ==========

const ACCOUNT_TYPES = [
  { value: 'OPERATING', label: 'Operating', description: 'Main business checking account' },
  { value: 'SAVINGS', label: 'Savings', description: 'Interest-bearing savings account' },
  { value: 'MONEY_MARKET', label: 'Money Market', description: 'Higher yield money market' },
  { value: 'PAYROLL', label: 'Payroll', description: 'Dedicated payroll account' },
  { value: 'TAX', label: 'Tax', description: 'Tax payment reserve account' },
  { value: 'ESCROW', label: 'Escrow', description: 'Trust/escrow account' },
  { value: 'PETTY_CASH', label: 'Petty Cash', description: 'Small cash expenses' },
  { value: 'MERCHANT', label: 'Merchant', description: 'Payment processing account' },
  { value: 'INVESTMENT', label: 'Investment', description: 'Short-term investments' },
  { value: 'FOREIGN', label: 'Foreign Currency', description: 'Foreign currency account' },
  { value: 'VIRTUAL', label: 'Virtual', description: 'Digital/virtual account' },
  { value: 'CREDIT_LINE', label: 'Credit Line', description: 'Overdraft/credit facility' },
]

const CONNECTION_TYPES = [
  { value: 'MANUAL', label: 'Manual Entry', icon: CreditCard },
  { value: 'FILE_IMPORT', label: 'File Import', icon: Building2 },
  { value: 'OPEN_BANKING', label: 'Open Banking', icon: Zap },
  { value: 'PLAID', label: 'Plaid', icon: Zap },
  { value: 'ACH', label: 'ACH Network', icon: Globe },
  { value: 'SEPA', label: 'SEPA', icon: Globe },
]

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
]

// ========== Step Indicator ==========

function StepIndicator({
  steps,
  currentStep,
  onStepClick,
}: {
  steps: { id: string; title: string; icon: React.ElementType }[]
  currentStep: number
  onStepClick?: (step: number) => void
}) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => {
        const StepIcon = step.icon
        const isActive = index === currentStep
        const isCompleted = index < currentStep

        return (
          <React.Fragment key={step.id}>
            <button
              type="button"
              onClick={() => onStepClick?.(index)}
              disabled={!onStepClick}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all',
                isActive && 'bg-gradient-to-r from-blue-600 to-purple-600 text-white',
                isCompleted && 'bg-emerald-500/20 text-emerald-400',
                !isActive && !isCompleted && 'bg-white/5 text-muted-foreground',
                onStepClick && 'cursor-pointer hover:bg-white/10'
              )}
            >
              {isCompleted ? (
                <Check className="h-4 w-4" />
              ) : (
                <StepIcon className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{step.title}</span>
            </button>
            {index < steps.length - 1 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ========== Main Component ==========

export function BankAccountForm({
  open,
  onOpenChange,
  mode,
  initialData,
  glAccounts = [],
  onSubmit,
}: BankAccountFormProps) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const steps = [
    { id: 'basic', title: 'Basic Info', icon: Building2 },
    { id: 'bank', title: 'Bank Details', icon: CreditCard },
    { id: 'connection', title: 'Connection', icon: Zap },
    { id: 'settings', title: 'Settings', icon: Settings },
  ]

  const form = useForm<BankAccountFormValues>({
    resolver: zodResolver(bankAccountFormSchema) as Resolver<BankAccountFormValues>,
    defaultValues: {
      accountCode: '',
      accountName: '',
      description: '',
      bankName: '',
      accountNumber: '',
      iban: '',
      swiftBic: '',
      routingNumber: '',
      sortCode: '',
      branchCode: '',
      branchName: '',
      accountType: 'OPERATING',
      currencyCode: 'USD',
      connectionType: 'MANUAL',
      autoSync: false,
      accountHolderName: '',
      accountHolderType: 'BUSINESS',
      isDefault: false,
      isPrimaryOperating: false,
      requiresDualApproval: false,
      ...initialData,
    },
  })

  // Reset form when opening
  React.useEffect(() => {
    if (open) {
      setCurrentStep(0)
      form.reset({
        accountCode: '',
        accountName: '',
        description: '',
        bankName: '',
        accountNumber: '',
        iban: '',
        swiftBic: '',
        routingNumber: '',
        sortCode: '',
        branchCode: '',
        branchName: '',
        accountType: 'OPERATING',
        currencyCode: 'USD',
        connectionType: 'MANUAL',
        autoSync: false,
        accountHolderName: '',
        accountHolderType: 'BUSINESS',
        isDefault: false,
        isPrimaryOperating: false,
        requiresDualApproval: false,
        ...initialData,
      })
    }
  }, [open, initialData, form])

  const handleSubmit = async (data: BankAccountFormValues) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save bank account:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const connectionType = form.watch('connectionType')

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto" showX>
        <SheetHeader className="space-y-1">
          <SheetTitle className="text-2xl font-bold">
            {mode === 'create' ? 'Add Bank Account' : 'Edit Bank Account'}
          </SheetTitle>
          <SheetDescription>
            {mode === 'create'
              ? 'Set up a new bank account for your organization'
              : 'Update bank account details and settings'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8">
          <StepIndicator
            steps={steps}
            currentStep={currentStep}
            onStepClick={setCurrentStep}
          />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <AnimatePresence mode="wait">
                {/* Step 1: Basic Info */}
                {currentStep === 0 && (
                  <motion.div
                    key="basic"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="grid gap-6 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="accountCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">Account Code *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., BANK-001" className="h-12 text-base" {...field} />
                            </FormControl>
                            <FormDescription>Unique identifier for this account</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="currencyCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">Currency *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 text-base">
                                  <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {CURRENCIES.map((currency) => (
                                  <SelectItem key={currency.code} value={currency.code}>
                                    <span className="flex items-center gap-2">
                                      <span className="font-mono">{currency.code}</span>
                                      <span className="text-muted-foreground">- {currency.name}</span>
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="accountName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Account Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Main Operating Account" className="h-12 text-base" {...field} />
                          </FormControl>
                          <FormDescription>Display name for this bank account</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="accountType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Account Type *</FormLabel>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {ACCOUNT_TYPES.slice(0, 6).map((type) => (
                              <button
                                key={type.value}
                                type="button"
                                onClick={() => field.onChange(type.value)}
                                className={cn(
                                  'flex flex-col items-start rounded-xl border-2 p-4 text-left transition-all',
                                  field.value === type.value
                                    ? 'border-blue-500 bg-blue-500/10'
                                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                                )}
                              >
                                <span className="font-semibold text-base">{type.label}</span>
                                <span className="text-sm text-muted-foreground">{type.description}</span>
                              </button>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Optional notes about this account..."
                              className="min-h-[100px] text-base resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}

                {/* Step 2: Bank Details */}
                {currentStep === 1 && (
                  <motion.div
                    key="bank"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="grid gap-6 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="bankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">Bank Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Chase Bank" className="h-12 text-base" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="branchName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">Branch Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Main Street Branch" className="h-12 text-base" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Account Number *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter account number"
                              className="h-12 text-base font-mono"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>Your bank account number (securely stored)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-6 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="routingNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">Routing / ABA Number</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 021000021" className="h-12 text-base font-mono" {...field} />
                            </FormControl>
                            <FormDescription>US routing number</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="sortCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">Sort Code</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 12-34-56" className="h-12 text-base font-mono" {...field} />
                            </FormControl>
                            <FormDescription>UK sort code</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator className="my-6" />

                    <div className="grid gap-6 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="iban"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">IBAN</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., GB82WEST12345698765432" className="h-12 text-base font-mono" {...field} />
                            </FormControl>
                            <FormDescription>International Bank Account Number</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="swiftBic"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold">SWIFT / BIC</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., CHASUS33" className="h-12 text-base font-mono" {...field} />
                            </FormControl>
                            <FormDescription>8-11 character code</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="accountHolderName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Account Holder Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Name on the account" className="h-12 text-base" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="accountHolderType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Account Holder Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 text-base">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="BUSINESS">Business Account</SelectItem>
                              <SelectItem value="INDIVIDUAL">Individual Account</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}

                {/* Step 3: Connection */}
                {currentStep === 2 && (
                  <motion.div
                    key="connection"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="connectionType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Connection Type</FormLabel>
                          <FormDescription className="text-sm mb-4">
                            Choose how this account connects to banking systems
                          </FormDescription>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {CONNECTION_TYPES.map((type) => {
                              const Icon = type.icon
                              return (
                                <button
                                  key={type.value}
                                  type="button"
                                  onClick={() => field.onChange(type.value)}
                                  className={cn(
                                    'flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all',
                                    field.value === type.value
                                      ? 'border-blue-500 bg-blue-500/10'
                                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                                  )}
                                >
                                  <div className={cn(
                                    'rounded-lg p-2.5',
                                    field.value === type.value ? 'bg-blue-500/20' : 'bg-white/10'
                                  )}>
                                    <Icon className="h-5 w-5" />
                                  </div>
                                  <span className="font-semibold text-base">{type.label}</span>
                                </button>
                              )
                            })}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {connectionType !== 'MANUAL' && (
                      <>
                        <Separator />

                        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5" />
                            <div>
                              <p className="font-semibold text-amber-400">Connection Required</p>
                              <p className="text-sm text-amber-300/80 mt-1">
                                After saving, you&apos;ll be redirected to connect this account via{' '}
                                {connectionType.replace(/_/g, ' ')}.
                              </p>
                            </div>
                          </div>
                        </div>

                        <FormField
                          control={form.control}
                          name="autoSync"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                              <div className="space-y-1">
                                <FormLabel className="text-base font-semibold">Auto-Sync Transactions</FormLabel>
                                <FormDescription>
                                  Automatically import new transactions
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    <FormField
                      control={form.control}
                      name="glAccountId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Link to GL Account</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 text-base">
                                <SelectValue placeholder="Select GL account..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {glAccounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                  <span className="flex items-center gap-2">
                                    <span className="font-mono text-muted-foreground">{account.code}</span>
                                    <span>{account.name}</span>
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Link this bank account to a General Ledger control account
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}

                {/* Step 4: Settings */}
                {currentStep === 3 && (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Account Flags</h3>
                      
                      <FormField
                        control={form.control}
                        name="isPrimaryOperating"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <FormLabel className="text-base font-semibold">Primary Operating Account</FormLabel>
                                <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                                  Important
                                </Badge>
                              </div>
                              <FormDescription>
                                Main account for daily business operations
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isDefault"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                            <div className="space-y-1">
                              <FormLabel className="text-base font-semibold">Default Account</FormLabel>
                              <FormDescription>
                                Use as default for new transactions
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="requiresDualApproval"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <FormLabel className="text-base font-semibold">Dual Approval Required</FormLabel>
                                <Shield className="h-4 w-4 text-blue-400" />
                              </div>
                              <FormDescription>
                                Require two approvers for payments
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Payment Limits</h3>
                      
                      <div className="grid gap-6 sm:grid-cols-3">
                        <FormField
                          control={form.control}
                          name="overdraftLimit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold">Overdraft Limit</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  className="h-12 text-base font-mono"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="dailyPaymentLimit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold">Daily Limit</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  className="h-12 text-base font-mono"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="singlePaymentLimit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold">Single Payment Limit</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  className="h-12 text-base font-mono"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="h-12 px-6"
                >
                  Previous
                </Button>

                {currentStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 px-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        {mode === 'create' ? 'Create Account' : 'Save Changes'}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
