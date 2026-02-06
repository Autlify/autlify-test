/**
 * Payment Methods List Component
 * Displays saved payment methods with management actions
 * @packageDocumentation
 */

"use client";

import * as React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Button,
    Badge,
} from "../ui";
import { cn, maskCardNumber, formatCardExpiry, getCardBrandName } from "../../utils";
import type { PaymentMethodsListProps } from "../types";

// Icons
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

function PlusIcon({ className }: { className?: string }) {
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
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    );
}

function TrashIcon({ className }: { className?: string }) {
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
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
    );
}

function StarIcon({ className, filled }: { className?: string; filled?: boolean }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={filled ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
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

export function PaymentMethodsList({
    paymentMethods,
    onAddCard,
    onSetDefault,
    onRemoveCard,
    onReplaceCard,
    showAddButton = true,
    emptyMessage = "No payment methods saved",
    className,
}: PaymentMethodsListProps) {
    const [loadingId, setLoadingId] = React.useState<string | null>(null);
    const [loadingAction, setLoadingAction] = React.useState<string | null>(null);

    const handleAction = async (
        action: "default" | "remove" | "replace",
        methodId: string,
        handler?: (id: string) => void | Promise<void>
    ) => {
        if (!handler) return;
        setLoadingId(methodId);
        setLoadingAction(action);
        try {
            await handler(methodId);
        } finally {
            setLoadingId(null);
            setLoadingAction(null);
        }
    };

    return (
        <div className={cn("rounded-lg border border-border/50 bg-surface-secondary p-6", className)}>
            <Card className="shadow-lg">
                <CardHeader className="px-4 pb-4 sm:px-6 sm:pb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                <div className="rounded-lg bg-primary/10 p-1.5 ring-1 ring-primary/20 sm:p-2">
                                    <CreditCardIcon className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                                </div>
                                Payment Methods
                            </CardTitle>
                            <CardDescription className="mt-2 text-sm sm:text-base">
                                Manage your saved payment methods
                            </CardDescription>
                        </div>
                        {showAddButton && onAddCard && (
                            <Button
                                onClick={() => onAddCard("")}
                                size="sm"
                                className="shadow-lg transition-all duration-200 hover:shadow-xl"
                            >
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Add New
                            </Button>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="px-4 sm:px-6">
                    {paymentMethods.length === 0 ? (
                        <div className="rounded-lg border-2 border-dashed bg-muted/10 py-12 text-center">
                            <CreditCardIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                            <p className="mb-4 text-muted-foreground">{emptyMessage}</p>
                            {onAddCard && (
                                <Button
                                    onClick={() => onAddCard("")}
                                    variant="outline"
                                    className="shadow-lg transition-all duration-200 hover:shadow-xl"
                                >
                                    <PlusIcon className="mr-2 h-4 w-4" />
                                    Add Payment Method
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {paymentMethods.map((method) => {
                                const isLoading = loadingId === method.id;
                                return (
                                    <div
                                        key={method.id}
                                        className={cn(
                                            "group flex flex-col gap-4 rounded-lg border p-4 transition-all duration-200 sm:flex-row sm:items-center sm:justify-between",
                                            method.isDefault
                                                ? "border-primary/30 bg-primary/5"
                                                : "border-border/50 hover:border-border"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Card Icon Placeholder */}
                                            <div className="flex h-10 w-16 items-center justify-center rounded-md bg-gradient-to-br from-muted to-muted/50">
                                                <CreditCardIcon className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">
                                                        {getCardBrandName(method.brand)}
                                                    </span>
                                                    <span className="font-mono text-sm text-muted-foreground">
                                                        {maskCardNumber(method.last4)}
                                                    </span>
                                                    {method.isDefault && (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-primary/20 bg-primary/10 text-primary"
                                                        >
                                                            <StarIcon className="mr-1 h-3 w-3" filled />
                                                            Default
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="mt-1 text-sm text-muted-foreground">
                                                    {method.cardholderName && (
                                                        <span>{method.cardholderName} • </span>
                                                    )}
                                                    Expires{" "}
                                                    {formatCardExpiry(method.expiryMonth, method.expiryYear)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            {!method.isDefault && onSetDefault && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        handleAction("default", method.id, onSetDefault)
                                                    }
                                                    disabled={isLoading}
                                                    className="text-muted-foreground hover:text-foreground"
                                                >
                                                    {isLoading && loadingAction === "default" ? (
                                                        <RefreshCwIcon className="mr-1.5 h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <StarIcon className="mr-1.5 h-4 w-4" />
                                                    )}
                                                    Set Default
                                                </Button>
                                            )}
                                            {onReplaceCard && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        handleAction("replace", method.id, onReplaceCard)
                                                    }
                                                    disabled={isLoading}
                                                >
                                                    {isLoading && loadingAction === "replace" ? (
                                                        <RefreshCwIcon className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <RefreshCwIcon className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            )}
                                            {onRemoveCard && !method.isDefault && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        handleAction("remove", method.id, onRemoveCard)
                                                    }
                                                    disabled={isLoading}
                                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    {isLoading && loadingAction === "remove" ? (
                                                        <RefreshCwIcon className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <TrashIcon className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

PaymentMethodsList.displayName = "PaymentMethodsList";
