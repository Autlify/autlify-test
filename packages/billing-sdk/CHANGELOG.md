# Changelog

All notable changes to the Autlify Billing SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial billing SDK package structure
- Component registry system with metadata for 18 billing components
- CLI tool for component installation and management
- `list` command to browse available components
- `add` command to install components with dependencies
- `init` command to set up billing SDK structure
- `info` command to get component details
- TypeScript type definitions for all components
- Comprehensive README with usage examples
- Development guide with best practices
- Support for both npm and bun package managers

### Components Included (v0.1.0)

#### Subscription Management
- SubscriptionCard - Current subscription display with pricing and status
- PlanSelectorDialog - Plan selection and comparison modal
- CancelSubscriptionDialog - Subscription cancellation flow
- TrialBanner - Trial expiry notifications
- BillingOverview - Complete billing dashboard

#### Payment Methods
- PaymentMethodsList - Gallery of saved payment methods with 30+ bank card styles
- PaymentCard - Individual bank card display with BIN detection
- PaymentForm - Add payment method with Stripe Elements
-BillingForm - Billing address and tax information

#### Invoices & Usage
- InvoiceList - Invoice history with download and status
- UsageDisplay - Resource usage metrics with progress bars
- UsageTable - Detailed usage breakdown table

#### Credits
- CreditBalanceCard - Credit balance display
- CreditHistory - Credit transactions history

#### Feedback & Alerts
- DunningAlerts - Failed payment warnings
- PaymentSuccessDialog - Success confirmation modal
- PaymentFailure - Error state with retry options

### Technical Features
- Full TypeScript support with comprehensive type definitions
- Dark mode support across all components
- Tailwind CSS styling with theme integration
- Stripe Elements integration for payment forms
- Radix UI primitives for accessible components
- Tree-shaking support for optimal bundle size
- CommonJS and ESM module formats
- Source maps for debugging

---

## [0.1.0] - 2026-01-27

### Added
- Initial release of Autlify Billing SDK
- 18 premium billing and subscription components
- CLI tool for component management
- Component registry system
- TypeScript definitions
- Comprehensive documentation

[Unreleased]: https://github.com/autlify/billing-sdk/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/autlify/billing-sdk/releases/tag/v0.1.0
