/**
 * Billing SDK Re-exports
 * 
 * This module re-exports from @autlify/billing-sdk for backward compatibility.
 * For new code, import directly from '@autlify/billing-sdk/components'.
 */

// Re-export SDK components with original names for backward compatibility
export { 
  SubscriptionManagement,
  UpdatePlanDialog,
  DetailedUsageTable,
  CancelSubscriptionDialog,
  UsageClient,
} from "@autlify/billing-sdk/components";

// Re-export types from SDK
export type { Plan, CurrentPlanUI } from "@autlify/billing-sdk/types";

// Re-export component types
export type {
  UsageResource,
  DetailedUsageTableProps,
  UpdatePlanDialogProps,
  CancelSubscriptionDialogProps,
  SubscriptionManagementProps,
  UsageClientProps,
  UsagePeriod,
  UsageRow,
  UsageEventRow,
  UsageWindow,
} from "@autlify/billing-sdk/components";

// Legacy app components (not yet migrated to SDK)
export { SubscriptionCard } from './subscription-card'
export { PlanSelectorDialog } from './plan-selector-dialog'

// Billing & Invoices
export { InvoiceList } from './invoice-list'
export { BillingOverview } from './billing-overview'

// Usage & Limits
export { UsageDisplay } from './usage-display'

// Credits
export { CreditBalanceCard } from './credit-balance-card'
export { CreditHistory } from './credit-history'

// Payment Methods
export { PaymentMethodsList } from './payment-methods-list'
export { PaymentCard } from './payment-card'
export { PaymentForm } from './payment-form'
export { BillingForm } from './billing-form'

// Alerts & Notifications
export { TrialBanner } from './trial-banner'
export { DunningAlerts } from './dunning-alerts'
export { PaymentSuccessDialog } from './payment-success-dialog'
export { PaymentFailure } from './payment-failure'

// Tables
export { UsageTable } from './usage-table'

// Types
export * from './types'
