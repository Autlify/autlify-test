/**
 * Autlify Billing SDK
 *
 * PROPRIETARY SOFTWARE - API Key Required
 * Copyright © 2026 Autlify. All rights reserved.
 *
 * A comprehensive billing and subscription management SDK for React applications.
 * Supports internal billing, external API integrations, and payment gateway (PayKit) mode.
 *
 * Get your API key: https://naropo.com/dashboard/api-keys
 * Whitelisted domains: localhost, *.naropo.com, *.autlify.dev
 *
 * @packageDocumentation
 */

// ============================================
// LICENSE & CONFIGURATION
// ============================================

export { initLicense, isInternalEnvironment, LicenseValidator } from "./license";
export type { LicenseConfig } from "./license";

export type { BillingSDKConfig, StripeConfig, ComponentConfig } from "./config";

// ============================================
// CORE - Provider, Hooks & API Client
// ============================================

export {
    // Provider
    BillingProvider,
    useBillingContext,
    useBillingProviderAvailable,
    // API Client
    createBillingApiClient,
    // Hooks
    useSubscription,
    usePaymentMethods,
    useInvoices,
    useUsage,
    useEntitlement,
    useCredits,
    useCoupons,
    useBilling,
    useBillingOptional,
} from "./core";

export type {
    BillingProviderConfig,
    BillingProviderProps,
    BillingContextState,
    BillingApiClient,
    BillingApiClientConfig,
} from "./core";

// ============================================
// TYPES - All billing type definitions
// ============================================

export type {
    // Common
    Currency,
    Locale,
    PaginationParams,
    PaginatedResponse,
    ApiResponse,
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
} from "./types";

// ============================================
// GATEWAY - Payment Gateway (PayKit Mode)
// ============================================

export {
    // Client
    createGatewayClient,
    // Components
    EmbeddedCheckout,
    PaymentButton,
} from "./gateway";

export type {
    // Client types
    GatewayClient,
    CreateCheckoutParams,
    CreatePaymentLinkParams,
    RefundParams,
    // Component types
    EmbeddedCheckoutProps,
    PaymentButtonProps,
    // Gateway types
    GatewayConfig,
    GatewayEnvironment,
    GatewayMerchant,
    GatewayCheckoutSession,
    GatewayLineItem,
    GatewayPayment,
    GatewayPaymentStatus,
    GatewayRefund,
    GatewayPayout,
    GatewayWebhookEvent,
    GatewayWebhookEventType,
    GatewayClientOptions,
    EmbeddedCheckoutConfig,
} from "./gateway";

// ============================================
// REGISTRY - Component Registry for CLI
// ============================================

export type {
    ComponentCategory,
    ComponentFile,
    ComponentRegistry,
} from "./registry";

export { billingSDKRegistry, componentNames } from "./registry";

// ============================================
// COMPONENTS - UI Components
// ============================================

export {
    // Billing Display
    SubscriptionCard,
    UsageDisplay,
    CreditBalanceCard,
    CreditHistory,
    InvoiceList,
    PaymentMethodsList,
    BillingOverview,
    // Alerts
    TrialBanner,
    DunningAlerts,
    // Dialogs
    PlanSelectorDialog,
    CancelSubscriptionDialog,
    UpdatePlanDialog,
    // UI Primitives
    Button,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
    Badge,
    Progress,
    Separator,
    Input,
    Label,
    Skeleton,
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    UIProvider,
    useUI,
} from "./components";

export type {
    // Component Props
    SubscriptionCardProps,
    UsageDisplayProps,
    CreditBalanceCardProps,
    CreditHistoryProps,
    InvoiceListProps,
    PaymentMethodsListProps,
    BillingOverviewProps,
    TrialBannerProps,
    DunningAlertsProps,
    PlanSelectorDialogProps,
    PlanOption,
    CancelSubscriptionDialogProps,
    PaymentFormProps,
    CouponInputProps,
    AllocationManagerProps,
    BaseComponentProps,
    // UI Props
    ButtonProps,
    CardProps,
    BadgeProps,
    ProgressProps,
    DialogProps,
    InputProps,
    UIComponents,
} from "./components";

// ============================================
// UTILS - Utility Functions
// ============================================

export {
    cn,
    formatCurrency,
    formatCurrencyMajor,
    formatDate,
    formatDateShort,
    formatRelativeTime,
    formatNumber,
    formatPercent,
    getUsagePercentage,
    getUsageColorClass,
    getUsageBgClass,
    maskCardNumber,
    formatCardExpiry,
    getCardBrandName,
    getDaysRemaining,
    isInGracePeriod,
    debounce,
} from "./utils";

// ============================================
// VERSION
// ============================================

export const SDK_VERSION = "0.3.0";
export const SDK_NAME = "@autlify/billing-sdk";
