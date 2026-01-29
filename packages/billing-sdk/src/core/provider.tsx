/**
 * Autlify Billing SDK - Core Provider
 *
 * PROPRIETARY SOFTWARE
 * Copyright © 2026 Autlify. All rights reserved.
 *
 * Provides billing context to components with subscription, payment,
 * and usage data. Supports both internal and external integrations.
 */

"use client";

import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    useMemo,
} from "react";
import type {
    Subscription,
    SubscriptionState,
    PricingPlan,
    CurrentPlan,
} from "../types/subscription";
import type { PaymentMethod, PaymentMethodCard } from "../types/payment";
import type { Invoice, UpcomingInvoice, Coupon } from "../types/invoice";
import type { UsageSummary, Entitlement } from "../types/usage";
import type { AggregatedCreditBalance } from "../types/credits";
import type { BillingApiClient } from "./api-client";
import { createBillingApiClient } from "./api-client";

// Provider configuration
export interface BillingProviderConfig {
    /**
     * Agency ID for billing context
     */
    agencyId: string;

    /**
     * Optional sub-account ID for scoped billing
     */
    subAccountId?: string;

    /**
     * API key for external integrations (not needed for internal use)
     */
    apiKey?: string;

    /**
     * Custom API base URL
     * @default "/api/features/core/billing"
     */
    apiBaseUrl?: string;

    /**
     * Stripe publishable key (for payment forms)
     */
    stripePublishableKey?: string;

    /**
     * Enable automatic data refresh
     * @default true
     */
    autoRefresh?: boolean;

    /**
     * Refresh interval in milliseconds
     * @default 60000 (1 minute)
     */
    refreshInterval?: number;

    /**
     * Callback when subscription changes
     */
    onSubscriptionChange?: (subscription: Subscription | null) => void;

    /**
     * Callback when payment fails
     */
    onPaymentFailure?: (error: Error) => void;
}

// Billing context state
export interface BillingContextState {
    // Configuration
    config: BillingProviderConfig;
    apiClient: BillingApiClient;

    // Loading states
    isLoading: boolean;
    isRefreshing: boolean;
    error: string | null;

    // Core data
    subscription: SubscriptionState | null;
    currentPlan: CurrentPlan | null;
    plans: PricingPlan[];

    // Payment
    paymentMethods: PaymentMethod[];
    defaultPaymentMethod: PaymentMethod | null;

    // Invoice & Billing
    invoices: Invoice[];
    upcomingInvoice: UpcomingInvoice | null;
    appliedCoupons: Coupon[];

    // Usage & Entitlements
    usageSummary: UsageSummary | null;
    entitlements: Record<string, Entitlement>;

    // Credits
    creditBalance: AggregatedCreditBalance | null;

    // Actions
    refresh: () => Promise<void>;
    refreshSubscription: () => Promise<void>;
    refreshPaymentMethods: () => Promise<void>;
    refreshInvoices: () => Promise<void>;
    refreshUsage: () => Promise<void>;
    refreshCredits: () => Promise<void>;

    // Subscription actions
    changePlan: (priceId: string, billingCycle?: "monthly" | "yearly") => Promise<void>;
    cancelSubscription: (reason?: string, feedback?: string) => Promise<void>;
    resumeSubscription: () => Promise<void>;

    // Payment actions
    addPaymentMethod: (paymentMethodId: string) => Promise<void>;
    removePaymentMethod: (paymentMethodId: string) => Promise<void>;
    setDefaultPaymentMethod: (paymentMethodId: string) => Promise<void>;

    // Credit actions
    topupCredits: (featureKey: string, credits: number) => Promise<void>;

    // Coupon actions
    applyCoupon: (code: string) => Promise<void>;
    removeCoupon: (couponId: string) => Promise<void>;
}

const BillingContext = createContext<BillingContextState | null>(null);

export interface BillingProviderProps {
    config: BillingProviderConfig;
    children: React.ReactNode;
    /**
     * Initial data to hydrate provider (for SSR)
     */
    initialData?: Partial<BillingContextState>;
}

