import type Stripe from 'stripe'

// ========================================
// SUBSCRIPTION TYPES
// ========================================

export interface SubscriptionState {
  state: 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'CANCELED' | 'PAST_DUE' | 'INCOMPLETE' | 'NONE'
  subscription: any | null
  daysRemaining?: number
  isGracePeriod?: boolean
}

export interface SubscriptionWithPlan {
  id: string
  priceId: string
  customerId: string
  currentPeriodEndDate: Date
  status: string
  cancelAtPeriodEnd: boolean
  canceledAt?: Date
  trialEndedAt?: Date
  plan?: PricingPlan
}

export interface PricingPlan {
  title: string
  description: string
  price: string
  duration: string
  trialPeriod?: number
  highlight?: string
  features: string[]
  entitlementFeatures?: Record<string, number>[]
  priceId: string
  popular?: boolean
}

// ========================================
// PAYMENT METHOD TYPES
// ========================================

export interface PaymentMethodCard {
  id: string
  cardNumber: string
  cardholderName: string
  expiryMonth: string
  expiryYear: string
  variant: 'default' | 'premium' | 'platinum' | 'black'
  isDefault: boolean
  brand: string
  cvv?: string
}

export interface StripePaymentMethodData {
  id: string
  type: string
  card?: Stripe.PaymentMethod.Card
  billing_details?: Stripe.PaymentMethod.BillingDetails
  created: number
}

// ========================================
// INVOICE TYPES
// ========================================

export interface BillingInvoice {
  id: string
  number: string | null
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void'
  amount: number
  currency: string
  created: number
  dueDate: number | null
  paidAt: number | null
  hosted_invoice_url?: string | null
  invoice_pdf?: string | null
  period_start: number
  period_end: number
}

// ========================================
// USAGE & CREDITS TYPES
// ========================================

export interface UsageMetric {
  name: string
  current: number
  limit: number | 'unlimited'
  unit: string
  description?: string
}

export interface CreditBalance {
  total: number
  used: number
  remaining: number
  expiresAt?: Date
  currency: string
}

export interface CreditTransaction {
  id: string
  amount: number
  type: 'PURCHASE' | 'DEDUCTION' | 'REFUND' | 'BONUS'
  description: string
  createdAt: Date
  expiresAt?: Date
}

// ========================================
// COUPON TYPES
// ========================================

export interface CouponData {
  id: string
  name: string
  code: string
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT'
  discountValue: number
  currency?: string
  isActive: boolean
  expiresAt?: Date
  maxRedemptions?: number
  timesRedeemed: number
  createdAt: Date
}

export interface AppliedCoupon {
  id: string
  coupon: CouponData
  appliedAt: Date
  discountAmount: number
}

// ========================================
// DUNNING TYPES
// ========================================

export interface FailedPayment {
  id: string
  invoiceId: string
  attemptedAt: Date
  amount: number
  currency: string
  failureReason: string
  nextRetryAt?: Date
  attemptsRemaining: number
}

export interface DunningStrike {
  id: string
  agencyId: string
  subAccountId?: string
  level: 1 | 2 | 3
  createdAt: Date
  resolvedAt?: Date
  failedPayments: FailedPayment[]
}

// ========================================
// ALLOCATION TYPES
// ========================================

export interface ResourceAllocation {
  id: string
  resourceType: string
  allocated: number
  used: number
  unit: string
  subAccountId?: string
  subAccountName?: string
}

export interface AllocationUpdate {
  resourceType: string
  newAllocation: number
  subAccountId?: string
}

// ========================================
// BILLING OVERVIEW TYPES
// ========================================

export interface BillingOverview {
  currentPlan: PricingPlan
  subscription: SubscriptionState
  paymentMethod?: PaymentMethodCard
  upcomingInvoice?: {
    amount: number
    currency: string
    dueDate: Date
  }
  credits: CreditBalance
  usage: UsageMetric[]
  recentInvoices: BillingInvoice[]
}

// ========================================
// COMPONENT PROP TYPES
// ========================================

export interface SubscriptionCardProps {
  subscription: SubscriptionWithPlan
  state: SubscriptionState['state']
  paymentMethod?: PaymentMethodCard
  onChangePlan?: () => void
  onCancelSubscription?: () => void
}

export interface PlanSelectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPlanId?: string
  plans: PricingPlan[]
  onSelectPlan: (planId: string, billingCycle: 'monthly' | 'yearly') => void | Promise<void>
}

export interface CancelSubscriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCancel: (reason: string, feedback?: string) => void | Promise<void>
  planName?: string
}

export interface InvoiceListProps {
  invoices: BillingInvoice[]
  onDownload?: (invoiceId: string) => void | Promise<void>
}

export interface UsageDisplayProps {
  usage: UsageMetric[]
  className?: string
}

export interface TrialBannerProps {
  trialEndDate: Date
  onUpgrade?: () => void
  features?: string[]
  className?: string
}

export interface CreditBalanceCardProps {
  balance: CreditBalance
  onPurchaseCredits?: () => void
  className?: string
}

export interface CreditHistoryProps {
  transactions: CreditTransaction[]
  className?: string
}

export interface PaymentMethodListProps {
  cards: PaymentMethodCard[]
  onSetDefault?: (cardId: string) => void | Promise<void>
  onRemove?: (cardId: string) => void | Promise<void>
  className?: string
}

export interface CouponsListProps {
  coupons: CouponData[]
  appliedCoupons: AppliedCoupon[]
  onApplyCoupon?: (code: string) => void | Promise<void>
  onRemoveCoupon?: (couponId: string) => void | Promise<void>
  className?: string
}

export interface DunningAlertsProps {
  strikes: DunningStrike[]
  onRetryPayment?: (invoiceId: string) => void | Promise<void>
  className?: string
}

export interface AllocationManagerProps {
  allocations: ResourceAllocation[]
  onUpdateAllocation?: (update: AllocationUpdate) => void | Promise<void>
  className?: string
}
