/**
 * Naropo Billing SDK - React Hooks
 *
 * PROPRIETARY SOFTWARE
 * Copyright © 2026 Naropo. All rights reserved.
 *
 * Custom hooks for billing operations.
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import { useBillingContext, useBillingProviderAvailable } from "./provider";
import type { Entitlement, EntitlementCheck, RecordUsageParams } from "../types/usage";

/**
 * Access subscription state and actions
 */
export function useSubscription() {
    const {
        subscription,
        currentPlan,
        plans,
        isLoading,
        changePlan,
        cancelSubscription,
        resumeSubscription,
        refreshSubscription,
    } = useBillingContext();

    return {
        state: subscription,
        currentPlan,
        plans,
        isLoading,
        changePlan,
        cancel: cancelSubscription,
        resume: resumeSubscription,
        refresh: refreshSubscription,
    };
}

/**
 * Access payment methods and actions
 */
export function usePaymentMethods() {
    const {
        paymentMethods,
        defaultPaymentMethod,
        isLoading,
        addPaymentMethod,
        removePaymentMethod,
        setDefaultPaymentMethod,
        refreshPaymentMethods,
    } = useBillingContext();

    return {
        methods: paymentMethods,
        defaultMethod: defaultPaymentMethod,
        isLoading,
        add: addPaymentMethod,
        remove: removePaymentMethod,
        setDefault: setDefaultPaymentMethod,
        refresh: refreshPaymentMethods,
    };
}

/**
 * Access invoices and billing history
 */
export function useInvoices() {
    const {
        invoices,
        upcomingInvoice,
        isLoading,
        refreshInvoices,
        apiClient,
    } = useBillingContext();

    const download = useCallback(
        async (invoiceId: string) => {
            const url = await apiClient.downloadInvoice(invoiceId);
            window.open(url, "_blank");
        },
        [apiClient]
    );

    return {
        invoices,
        upcomingInvoice,
        isLoading,
        download,
        refresh: refreshInvoices,
    };
}

/**
 * Access usage metrics and entitlements
 */
export function useUsage() {
    const {
        usageSummary,
        entitlements,
        isLoading,
        refreshUsage,
        apiClient,
    } = useBillingContext();

    const [isRecording, setIsRecording] = useState(false);

    const recordUsage = useCallback(
        async (params: Omit<RecordUsageParams, "agencyId" | "subAccountId" | "scope">) => {
            setIsRecording(true);
            try {
                await apiClient.recordUsage({
                    ...params,
                    agencyId: "", // Will be filled by API client
                    scope: "AGENCY",
                } as RecordUsageParams);
                await refreshUsage();
            } finally {
                setIsRecording(false);
            }
        },
        [apiClient, refreshUsage]
    );

    return {
        summary: usageSummary,
        metrics: usageSummary?.metrics ?? [],
        events: usageSummary?.events ?? [],
        entitlements,
        isLoading,
        isRecording,
        recordUsage,
        refresh: refreshUsage,
    };
}

/**
 * Check entitlement for a specific feature
 */
export function useEntitlement(featureKey: string): EntitlementCheck & { entitlement: Entitlement | null } {
    const { entitlements, usageSummary, apiClient } = useBillingContext();

    return useMemo(() => {
        const entitlement = entitlements[featureKey] ?? null;

        if (!entitlement) {
            return {
                allowed: false,
                reason: "no_entitlement" as const,
                entitlement: null,
            };
        }

        if (!entitlement.enabled) {
            return {
                allowed: false,
                reason: "disabled" as const,
                entitlement,
            };
        }

        if (entitlement.isUnlimited) {
            return {
                allowed: true,
                reason: "unlimited" as const,
                entitlement,
            };
        }

        const metric = usageSummary?.metrics.find((m) => m.key === featureKey);
        const currentUsage = metric?.current ?? 0;
        const limit = entitlement.limit ?? 0;
        const remaining = limit - currentUsage;

        if (currentUsage >= limit) {
            return {
                allowed: false,
                reason: "over_limit" as const,
                currentUsage,
                limit,
                remaining: 0,
                entitlement,
            };
        }

        return {
            allowed: true,
            reason: "within_limit" as const,
            currentUsage,
            limit,
            remaining,
            entitlement,
        };
    }, [entitlements, featureKey, usageSummary]);
}

/**
 * Access credits and balance
 */
export function useCredits() {
    const {
        creditBalance,
        isLoading,
        topupCredits,
        refreshCredits,
        apiClient,
    } = useBillingContext();

    const [isTopingUp, setIsTopingUp] = useState(false);
    const [history, setHistory] = useState<Awaited<ReturnType<typeof apiClient.getCreditHistory>>>([]);

    const topup = useCallback(
        async (featureKey: string, credits: number) => {
            setIsTopingUp(true);
            try {
                await topupCredits(featureKey, credits);
            } finally {
                setIsTopingUp(false);
            }
        },
        [topupCredits]
    );

    const loadHistory = useCallback(async () => {
        const data = await apiClient.getCreditHistory();
        setHistory(data);
    }, [apiClient]);

    return {
        balance: creditBalance,
        history,
        isLoading,
        isTopingUp,
        topup,
        loadHistory,
        refresh: refreshCredits,
    };
}

/**
 * Access coupons
 */
export function useCoupons() {
    const {
        appliedCoupons,
        applyCoupon,
        removeCoupon,
        apiClient,
    } = useBillingContext();

    const [isValidating, setIsValidating] = useState(false);
    const [isApplying, setIsApplying] = useState(false);

    const validate = useCallback(
        async (code: string) => {
            setIsValidating(true);
            try {
                return await apiClient.validateCoupon(code);
            } finally {
                setIsValidating(false);
            }
        },
        [apiClient]
    );

    const apply = useCallback(
        async (code: string) => {
            setIsApplying(true);
            try {
                await applyCoupon(code);
            } finally {
                setIsApplying(false);
            }
        },
        [applyCoupon]
    );

    return {
        applied: appliedCoupons,
        isValidating,
        isApplying,
        validate,
        apply,
        remove: removeCoupon,
    };
}

/**
 * Quick access to billing state
 */
export function useBilling() {
    const context = useBillingContext();
    return {
        isLoading: context.isLoading,
        isRefreshing: context.isRefreshing,
        error: context.error,
        refresh: context.refresh,
        subscription: context.subscription,
        currentPlan: context.currentPlan,
        creditBalance: context.creditBalance,
    };
}

/**
 * Conditional hook - returns null if provider not available
 */
export function useBillingOptional() {
    const available = useBillingProviderAvailable();

    // This is safe because we're checking availability first
    if (!available) return null;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useBillingContext();
}
