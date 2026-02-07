/**
 * Naropo Billing SDK - Payment Gateway Types (PayKit Mode)
 *
 * PROPRIETARY SOFTWARE
 * Copyright © 2026 Naropo. All rights reserved.
 *
 * This module enables external apps to use Naropo as their payment processor,
 * similar to PayKit, Dodo Payments, or Lemon Squeezy.
 */

export type GatewayEnvironment = "sandbox" | "production";
export type GatewayPaymentStatus =
    | "pending"
    | "processing"
    | "succeeded"
    | "failed"
    | "canceled"
    | "refunded"
    | "disputed";

export interface GatewayConfig {
    apiKey: string;
    merchantId: string;
    environment: GatewayEnvironment;
    webhookSecret?: string;
    returnUrl?: string;
    cancelUrl?: string;
    metadata?: Record<string, string>;
}

export interface GatewayMerchant {
    id: string;
    name: string;
    email: string;
    country: string;
    currency: string;
    status: "active" | "pending" | "suspended";
    onboardingCompleted: boolean;
    stripeAccountId?: string;
    platformFeePercent: number;
    createdAt: Date;
}

export interface GatewayCheckoutSession {
    id: string;
    merchantId: string;
    url: string;
    status: "open" | "complete" | "expired";
    mode: "payment" | "subscription" | "setup";
    amount?: number;
    currency: string;
    customerId?: string;
    customerEmail?: string;
    lineItems: GatewayLineItem[];
    successUrl: string;
    cancelUrl: string;
    expiresAt: Date;
    metadata?: Record<string, string>;
}

export interface GatewayLineItem {
    name: string;
    description?: string;
    amount: number;
    currency: string;
    quantity: number;
    imageUrl?: string;
    metadata?: Record<string, string>;
}

export interface GatewayPayment {
    id: string;
    merchantId: string;
    checkoutSessionId?: string;
    amount: number;
    currency: string;
    status: GatewayPaymentStatus;
    paymentMethod?: string;
    customerEmail?: string;
    description?: string;
    platformFee: number;
    netAmount: number;
    stripePaymentIntentId?: string;
    createdAt: Date;
    paidAt?: Date;
    refundedAt?: Date;
    metadata?: Record<string, string>;
}

export interface GatewayRefund {
    id: string;
    paymentId: string;
    amount: number;
    currency: string;
    status: "pending" | "succeeded" | "failed" | "canceled";
    reason?: string;
    createdAt: Date;
    metadata?: Record<string, string>;
}

export interface GatewayPayout {
    id: string;
    merchantId: string;
    amount: number;
    currency: string;
    status: "pending" | "in_transit" | "paid" | "failed" | "canceled";
    arrivalDate?: Date;
    bankAccount?: string;
    createdAt: Date;
}

export interface GatewayWebhookEvent {
    id: string;
    type: GatewayWebhookEventType;
    data: Record<string, unknown>;
    merchantId: string;
    createdAt: Date;
    deliveredAt?: Date;
    retries: number;
}

export type GatewayWebhookEventType =
    | "checkout.session.completed"
    | "checkout.session.expired"
    | "payment.succeeded"
    | "payment.failed"
    | "payment.refunded"
    | "payment.disputed"
    | "subscription.created"
    | "subscription.updated"
    | "subscription.canceled"
    | "payout.paid"
    | "payout.failed";

// Embedded checkout configuration
export interface EmbeddedCheckoutConfig {
    checkoutSessionId?: string;
    clientSecret?: string;
    appearance?: {
        theme?: "light" | "dark" | "auto";
        variables?: Record<string, string>;
    };
    onComplete?: (result: GatewayPayment) => void;
    onCancel?: () => void;
    onError?: (error: Error) => void;
}

// Gateway API client options
export interface GatewayClientOptions {
    config: GatewayConfig;
    baseUrl?: string;
    timeout?: number;
    retries?: number;
}
