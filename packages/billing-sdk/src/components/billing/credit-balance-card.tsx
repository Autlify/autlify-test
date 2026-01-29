/**
 * Credit Balance Card Component
 * Displays credit balance with progress bar and stats
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
    Progress,
} from "../ui";
import { cn, formatDate } from "../../utils";
import type { CreditBalanceCardProps } from "../types";

// Icons
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

function TrendingDownIcon({ className }: { className?: string }) {
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
            <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
            <polyline points="16 17 22 17 22 11" />
        </svg>
    );
}

function CalendarIcon({ className }: { className?: string }) {
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
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
    );
}

export function CreditBalanceCard({
    balance,
    onPurchaseCredits,
    showPurchaseButton = true,
    className,
}: CreditBalanceCardProps) {
    const usagePercentage = (balance.used / balance.total) * 100;
    const remainingPercentage = 100 - usagePercentage;

    return (
        <div className={cn("rounded-lg border border-border/50 bg-surface-secondary p-6", className)}>
            <Card className="overflow-hidden shadow-lg">
                <CardHeader className="px-4 pb-4 sm:px-6 sm:pb-6">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg sm:gap-3 sm:text-xl">
                            <div className="rounded-lg bg-primary/10 p-1.5 ring-1 ring-primary/20 sm:p-2">
                                <CoinsIcon className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                            </div>
                            Credit Balance
                        </CardTitle>
                        {showPurchaseButton && onPurchaseCredits && (
                            <Button
                                size="sm"
                                onClick={onPurchaseCredits}
                                className="shadow-lg transition-all duration-200 hover:shadow-xl"
                            >
                                <PlusIcon className="mr-1.5 h-4 w-4" />
                                Add Credits
                            </Button>
                        )}
                    </div>
                    <CardDescription className="text-sm sm:text-base">
                        Track your credit usage and balance
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 px-4 sm:px-6">
                    {/* Progress Bar Section */}
                    <div className="space-y-3">
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold tabular-nums sm:text-4xl">
                                {balance.remaining.toLocaleString()}
                            </span>
                            <span className="text-base text-muted-foreground sm:text-lg">
                                / {balance.total.toLocaleString()}
                            </span>
                            <span className="ml-auto text-sm text-muted-foreground">
                                {balance.currency}
                            </span>
                        </div>

                        <Progress value={remainingPercentage} className="h-2" />

                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <TrendingDownIcon className="h-4 w-4" />
                                <span>{balance.used.toLocaleString()} used</span>
                            </div>
                            {balance.expiresAt && (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <CalendarIcon className="h-4 w-4" />
                                    <span>
                                        Expires {formatDate(balance.expiresAt)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 divide-x rounded-lg border bg-muted/30">
                        <div className="p-4 text-center">
                            <div className="text-xl font-bold text-primary sm:text-2xl">
                                {balance.total.toLocaleString()}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">Total</div>
                        </div>
                        <div className="p-4 text-center">
                            <div className="text-xl font-bold text-orange-600 sm:text-2xl">
                                {balance.used.toLocaleString()}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">Used</div>
                        </div>
                        <div className="p-4 text-center">
                            <div className="text-xl font-bold text-green-600 sm:text-2xl">
                                {balance.remaining.toLocaleString()}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">Remaining</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

CreditBalanceCard.displayName = "CreditBalanceCard";
