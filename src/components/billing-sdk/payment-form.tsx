"use client";

import React, { useState } from "react";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Loader2, Lock, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { InteractiveBankCard } from "@/components/ui/bank-card";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Stripe Element styling
const stripeElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "hsl(var(--foreground))",
      fontFamily: "var(--font-sans)",
      "::placeholder": {
        color: "hsl(var(--muted-foreground))",
      },
      iconColor: "hsl(var(--primary))",
    },
    invalid: {
      iconColor: "hsl(var(--destructive))",
      color: "hsl(var(--destructive))",
    },
    complete: {
      iconColor: "hsl(var(--primary))",
    },
  },
};

interface PaymentFormContentProps {
  onSuccess: (paymentMethodId: string) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
  showCardPreview?: boolean;
  buttonText?: string;
}

function PaymentFormContent({
  onSuccess,
  onCancel,
  isLoading = false,
  className,
  showCardPreview = true,
  buttonText = "Add Payment Method",
}: PaymentFormContentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [errors, setErrors] = useState<{
    cardNumber?: string;
    cardExpiry?: string;
    cardCvc?: string;
    cardholderName?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    // Validate cardholder name
    if (!cardholderName.trim()) {
      setErrors({ ...errors, cardholderName: "Cardholder name is required" });
      toast.error("Please enter the cardholder name");
      return;
    }

    setProcessing(true);
    setErrors({});

    try {
      const cardNumberElement = elements.getElement(CardNumberElement);
      if (!cardNumberElement) {
        throw new Error("Card element not found");
      }

      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardNumberElement,
        billing_details: {
          name: cardholderName,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!paymentMethod) {
        throw new Error("Failed to create payment method");
      }

      // Call success callback
      await onSuccess(paymentMethod.id);

      toast.success("Payment method added successfully");
    } catch (error: any) {
      console.error("Payment method error:", error);
      toast.error(error.message || "Failed to add payment method");
      setErrors({ cardNumber: error.message });
    } finally {
      setProcessing(false);
    }
  };

  const handleCardNumberChange = (event: any) => {
    if (event.error) {
      setErrors({ ...errors, cardNumber: event.error.message });
    } else {
      setErrors({ ...errors, cardNumber: undefined });
      // Update card number for preview (masked)
      if (event.complete && event.brand) {
        const last4 = "••••"; // Stripe doesn't expose full number for security
        setCardNumber(`•••• •••• •••• ${last4}`);
      }
    }
  };

  const handleCardExpiryChange = (event: any) => {
    if (event.error) {
      setErrors({ ...errors, cardExpiry: event.error.message });
    } else {
      setErrors({ ...errors, cardExpiry: undefined });
      if (event.complete) {
        // Format is MM/YY from Stripe
        setExpiry("MM/YY"); // Placeholder since we can't access actual value
      }
    }
  };

  const handleCardCvcChange = (event: any) => {
    if (event.error) {
      setErrors({ ...errors, cardCvc: event.error.message });
    } else {
      setErrors({ ...errors, cardCvc: undefined });
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <Card className="shadow-lg">
        <CardHeader className="px-4 pb-4 sm:px-6 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <div className="bg-primary/10 ring-primary/20 rounded-lg p-1.5 ring-1 sm:p-2">
              <CreditCard className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            Payment Method
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Add a new payment method securely
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-4 sm:px-6">
          {/* Card Preview */}
          {showCardPreview && (
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <InteractiveBankCard
                  cardNumber={cardNumber || "•••• •••• •••• ••••"}
                  cardholderName={cardholderName || "CARDHOLDER NAME"}
                  expiryMonth={expiry?.split('/')[0] || "MM"}
                  expiryYear={expiry?.split('/')[1] || "YY"}
                  variant="default"
                  className="w-full"
                />
              </div>
            </div>
          )}

          <Separator />

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Cardholder Name */}
            <div>
              <Label htmlFor="cardholderName" className="mb-2 block">
                Cardholder Name *
              </Label>
              <Input
                id="cardholderName"
                type="text"
                value={cardholderName}
                onChange={(e) => {
                  setCardholderName(e.target.value);
                  setErrors({ ...errors, cardholderName: undefined });
                }}
                placeholder="John Doe"
                className="h-11"
                disabled={processing || isLoading}
              />
              {errors.cardholderName && (
                <p className="text-sm text-destructive mt-1">{errors.cardholderName}</p>
              )}
            </div>

            {/* Card Number */}
            <div>
              <Label htmlFor="cardNumber" className="mb-2 block">
                Card Number *
              </Label>
              <div className="relative">
                <div className="h-11 px-4 py-3 border border-input bg-background rounded-md shadow-sm hover:border-primary/50 transition-colors">
                  <CardNumberElement
                    id="cardNumber"
                    options={stripeElementOptions}
                    onChange={handleCardNumberChange}
                  />
                </div>
              </div>
              {errors.cardNumber && (
                <p className="text-sm text-destructive mt-1">{errors.cardNumber}</p>
              )}
            </div>

            {/* Expiry and CVC */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cardExpiry" className="mb-2 block">
                  Expiry Date *
                </Label>
                <div className="h-11 px-4 py-3 border border-input bg-background rounded-md shadow-sm hover:border-primary/50 transition-colors">
                  <CardExpiryElement
                    id="cardExpiry"
                    options={stripeElementOptions}
                    onChange={handleCardExpiryChange}
                  />
                </div>
                {errors.cardExpiry && (
                  <p className="text-sm text-destructive mt-1">{errors.cardExpiry}</p>
                )}
              </div>

              <div>
                <Label htmlFor="cardCvc" className="mb-2 block">
                  CVC *
                </Label>
                <div className="h-11 px-4 py-3 border border-input bg-background rounded-md shadow-sm hover:border-primary/50 transition-colors">
                  <CardCvcElement
                    id="cardCvc"
                    options={stripeElementOptions}
                    onChange={handleCardCvcChange}
                  />
                </div>
                {errors.cardCvc && (
                  <p className="text-sm text-destructive mt-1">{errors.cardCvc}</p>
                )}
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border">
              <Lock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Your payment information is encrypted and securely processed by Stripe. We never
                store your full card details.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-2">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={processing || isLoading}
                  className="shadow-sm"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={!stripe || processing || isLoading}
                className="shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {(processing || isLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {buttonText}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export interface PaymentFormProps extends PaymentFormContentProps {
  stripePublishableKey?: string;
  clientSecret?: string;
}

export function PaymentForm({
  stripePublishableKey,
  clientSecret,
  ...props
}: PaymentFormProps) {
  const stripeOptions: StripeElementsOptions = {
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "hsl(var(--primary))",
        colorText: "hsl(var(--foreground))",
        colorDanger: "hsl(var(--destructive))",
        borderRadius: "0.5rem",
      },
    },
    ...(clientSecret && { clientSecret }),
  };

  // Use provided key or default from env
  const stripeKey = stripePublishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!;
  const stripe = loadStripe(stripeKey);

  return (
    <Elements stripe={stripe} options={stripeOptions}>
      <PaymentFormContent {...props} />
    </Elements>
  );
}
