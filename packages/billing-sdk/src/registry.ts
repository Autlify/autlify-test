/**
 * Billing SDK Component Registry
 *
 * PROPRIETARY SOFTWARE
 * Copyright © 2026 Autlify. All rights reserved.
 */

export type ComponentCategory =
    | "subscription"
    | "payment"
    | "invoice"
    | "credit"
    | "usage"
    | "feedback"
    | "form"
    | "table"
    | "gateway"
    | "provider";

export interface ComponentFile {
    name: string;
    path?: string;
}

export interface ComponentRegistry {
    name: string;
    description: string;
    category: ComponentCategory;
    dependencies: string[];
    registryDependencies: string[];
    files: ComponentFile[];
    meta: {
        source: string;
        docs: string;
        examples?: string[];
    };
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
            source: "https://github.com/autlify/billing-sdk",
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
            source: "https://github.com/autlify/billing-sdk",
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
            source: "https://github.com/autlify/billing-sdk",
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
            source: "https://github.com/autlify/billing-sdk",
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
            source: "https://github.com/autlify/billing-sdk",
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
            source: "https://github.com/autlify/billing-sdk",
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
            source: "https://github.com/autlify/billing-sdk",
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
            source: "https://github.com/autlify/billing-sdk",
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
            source: "https://github.com/autlify/billing-sdk",
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
            source: "https://github.com/autlify/billing-sdk",
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
            source: "https://github.com/autlify/billing-sdk",
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
            source: "https://github.com/autlify/billing-sdk",
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
            source: "https://github.com/autlify/billing-sdk",
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
            source: "https://github.com/autlify/billing-sdk",
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
            source: "https://github.com/autlify/billing-sdk",
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
            source: "https://github.com/autlify/billing-sdk",
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
            source: "https://github.com/autlify/billing-sdk",
            docs: "/site/docs/billing-sdk",
            examples: ["/site/design#billing-sdk"]
        }
    },
    // Provider & Core
    "billing-provider": {
        name: "billing-provider",
        description: "React context provider for billing state and actions",
        category: "provider",
        dependencies: [],
        registryDependencies: [],
        files: [
            { name: "provider.tsx", path: "core/" },
            { name: "hooks.ts", path: "core/" },
            { name: "api-client.ts", path: "core/" },
        ],
        meta: {
            source: "https://github.com/autlify/billing-sdk",
            docs: "/site/docs/billing-sdk/provider"
        }
    },
    // Usage Components
    "usage-client": {
        name: "usage-client",
        description: "Full usage page with summary, events, and export",
        category: "usage",
        dependencies: [],
        registryDependencies: ["card", "table", "badge", "button", "select", "input"],
        files: [{ name: "usage-client.tsx" }],
        meta: {
            source: "https://github.com/autlify/billing-sdk",
            docs: "/site/docs/billing-sdk/usage"
        }
    },
    "detailed-usage-table": {
        name: "detailed-usage-table",
        description: "Detailed usage breakdown table with progress bars",
        category: "usage",
        dependencies: [],
        registryDependencies: ["card", "table", "progress", "badge"],
        files: [{ name: "detailed-usage-table.tsx" }],
        meta: {
            source: "https://github.com/autlify/billing-sdk",
            docs: "/site/docs/billing-sdk/usage"
        }
    },
    // Credits Components
    "credits-client": {
        name: "credits-client",
        description: "Credits management page with balances and top-up",
        category: "credit",
        dependencies: [],
        registryDependencies: ["card", "table", "badge", "button", "dialog", "input", "select"],
        files: [{ name: "credits-client.tsx" }],
        meta: {
            source: "https://github.com/autlify/billing-sdk",
            docs: "/site/docs/billing-sdk/credits"
        }
    },
    // Coupon Components
    "coupon-client": {
        name: "coupon-client",
        description: "Coupon validation and application component",
        category: "invoice",
        dependencies: [],
        registryDependencies: ["card", "input", "button", "badge"],
        files: [{ name: "coupon-client.tsx" }],
        meta: {
            source: "https://github.com/autlify/billing-sdk",
            docs: "/site/docs/billing-sdk/coupons"
        }
    },
    // Subscription Management
    "subscription-management": {
        name: "subscription-management",
        description: "Full subscription management with plan change and cancel",
        category: "subscription",
        dependencies: [],
        registryDependencies: ["card", "badge", "button", "separator", "dialog"],
        files: [
            { name: "subscription-management.tsx" },
            { name: "update-plan-dialog.tsx" },
            { name: "cancel-subscription-dialog.tsx" },
        ],
        meta: {
            source: "https://github.com/autlify/billing-sdk",
            docs: "/site/docs/billing-sdk/subscription",
            examples: ["/site/design#billing-sdk"]
        }
    },
    // Gateway Components (PayKit Mode)
    "embedded-checkout": {
        name: "embedded-checkout",
        description: "Embeddable checkout for payment gateway integration",
        category: "gateway",
        dependencies: [],
        registryDependencies: [],
        files: [{ name: "embedded-checkout.tsx", path: "gateway/" }],
        meta: {
            source: "https://github.com/autlify/billing-sdk",
            docs: "/site/docs/billing-sdk/gateway"
        }
    },
    "payment-button": {
        name: "payment-button",
        description: "One-click payment button for quick integrations",
        category: "gateway",
        dependencies: [],
        registryDependencies: [],
        files: [{ name: "embedded-checkout.tsx", path: "gateway/" }],
        meta: {
            source: "https://github.com/autlify/billing-sdk",
            docs: "/site/docs/billing-sdk/gateway"
        }
    },
    "gateway-client": {
        name: "gateway-client",
        description: "Payment gateway API client for merchants",
        category: "gateway",
        dependencies: [],
        registryDependencies: [],
        files: [{ name: "client.ts", path: "gateway/" }],
        meta: {
            source: "https://github.com/autlify/billing-sdk",
            docs: "/site/docs/billing-sdk/gateway"
        }
    }
}

export const componentNames = Object.keys(billingSDKRegistry)
