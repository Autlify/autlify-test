# Autlify Billing SDK

Premium billing and subscription components for React applications. Built with TypeScript, Tailwind CSS, and Radix UI.

## ⚠️ Proprietary Software - API Key Required

This SDK requires a valid Autlify API key. **Not open source.**

### Get Your API Key

🔑 **Get API Key**: https://naropo.com/dashboard/api-keys

### Internal Use (No API Key Needed)

Whitelisted domains:
- `localhost` (all ports)
- `*.naropo.com`
- `*.autlify.dev`

## Features

- 🎨 **18 Premium Components** - Complete billing and subscription management
- 💳 **30+ Bank Card Styles** - Malaysian and international banks with automatic BIN detection
- 🎭 **Dark Mode Support** - Beautiful themes that adapt to your app
- 📦 **TypeScript First** - Full type safety with comprehensive definitions
- ⚡ **Stripe Integration** - Built-in Stripe Elements support
- 🎯 **Fully Customizable** - Every component accepts custom props and styling

## Installation

### 1. Get API Key

Visit https://naropo.com/dashboard/api-keys to get your API key.

### 2. Set Environment Variable

```bash
# .env.local
AUTLIFY_API_KEY=your_api_key_here
```

### 3. Install SDK

### Using CLI (Recommended)

```bash
# Initialize the SDK
bunx @autlify/billing-sdk init

# Add individual components
bunx @autlify/billing-sdk add subscription-card
bunx @autlify/billing-sdk add payment-methods-list
bunx @autlify/billing-sdk add invoice-list
```

### Using npm/bun

```bash
bun add @autlify/billing-sdk
# or
npm install @autlify/billing-sdk
```

## Quick Start

### 1. Initialize License

```tsx
import { initLicense } from "@autlify/billing-sdk"

// In your app initialization (e.g., _app.tsx or layout.tsx)
await initLicense({
  apiKey: process.env.AUTLIFY_API_KEY
})
```

### 2. Use Components

```tsx
import { SubscriptionCard } from "@/components/billing-sdk"

const MyBillingPage = async () => {
  return (
    <SubscriptionCard
      plan={{
        name: "Professional Plan",
        price: "$49",
        billingCycle: "month",
        description: "Perfect for growing teams",
        status: "active",
        features: ["Unlimited projects", "Priority support"]
      }}
      billingInfo={{
        nextBillingDate: "February 27, 2026",
        paymentMethod: "•••• 4242"
      }}
      onChangePlan={() => console.log("Change plan")}
      onCancelSubscription={() => console.log("Cancel")}
    />
  )
}

export default MyBillingPage
```

## Components

### Subscription Management
- `SubscriptionCard` - Current subscription display
- `PlanSelectorDialog` - Plan selection with comparison
- `CancelSubscriptionDialog` - Cancellation flow
- `TrialBanner` - Trial expiry notifications
- `BillingOverview` - Complete dashboard

### Payment Methods
- `PaymentMethodsList` - Saved cards gallery
- `PaymentCard` - Individual card display
- `PaymentForm` - Add new payment method
- `BillingForm` - Billing address form

### Invoices & Usage
- `InvoiceList` - Invoice history
- `UsageDisplay` - Resource usage metrics
- `UsageTable` - Detailed usage breakdown

### Credits & Alerts
- `CreditBalanceCard` - Credit balance display
- `CreditHistory` - Credit transactions
- `DunningAlerts` - Failed payment warnings

### Feedback
- `PaymentSuccessDialog` - Success confirmation
- `PaymentFailure` - Error state with retry

## CLI Commands

```bash
# List all components
bunx @autlify/billing-sdk list

# Filter by category
bunx @autlify/billing-sdk list --category payment

# Add component
bunx @autlify/billing-sdk add subscription-card

# Custom installation path
bunx @autlify/billing-sdk add payment-form --path src/components/custom

# Skip dependencies
bunx @autlify/billing-sdk add invoice-list --skip-deps
```

## Documentation

- [Full Documentation](https://naropo.com/site/docs/billing-sdk)
- [Live Examples](https://naropo.com/site/design#billing-sdk)
- [API Reference](https://naropo.com/site/docs/billing-sdk#reference)

## TypeScript Support

All components are fully typed with comprehensive TypeScript definitions:

```tsx
import type {
  SubscriptionPlan,
  BillingInfo,
  Invoice,
  UsageMetric,
  CreditBalance,
} from "@/components/billing-sdk"
```

## Styling

Components use Tailwind CSS and support customization via `className` prop:

```tsx
<SubscriptionCard
  className="max-w-2xl mx-auto"
  plan={plan}
  billingInfo={billingInfo}
/>
```

## Stripe Integration

Payment components integrate with Stripe Elements:

```tsx
import { Elements } from "@stripe/react-stripe-js"
import { PaymentForm } from "@/components/billing-sdk"

const CheckoutPage = async ({ stripePromise }) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm
        onSuccess={(paymentMethod) => console.log(paymentMethod)}
        onError={(error) => console.error(error)}
      />
    </Elements>
  )
}

export default CheckoutPage
```

## License

**PROPRIETARY** - This is not open source software.

- Requires valid Autlify API key
- See [LICENSE](./LICENSE) for full terms
- Internal Autlify domains are whitelisted
- Unauthorized use is prohibited

**Get API Key**: https://naropo.com/dashboard/api-keys

## Support

- [GitHub Issues](https://github.com/autlify/billing-sdk/issues)
- [Documentation](https://naropo.com/site/docs/billing-sdk)
- [Contact Support](https://naropo.com/site/contact)
