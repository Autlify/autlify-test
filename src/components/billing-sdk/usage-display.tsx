"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UsageMetric {
  name: string;
  current: number;
  limit: number;
  unit: string;
  unlimited?: boolean;
}

export interface UsageDisplayProps {
  metrics: UsageMetric[];
  className?: string;
}

export function UsageDisplay({ metrics, className }: UsageDisplayProps) {
  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "bg-destructive";
    if (percentage >= 75) return "bg-orange-500";
    return "bg-primary";
  };

  return (
    <div className="rounded-lg border border-border/50 bg-surface-secondary p-6">
      <div className={cn("w-full space-y-4", className)}>
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2 ring-1 ring-primary/20">
          <Activity className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">Usage</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((metric, index) => {
          const percentage = metric.unlimited ? 0 : getUsagePercentage(metric.current, metric.limit);
          const progressColor = getUsageColor(percentage);

          return (
            <Card key={index} className="p-4 border-border/50 shadow-lg transition-all duration-200 hover:shadow-xl">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{metric.name}</h4>
                    <div className="text-sm text-muted-foreground mt-1">
                      {metric.unlimited ? (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 backdrop-blur-sm">
                          Unlimited
                        </Badge>
                      ) : (
                        <>
                          {metric.current.toLocaleString()} of {metric.limit.toLocaleString()} {metric.unit}
                        </>
                      )}
                    </div>
                  </div>
                  {!metric.unlimited && (
                    <Badge variant="outline" className={cn(
                      percentage >= 90 ? "bg-destructive/10 text-destructive border-destructive/20 backdrop-blur-sm" :
                      percentage >= 75 ? "bg-orange-500/10 text-orange-500 border-orange-500/20 backdrop-blur-sm" :
                      "bg-primary/10 text-primary border-primary/20 backdrop-blur-sm"
                    )}>
                      {percentage.toFixed(0)}%
                    </Badge>
                  )}
                </div>
                {!metric.unlimited && (
                  <div className="relative">
                    <Progress value={percentage} className="h-2" />
                    <div className={cn("absolute inset-y-0 left-0 rounded-full transition-all", progressColor)} style={{ width: `${percentage}%` }} />
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
