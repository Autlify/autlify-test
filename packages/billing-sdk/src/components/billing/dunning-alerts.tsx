/**
 * Dunning Alerts Component
 * Displays payment failure alerts with retry and update payment options
 * @packageDocumentation
 */

"use client";

import * as React from "react";
import { Card, Button, Badge } from "../ui";
import { cn, formatCurrencyMajor, formatDate } from "../../utils";
import type { DunningAlertsProps } from "../types";

// Icons
function AlertCircleIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
        </svg>
    );
}

function RefreshCwIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
        </svg>
    );
}

function CreditCardIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
    );
}

function getLevelStyles(level: 1 | 2 | 3) {
    switch (level) {
        case 1:
            return {
                container: "border-orange-500/30 bg-orange-500/5",
                icon: "text-orange-500",
                badge: "bg-orange-500/10 text-orange-500 border-orange-500/20",
                label: "Warning",
            };
        case 2:
            return {
                container: "border-red-500/30 bg-red-500/5",
                icon: "text-red-500",
                badge: "bg-red-500/10 text-red-500 border-red-500/20",
                label: "Urgent",
            };
        case 3:
            return {
                container: "border-destructive/30 bg-destructive/5",
                icon: "text-destructive",
                badge: "bg-destructive/10 text-destructive border-destructive/20",
                label: "Critical",
            };
    }
}

export function DunningAlerts({
    alerts,
    onRetryPayment,
    onUpdatePaymentMethod,
    className,
}: DunningAlertsProps) {
    const [retryingId, setRetryingId] = React.useState<string | null>(null);

    const handleRetry = async (invoiceId: string) => {
        if (!onRetryPayment) return;
        setRetryingId(invoiceId);
        try {
            await onRetryPayment(invoiceId);
        } finally {
            setRetryingId(null);
        }
    };

    if (alerts.length === 0) {
        return null;
    }

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center gap-3">
                <div className="rounded-lg bg-destructive/10 p-2 ring-1 ring-destructive/20">
                    <AlertCircleIcon className="h-5 w-5 text-destructive" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold">Payment Issues</h2>
                    <p className="text-sm text-muted-foreground">
                        {alerts.length} payment{alerts.length !== 1 ? "s" : ""} require
                        attention
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                {alerts.map((alert) => {
                    const styles = getLevelStyles(alert.level);
                    const isRetrying = retryingId === alert.invoiceId;

                    return (
                        <Card
                            key={alert.id}
                            className={cn(
                                "overflow-hidden border p-4 shadow-lg transition-all duration-200 hover:shadow-xl",
                                styles.container
                            )}
                        >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex items-start gap-3">
                                    <div className={cn("mt-0.5", styles.icon)}>
                                        <AlertCircleIcon className="h-5 w-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{alert.message}</span>
                                            <Badge
                                                variant="outline"
                                                className={cn("backdrop-blur-sm", styles.badge)}
                                            >
                                                {styles.label}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                            {alert.amount && alert.currency && (
                                                <span>
                                                    Amount: {formatCurrencyMajor(alert.amount, alert.currency)}
                                                </span>
                                            )}
                                            {alert.dueDate && (
                                                <span>Due: {formatDate(alert.dueDate)}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {alert.invoiceId && onRetryPayment && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleRetry(alert.invoiceId!)}
                                            disabled={isRetrying}
                                            className="shrink-0"
                                        >
                                            <RefreshCwIcon
                                                className={cn(
                                                    "mr-1.5 h-4 w-4",
                                                    isRetrying && "animate-spin"
                                                )}
                                            />
                                            {isRetrying ? "Retrying..." : "Retry Payment"}
                                        </Button>
                                    )}
                                    {onUpdatePaymentMethod && (
                                        <Button
                                            size="sm"
                                            onClick={onUpdatePaymentMethod}
                                            className="shrink-0"
                                        >
                                            <CreditCardIcon className="mr-1.5 h-4 w-4" />
                                            Update Card
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

DunningAlerts.displayName = "DunningAlerts";
