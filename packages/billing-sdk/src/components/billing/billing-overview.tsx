/**
 * Billing Overview Component
 * Comprehensive dashboard showing subscription, usage, credits, and recent activity
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
    Progress,
    Separator,
} from "../ui";
import { cn, formatDate, formatCurrencyMajor, getUsagePercentage } from "../../utils";
import type { BillingOverviewProps } from "../types";

// Icons
function LayoutDashboardIcon({ className }: { className?: string }) {
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
            <rect width="7" height="9" x="3" y="3" rx="1" />
            <rect width="7" height="5" x="14" y="3" rx="1" />
            <rect width="7" height="9" x="14" y="12" rx="1" />
            <rect width="7" height="5" x="3" y="16" rx="1" />
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

function CoinsIcon({ className }: { className?: string }) {
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
            <circle cx="8" cy="8" r="6" />
            <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
            <path d="M7 6h1v4" />
            <path d="m16.71 13.88.7.71-2.82 2.82" />
        </svg>
    );
}

function ActivityIcon({ className }: { className?: string }) {
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
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    );
}

function FileTextIcon({ className }: { className?: string }) {
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
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" x2="8" y1="13" y2="13" />
            <line x1="16" x2="8" y1="17" y2="17" />
        </svg>
    );
}

function ChevronRightIcon({ className }: { className?: string }) {
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
            <path d="m9 18 6-6-6-6" />
        </svg>
    );
}

export function BillingOverview({
    overview,
    onManageSubscription,
    onViewInvoices,
    onManageCredits,
    className,
}: BillingOverviewProps) {
    return (
        <div className={cn("space-y-6", className)}>
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2 ring-1 ring-primary/20">
                    <LayoutDashboardIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold">Billing Overview</h2>
                    <p className="text-sm text-muted-foreground">
                        Summary of your subscription, usage, and billing
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Subscription Card */}
                <Card className="shadow-lg transition-all duration-200 hover:shadow-xl">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <CreditCardIcon className="h-4 w-4 text-primary" />
                                Subscription
                            </CardTitle>
                            <Badge
                                variant="outline"
                                className={cn(
                                    "backdrop-blur-sm",
                                    overview.subscription.status === "active"
                                        ? "border-green-500/20 bg-green-500/10 text-green-500"
                                        : overview.subscription.status === "trialing"
                                          ? "border-blue-500/20 bg-blue-500/10 text-blue-500"
                                          : "border-muted bg-muted text-muted-foreground"
                                )}
                            >
                                {overview.subscription.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <div className="text-2xl font-bold">{overview.subscription.plan}</div>
                            {overview.subscription.amount && overview.subscription.currency && (
                                <div className="text-sm text-muted-foreground">
                                    {formatCurrencyMajor(
                                        overview.subscription.amount,
                                        overview.subscription.currency
                                    )}
                                    /month
                                </div>
                            )}
                        </div>
                        {overview.subscription.nextBillingDate && (
                            <div className="text-sm text-muted-foreground">
                                Next billing: {formatDate(overview.subscription.nextBillingDate)}
                            </div>
                        )}
                        {onManageSubscription && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onManageSubscription}
                                className="mt-2 w-full justify-between"
                            >
                                Manage Subscription
                                <ChevronRightIcon className="h-4 w-4" />
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Credits Card */}
                {overview.credits && (
                    <Card className="shadow-lg transition-all duration-200 hover:shadow-xl">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <CoinsIcon className="h-4 w-4 text-primary" />
                                Credits
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <div className="text-2xl font-bold tabular-nums">
                                    {overview.credits.balance.toLocaleString()}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {overview.credits.currency} available
                                </div>
                            </div>
                            {onManageCredits && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onManageCredits}
                                    className="mt-2 w-full justify-between"
                                >
                                    Manage Credits
                                    <ChevronRightIcon className="h-4 w-4" />
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Usage Summary */}
                {overview.usage && overview.usage.length > 0 && (
                    <Card className="shadow-lg transition-all duration-200 hover:shadow-xl">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <ActivityIcon className="h-4 w-4 text-primary" />
                                Usage
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {overview.usage.slice(0, 3).map((metric, index) => {
                                const percentage = getUsagePercentage(metric.current, metric.limit);
                                return (
                                    <div key={index} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span>{metric.name}</span>
                                            <span className="text-muted-foreground">
                                                {metric.current}/{metric.limit}
                                            </span>
                                        </div>
                                        <Progress value={percentage} className="h-1.5" />
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Recent Invoices */}
            {overview.recentInvoices && overview.recentInvoices.length > 0 && (
                <Card className="shadow-lg">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FileTextIcon className="h-4 w-4 text-primary" />
                                Recent Invoices
                            </CardTitle>
                            {onViewInvoices && (
                                <Button variant="ghost" size="sm" onClick={onViewInvoices}>
                                    View All
                                    <ChevronRightIcon className="ml-1 h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {overview.recentInvoices.slice(0, 5).map((invoice, index) => (
                                <React.Fragment key={invoice.id}>
                                    <div className="flex items-center justify-between py-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium">{invoice.date}</span>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "text-xs backdrop-blur-sm",
                                                    invoice.status === "paid"
                                                        ? "border-green-500/20 bg-green-500/10 text-green-500"
                                                        : "border-muted bg-muted text-muted-foreground"
                                                )}
                                            >
                                                {invoice.status}
                                            </Badge>
                                        </div>
                                        <span className="font-medium">{invoice.amount}</span>
                                    </div>
                                    {index < overview.recentInvoices!.length - 1 && (
                                        <Separator />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

BillingOverview.displayName = "BillingOverview";
