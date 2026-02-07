/**
 * Naropo Billing SDK - API Client
 *
 * PROPRIETARY SOFTWARE
 * Copyright © 2026 Naropo. All rights reserved.
 *
 * REST API client for billing operations.
 */

import type {
    Subscription,
    SubscriptionState,
    PricingPlan,
    CurrentPlan,
} from "../types/subscription";
import type { PaymentMethod, PaymentIntent, SetupIntent } from "../types/payment";
import type { Invoice, UpcomingInvoice, Coupon } from "../types/invoice";
import type { UsageSummary, Entitlement, RecordUsageParams } from "../types/usage";
import type { AggregatedCreditBalance, CreditTransaction } from "../types/credits";

export interface BillingApiClientConfig {
    baseUrl: string;
    apiKey?: string;
    agencyId: string;
    subAccountId?: string;
    timeout?: number;
}

export interface BillingApiClient {
    // Subscription
    getSubscription(): Promise<{ state: SubscriptionState; currentPlan: CurrentPlan | null }>;
    getPlans(): Promise<PricingPlan[]>;
    changePlan(priceId: string, billingCycle?: "monthly" | "yearly"): Promise<void>;
    cancelSubscription(reason?: string, feedback?: string): Promise<void>;
    resumeSubscription(): Promise<void>;
    createCheckoutSession(priceId: string, billingCycle?: "monthly" | "yearly"): Promise<{ url: string }>;

    // Payment Methods
    getPaymentMethods(): Promise<PaymentMethod[]>;
    addPaymentMethod(paymentMethodId: string): Promise<void>;
    removePaymentMethod(paymentMethodId: string): Promise<void>;
    setDefaultPaymentMethod(paymentMethodId: string): Promise<void>;
    createSetupIntent(): Promise<SetupIntent>;

    // Invoices
    getInvoices(limit?: number): Promise<Invoice[]>;
    getUpcomingInvoice(): Promise<UpcomingInvoice | null>;
    downloadInvoice(invoiceId: string): Promise<string>;

    // Usage & Entitlements
    getUsageSummary(period?: string, periodsBack?: number): Promise<UsageSummary>;
    getEntitlements(): Promise<Record<string, Entitlement>>;
    checkEntitlement(featureKey: string, quantity?: number): Promise<boolean>;
    recordUsage(params: RecordUsageParams): Promise<void>;

    // Credits
    getCreditBalance(): Promise<AggregatedCreditBalance>;
    getCreditHistory(limit?: number): Promise<CreditTransaction[]>;
    topupCredits(featureKey: string, credits: number): Promise<void>;
    purchaseCredits(featureKey: string, amount: number): Promise<PaymentIntent>;

    // Coupons
    validateCoupon(code: string): Promise<Coupon>;
    applyCoupon(code: string): Promise<Coupon>;
    removeCoupon(couponId: string): Promise<void>;
}

