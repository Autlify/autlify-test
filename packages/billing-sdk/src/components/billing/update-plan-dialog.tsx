"use client";

/**
 * Autlify Billing SDK - Update Plan Dialog
 *
 * PROPRIETARY SOFTWARE - API Key Required
 * Copyright © 2026 Autlify. All rights reserved.
 */

import { useState, useCallback } from "react";
import {
  Button,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Label,
} from "../ui";
import { cn } from "../../utils";
import type { Plan } from "../../types/subscription";

export interface UpdatePlanDialogProps {
  currentPlan: Plan;
  plans: Plan[];
  triggerText: string;
  onPlanChange: (planId: string) => void;
  className?: string;
  title?: string;
}

export function UpdatePlanDialog({
  currentPlan,
  plans,
  onPlanChange,
  className,
  title,
  triggerText,
}: UpdatePlanDialogProps) {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | undefined>(
    undefined,
  );
  const [isOpen, setIsOpen] = useState(false);

  const getCurrentPrice = useCallback(
    (plan: Plan) => (isYearly ? `${plan.yearlyPrice}` : `${plan.monthlyPrice}`),
    [isYearly],
  );

  const handlePlanChange = useCallback((planId: string) => {
    setSelectedPlan((prev) => (prev === planId ? undefined : planId));
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSelectedPlan(undefined);
    }
  }, []);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        {triggerText || "Update Plan"}
      </Button>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          className={cn(
            "text-foreground flex max-h-[95vh] flex-col gap-3 sm:max-h-[90vh] sm:gap-4",
            "w-[calc(100vw-2rem)] max-w-2xl sm:w-full",
            "p-4 sm:p-6",
            className,
          )}
        >
          <DialogHeader className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pb-0">
            <DialogTitle className="text-lg font-semibold sm:text-xl">
              {title || "Upgrade Plan"}
            </DialogTitle>
            <div className="flex items-center gap-1.5 text-sm sm:gap-2">
              <Button
                variant={!isYearly ? "default" : "outline"}
                size="sm"
                onClick={() => setIsYearly(false)}
                className="h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm"
              >
                Monthly
              </Button>
              <Button
                variant={isYearly ? "default" : "outline"}
                size="sm"
                onClick={() => setIsYearly(true)}
                className="h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm"
              >
                Yearly
              </Button>
            </div>
          </DialogHeader>
          
          <div
            className="[&::-webkit-scrollbar-thumb]:bg-muted hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 -mx-4 min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 sm:-mx-6 sm:px-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "hsl(var(--muted)) transparent",
            }}
          >
            {plans.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-center">
                <p className="text-muted-foreground text-sm">
                  No plans available
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 pr-0.5 pb-2 sm:space-y-3">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => handlePlanChange(plan.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handlePlanChange(plan.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selectedPlan === plan.id}
                    className={cn(
                      "relative cursor-pointer overflow-hidden rounded-lg border transition-all duration-200 sm:rounded-xl",
                      "focus-visible:ring-primary touch-manipulation focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                      selectedPlan === plan.id
                        ? "border-primary from-muted/60 to-muted/30 bg-gradient-to-br shadow-sm"
                        : "border-border hover:border-primary/50",
                    )}
                  >
                    <div className="p-3 sm:p-4">
                      <div className="flex items-start justify-between gap-2 sm:gap-3">
                        <div className="flex min-w-0 flex-1 gap-2 sm:gap-3">
                          <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                            <div className={cn(
                              "h-4 w-4 rounded-full border-2 flex items-center justify-center",
                              selectedPlan === plan.id 
                                ? "border-primary bg-primary" 
                                : "border-muted-foreground/20"
                            )}>
                              {selectedPlan === plan.id && (
                                <div className="h-2 w-2 rounded-full bg-white" />
                              )}
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                              <Label
                                className="cursor-pointer text-sm leading-tight font-semibold sm:text-base sm:font-medium"
                              >
                                {plan.title}
                              </Label>
                              {plan.badge && (
                                <Badge
                                  variant="secondary"
                                  className="h-5 flex-shrink-0 px-1.5 py-0 text-[10px] sm:h-auto sm:px-2 sm:py-0.5 sm:text-xs"
                                >
                                  {plan.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed sm:text-xs">
                              {plan.description}
                            </p>
                            {plan.features.length > 0 && (
                              <div className="pt-2 sm:pt-3">
                                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                  {plan.features.map((feature, featureIndex) => (
                                    <div
                                      key={featureIndex}
                                      className="bg-muted/20 border-border/30 flex flex-shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 sm:gap-2 sm:rounded-lg"
                                    >
                                      <div className="bg-primary h-1 w-1 flex-shrink-0 rounded-full sm:h-1.5 sm:w-1.5" />
                                      <span className="text-muted-foreground text-[10px] leading-none whitespace-nowrap sm:text-xs">
                                        {feature.name}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="min-w-[60px] flex-shrink-0 text-right sm:min-w-[80px]">
                          <div className="text-base leading-tight font-bold sm:text-xl sm:font-semibold">
                            {parseFloat(getCurrentPrice(plan)) >= 0
                              ? `${plan.currency || ""}${getCurrentPrice(plan)}`
                              : getCurrentPrice(plan)}
                          </div>
                          <div className="text-muted-foreground mt-0.5 text-[10px] sm:text-xs">
                            /{isYearly ? "year" : "month"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedPlan === plan.id && (
                      <div className="overflow-hidden">
                        <div className="px-3 pb-3 sm:px-4 sm:pb-4">
                          <Button
                            className="h-10 w-full touch-manipulation text-sm font-medium sm:h-11 sm:text-base"
                            disabled={selectedPlan === currentPlan.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlanChange(plan.id);
                              handleOpenChange(false);
                            }}
                          >
                            {selectedPlan === currentPlan.id
                              ? "Current Plan"
                              : "Upgrade"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
