/**
 * Autlify Billing SDK - Payment Types
 *
 * PROPRIETARY SOFTWARE
 * Copyright © 2026 Autlify. All rights reserved.
 */

export type PaymentMethodType =
    | "card"
    | "bank_transfer"
    | "fpx"
    | "grabpay"
    | "alipay"
    | "wechat"
    | "paynow"
    | "promptpay";

export type CardBrand =
    | "visa"
    | "mastercard"
    | "amex"
    | "discover"
    | "diners"
    | "jcb"
    | "unionpay"
    | "unknown";

export type CardVariant =
    | "default"
    | "premium"
    | "platinum"
    | "black"
    | "gold"
    | "titanium"
    | "signature";

export interface PaymentMethod {
    id: string;
    type: PaymentMethodType;
    isDefault: boolean;
    createdAt: Date;
    card?: CardDetails;
    billingDetails?: BillingDetails;
    metadata?: Record<string, string>;
}

export interface CardDetails {
    last4: string;
    brand: CardBrand;
    expiryMonth: number;
    expiryYear: number;
    cardholderName?: string;
    fingerprint?: string;
    funding?: "credit" | "debit" | "prepaid" | "unknown";
    country?: string;
}

export interface PaymentMethodCard {
    id: string;
    cardNumber: string; // Masked: •••• •••• •••• 1234
    cardholderName: string;
    expiryMonth: string;
    expiryYear: string;
    variant: CardVariant;
    isDefault: boolean;
    brand: CardBrand;
    cvv?: string;
}

export interface BillingDetails {
    name?: string;
    email?: string;
    phone?: string;
    address?: BillingAddress;
}

export interface BillingAddress {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
}

export interface PaymentIntent {
    id: string;
    clientSecret: string;
    amount: number;
    currency: string;
    status:
    | "requires_payment_method"
    | "requires_confirmation"
    | "requires_action"
    | "processing"
    | "requires_capture"
    | "canceled"
    | "succeeded";
    paymentMethodId?: string;
    metadata?: Record<string, string>;
}

export interface SetupIntent {
    id: string;
    clientSecret: string;
    status:
    | "requires_payment_method"
    | "requires_confirmation"
    | "requires_action"
    | "processing"
    | "canceled"
    | "succeeded";
    paymentMethodId?: string;
    usage: "off_session" | "on_session";
}

export interface PaymentResult {
    success: boolean;
    paymentIntentId?: string;
    paymentMethodId?: string;
    error?: string;
    errorCode?: string;
    requiresAction?: boolean;
    redirectUrl?: string;
}

export interface FailedPayment {
    id: string;
    invoiceId: string;
    attemptedAt: Date;
    amount: number;
    currency: string;
    failureReason: string;
    failureCode?: string;
    nextRetryAt?: Date;
    attemptsRemaining: number;
}
