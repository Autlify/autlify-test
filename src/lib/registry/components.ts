/**
 * Billing SDK Component Registry
 * 
 * Component metadata for CLI installation and documentation generation.
 * Follows shadcn/ui registry patterns for component management.
 */

export type ComponentCategory = 
  | "subscription"
  | "payment"
  | "invoice"
  | "credit"
  | "feedback"
  | "form"
  | "table"

export interface ComponentFile {
  name: string
  content?: string
}

export interface ComponentDependency {
  name: string
  version?: string
}

export interface ComponentRegistry {
  name: string
  type: "component"
  description: string
  category: ComponentCategory
  subcategory?: string
  dependencies: string[]
  devDependencies?: string[]
  registryDependencies: string[]
  files: ComponentFile[]
  meta: {
    source: string
    docs: string
    examples?: string[]
  }
}

export const billingSDKRegistry: Record<string, ComponentRegistry> = {
  "subscription-card": {
    name: "subscription-card",
    type: "component",
    description: "Display current subscription with pricing, status, and billing information",
    category: "subscription",
    dependencies: [],
    registryDependencies: ["card", "badge", "separator", "button"],
    files: [
      {
        name: "subscription-card.tsx",
      },
    ],
    meta: {
      source: "@/components/billing-sdk/subscription-card",
      docs: "/site/docs/billing-sdk#subscription-card",
      examples: ["/site/design#billing-sdk"],
    },
  },
  
  "plan-selector-dialog": {
    name: "plan-selector-dialog",
    type: "component",
    description: "Interactive plan selection dialog with monthly/yearly toggle and feature comparison",
    category: "subscription",
    dependencies: [],
    registryDependencies: ["dialog", "button", "badge", "tabs"],
    files: [
      {
        name: "plan-selector-dialog.tsx",
      },
    ],
    meta: {
      source: "@/components/billing-sdk/plan-selector-dialog",
      docs: "/site/docs/billing-sdk#plan-selector-dialog",
    },
  },
  
  "cancel-subscription-dialog": {
    name: "cancel-subscription-dialog",
    type: "component",
    description: "Cancellation flow with feedback collection and confirmation",
    category: "subscription",
    dependencies: [],
    registryDependencies: ["dialog", "button", "textarea"],
    files: [
      {
        name: "cancel-subscription-dialog.tsx",
      },
    ],
    meta: {
      source: "@/components/billing-sdk/cancel-subscription-dialog",
      docs: "/site/docs/billing-sdk#cancel-subscription-dialog",
    },
  },
  
  "payment-methods-list": {
    name: "payment-methods-list",
    type: "component",
    description: "Gallery view of saved payment methods with card management",
    category: "payment",
    dependencies: [],
    registryDependencies: ["card", "dialog", "dropdown-menu", "bank-card"],
    files: [
      {
        name: "payment-methods-list.tsx",
      },
    ],
    meta: {
      source: "@/components/billing-sdk/payment-methods-list",
      docs: "/site/docs/billing-sdk#payment-methods-list",
    },
  },
  
  "payment-card": {
    name: "payment-card",
    type: "component",
    description: "Individual payment card display with action menu (set default, update, remove)",
    category: "payment",
    dependencies: [],
    registryDependencies: ["bank-card", "dropdown-menu", "dialog"],
    files: [
      {
        name: "payment-card.tsx",
      },
    ],
    meta: {
      source: "@/components/billing-sdk/payment-card",
      docs: "/site/docs/billing-sdk#payment-card",
    },
  },
  
  "payment-form": {
    name: "payment-form",
    type: "component",
    description: "Add new payment method with Stripe Elements integration",
    category: "payment",
    dependencies: ["@stripe/stripe-js", "@stripe/react-stripe-js"],
    registryDependencies: ["card", "button", "input", "bank-card"],
    files: [
      {
        name: "payment-form.tsx",
      },
    ],
    meta: {
      source: "@/components/billing-sdk/payment-form",
      docs: "/site/docs/billing-sdk#payment-form",
    },
  },
  
  "billing-form": {
    name: "billing-form",
    type: "component",
    description: "Billing address and company information form with validation",
    category: "form",
    dependencies: [],
    registryDependencies: ["card", "button", "input", "select"],
    files: [
      {
        name: "billing-form.tsx",
      },
    ],
    meta: {
      source: "@/components/billing-sdk/billing-form",
      docs: "/site/docs/billing-sdk#billing-form",
    },
  },
  
  "invoice-list": {
    name: "invoice-list",
    type: "component",
    description: "Tabular list of invoices with status badges and download links",
    category: "invoice",
    dependencies: [],
    registryDependencies: ["card", "badge", "button", "table"],
    files: [
      {
        name: "invoice-list.tsx",
      },
    ],
    meta: {
      source: "@/components/billing-sdk/invoice-list",
      docs: "/site/docs/billing-sdk#invoice-list",
    },
  },
  
  "usage-display": {
    name: "usage-display",
    type: "component",
    description: "Visual progress bars for resource usage metrics",
    category: "invoice",
    dependencies: [],
    registryDependencies: ["card", "progress", "badge"],
    files: [
      {
        name: "usage-display.tsx",
      },
    ],
    meta: {
      source: "@/components/billing-sdk/usage-display",
      docs: "/site/docs/billing-sdk#usage-display",
    },
  },
  
  "usage-table": {
    name: "usage-table",
    type: "component",
    description: "Detailed usage breakdown table with CSV export functionality",
    category: "table",
    dependencies: [],
    registryDependencies: ["card", "table", "button"],
    files: [
      {
        name: "usage-table.tsx",
      },
    ],
    meta: {
      source: "@/components/billing-sdk/usage-table",
      docs: "/site/docs/billing-sdk#usage-table",
    },
  },
  
  "credit-balance-card": {
    name: "credit-balance-card",
    type: "component",
    description: "Credit balance display with purchase option and usage statistics",
    category: "credit",
    dependencies: [],
    registryDependencies: ["card", "button", "progress"],
    files: [
      {
        name: "credit-balance-card.tsx",
      },
    ],
    meta: {
      source: "@/components/billing-sdk/credit-balance-card",
      docs: "/site/docs/billing-sdk#credit-balance-card",
    },
  },
  
  "credit-history": {
    name: "credit-history",
    type: "component",
    description: "Transaction history for credit usage with type badges",
    category: "credit",
    dependencies: [],
    registryDependencies: ["card", "badge"],
    files: [
      {
        name: "credit-history.tsx",
      },
    ],
    meta: {
      source: "@/components/billing-sdk/credit-history",
      docs: "/site/docs/billing-sdk#credit-history",
    },
  },
  
  "trial-banner": {
    name: "trial-banner",
    type: "component",
    description: "Trial expiry countdown notification with upgrade CTA",
    category: "feedback",
    dependencies: [],
    registryDependencies: ["card", "button", "badge"],
    files: [
      {
        name: "trial-banner.tsx",
      },
    ],
    meta: {
      source: "@/components/billing-sdk/trial-banner",
      docs: "/site/docs/billing-sdk#trial-banner",
    },
  },
  
  "dunning-alerts": {
    name: "dunning-alerts",
    type: "component",
    description: "Failed payment warnings with retry functionality",
    category: "feedback",
    dependencies: [],
    registryDependencies: ["card", "badge", "button"],
    files: [
      {
        name: "dunning-alerts.tsx",
      },
    ],
    meta: {
      source: "@/components/billing-sdk/dunning-alerts",
      docs: "/site/docs/billing-sdk#dunning-alerts",
    },
  },
  
  "payment-success-dialog": {
    name: "payment-success-dialog",
    type: "component",
    description: "Success confirmation dialog with transaction details and receipt download",
    category: "feedback",
    dependencies: [],
    registryDependencies: ["dialog", "button"],
    files: [
      {
        name: "payment-success-dialog.tsx",
      },
    ],
    meta: {
      source: "@/components/billing-sdk/payment-success-dialog",
      docs: "/site/docs/billing-sdk#payment-success-dialog",
    },
  },
  
  "payment-failure": {
    name: "payment-failure",
    type: "component",
    description: "Payment failure state with common reasons and retry options",
    category: "feedback",
    dependencies: [],
    registryDependencies: ["card", "button"],
    files: [
      {
        name: "payment-failure.tsx",
      },
    ],
    meta: {
      source: "@/components/billing-sdk/payment-failure",
      docs: "/site/docs/billing-sdk#payment-failure",
    },
  },
  
  "billing-overview": {
    name: "billing-overview",
    type: "component",
    description: "Complete billing dashboard showing plan, usage, invoices, and credits",
    category: "subscription",
    subcategory: "overview",
    dependencies: [],
    registryDependencies: ["card", "badge", "progress"],
    files: [
      {
        name: "billing-overview.tsx",
      },
    ],
    meta: {
      source: "@/components/billing-sdk/billing-overview",
      docs: "/site/docs/billing-sdk#billing-overview",
    },
  },
}

// Helper to get all components by category
export const getComponentsByCategory = (category: ComponentCategory) => {
  return Object.values(billingSDKRegistry).filter(c => c.category === category)
}

// Helper to get component metadata
export const getComponent = (name: string) => {
  return billingSDKRegistry[name]
}

// Export all component names
export const componentNames = Object.keys(billingSDKRegistry)
