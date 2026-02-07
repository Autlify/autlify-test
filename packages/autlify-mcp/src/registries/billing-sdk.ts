/**
 * Billing SDK Component Registry
 * Simplified version for CLI usage
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
}

export interface ComponentRegistry {
    name: string
    description: string
    category: ComponentCategory
    dependencies: string[]
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
        description: "Display current subscription with pricing, status, and billing information",
        category: "subscription",
        dependencies: [],
        registryDependencies: ["card", "badge", "separator", "button"],
        files: [{ name: "subscription-card.tsx" }],
        meta: {
            source: "https://github.com/Autlify/billing-sdk",
            docs: "/site/docs/billing-sdk",
            examples: ["/site/design#billing-sdk"]
        }
    },
    "plan-selector-dialog": {
        name: "plan-selector-dialog",
        description: "Modal dialog for selecting and comparing subscription plans",
        category: "subscription",
        dependencies: [],
        registryDependencies: ["dialog", "button", "card", "badge"],
        files: [{ name: "plan-selector-dialog.tsx" }],
        meta: {
            source: "https://github.com/Autlify/billing-sdk",
            docs: "/site/docs/billing-sdk",
            examples: ["/site/design#billing-sdk"]
        }
    },
    "cancel-subscription-dialog": {
        name: "cancel-subscription-dialog",
        description: "Cancel subscription flow with reason selection and feedback",
        category: "subscription",
        dependencies: [],
        registryDependencies: ["dialog", "button", "radio-group", "textarea"],
        files: [{ name: "cancel-subscription-dialog.tsx" }],
        meta: {
            source: "https://github.com/Autlify/billing-sdk",
            docs: "/site/docs/billing-sdk"
        }
    },
    "trial-banner": {
        name: "trial-banner",
        description: "Trial expiry notification banner with CTA",
        category: "subscription",
        dependencies: [],
        registryDependencies: ["card", "button"],
        files: [{ name: "trial-banner.tsx" }],
        meta: {
            source: "https://github.com/Autlify/billing-sdk",
            docs: "/site/docs/billing-sdk"
        }
    },
    "payment-methods-list": {
        name: "payment-methods-list",
        description: "Gallery of saved payment methods with 30+ bank card styles",
        category: "payment",
        dependencies: [],
        registryDependencies: ["card", "button"],
        files: [{ name: "payment-methods-list.tsx" }],
        meta: {
            source: "https://github.com/Autlify/billing-sdk",
            docs: "/site/docs/billing-sdk",
            examples: ["/site/design#billing-sdk"]
        }
    },
    "payment-card": {
        name: "payment-card",
        description: "Individual bank card display with automatic BIN detection",
        category: "payment",
        dependencies: [],
        registryDependencies: ["card"],
        files: [{ name: "payment-card.tsx" }],
        meta: {
            source: "https://github.com/Autlify/billing-sdk",
            docs: "/site/docs/billing-sdk"
        }
    },
    "payment-form": {
        name: "payment-form",
        description: "Add new payment method with Stripe Elements integration",
        category: "form",
        dependencies: ["@stripe/react-stripe-js", "@stripe/stripe-js"],
        registryDependencies: ["card", "button", "input", "label"],
        files: [{ name: "payment-form.tsx" }],
        meta: {
            source: "https://github.com/Autlify/billing-sdk",
            docs: "/site/docs/billing-sdk"
        }
    },
    "billing-form": {
        name: "billing-form",
        description: "Billing address and tax information form",
        category: "form",
        dependencies: [],
        registryDependencies: ["card", "input", "label", "select", "button"],
        files: [{ name: "billing-form.tsx" }],
        meta: {
            source: "https://github.com/Autlify/billing-sdk",
            docs: "/site/docs/billing-sdk"
        }
    },
    "invoice-list": {
        name: "invoice-list",
        description: "Invoice history with download and payment status",
        category: "invoice",
        dependencies: [],
        registryDependencies: ["card", "table", "badge", "button"],
        files: [{ name: "invoice-list.tsx" }],
        meta: {
            source: "https://github.com/Autlify/billing-sdk",
            docs: "/site/docs/billing-sdk",
            examples: ["/site/design#billing-sdk"]
        }
    },
    "usage-display": {
        name: "usage-display",
        description: "Resource usage metrics with progress bars and limits",
        category: "table",
        dependencies: [],
        registryDependencies: ["card", "progress"],
        files: [{ name: "usage-display.tsx" }],
        meta: {
            source: "https://github.com/Autlify/billing-sdk",
            docs: "/site/docs/billing-sdk"
        }
    },
    "usage-table": {
        name: "usage-table",
        description: "Detailed usage breakdown table with analytics",
        category: "table",
        dependencies: [],
        registryDependencies: ["card", "table"],
        files: [{ name: "usage-table.tsx" }],
        meta: {
            source: "https://github.com/Autlify/billing-sdk",
            docs: "/site/docs/billing-sdk"
        }
    },
    "credit-balance-card": {
        name: "credit-balance-card",
        description: "Credit balance display with add credits CTA",
        category: "credit",
        dependencies: [],
        registryDependencies: ["card", "button"],
        files: [{ name: "credit-balance-card.tsx" }],
        meta: {
            source: "https://github.com/Autlify/billing-sdk",
            docs: "/site/docs/billing-sdk"
        }
    },
    "credit-history": {
        name: "credit-history",
        description: "Credits transaction history with filters",
        category: "credit",
        dependencies: [],
        registryDependencies: ["card", "table", "badge"],
        files: [{ name: "credit-history.tsx" }],
        meta: {
            source: "https://github.com/Autlify/billing-sdk",
            docs: "/site/docs/billing-sdk"
        }
    },
    "dunning-alerts": {
        name: "dunning-alerts",
        description: "Failed payment warnings and retry actions",
        category: "feedback",
        dependencies: [],
        registryDependencies: ["alert", "button"],
        files: [{ name: "dunning-alerts.tsx" }],
        meta: {
            source: "https://github.com/Autlify/billing-sdk",
            docs: "/site/docs/billing-sdk"
        }
    },
    "payment-success-dialog": {
        name: "payment-success-dialog",
        description: "Payment success confirmation modal",
        category: "feedback",
        dependencies: [],
        registryDependencies: ["dialog", "button"],
        files: [{ name: "payment-success-dialog.tsx" }],
        meta: {
            source: "https://github.com/Autlify/billing-sdk",
            docs: "/site/docs/billing-sdk"
        }
    },
    "payment-failure": {
        name: "payment-failure",
        description: "Payment error state with retry options",
        category: "feedback",
        dependencies: [],
        registryDependencies: ["card", "button", "alert"],
        files: [{ name: "payment-failure.tsx" }],
        meta: {
            source: "https://github.com/Autlify/billing-sdk",
            docs: "/site/docs/billing-sdk"
        }
    },
    "billing-overview": {
        name: "billing-overview",
        description: "Complete billing dashboard with all components",
        category: "subscription",
        dependencies: [],
        registryDependencies: ["card", "tabs"],
        files: [{ name: "billing-overview.tsx" }],
        meta: {
            source: "https://github.com/Autlify/billing-sdk",
            docs: "/site/docs/billing-sdk",
            examples: ["/site/design#billing-sdk"]
        }
    }
}

export const componentNames = Object.keys(billingSDKRegistry)
