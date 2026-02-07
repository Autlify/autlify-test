/**
 * Naropo Billing SDK - Components Module
 * 
 * This module exports all UI components for billing, subscription management,
 * payment methods, credits, and usage display.
 * 
 * @example
 * ```tsx
 * import { 
 *   SubscriptionCard, 
 *   UsageDisplay, 
 *   CreditBalanceCard 
 * } from '@naropo/billing-sdk/components';
 * ```
 * 
 * @packageDocumentation
 */

// ========================================
// BILLING COMPONENTS
// ========================================

export {
    // Display
    SubscriptionCard,
    UsageDisplay,
    UsageClient,
    CreditBalanceCard,
    CreditHistory,
    InvoiceList,
    PaymentMethodsList,
    BillingOverview,
    // Alerts
    TrialBanner,
    DunningAlerts,
    // Tables
    DetailedUsageTable,
    // Dialogs
    PlanSelectorDialog,
    CancelSubscriptionDialog,
    UpdatePlanDialog,
    // Complex Components
    SubscriptionManagement,
} from "./billing";

// ========================================
// UI PRIMITIVES
// ========================================

export {
    // Core
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
    // Table
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    // Dialog
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    // Context
    UIProvider,
    useUI,
} from "./ui";

// ========================================
// COMPONENT TYPES
// ========================================

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
    PaymentFormProps,
    CouponInputProps,
    AllocationManagerProps,
    BaseComponentProps,
} from "./types";

// Export types from new components
export type { UsageResource, DetailedUsageTableProps } from "./billing/detailed-usage-table";
export type { UpdatePlanDialogProps } from "./billing/update-plan-dialog";
export type { PlanSelectorDialogProps, PlanOption } from "./billing/plan-selector-dialog";
export type { CancelSubscriptionDialogProps } from "./billing/cancel-subscription-dialog";
export type { SubscriptionManagementProps } from "./billing/subscription-management";
export type { UsageClientProps, UsagePeriod, UsageRow, UsageEventRow, UsageWindow } from "./billing/usage-client";

export type {
    // UI Primitive Props
    ButtonProps,
    CardProps,
    BadgeProps,
    ProgressProps,
    DialogProps,
    InputProps,
    UIComponents,
} from "./ui";

// ========================================
// COMMON COMPONENTS
// ========================================

export {
    // Loading Skeletons
    Skeletons,
    SubscriptionCardSkeleton,
    UsageDisplaySkeleton,
    InvoiceListSkeleton,
    CreditBalanceSkeleton,
    CreditHistorySkeleton,
    PaymentMethodsSkeleton,
    BillingOverviewSkeleton,
    // Error Handling
    BillingErrorBoundary,
    BillingErrorCard,
    useBillingErrorHandler,
} from "./common";
