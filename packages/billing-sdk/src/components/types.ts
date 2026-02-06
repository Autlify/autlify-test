/**
 * Autlify Billing SDK - Component Types
 * Re-exports from main types for component use
 * @packageDocumentation
 */

// Re-export from types module for internal use
export type {
    // Subscription
    SubscriptionStatus,
    BillingCycle,
    SubscriptionState,
    Subscription,
    PricingPlan,
    PlanFeature,
    CurrentPlan,
    SubscriptionAction,
    SubscriptionIntent,
    // Payment
    PaymentMethodType,
    CardBrand,
    CardVariant,
    PaymentMethod,
    CardDetails,
    PaymentMethodCard,
    BillingDetails,
    BillingAddress,
    PaymentIntent,
    SetupIntent,
    PaymentResult,
    FailedPayment,
    // Invoice
    InvoiceStatus,
    Invoice,
    InvoiceLine,
    InvoiceDiscount,
    InvoiceTax,
    UpcomingInvoice,
    CouponDuration,
    DiscountType,
    Coupon,
    AppliedCoupon,
    // Usage & Entitlements
    UsagePeriod,
    MeteringScope,
    MeteringType,
    LimitEnforcement,
    OverageMode,
    UsageMetric,
    UsageEvent,
    UsageSummary,
    Entitlement,
    EntitlementCheck,
    RecordUsageParams,
    ResourceAllocation,
    AllocationUpdate,
    // Credits
    CreditTransactionType,
    CreditBalance,
    AggregatedCreditBalance,
    CreditTransaction,
    CreditTopupParams,
    CreditDeductParams,
    CreditPurchaseIntent,
    CreditPackage,
} from "../types";

// ========================================
// COMPONENT-SPECIFIC PROP TYPES
// ========================================

/**
 * Base props shared by all SDK components
 */
export interface BaseComponentProps {
    className?: string;
}

/**
 * Props for subscription display component
 */
export interface SubscriptionCardProps extends BaseComponentProps {
    plan: {
        name: string;
        price: string;
        billingCycle: string;
        description: string;
        status: "active" | "inactive" | "trialing" | "past_due" | "cancelled";
        features: string[];
    };
    billingInfo: {
        nextBillingDate: string;
        paymentMethod: string;
    };
    onChangePlan?: () => void;
    onCancelSubscription?: () => void;
}

/**
 * Props for plan selector dialog
 */
export interface PlanSelectorDialogProps extends BaseComponentProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentPlanId?: string;
    plans: Array<{
        id: string;
        name: string;
        description: string;
        monthlyPrice: number;
        yearlyPrice: number;
        currency: string;
        features: string[];
        popular?: boolean;
    }>;
    onSelectPlan: (planId: string, billingCycle: "monthly" | "yearly") => void | Promise<void>;
    loading?: boolean;
}

/**
 * Props for cancel subscription dialog
 */
export interface CancelSubscriptionDialogProps extends BaseComponentProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (reason: string, feedback?: string) => void | Promise<void>;
    planName?: string;
    endDate?: Date | string;
    loading?: boolean;
}

/**
 * Props for usage display component
 */
export interface UsageDisplayProps extends BaseComponentProps {
    metrics: Array<{
        name: string;
        current: number;
        limit: number;
        unit: string;
        unlimited?: boolean;
        description?: string;
    }>;
    showProgress?: boolean;
    compact?: boolean;
}

/**
 * Props for invoice list component
 */
export interface InvoiceListProps extends BaseComponentProps {
    invoices: Array<{
        id: string;
        date: string;
        description: string;
        amount: string;
        status: "paid" | "pending" | "failed" | "void";
        downloadUrl?: string;
    }>;
    onDownload?: (invoiceId: string) => void | Promise<void>;
    showPagination?: boolean;
    pageSize?: number;
}

/**
 * Props for payment methods list
 */
export interface PaymentMethodsListProps extends BaseComponentProps {
    paymentMethods: Array<{
        id: string;
        last4: string;
        brand: string;
        expiryMonth: number;
        expiryYear: number;
        isDefault: boolean;
        cardholderName?: string;
    }>;
    onAddCard?: (paymentMethodId: string) => void | Promise<void>;
    onSetDefault?: (methodId: string) => void | Promise<void>;
    onRemoveCard?: (methodId: string) => void | Promise<void>;
    onReplaceCard?: (methodId: string) => void | Promise<void>;
    showAddButton?: boolean;
    emptyMessage?: string;
    clientSecret?: string;
}

/**
 * Props for credit balance card
 */
export interface CreditBalanceCardProps extends BaseComponentProps {
    balance: {
        total: number;
        used: number;
        remaining: number;
        expiresAt?: Date | string;
        currency: string;
    };
    onPurchaseCredits?: () => void;
    showPurchaseButton?: boolean;
}

/**
 * Props for credit history component
 */
export interface CreditHistoryProps extends BaseComponentProps {
    transactions: Array<{
        id: string;
        amount: number;
        type: "PURCHASE" | "DEDUCTION" | "REFUND" | "BONUS" | "EXPIRY";
        description: string;
        createdAt: Date | string;
        expiresAt?: Date | string;
    }>;
    showPagination?: boolean;
    pageSize?: number;
}

/**
 * Props for trial banner component
 */
export interface TrialBannerProps extends BaseComponentProps {
    trialEndDate: Date | string;
    onUpgrade?: () => void;
    features?: string[];
    variant?: "default" | "urgent" | "expired";
}

/**
 * Props for dunning alerts component
 */
export interface DunningAlertsProps extends BaseComponentProps {
    alerts: Array<{
        id: string;
        level: 1 | 2 | 3;
        message: string;
        invoiceId?: string;
        amount?: number;
        currency?: string;
        dueDate?: Date | string;
    }>;
    onRetryPayment?: (invoiceId: string) => void | Promise<void>;
    onUpdatePaymentMethod?: () => void;
}

/**
 * Props for payment form component
 */
export interface PaymentFormProps extends BaseComponentProps {
    onSuccess: (paymentMethodId: string) => void | Promise<void>;
    onError?: (error: Error) => void;
    onCancel?: () => void;
    clientSecret?: string;
    showCardPreview?: boolean;
    buttonText?: string;
    loading?: boolean;
}

/**
 * Props for billing overview component
 */
export interface BillingOverviewProps extends BaseComponentProps {
    overview: {
        subscription: {
            plan: string;
            status: string;
            nextBillingDate?: Date | string;
            amount?: number;
            currency?: string;
        };
        credits?: {
            balance: number;
            currency: string;
        };
        usage?: Array<{
            name: string;
            current: number;
            limit: number;
        }>;
        recentInvoices?: Array<{
            id: string;
            date: string;
            amount: string;
            status: string;
        }>;
    };
    onManageSubscription?: () => void;
    onViewInvoices?: () => void;
    onManageCredits?: () => void;
}

/**
 * Props for coupon input component
 */
export interface CouponInputProps extends BaseComponentProps {
    onApply: (code: string) => void | Promise<void>;
    appliedCoupon?: {
        code: string;
        discount: string;
    };
    onRemove?: () => void;
    loading?: boolean;
    error?: string;
}

/**
 * Props for allocation manager component
 */
export interface AllocationManagerProps extends BaseComponentProps {
    allocations: Array<{
        id: string;
        resourceType: string;
        allocated: number;
        used: number;
        unit: string;
        subAccountId?: string;
        subAccountName?: string;
    }>;
    onUpdateAllocation?: (resourceType: string, newValue: number, subAccountId?: string) => void | Promise<void>;
    showSubAccounts?: boolean;
}
