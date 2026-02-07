/**
 * Naropo Billing SDK - Subscription Types
 *
 * PROPRIETARY SOFTWARE
 * Copyright © 2026 Naropo. All rights reserved.
 */

export type SubscriptionStatus =
    | "ACTIVE"
    | "TRIAL"
    | "EXPIRED"
    | "CANCELED"
    | "PAST_DUE"
    | "INCOMPLETE"
    | "INCOMPLETE_EXPIRED"
    | "PAUSED"
    | "NONE";

export type BillingCycle = "monthly" | "yearly" | "one_time";

export interface SubscriptionState {
    state: SubscriptionStatus;
    subscription: Subscription | null;
    daysRemaining?: number;
    isGracePeriod?: boolean;
    trialDaysRemaining?: number;
}

export interface Subscription {
    id: string;
    priceId: string;
    productId?: string;
    customerId: string;
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    canceledAt?: Date | null;
    trialStart?: Date | null;
    trialEnd?: Date | null;
    metadata?: Record<string, string>;
    plan?: PricingPlan;
}

export interface PricingPlan {
    id: string;
    priceId: string;
    productId?: string;
    title: string;
    description: string;
    currency: string;
    monthlyPrice: number;
    yearlyPrice?: number;
    duration: BillingCycle;
    trialDays?: number;
    highlight?: string;
    features: PlanFeature[];
    entitlements?: Record<string, number | boolean | string>;
    popular?: boolean;
    recommended?: boolean;
    sortOrder?: number;
    metadata?: Record<string, string>;
}

export interface PlanFeature {
    name: string;
    description?: string;
    included: boolean;
    limit?: number | "unlimited";
    unit?: string;
}

/**
 * UI-friendly Plan type for SDK components
 * Compatible with billing dialogs and cards
 */
export interface Plan {
    id: string;
    title: string;
    description: string;
    highlight?: boolean;
    type?: BillingCycle;
    currency?: string;
    monthlyPrice: string;
    yearlyPrice: string;
    buttonText: string;
    badge?: string;
    features: {
        name: string;
        icon?: string;
        iconColor?: string;
    }[];
}

/**
 * UI-friendly CurrentPlan for SDK components
 */
export interface CurrentPlanUI {
    plan: Plan;
    type: "monthly" | "yearly" | "custom";
    price?: string;
    nextBillingDate: string;
    paymentMethod: string;
    status: "active" | "inactive" | "past_due" | "cancelled";
}

export interface CurrentPlan {
    plan: PricingPlan;
    status: SubscriptionStatus;
    type: BillingCycle;
    price: string;
    nextBillingDate: string;
    paymentMethod: string;
    cancelAtPeriodEnd?: boolean;
}

export interface SubscriptionAction {
    type: "create" | "update" | "cancel" | "resume" | "pause";
    planId?: string;
    priceId?: string;
    billingCycle?: BillingCycle;
    couponCode?: string;
    cancelReason?: string;
    feedback?: string;
    effectiveDate?: "immediately" | "end_of_period";
}

export interface SubscriptionIntent {
    clientSecret: string;
    subscriptionId: string;
    status: "requires_payment_method" | "requires_confirmation" | "requires_action" | "succeeded";
}