export function BillingProvider({
    config,
    children,
    initialData,
}: BillingProviderProps) {
    // API client
    const apiClient = useMemo(
        () =>
            createBillingApiClient({
                baseUrl: config.apiBaseUrl || "/api/features/core/billing",
                apiKey: config.apiKey,
                agencyId: config.agencyId,
                subAccountId: config.subAccountId,
            }),
        [config.apiBaseUrl, config.apiKey, config.agencyId, config.subAccountId]
    );

    // State
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [subscription, setSubscription] = useState<SubscriptionState | null>(
        initialData?.subscription ?? null
    );
    const [currentPlan, setCurrentPlan] = useState<CurrentPlan | null>(
        initialData?.currentPlan ?? null
    );
    const [plans, setPlans] = useState<PricingPlan[]>(initialData?.plans ?? []);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(
        initialData?.paymentMethods ?? []
    );
    const [invoices, setInvoices] = useState<Invoice[]>(
        initialData?.invoices ?? []
    );
    const [upcomingInvoice, setUpcomingInvoice] =
        useState<UpcomingInvoice | null>(initialData?.upcomingInvoice ?? null);
    const [appliedCoupons, setAppliedCoupons] = useState<Coupon[]>(
        initialData?.appliedCoupons ?? []
    );
    const [usageSummary, setUsageSummary] = useState<UsageSummary | null>(
        initialData?.usageSummary ?? null
    );
    const [entitlements, setEntitlements] = useState<Record<string, Entitlement>>(
        initialData?.entitlements ?? {}
    );
    const [creditBalance, setCreditBalance] =
        useState<AggregatedCreditBalance | null>(
            initialData?.creditBalance ?? null
        );

    const defaultPaymentMethod = useMemo(
        () => paymentMethods.find((pm) => pm.isDefault) ?? null,
        [paymentMethods]
    );

    // Refresh functions
    const refreshSubscription = useCallback(async () => {
        try {
            const data = await apiClient.getSubscription();
            setSubscription(data.state);
            setCurrentPlan(data.currentPlan);
            config.onSubscriptionChange?.(data.state?.subscription ?? null);
        } catch (err) {
            console.error("[BillingSDK] Failed to refresh subscription:", err);
        }
    }, [apiClient, config]);

    const refreshPaymentMethods = useCallback(async () => {
        try {
            const data = await apiClient.getPaymentMethods();
            setPaymentMethods(data);
        } catch (err) {
            console.error("[BillingSDK] Failed to refresh payment methods:", err);
        }
    }, [apiClient]);

    const refreshInvoices = useCallback(async () => {
        try {
            const [invoiceData, upcomingData] = await Promise.all([
                apiClient.getInvoices(),
                apiClient.getUpcomingInvoice(),
            ]);
            setInvoices(invoiceData);
            setUpcomingInvoice(upcomingData);
        } catch (err) {
            console.error("[BillingSDK] Failed to refresh invoices:", err);
        }
    }, [apiClient]);

    const refreshUsage = useCallback(async () => {
        try {
            const [usageData, entitlementData] = await Promise.all([
                apiClient.getUsageSummary(),
                apiClient.getEntitlements(),
            ]);
            setUsageSummary(usageData);
            setEntitlements(entitlementData);
        } catch (err) {
            console.error("[BillingSDK] Failed to refresh usage:", err);
        }
    }, [apiClient]);

    const refreshCredits = useCallback(async () => {
        try {
            const data = await apiClient.getCreditBalance();
            setCreditBalance(data);
        } catch (err) {
            console.error("[BillingSDK] Failed to refresh credits:", err);
        }
    }, [apiClient]);

    const refresh = useCallback(async () => {
        setIsRefreshing(true);
        setError(null);
        try {
            await Promise.all([
                refreshSubscription(),
                refreshPaymentMethods(),
                refreshInvoices(),
                refreshUsage(),
                refreshCredits(),
            ]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to refresh data");
        } finally {
            setIsRefreshing(false);
        }
    }, [
        refreshSubscription,
        refreshPaymentMethods,
        refreshInvoices,
        refreshUsage,
        refreshCredits,
    ]);

    // Subscription actions
    const changePlan = useCallback(
        async (priceId: string, billingCycle: "monthly" | "yearly" = "monthly") => {
            try {
                await apiClient.changePlan(priceId, billingCycle);
                await refreshSubscription();
            } catch (err) {
                throw err;
            }
        },
        [apiClient, refreshSubscription]
    );

    const cancelSubscription = useCallback(
        async (reason?: string, feedback?: string) => {
            try {
                await apiClient.cancelSubscription(reason, feedback);
                await refreshSubscription();
            } catch (err) {
                throw err;
            }
        },
        [apiClient, refreshSubscription]
    );

    const resumeSubscription = useCallback(async () => {
        try {
            await apiClient.resumeSubscription();
            await refreshSubscription();
        } catch (err) {
            throw err;
        }
    }, [apiClient, refreshSubscription]);

    // Payment actions
    const addPaymentMethod = useCallback(
        async (paymentMethodId: string) => {
            try {
                await apiClient.addPaymentMethod(paymentMethodId);
                await refreshPaymentMethods();
            } catch (err) {
                config.onPaymentFailure?.(err instanceof Error ? err : new Error(String(err)));
                throw err;
            }
        },
        [apiClient, refreshPaymentMethods, config]
    );

    const removePaymentMethod = useCallback(
        async (paymentMethodId: string) => {
            try {
                await apiClient.removePaymentMethod(paymentMethodId);
                await refreshPaymentMethods();
            } catch (err) {
                throw err;
            }
        },
        [apiClient, refreshPaymentMethods]
    );

    const setDefaultPaymentMethod = useCallback(
        async (paymentMethodId: string) => {
            try {
                await apiClient.setDefaultPaymentMethod(paymentMethodId);
                await refreshPaymentMethods();
            } catch (err) {
                throw err;
            }
        },
        [apiClient, refreshPaymentMethods]
    );

    // Credit actions
    const topupCredits = useCallback(
        async (featureKey: string, credits: number) => {
            try {
                await apiClient.topupCredits(featureKey, credits);
                await refreshCredits();
            } catch (err) {
                throw err;
            }
        },
        [apiClient, refreshCredits]
    );

    // Coupon actions
    const applyCoupon = useCallback(
        async (code: string) => {
            try {
                const coupon = await apiClient.applyCoupon(code);
                setAppliedCoupons((prev) => [...prev, coupon]);
            } catch (err) {
                throw err;
            }
        },
        [apiClient]
    );

    const removeCoupon = useCallback(
        async (couponId: string) => {
            try {
                await apiClient.removeCoupon(couponId);
                setAppliedCoupons((prev) => prev.filter((c) => c.id !== couponId));
            } catch (err) {
                throw err;
            }
        },
        [apiClient]
    );

    // Initial load and fetch plans
    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            try {
                const planData = await apiClient.getPlans();
                setPlans(planData);
                await refresh();
            } catch (err) {
                setError(err instanceof Error ? err.message : "Initialization failed");
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, [apiClient]); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-refresh interval
    useEffect(() => {
        if (config.autoRefresh === false) return;

        const interval = setInterval(() => {
            refresh();
        }, config.refreshInterval ?? 60000);

        return () => clearInterval(interval);
    }, [config.autoRefresh, config.refreshInterval, refresh]);

    const value: BillingContextState = {
        config,
        apiClient,
        isLoading,
        isRefreshing,
        error,
        subscription,
        currentPlan,
        plans,
        paymentMethods,
        defaultPaymentMethod,
        invoices,
        upcomingInvoice,
        appliedCoupons,
        usageSummary,
        entitlements,
        creditBalance,
        refresh,
        refreshSubscription,
        refreshPaymentMethods,
        refreshInvoices,
        refreshUsage,
        refreshCredits,
        changePlan,
        cancelSubscription,
        resumeSubscription,
        addPaymentMethod,
        removePaymentMethod,
        setDefaultPaymentMethod,
        topupCredits,
        applyCoupon,
        removeCoupon,
    };

    return (
        <BillingContext.Provider value={value}>{children}</BillingContext.Provider>
    );
}

/**
 * Access billing context
 */
export function useBillingContext(): BillingContextState {
    const context = useContext(BillingContext);
    if (!context) {
        throw new Error("useBillingContext must be used within BillingProvider");
    }
    return context;
}

/**
 * Check if provider is available
 */
export function useBillingProviderAvailable(): boolean {
    const context = useContext(BillingContext);
    return context !== null;
}
