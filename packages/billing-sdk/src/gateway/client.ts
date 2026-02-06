/**
 * Autlify Billing SDK - Payment Gateway Client
 *
 * PROPRIETARY SOFTWARE
 * Copyright © 2026 Autlify. All rights reserved.
 *
 * Enables external apps to use Autlify as their payment processor,
 * similar to PayKit, Dodo Payments, or Lemon Squeezy.
 */

import type {
    GatewayConfig,
    GatewayMerchant,
    GatewayCheckoutSession,
    GatewayLineItem,
    GatewayPayment,
    GatewayRefund,
    GatewayPayout,
    GatewayClientOptions,
} from "../types/gateway";

export interface CreateCheckoutParams {
    mode: "payment" | "subscription" | "setup";
    lineItems: GatewayLineItem[];
    customerEmail?: string;
    customerId?: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
    allowPromotionCodes?: boolean;
    billingAddressCollection?: "auto" | "required";
    shippingAddressCollection?: {
        allowedCountries: string[];
    };
    expiresAt?: Date;
}

export interface CreatePaymentLinkParams {
    lineItems: GatewayLineItem[];
    metadata?: Record<string, string>;
    allowPromotionCodes?: boolean;
    afterCompletion?: {
        type: "redirect" | "hosted_confirmation";
        redirectUrl?: string;
    };
}

export interface RefundParams {
    paymentId: string;
    amount?: number;
    reason?: string;
    metadata?: Record<string, string>;
}

export interface GatewayClient {
    // Merchant
    getMerchant(): Promise<GatewayMerchant>;
    updateMerchant(data: Partial<GatewayMerchant>): Promise<GatewayMerchant>;

    // Checkout
    createCheckoutSession(params: CreateCheckoutParams): Promise<GatewayCheckoutSession>;
    getCheckoutSession(sessionId: string): Promise<GatewayCheckoutSession>;
    expireCheckoutSession(sessionId: string): Promise<void>;

    // Payment Links
    createPaymentLink(params: CreatePaymentLinkParams): Promise<{ url: string; id: string }>;

    // Payments
    getPayment(paymentId: string): Promise<GatewayPayment>;
    listPayments(params?: { limit?: number; startingAfter?: string }): Promise<{
        data: GatewayPayment[];
        hasMore: boolean;
    }>;

    // Refunds
    createRefund(params: RefundParams): Promise<GatewayRefund>;
    getRefund(refundId: string): Promise<GatewayRefund>;

    // Payouts
    listPayouts(params?: { limit?: number; status?: string }): Promise<{
        data: GatewayPayout[];
        hasMore: boolean;
    }>;

    // Webhooks
    constructWebhookEvent(payload: string, signature: string): Promise<unknown>;
}

const DEFAULT_BASE_URL = "https://api.autlify.com/v1/gateway";

export function createGatewayClient(
    options: GatewayClientOptions
): GatewayClient {
    const {
        config,
        baseUrl = DEFAULT_BASE_URL,
        timeout = 30000,
        retries = 3,
    } = options;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
        "X-Merchant-ID": config.merchantId,
        "X-Environment": config.environment,
    };

    const fetchWithRetry = async <T>(
        path: string,
        init: RequestInit = {},
        attempt = 1
    ): Promise<T> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(`${baseUrl}${path}`, {
                ...init,
                headers: { ...headers, ...(init.headers as Record<string, string>) },
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            const data = await response.json();

            if (!response.ok) {
                const error = new Error(
                    data?.error?.message || data?.message || `HTTP ${response.status}`
                );
                (error as any).code = data?.error?.code;
                (error as any).status = response.status;
                throw error;
            }

            return data;
        } catch (error) {
            clearTimeout(timeoutId);

            // Retry on network errors or 5xx
            if (attempt < retries) {
                const isRetryable =
                    (error instanceof Error && error.name === "AbortError") ||
                    ((error as any)?.status >= 500 && (error as any)?.status < 600);

                if (isRetryable) {
                    await new Promise((resolve) =>
                        setTimeout(resolve, Math.pow(2, attempt) * 100)
                    );
                    return fetchWithRetry(path, init, attempt + 1);
                }
            }

            throw error;
        }
    };

    return {
        // Merchant
        async getMerchant() {
            return fetchWithRetry<GatewayMerchant>("/merchant");
        },

        async updateMerchant(data) {
            return fetchWithRetry<GatewayMerchant>("/merchant", {
                method: "PATCH",
                body: JSON.stringify(data),
            });
        },

        // Checkout
        async createCheckoutSession(params) {
            return fetchWithRetry<GatewayCheckoutSession>("/checkout/sessions", {
                method: "POST",
                body: JSON.stringify({
                    ...params,
                    return_url: config.returnUrl,
                    cancel_url: config.cancelUrl,
                    metadata: { ...config.metadata, ...params.metadata },
                }),
            });
        },

        async getCheckoutSession(sessionId) {
            return fetchWithRetry<GatewayCheckoutSession>(
                `/checkout/sessions/${sessionId}`
            );
        },

        async expireCheckoutSession(sessionId) {
            await fetchWithRetry(`/checkout/sessions/${sessionId}/expire`, {
                method: "POST",
            });
        },

        // Payment Links
        async createPaymentLink(params) {
            return fetchWithRetry<{ url: string; id: string }>("/payment-links", {
                method: "POST",
                body: JSON.stringify({
                    ...params,
                    metadata: { ...config.metadata, ...params.metadata },
                }),
            });
        },

        // Payments
        async getPayment(paymentId) {
            return fetchWithRetry<GatewayPayment>(`/payments/${paymentId}`);
        },

        async listPayments(params) {
            const searchParams = new URLSearchParams();
            if (params?.limit) searchParams.set("limit", String(params.limit));
            if (params?.startingAfter)
                searchParams.set("starting_after", params.startingAfter);

            const query = searchParams.toString();
            return fetchWithRetry<{ data: GatewayPayment[]; hasMore: boolean }>(
                `/payments${query ? `?${query}` : ""}`
            );
        },

        // Refunds
        async createRefund(params) {
            return fetchWithRetry<GatewayRefund>("/refunds", {
                method: "POST",
                body: JSON.stringify({
                    payment_id: params.paymentId,
                    amount: params.amount,
                    reason: params.reason,
                    metadata: params.metadata,
                }),
            });
        },

        async getRefund(refundId) {
            return fetchWithRetry<GatewayRefund>(`/refunds/${refundId}`);
        },

        // Payouts
        async listPayouts(params) {
            const searchParams = new URLSearchParams();
            if (params?.limit) searchParams.set("limit", String(params.limit));
            if (params?.status) searchParams.set("status", params.status);

            const query = searchParams.toString();
            return fetchWithRetry<{ data: GatewayPayout[]; hasMore: boolean }>(
                `/payouts${query ? `?${query}` : ""}`
            );
        },

        // Webhooks
        async constructWebhookEvent(payload, signature) {
            // Verify webhook signature
            const response = await fetchWithRetry<{ event: unknown }>(
                "/webhooks/verify",
                {
                    method: "POST",
                    body: JSON.stringify({ payload, signature }),
                    headers: {
                        "X-Webhook-Secret": config.webhookSecret || "",
                    },
                }
            );
            return response.event;
        },
    };
}
