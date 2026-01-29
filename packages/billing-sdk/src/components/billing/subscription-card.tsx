/**
 * Subscription Card Component
 * Displays current subscription details with plan info and billing information
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
    Badge,
    Separator,
    Button,
} from "../ui";
import { cn } from "../../utils";
import type { SubscriptionCardProps } from "../types";

// Icons (inline SVG for portability)
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

export function SubscriptionCard({
    plan,
    billingInfo,
    onChangePlan,
    onCancelSubscription,
    className,
}: SubscriptionCardProps) {
    return (
        <div className={cn("rounded-lg border border-border/50 bg-surface-secondary p-6", className)}>
            <Card className="shadow-lg">
                <CardHeader className="px-4 pb-4 sm:px-6 sm:pb-6">
                    <CardTitle className="flex items-center gap-2 text-lg sm:gap-3 sm:text-xl">
                        <div className="rounded-lg bg-primary/10 p-1.5 ring-1 ring-primary/20 sm:p-2">
                            <CreditCardIcon className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                        </div>
                        Current Subscription
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                        Manage your billing and subscription settings
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 px-4 sm:space-y-8 sm:px-6">
                    {/* Current Plan Details */}
                    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 p-3 sm:p-4">
                        <div className="relative">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
                                <div className="w-full">
                                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-semibold sm:text-xl">
                                                {plan.name} Plan
                                            </h3>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge
                                                variant={plan.status === "active" ? "default" : "outline"}
                                                className="border-0 bg-primary/90 text-xs font-medium shadow-sm hover:bg-primary sm:text-sm"
                                            >
                                                {plan.price}/{plan.billingCycle}
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className="border-border/60 bg-background/50 text-xs shadow-sm backdrop-blur-sm sm:text-sm"
                                            >
                                                {plan.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <p className="relative z-10 text-xs text-muted-foreground sm:text-sm">
                                        {plan.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-4 bg-gradient-to-r from-transparent via-border to-transparent sm:my-6" />

                    {/* Billing Information */}
                    <div className="space-y-3 sm:space-y-4">
                        <h4 className="flex items-center gap-2 text-base font-medium sm:text-lg">
                            <div className="rounded-md bg-muted p-1 ring-1 ring-border/50 sm:p-1.5">
                                <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                            </div>
                            Billing Information
                        </h4>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6">
                            <div className="group rounded-lg border border-border/30 bg-gradient-to-b from-muted to-background/10 p-2.5 transition-all duration-200 hover:border-border/60 sm:p-3">
                                <span className="mb-1 block text-xs text-muted-foreground sm:text-sm">
                                    Next billing date
                                </span>
                                <div className="text-sm font-medium transition-colors duration-200 group-hover:text-primary sm:text-base">
                                    {billingInfo.nextBillingDate}
                                </div>
                            </div>
                            <div className="group rounded-lg border border-border/30 bg-gradient-to-b from-muted to-background/10 p-2.5 transition-all duration-200 hover:border-border/60 sm:p-3">
                                <span className="mb-1 block text-xs text-muted-foreground sm:text-sm">
                                    Payment method
                                </span>
                                <div className="text-sm font-medium transition-colors duration-200 group-hover:text-primary sm:text-base">
                                    {billingInfo.paymentMethod}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-4 bg-gradient-to-r from-transparent via-border to-transparent sm:my-6" />

                    {/* Actions */}
                    <div className="flex flex-col gap-3 sm:flex-row">
                        {onChangePlan && (
                            <Button
                                onClick={onChangePlan}
                                className="mx-0 shadow-lg transition-all duration-200 hover:shadow-xl"
                            >
                                Change Plan
                            </Button>
                        )}
                        {onCancelSubscription && (
                            <Button
                                onClick={onCancelSubscription}
                                variant="outline"
                                className="mx-0 shadow-lg transition-all duration-200 hover:shadow-xl"
                            >
                                Cancel Subscription
                            </Button>
                        )}
                    </div>

                    {/* Features */}
                    <div className="pt-4 sm:pt-6">
                        <h4 className="mb-3 text-base font-medium sm:mb-4 sm:text-lg">
                            Current Plan Features
                        </h4>
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            {plan.features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="group flex items-center gap-2 rounded-lg border border-border/80 p-2 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5"
                                >
                                    <div className="h-1 w-1 flex-shrink-0 rounded-full bg-primary transition-all duration-200 group-hover:scale-125 sm:h-1.5 sm:w-1.5" />
                                    <span className="text-xs text-muted-foreground transition-colors duration-200 group-hover:text-foreground sm:text-sm">
                                        {feature}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

SubscriptionCard.displayName = "SubscriptionCard";
