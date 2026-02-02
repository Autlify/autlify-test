export type BillingScope = "agency" | "subAccount";
export type BillingClientProps = {
  scope: BillingScope
  scopeId: string
  section: string
}

// ============================================================================
// Payment Types
// ============================================================================
export type BankCard = {
  id: string;
  cardNumber: string;
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  variant: "default" | "premium" | "platinum" | "black";
  isDefault?: boolean;
  brand?: string;
};

export interface PaymentMethodsCardProps {
  agencyId: string;
  cards: BankCard[];
  className?: string;
}

export interface Invoice {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: "paid" | "pending" | "failed";
  viewUrl?: string;
  downloadUrl?: string;
}

export interface InvoiceListCardProps {
  invoices: Invoice[];
  className?: string;
}

export interface PaymentClientProps {
  /** Scope type */
  scope: BillingScope;
  /** Agency or SubAccount ID */
  scopeId: string;
  /** Stripe Customer ID (required for fetching data) */
  customerId?: string | null;
  /** Agency/Account name for display */
  name?: string;
  /** Show payment methods section (default: true) */
  showPaymentMethods?: boolean;
  /** Show invoices section (default: true) */
  showInvoices?: boolean;
  /** Show dunning section for overdue invoices (default: false) */
  showDunning?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export interface DunningInvoice {
  id: string;
  number: string;
  status: 'open' | 'uncollectible';
  date: string;
  dueDate: string | null;
  amount: string;
  currency: string;
  hostedUrl: string | null;
} 

// ============================================================================
// Usage Types
// ============================================================================
export type UsageRow = {
  featureKey: string;
  currentUsage: string;
  maxAllowed: string | null;
  isUnlimited: boolean;
  period: string;
};

export type UsageEventRow = {
  id: string;
  createdAt: string;
  featureKey: string;
  quantity: string;
  actionKey: string | null;
  idempotencyKey: string;
};

export type SummaryResponse = {
  ok: true;
  scope: "AGENCY" | "SUBACCOUNT";
  agencyId: string;
  subAccountId: string | null;
  period: string;
  periodsBack: number;
  window: { periodStart: string; periodEnd: string };
  rows: UsageRow[];
};

export type EventsResponse = {
  ok: true;
  window: { periodStart: string; periodEnd: string };
  events: UsageEventRow[];
};

export interface UsageResource {
  name: string;
  used: number;
  limit: number;
  percentage?: number;
  unit?: string;
}

export interface UsageDetailsTableProps {
  className?: string;
  title?: string;
  description?: string;
  resources: UsageResource[];
}

export interface AllocationCardProps {
  className?: string;
}

export interface UsageClientProps {
  /** The scope type - either 'agency' or 'subAccount' */
  scope: BillingScope;
  /** The ID of the agency or sub-account */
  scopeId: string;
  /** Optional: Whether to show the cost allocation section */
  showAllocation?: boolean;
  /** Optional: Default period for usage view */
  defaultPeriod?: "MONTHLY" | "WEEKLY" | "DAILY" | "YEARLY";
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Promotional Types
// ============================================================================

export interface PromotionalClientProps {
  /** The scope type - either 'agency' or 'subAccount' */
  scope: BillingScope;
  /** The ID of the agency or sub-account */
  scopeId: string;
  /** Optional: Whether to show the credits section */
  showCredits?: boolean;
  /** Optional: Whether to show the coupons section */
  showCoupons?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export interface Entitlement {
  key: string;
  title?: string;
  creditEnabled?: boolean;
  creditExpires?: boolean;
  period?: string;
  scope?: string;
}

export interface CreditsBalanceRow {
  featureKey: string;
  balance: string;
  expiresAt: string | null;
}

export interface Coupon {
  id: string;
  percent_off: number | null;
  amount_off: number | null;
  currency: string | null;
  duration: string;
  duration_in_months: number | null;
}


export interface CouponCardProps {
  className?: string;
}

// ============================================================================
// CREDITS CARD - Credit Balances & Top-Up
// ============================================================================

export interface CreditsCardProps {
  agencyId: string;
  subAccountId?: string | null;
  className?: string;
}


export interface CreditBalance {
  total: number
  used: number
  remaining: number
  expiresAt?: Date
  currency: string
}

export interface CreditBalanceCardProps {
  balance: CreditBalance
  onPurchaseCredits?: () => void
  className?: string
}


// ============================================================================
// SUBSCRIPTION MANAGEMENT TYPES
// ============================================================================

export interface Plan {
  id: string;
  title: string;
  description: string;
  highlight?: boolean;
  type?: "monthly" | "yearly";
  currency?: string;
  monthlyPrice: number | string;
  yearlyPrice: number | string;
  buttonText: string;
  badge?: string;
  features: {
    name: string;
    icon: string;
    iconColor?: string;
  }[];
}

export interface CurrentPlan {
  plan: Plan;
  type: "monthly" | "yearly" | "custom";
  price: string;
  nextBillingDate: string;
  paymentMethod: string;
  status: "active" | "inactive" | "past_due" | "cancelled";
}

export interface TrialExpiryCardProps {
  trialEndDate?: Date | string | number;
  daysRemaining?: number;
  onUpgrade?: () => void | Promise<void>;
  className?: string;
  title?: string;
  description?: string;
  upgradeButtonText?: string;
  features?: string[];
}

export interface TrialTimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface CancelSubscriptionDialogProps {
  title: string;
  description: string;
  plan: Plan;
  triggerButtonText?: string;
  leftPanelImageUrl?: string;
  warningTitle?: string;
  warningText?: string;
  keepButtonText?: string;
  continueButtonText?: string;
  finalTitle?: string;
  finalSubtitle?: string;
  finalWarningText?: string;
  goBackButtonText?: string;
  confirmButtonText?: string;
  open?: boolean;
  onCancel: (planId: string) => Promise<void> | void;
  onKeepSubscription?: (planId: string) => Promise<void> | void;
  onDialogClose?: () => void;
  className?: string;
}

export interface UpdatePlanDialogProps {
  currentPlan: Plan;
  plans: Plan[];
  triggerText: string;
  onPlanChange: (planId: string) => void;
  className?: string;
  title?: string;
}


export interface SubscriptionManagementProps {
  className?: string;
  currentPlan: CurrentPlan;
  cancelSubscription: CancelSubscriptionDialogProps;
  updatePlan: UpdatePlanDialogProps;
}

export interface SubscriptionClientProps {
  scope: BillingScope
  scopeId: string
}
