/**
 * Autlify Billing SDK - Credits & Balance Types
 *
 * PROPRIETARY SOFTWARE
 * Copyright © 2026 Autlify. All rights reserved.
 */

export type CreditTransactionType =
    | "PURCHASE"
    | "DEDUCTION"
    | "REFUND"
    | "BONUS"
    | "EXPIRY"
    | "TRANSFER"
    | "ADJUSTMENT";

export interface CreditBalance {
    featureKey: string;
    balance: number;
    reserved: number;
    available: number;
    expiresAt?: Date;
    currency?: string;
    lastUpdated: Date;
}

export interface AggregatedCreditBalance {
    total: number;
    used: number;
    remaining: number;
    reserved: number;
    currency: string;
    balances: CreditBalance[];
}

export interface CreditTransaction {
    id: string;
    featureKey: string;
    type: CreditTransactionType;
    amount: number;
    balanceAfter: number;
    description: string;
    reference?: string;
    idempotencyKey?: string;
    createdAt: Date;
    expiresAt?: Date;
    metadata?: Record<string, string>;
}

export interface CreditTopupParams {
    agencyId: string;
    subAccountId?: string;
    scope: "AGENCY" | "SUBACCOUNT";
    featureKey: string;
    credits: number;
    expiresAt?: Date;
    description?: string;
    reference?: string;
    idempotencyKey: string;
}

export interface CreditDeductParams {
    agencyId: string;
    subAccountId?: string;
    scope: "AGENCY" | "SUBACCOUNT";
    featureKey: string;
    credits: number;
    description?: string;
    reference?: string;
    idempotencyKey: string;
}

export interface CreditPurchaseIntent {
    clientSecret: string;
    paymentIntentId: string;
    amount: number;
    credits: number;
    currency: string;
    featureKey: string;
    unitPrice: number;
}

// Stripe credit purchase packages
export interface CreditPackage {
    id: string;
    name: string;
    credits: number;
    price: number;
    currency: string;
    savings?: number;
    popular?: boolean;
    stripePriceId?: string;
}
