/**
 * Usage Display Component
 * Shows usage metrics with progress bars and color-coded warnings
 * @packageDocumentation
 */

"use client";

import * as React from "react";
import { Card, Badge, Progress } from "../ui";
import { cn, getUsagePercentage, getUsageBgClass } from "../../utils";
import type { UsageDisplayProps } from "../types";

// Activity Icon
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

export function UsageDisplay({ metrics, className, showProgress = true, compact = false }: UsageDisplayProps) {
    return (
        <div className={cn("rounded-lg border border-border/50 bg-surface-secondary p-6", className)}>
            <div className="w-full space-y-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 ring-1 ring-primary/20">
                        <ActivityIcon className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">Usage</h2>
                </div>

                <div className={cn(
                    "grid gap-4",
                    compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
                )}>
                    {metrics.map((metric, index) => {
                        const percentage = metric.unlimited
                            ? 0
                            : getUsagePercentage(metric.current, metric.limit);
                        const progressColor = getUsageBgClass(percentage);

                        return (
                            <Card
                                key={index}
                                className="border-border/50 p-4 shadow-lg transition-all duration-200 hover:shadow-xl"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-medium">{metric.name}</h4>
                                            <div className="mt-1 text-sm text-muted-foreground">
                                                {metric.unlimited ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-primary/20 bg-primary/10 text-primary backdrop-blur-sm"
                                                    >
                                                        Unlimited
                                                    </Badge>
                                                ) : (
                                                    <>
                                                        {metric.current.toLocaleString()} of{" "}
                                                        {metric.limit.toLocaleString()} {metric.unit}
                                                    </>
                                                )}
                                            </div>
                                            {metric.description && (
                                                <p className="mt-1 text-xs text-muted-foreground/70">
                                                    {metric.description}
                                                </p>
                                            )}
                                        </div>
                                        {!metric.unlimited && (
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "backdrop-blur-sm",
                                                    percentage >= 90
                                                        ? "border-destructive/20 bg-destructive/10 text-destructive"
                                                        : percentage >= 75
                                                          ? "border-orange-500/20 bg-orange-500/10 text-orange-500"
                                                          : "border-primary/20 bg-primary/10 text-primary"
                                                )}
                                            >
                                                {percentage.toFixed(0)}%
                                            </Badge>
                                        )}
                                    </div>
                                    {showProgress && !metric.unlimited && (
                                        <div className="relative">
                                            <Progress value={percentage} className="h-2" />
                                            <div
                                                className={cn(
                                                    "absolute inset-y-0 left-0 rounded-full transition-all",
                                                    progressColor
                                                )}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

UsageDisplay.displayName = "UsageDisplay";
