"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {  Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const handleConfirm = async () => {
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
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            Change Plan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
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
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {selectedPlanId === currentPlanId ? "Current Plan" : "Confirm Change"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
