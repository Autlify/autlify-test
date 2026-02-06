/**
 * Loading Skeleton Components
 * Provides skeleton loaders for billing components while data is loading
 * @packageDocumentation
 */

"use client";

import * as React from "react";
import { cn } from "../../utils";

// Base Skeleton component
export function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-muted/50",
                className
            )}
            {...props}
        />
    );
}

// Subscription Card Skeleton
export function SubscriptionCardSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn("rounded-lg border border-border/50 bg-surface-secondary p-6", className)}>
            <div className="rounded-xl border border-border/50 bg-card p-6 shadow-lg">
                {/* Header */}
                <div className="mb-6 flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-60" />
                    </div>
                </div>

                {/* Plan Details */}
                <div className="mb-6 rounded-xl border border-border/30 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-5 w-20 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                </div>

                {/* Separator */}
                <Skeleton className="my-6 h-px w-full" />

                {/* Billing Info */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-5 w-36" />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Skeleton className="h-20 rounded-lg" />
                        <Skeleton className="h-20 rounded-lg" />
                    </div>
                </div>

                {/* Separator */}
                <Skeleton className="my-6 h-px w-full" />

                {/* Actions */}
                <div className="flex gap-3">
                    <Skeleton className="h-10 w-28 rounded-md" />
                    <Skeleton className="h-10 w-36 rounded-md" />
                </div>
            </div>
        </div>
    );
}

// Usage Display Skeleton
export function UsageDisplaySkeleton({ className, count = 4 }: { className?: string; count?: number }) {
    return (
        <div className={cn("rounded-lg border border-border/50 bg-surface-secondary p-6", className)}>
            <div className="w-full space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <Skeleton className="h-6 w-24" />
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {Array.from({ length: count }).map((_, i) => (
                        <div
                            key={i}
                            className="rounded-lg border border-border/50 bg-card p-4 shadow-lg"
                        >
                            <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                    <Skeleton className="h-5 w-12 rounded-full" />
                                </div>
                                <Skeleton className="h-2 w-full rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Invoice List Skeleton
export function InvoiceListSkeleton({ className, rows = 5 }: { className?: string; rows?: number }) {
    return (
        <div className={cn("rounded-lg border border-border/50 bg-surface-secondary p-6", className)}>
            <div className="w-full space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <Skeleton className="h-6 w-32" />
                </div>

                {/* Table */}
                <div className="rounded-lg border border-border/50 shadow-lg">
                    {/* Table Header */}
                    <div className="flex items-center gap-4 border-b border-border/30 bg-muted/20 p-4">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 flex-1" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                    </div>

                    {/* Table Rows */}
                    {Array.from({ length: rows }).map((_, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-4 border-b border-border/20 p-4 last:border-0"
                        >
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 flex-1" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-8 w-8 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Credit Balance Skeleton
export function CreditBalanceSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn("rounded-lg border border-border/50 bg-surface-secondary p-6", className)}>
            <div className="rounded-xl border border-border/50 bg-card p-6 shadow-lg">
                {/* Header */}
                <div className="mb-6 flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-28" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                </div>

                {/* Balance Display */}
                <div className="mb-6 flex items-baseline justify-center gap-2">
                    <Skeleton className="h-12 w-32" />
                    <Skeleton className="h-5 w-16" />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-lg bg-muted/20 p-3 text-center">
                            <Skeleton className="mx-auto mb-2 h-6 w-12" />
                            <Skeleton className="mx-auto h-3 w-16" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Credit History Skeleton
export function CreditHistorySkeleton({ className, rows = 5 }: { className?: string; rows?: number }) {
    return (
        <div className={cn("rounded-lg border border-border/50 bg-surface-secondary p-6", className)}>
            <div className="rounded-xl border border-border/50 bg-card p-6 shadow-lg">
                {/* Header */}
                <div className="mb-6 flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-28" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>

                {/* Transaction List */}
                <div className="space-y-3">
                    {Array.from({ length: rows }).map((_, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between rounded-lg border border-border/50 p-4"
                        >
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-lg" />
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-4 w-16 rounded-full" />
                                    </div>
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                            <Skeleton className="h-5 w-16" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Payment Methods Skeleton
export function PaymentMethodsSkeleton({ className, count = 2 }: { className?: string; count?: number }) {
    return (
        <div className={cn("rounded-lg border border-border/50 bg-surface-secondary p-6", className)}>
            <div className="rounded-xl border border-border/50 bg-card p-6 shadow-lg">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-36" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                    <Skeleton className="h-9 w-28 rounded-md" />
                </div>

                {/* Payment Methods */}
                <div className="space-y-3">
                    {Array.from({ length: count }).map((_, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between rounded-lg border border-border/50 p-4"
                        >
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-8 w-12 rounded" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-16 rounded-full" />
                                <Skeleton className="h-8 w-8 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Billing Overview Skeleton
export function BillingOverviewSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn("space-y-6", className)}>
            <SubscriptionCardSkeleton />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <UsageDisplaySkeleton count={2} />
                <CreditBalanceSkeleton />
            </div>
            <InvoiceListSkeleton rows={3} />
        </div>
    );
}

// Export all skeletons
export const Skeletons = {
    Skeleton,
    SubscriptionCard: SubscriptionCardSkeleton,
    UsageDisplay: UsageDisplaySkeleton,
    InvoiceList: InvoiceListSkeleton,
    CreditBalance: CreditBalanceSkeleton,
    CreditHistory: CreditHistorySkeleton,
    PaymentMethods: PaymentMethodsSkeleton,
    BillingOverview: BillingOverviewSkeleton,
};
