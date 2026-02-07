/**
 * Naropo Billing SDK - Embedded Checkout Component
 *
 * PROPRIETARY SOFTWARE
 * Copyright © 2026 Naropo. All rights reserved.
 *
 * Drop-in checkout component for external merchants.
 */

"use client";

import React, { useEffect, useState, useCallback } from "react";
import type { EmbeddedCheckoutConfig, GatewayPayment } from "../types/gateway";

export interface EmbeddedCheckoutProps extends EmbeddedCheckoutConfig {
    className?: string;
    loadingComponent?: React.ReactNode;
    errorComponent?: (error: Error) => React.ReactNode;
}

interface CheckoutState {
    status: "loading" | "ready" | "processing" | "complete" | "error";
    error?: Error;
    payment?: GatewayPayment;
}

/**
 * Embedded checkout component for external merchants
 * 
 * @example
 * ```tsx
 * <EmbeddedCheckout
 *   checkoutSessionId="cs_xxx"
 *   appearance={{ theme: "dark" }}
 *   onComplete={(payment) => console.log("Payment complete:", payment)}
 *   onError={(error) => console.error("Payment failed:", error)}
 * />
 * ```
 */
export function EmbeddedCheckout({
    checkoutSessionId,
    clientSecret,
    appearance = { theme: "auto" },
    onComplete,
    onCancel,
    onError,
    className,
    loadingComponent,
    errorComponent,
}: EmbeddedCheckoutProps) {
    const [state, setState] = useState<CheckoutState>({ status: "loading" });
    const [iframeUrl, setIframeUrl] = useState<string | null>(null);

    // Construct iframe URL
    useEffect(() => {
        const baseUrl = "https://checkout.naropo.com/embedded";
        const params = new URLSearchParams();

        if (checkoutSessionId) {
            params.set("session_id", checkoutSessionId);
        }
        if (clientSecret) {
            params.set("client_secret", clientSecret);
        }
        if (appearance.theme) {
            params.set("theme", appearance.theme);
        }
        if (appearance.variables) {
            params.set("variables", btoa(JSON.stringify(appearance.variables)));
        }

        setIframeUrl(`${baseUrl}?${params.toString()}`);
        setState({ status: "ready" });
    }, [checkoutSessionId, clientSecret, appearance]);

    // Listen for messages from iframe
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // Verify origin
            if (!event.origin.endsWith(".naropo.com")) return;

            const { type, data } = event.data || {};

            switch (type) {
                case "checkout:complete":
                    setState({ status: "complete", payment: data.payment });
                    onComplete?.(data.payment);
                    break;

                case "checkout:cancel":
                    onCancel?.();
                    break;

                case "checkout:error":
                    const error = new Error(data.message || "Checkout failed");
                    setState({ status: "error", error });
                    onError?.(error);
                    break;

                case "checkout:processing":
                    setState({ status: "processing" });
                    break;
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [onComplete, onCancel, onError]);

    // Render loading state
    if (state.status === "loading") {
        if (loadingComponent) {
            return <>{loadingComponent}</>;
        }
        return (
            <div className={className} style={styles.container}>
                <div style={styles.loading}>
                    <div style={styles.spinner} />
                    <p style={styles.loadingText}>Loading checkout...</p>
                </div>
            </div>
        );
    }

    // Render error state
    if (state.status === "error" && state.error) {
        if (errorComponent) {
            return <>{errorComponent(state.error)}</>;
        }
        return (
            <div className={className} style={styles.container}>
                <div style={styles.error}>
                    <p style={styles.errorText}>
                        {state.error.message || "Something went wrong"}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={styles.retryButton}
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    // Render complete state
    if (state.status === "complete") {
        return (
            <div className={className} style={styles.container}>
                <div style={styles.success}>
                    <div style={styles.successIcon}>✓</div>
                    <p style={styles.successText}>Payment successful!</p>
                </div>
            </div>
        );
    }

    // Render checkout iframe
    return (
        <div className={className} style={styles.container}>
            {state.status === "processing" && (
                <div style={styles.overlay}>
                    <div style={styles.spinner} />
                    <p style={styles.loadingText}>Processing payment...</p>
                </div>
            )}
            {iframeUrl && (
                <iframe
                    src={iframeUrl}
                    style={styles.iframe}
                    title="Naropo Checkout"
                    allow="payment"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
            )}
        </div>
    );
}

// Inline styles for portability
const styles: Record<string, React.CSSProperties> = {
    container: {
        position: "relative",
        width: "100%",
        minHeight: "400px",
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: "#0a0a0a",
    },
    iframe: {
        width: "100%",
        height: "100%",
        minHeight: "400px",
        border: "none",
    },
    loading: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "400px",
    },
    spinner: {
        width: "32px",
        height: "32px",
        border: "3px solid rgba(255, 255, 255, 0.1)",
        borderTopColor: "#fff",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
    },
    loadingText: {
        marginTop: "16px",
        color: "#888",
        fontSize: "14px",
    },
    error: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "400px",
        padding: "24px",
    },
    errorText: {
        color: "#ef4444",
        fontSize: "14px",
        textAlign: "center",
        marginBottom: "16px",
    },
    retryButton: {
        padding: "8px 16px",
        backgroundColor: "#333",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "14px",
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        zIndex: 10,
    },
    success: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "400px",
    },
    successIcon: {
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        backgroundColor: "#22c55e",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "24px",
        fontWeight: "bold",
    },
    successText: {
        marginTop: "16px",
        color: "#22c55e",
        fontSize: "16px",
        fontWeight: "500",
    },
};

/**
 * Payment button component for quick integrations
 */
export interface PaymentButtonProps {
    amount: number;
    currency: string;
    label?: string;
    description?: string;
    merchantId: string;
    apiKey: string;
    successUrl: string;
    cancelUrl?: string;
    className?: string;
    style?: React.CSSProperties;
    disabled?: boolean;
    onError?: (error: Error) => void;
}

export function PaymentButton({
    amount,
    currency,
    label,
    description,
    merchantId,
    apiKey,
    successUrl,
    cancelUrl,
    className,
    style,
    disabled,
    onError,
}: PaymentButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = useCallback(async () => {
        setIsLoading(true);

        try {
            const response = await fetch(
                "https://api.naropo.com/v1/gateway/checkout/sessions",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${apiKey}`,
                        "X-Merchant-ID": merchantId,
                    },
                    body: JSON.stringify({
                        mode: "payment",
                        line_items: [
                            {
                                name: label || "Payment",
                                description,
                                amount,
                                currency,
                                quantity: 1,
                            },
                        ],
                        success_url: successUrl,
                        cancel_url: cancelUrl || window.location.href,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || "Failed to create checkout");
            }

            // Redirect to checkout
            window.location.href = data.url;
        } catch (error) {
            setIsLoading(false);
            onError?.(error instanceof Error ? error : new Error(String(error)));
        }
    }, [amount, currency, label, description, merchantId, apiKey, successUrl, cancelUrl, onError]);

    const formattedAmount = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
    }).format(amount / 100);

    return (
        <button
            onClick={handleClick}
            disabled={disabled || isLoading}
            className={className}
            style={{
                padding: "12px 24px",
                backgroundColor: isLoading ? "#333" : "#6366f1",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "500",
                cursor: disabled || isLoading ? "not-allowed" : "pointer",
                opacity: disabled || isLoading ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                ...style,
            }}
        >
            {isLoading ? (
                <>
                    <span style={{ ...styles.spinner, width: "16px", height: "16px" }} />
                    Processing...
                </>
            ) : (
                <>
                    Pay {formattedAmount}
                </>
            )}
        </button>
    );
}
