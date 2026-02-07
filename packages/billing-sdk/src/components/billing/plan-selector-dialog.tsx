"use client";

/**
 * Naropo Billing SDK - Plan Selector Dialog
 *
 * PROPRIETARY SOFTWARE - API Key Required
 * Copyright © 2026 Naropo. All rights reserved.
 */

import { useState, useCallback } from "react";
import {
    Button,
    Badge,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui";
import { cn } from "../../utils";

// Check icon inline SVG for portability
function CheckIcon({ className }: { className?: string }) {
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
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

// Loader icon inline SVG for portability
function LoaderIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("animate-spin", className)}
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}

export interface PlanOption {
    id: string;
    name: string;
    description: string;
    monthlyPrice: string;
    yearlyPrice: string;
    currency: string;
    features: string[];
    popular?: boolean;
}

export interface PlanSelectorDialogProps {
    currentPlanId: string;
    plans: PlanOption[];
    onSelectPlan: (planId: string, billingCycle: "monthly" | "yearly") => Promise<void>;
    trigger?: React.ReactNode;
    className?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function PlanSelectorDialog({
    currentPlanId,
    plans,
    onSelectPlan,
    trigger,
    className,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
}: PlanSelectorDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = controlledOnOpenChange || setInternalOpen;
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
    const [selectedPlanId, setSelectedPlanId] = useState(currentPlanId);
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = useCallback(async () => {
        if (selectedPlanId === currentPlanId) {
            setOpen(false);
            return;
        }

        setIsLoading(true);
        try {
            await onSelectPlan(selectedPlanId, billingCycle);
            setOpen(false);
        } catch (error) {
            console.error("Failed to update plan:", error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedPlanId, currentPlanId, billingCycle, onSelectPlan, setOpen]);

    const handleOpenChange = useCallback((newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            // Reset selection when dialog closes
            setSelectedPlanId(currentPlanId);
        }
    }, [setOpen, currentPlanId]);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            {trigger && (
                <button type="button" onClick={() => setOpen(true)}>
                    {trigger}
                </button>
            )}
            <DialogContent className={cn("max-w-4xl max-h-[90vh] overflow-y-auto", className)}>
                <DialogHeader>
                    <DialogTitle>Change Your Plan</DialogTitle>
                    <DialogDescription>
                        Select a new plan to upgrade or downgrade your subscription
                    </DialogDescription>
                </DialogHeader>

                {/* Billing Cycle Toggle */}
                <div className="flex justify-center">
                    <div className="inline-flex rounded-lg border border-border p-1 bg-muted/50">
                        <button
                            type="button"
                            onClick={() => setBillingCycle("monthly")}
                            className={cn(
                                "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                                billingCycle === "monthly"
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Monthly
                        </button>
                        <button
                            type="button"
                            onClick={() => setBillingCycle("yearly")}
                            className={cn(
                                "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                                billingCycle === "yearly"
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Yearly <span className="text-xs">(Save 20%)</span>
                        </button>
                    </div>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                    {plans.map((plan) => {
                        const isSelected = selectedPlanId === plan.id;
                        const isCurrent = currentPlanId === plan.id;
                        const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;

                        return (
                            <button
                                key={plan.id}
                                type="button"
                                onClick={() => setSelectedPlanId(plan.id)}
                                className={cn(
                                    "relative rounded-xl border p-6 text-left transition-all duration-200 shadow-lg hover:shadow-xl",
                                    isSelected
                                        ? "border-primary bg-primary/5 ring-2 ring-primary"
                                        : "border-border hover:border-primary/50",
                                    isCurrent && "ring-1 ring-border"
                                )}
                            >
                                {plan.popular && (
                                    <Badge className="absolute -top-2 left-4 bg-primary text-primary-foreground border-0 backdrop-blur-sm">
                                        Most Popular
                                    </Badge>
                                )}
                                {isCurrent && (
                                    <Badge variant="outline" className="absolute -top-2 right-4 backdrop-blur-sm">
                                        Current Plan
                                    </Badge>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-lg">{plan.name}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {plan.description}
                                        </p>
                                    </div>

                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold">{plan.currency}{price}</span>
                                        <span className="text-sm text-muted-foreground">
                                            /{billingCycle === "monthly" ? "mo" : "yr"}
                                        </span>
                                    </div>

                                    <div className="space-y-2 pt-2">
                                        {plan.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-start gap-2">
                                                <CheckIcon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                                <span className="text-sm text-muted-foreground">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isLoading || selectedPlanId === currentPlanId}
                    >
                        {isLoading && <LoaderIcon className="mr-2 h-4 w-4" />}
                        {selectedPlanId === currentPlanId ? "Current Plan" : "Confirm Change"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

PlanSelectorDialog.displayName = "PlanSelectorDialog";
