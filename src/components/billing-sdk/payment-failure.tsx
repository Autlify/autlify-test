"use client";

import * as React from "react";
import { XCircle, RefreshCw, Home, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface PaymentFailureProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  message?: string;
  reasons?: string[];
  isRetrying?: boolean;
  retryButtonText?: string;
  secondaryButtonText?: string;
  tertiaryButtonText?: string;
  onRetry?: () => void;
  onSecondary?: () => void;
  onTertiary?: () => void;
}

export const PaymentFailure = React.forwardRef<HTMLDivElement, PaymentFailureProps>(
  (
    {
      className,
      title = "Payment Failed",
      subtitle = "We couldn't process your payment.",
      message = "Please check your payment details and try again, or contact your bank for more information.",
      reasons = [
        "Insufficient funds in your account",
        "Incorrect card details or expired card",
        "Card declined by your bank",
        "Network connection issues",
      ],
      isRetrying = false,
      retryButtonText = "Try Again",
      secondaryButtonText = "Home",
      tertiaryButtonText = "Support",
      onRetry,
      onSecondary,
      onTertiary,
      ...props
    },
    ref
  ) => {
    return (
      <div className="rounded-lg border border-border/50 bg-surface-secondary p-6">
        <Card ref={ref} className={cn("w-full max-w-md shadow-lg", className)} {...props}>
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-3 border border-destructive/20">
                <XCircle className="h-16 w-16 text-destructive" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">{title}</CardTitle>
              <CardDescription className="mt-2 text-base">{subtitle}</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {reasons.length > 0 && (
              <div className="space-y-2 rounded-lg border border-border/30 bg-muted/30 p-4 backdrop-blur-sm">
                <h3 className="text-sm font-semibold">Common reasons for payment failure:</h3>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {reasons.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {message && <p className="text-center text-sm text-muted-foreground">{message}</p>}
          </CardContent>

          <CardFooter className="flex flex-col space-y-2">
            <Button
              onClick={onRetry}
              className="w-full shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isRetrying || !onRetry}
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {retryButtonText}
                </>
              )}
            </Button>

            {(onSecondary || onTertiary) && (
              <div className="flex w-full gap-2">
                {onSecondary && (
                  <Button
                    onClick={onSecondary}
                    variant="outline"
                    className="flex-1 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    {secondaryButtonText}
                  </Button>
                )}

                {onTertiary && (
                  <Button
                    onClick={onTertiary}
                    variant="outline"
                    className="flex-1 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    {tertiaryButtonText}
                  </Button>
                )}
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }
);

PaymentFailure.displayName = "PaymentFailure";
