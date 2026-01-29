/**
 * Autlify Billing SDK - Billing Components
 * @packageDocumentation
 */

// Display Components
export { SubscriptionCard } from "./subscription-card";
export { UsageDisplay } from "./usage-display";
export { UsageClient } from "./usage-client";
export type { UsageClientProps, UsagePeriod, UsageRow, UsageEventRow, UsageWindow } from "./usage-client";
export { CreditBalanceCard } from "./credit-balance-card";
export { CreditHistory } from "./credit-history";
export { InvoiceList } from "./invoice-list";
export { PaymentMethodsList } from "./payment-methods-list";
export { BillingOverview } from "./billing-overview";

// Alert & Status Components
export { TrialBanner } from "./trial-banner";
export { DunningAlerts } from "./dunning-alerts";

// Table Components
export { DetailedUsageTable } from "./detailed-usage-table";
export type { UsageResource, DetailedUsageTableProps } from "./detailed-usage-table";

// Dialog Components
export { UpdatePlanDialog } from "./update-plan-dialog";
export type { UpdatePlanDialogProps } from "./update-plan-dialog";
export { CancelSubscriptionDialog } from "./cancel-subscription-dialog";
export type { CancelSubscriptionDialogProps } from "./cancel-subscription-dialog";

// Subscription Management (Full component)
export { SubscriptionManagement } from "./subscription-management";
export type { SubscriptionManagementProps } from "./subscription-management";

// Re-export types
export type {
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
    PaymentFormProps,
    CouponInputProps,
    AllocationManagerProps,
    BaseComponentProps,
} from "../types";