export function createBillingApiClient(
    config: BillingApiClientConfig
): BillingApiClient {
    const { baseUrl, apiKey, agencyId, subAccountId, timeout = 30000 } = config;

    const buildUrl = (path: string, params?: Record<string, string | undefined>): string => {
        const url = new URL(path, typeof window !== "undefined" ? window.location.origin : "http://localhost");
        url.searchParams.set("agencyId", agencyId);
        if (subAccountId) url.searchParams.set("subAccountId", subAccountId);
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) url.searchParams.set(key, value);
            });
        }
        return url.toString().replace(url.origin, baseUrl);
    };

    const fetchWithAuth = async <T>(
        path: string,
        options: RequestInit = {},
        params?: Record<string, string | undefined>
    ): Promise<T> => {
        const url = buildUrl(path, params);
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            ...(options.headers as Record<string, string>),
        };
        if (apiKey) {
            headers["Authorization"] = `Bearer ${apiKey}`;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                headers,
                signal: controller.signal,
                cache: "no-store",
            });

            clearTimeout(timeoutId);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || data?.message || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name === "AbortError") {
                throw new Error("Request timeout");
            }
            throw error;
        }
    };

    return {
        // Subscription
        async getSubscription() {
            return fetchWithAuth<{ state: SubscriptionState; currentPlan: CurrentPlan | null }>(
                "/subscription/current"
            );
        },

        async getPlans() {
            const data = await fetchWithAuth<{ plans: PricingPlan[] }>("/plans");
            return data.plans;
        },

        async changePlan(priceId, billingCycle = "monthly") {
            await fetchWithAuth("/subscription/change", {
                method: "POST",
                body: JSON.stringify({ priceId, billingCycle }),
            });
        },

        async cancelSubscription(reason, feedback) {
            await fetchWithAuth("/subscription/cancel", {
                method: "POST",
                body: JSON.stringify({ reason, feedback }),
            });
        },

        async resumeSubscription() {
            await fetchWithAuth("/subscription/resume", { method: "POST" });
        },

        async createCheckoutSession(priceId, billingCycle = "monthly") {
            return fetchWithAuth<{ url: string }>("/checkout/session", {
                method: "POST",
                body: JSON.stringify({ priceId, billingCycle }),
            });
        },

        // Payment Methods
        async getPaymentMethods() {
            const data = await fetchWithAuth<{ paymentMethods: PaymentMethod[] }>(
                "/payment-methods"
            );
            return data.paymentMethods;
        },

        async addPaymentMethod(paymentMethodId) {
            await fetchWithAuth("/payment-methods/add", {
                method: "POST",
                body: JSON.stringify({ paymentMethodId }),
            });
        },

        async removePaymentMethod(paymentMethodId) {
            await fetchWithAuth("/payment-methods/remove", {
                method: "POST",
                body: JSON.stringify({ paymentMethodId }),
            });
        },

        async setDefaultPaymentMethod(paymentMethodId) {
            await fetchWithAuth("/payment-methods/set-default", {
                method: "POST",
                body: JSON.stringify({ paymentMethodId }),
            });
        },

        async createSetupIntent() {
            return fetchWithAuth<SetupIntent>("/payment-methods/setup-intent", {
                method: "POST",
            });
        },

        // Invoices
        async getInvoices(limit = 10) {
            const data = await fetchWithAuth<{ invoices: Invoice[] }>(
                "/invoices",
                {},
                { limit: String(limit) }
            );
            return data.invoices;
        },

        async getUpcomingInvoice() {
            try {
                return await fetchWithAuth<UpcomingInvoice>("/invoices/upcoming");
            } catch {
                return null;
            }
        },

        async downloadInvoice(invoiceId) {
            const data = await fetchWithAuth<{ url: string }>(
                `/invoices/${invoiceId}/download`
            );
            return data.url;
        },

        // Usage & Entitlements
        async getUsageSummary(period = "MONTHLY", periodsBack = 0) {
            const scope = subAccountId ? "SUBACCOUNT" : "AGENCY";
            return fetchWithAuth<UsageSummary>(
                "/usage/summary",
                {},
                { scope, period, periodsBack: String(periodsBack) }
            );
        },

        async getEntitlements() {
            const data = await fetchWithAuth<{ entitlements: Record<string, Entitlement> }>(
                "/entitlements/current"
            );
            return data.entitlements;
        },

        async checkEntitlement(featureKey, quantity = 1) {
            const data = await fetchWithAuth<{ allowed: boolean }>(
                "/entitlements/check",
                {},
                { featureKey, quantity: String(quantity) }
            );
            return data.allowed;
        },

        async recordUsage(params) {
            await fetchWithAuth("/usage/record", {
                method: "POST",
                body: JSON.stringify(params),
            });
        },

        // Credits
        async getCreditBalance() {
            const scope = subAccountId ? "SUBACCOUNT" : "AGENCY";
            const data = await fetchWithAuth<{ balances: AggregatedCreditBalance }>(
                "/credits/balance",
                {},
                { scope }
            );
            return data.balances;
        },

        async getCreditHistory(limit = 50) {
            const data = await fetchWithAuth<{ transactions: CreditTransaction[] }>(
                "/credits/history",
                {},
                { limit: String(limit) }
            );
            return data.transactions;
        },

        async topupCredits(featureKey, credits) {
            const scope = subAccountId ? "SUBACCOUNT" : "AGENCY";
            await fetchWithAuth("/credits/topup", {
                method: "POST",
                body: JSON.stringify({
                    agencyId,
                    subAccountId,
                    scope,
                    featureKey,
                    credits,
                    idempotencyKey: `sdk-topup:${agencyId}:${subAccountId ?? "null"}:${featureKey}:${Date.now()}`,
                }),
            });
        },

        async purchaseCredits(featureKey, amount) {
            return fetchWithAuth<PaymentIntent>("/credits/purchase", {
                method: "POST",
                body: JSON.stringify({ featureKey, amount }),
            });
        },

        // Coupons
        async validateCoupon(code) {
            return fetchWithAuth<Coupon>("/coupons/validate", {
                method: "POST",
                body: JSON.stringify({ code }),
            });
        },

        async applyCoupon(code) {
            return fetchWithAuth<Coupon>("/coupons/apply", {
                method: "POST",
                body: JSON.stringify({ code }),
            });
        },

        async removeCoupon(couponId) {
            await fetchWithAuth("/coupons/remove", {
                method: "POST",
                body: JSON.stringify({ couponId }),
            });
        },
    };
}
