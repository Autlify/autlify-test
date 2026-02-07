/**
 * Naropo Billing SDK - Invoice Types
 *
 * PROPRIETARY SOFTWARE
 * Copyright © 2026 Naropo. All rights reserved.
 */

export type InvoiceStatus =
    | "draft"
    | "open"
    | "paid"
    | "uncollectible"
    | "void";

export interface Invoice {
    id: string;
    number: string | null;
    status: InvoiceStatus;
    amount: number;
    amountPaid: number;
    amountRemaining: number;
    currency: string;
    created: Date;
    dueDate: Date | null;
    paidAt: Date | null;
    hostedInvoiceUrl?: string | null;
    invoicePdf?: string | null;
    periodStart: Date;
    periodEnd: Date;
    description?: string;
    lines?: InvoiceLine[];
    discount?: InvoiceDiscount;
    tax?: InvoiceTax;
    metadata?: Record<string, string>;
}

export interface InvoiceLine {
    id: string;
    description: string;
    amount: number;
    quantity: number;
    unitAmount: number;
    currency: string;
    priceId?: string;
    productId?: string;
    periodStart?: Date;
    periodEnd?: Date;
}

export interface InvoiceDiscount {
    couponId?: string;
    couponCode?: string;
    amount: number;
    percentOff?: number;
}

export interface InvoiceTax {
    amount: number;
    rate?: number;
    inclusive: boolean;
    taxId?: string;
}

export interface UpcomingInvoice {
    amount: number;
    currency: string;
    dueDate: Date;
    periodStart: Date;
    periodEnd: Date;
    lines?: InvoiceLine[];
    prorations?: InvoiceLine[];
}

// Coupon types
export type CouponDuration = "once" | "repeating" | "forever";
export type DiscountType = "percentage" | "fixed_amount";

export interface Coupon {
    id: string;
    code: string;
    name?: string;
    discountType: DiscountType;
    discountValue: number;
    currency?: string;
    duration: CouponDuration;
    durationInMonths?: number;
    isActive: boolean;
    redeemBy?: Date;
    maxRedemptions?: number;
    timesRedeemed: number;
    metadata?: Record<string, string>;
}

export interface AppliedCoupon {
    id: string;
    coupon: Coupon;
    customerId: string;
    subscriptionId?: string;
    appliedAt: Date;
    discountAmount: number;
    endsAt?: Date;
}
