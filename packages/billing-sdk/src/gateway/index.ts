/**
 * Autlify Billing SDK - Payment Gateway Module
 *
 * PROPRIETARY SOFTWARE
 * Copyright © 2026 Autlify. All rights reserved.
 *
 * Enables external apps to use Autlify as their payment processor.
 */

// Client
export {
    createGatewayClient,
    type GatewayClient,
    type CreateCheckoutParams,
    type CreatePaymentLinkParams,
    type RefundParams,
} from "./client";

// Components
export {
    EmbeddedCheckout,
    PaymentButton,
    type EmbeddedCheckoutProps,
    type PaymentButtonProps,
} from "./embedded-checkout";

// Re-export types for convenience
export type {
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
} from "../types/gateway";
