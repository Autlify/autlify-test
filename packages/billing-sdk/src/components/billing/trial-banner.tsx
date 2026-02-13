/**
 * Trial Banner Component
 * Displays trial status with countdown and upgrade CTA
 * @packageDocumentation
 */

"use client";

import * as React from "react";
import { Button, Badge } from "../ui";
import { cn, getDaysRemaining, formatDate } from "../../utils";
import type { TrialBannerProps } from "../types";

// Icons
function ClockIcon({ className }: { className?: string }) {
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
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}

function SparklesIcon({ className }: { className?: string }) {
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
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" />
            <path d="M19 17v4" />
            <path d="M3 5h4" />
            <path d="M17 19h4" />
        </svg>
    );
}

function AlertTriangleIcon({ className }: { className?: string }) {
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
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" x2="12" y1="9" y2="13" />
            <line x1="12" x2="12.01" y1="17" y2="17" />
        </svg>
    );
}

export function TrialBanner({
    trialEndDate,
    onUpgrade,
    features = [],
    variant = "default",
    className,
}: TrialBannerProps) {
    const daysRemaining = getDaysRemaining(trialEndDate);
    const isExpired = daysRemaining <= 0;
    const isUrgent = daysRemaining <= 3 && !isExpired;

    // Determine actual variant
    const resolvedVariant = isExpired ? "expired" : isUrgent ? "urgent" : variant;

    const variantStyles = {
        default: {
            container: "border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5",
            icon: "text-primary",
            badge: "bg-primary/10 text-primary border-primary/20",
        },
        urgent: {
            container: "border-orange-500/20 bg-gradient-to-r from-orange-500/5 via-orange-500/10 to-orange-500/5",
            icon: "text-orange-500",
            badge: "bg-orange-500/10 text-orange-500 border-orange-500/20",
        },
        expired: {
            container: "border-destructive/20 bg-gradient-to-r from-destructive/5 via-destructive/10 to-destructive/5",
            icon: "text-destructive",
            badge: "bg-destructive/10 text-destructive border-destructive/20",
        },
    };

    const styles = variantStyles[resolvedVariant];

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-lg border p-4 sm:p-6",
                styles.container,
                className
            )}
        >
            {/* Background decoration */}
            <div className="absolute right-0 top-0 -translate-y-1/4 translate-x-1/4 opacity-10">
                <SparklesIcon className="h-32 w-32" />
            </div>

            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3 sm:items-center">
                    <div className={cn("rounded-lg bg-background/50 p-2 backdrop-blur-sm", styles.icon)}>
                        {isExpired ? (
                            <AlertTriangleIcon className="h-5 w-5" />
                        ) : (
                            <ClockIcon className="h-5 w-5" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold">
                                {isExpired
                                    ? "Trial Expired"
                                    : `${daysRemaining} Day${daysRemaining !== 1 ? "s" : ""} Left in Trial`}
                            </h3>
                            <Badge variant="outline" className={cn("backdrop-blur-sm", styles.badge)}>
                                {isExpired ? "Expired" : "Trial"}
                            </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {isExpired
                                ? "Your trial has ended. Upgrade now to continue using all features."
                                : `Trial ends on ${formatDate(trialEndDate)}. Upgrade to keep access to all features.`}
                        </p>
                        {features.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {features.slice(0, 3).map((feature, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-1 text-xs text-muted-foreground"
                                    >
                                        <span className="h-1 w-1 rounded-full bg-current" />
                                        {feature}
                                    </span>
                                ))}
                                {features.length > 3 && (
                                    <span className="text-xs text-muted-foreground">
                                        +{features.length - 3} more
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {onUpgrade && (
                    <Button
                        onClick={onUpgrade}
                        className={cn(
                            "shrink-0 shadow-lg transition-all duration-200 hover:shadow-xl",
                            isExpired && "animate-pulse"
                        )}
                    >
                        <SparklesIcon className="mr-2 h-4 w-4" />
                        {isExpired ? "Upgrade Now" : "Upgrade"}
                    </Button>
                )}
            </div>
        </div>
    );
}

TrialBanner.displayName = "TrialBanner";
