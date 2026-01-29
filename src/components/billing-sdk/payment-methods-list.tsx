"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { SavedBankCardsGallery, type BankCardProps } from "@/components/ui/bank-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaymentForm } from "./payment-form";

export interface PaymentMethod {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  cardholderName?: string;
}

interface PaymentMethodsListProps {
  paymentMethods: PaymentMethod[];
  onAddCard?: (paymentMethodId: string) => void | Promise<void>;
  onSetDefault?: (methodId: string) => void | Promise<void>;
  onRemoveCard?: (methodId: string) => void | Promise<void>;
  onReplaceCard?: (methodId: string) => void | Promise<void>;
  className?: string;
  showAddButton?: boolean;
  emptyMessage?: string;
}

export function PaymentMethodsList({
  paymentMethods,
  onAddCard,
  onSetDefault,
  onRemoveCard,
  onReplaceCard,
  className,
  showAddButton = true,
  emptyMessage = "No payment methods saved",
}: PaymentMethodsListProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Convert PaymentMethod[] to cards format
  const savedCards = paymentMethods.map((method) => ({
    id: method.id,
    cardNumber: `•••• •••• •••• ${method.last4}`,
    brand: method.brand,
    expiryMonth: String(method.expiryMonth).padStart(2, '0'),
    expiryYear: String(method.expiryYear),
    cardholderName: method.cardholderName || "Cardholder",
    isDefault: method.isDefault,
    isMasked: true,
  }));

  const handleAddNew = () => {
    if (onAddCard) {
      setShowAddDialog(true);
    }
  };

  const handlePaymentSuccess = async (paymentMethodId: string) => {
    if (onAddCard) {
      await onAddCard(paymentMethodId);
    }
    setShowAddDialog(false);
  };

  return (
    <div className="rounded-lg border border-border/50 bg-surface-secondary p-6">
      <div className={cn("w-full", className)}>
      <Card className="shadow-lg">
        <CardHeader className="px-4 pb-4 sm:px-6 sm:pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <div className="bg-primary/10 ring-primary/20 rounded-lg p-1.5 ring-1 sm:p-2">
                  <CreditCard className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                Payment Methods
              </CardTitle>
              <CardDescription className="mt-2 text-sm sm:text-base">
                Manage your saved payment methods
              </CardDescription>
            </div>
            {showAddButton && onAddCard && (
              <Button
                onClick={handleAddNew}
                size="sm"
                className="shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="px-4 sm:px-6">
          {savedCards.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/10">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">{emptyMessage}</p>
              {onAddCard && (
                <Button
                  onClick={handleAddNew}
                  variant="outline"
                  className="shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              )}
            </div>
          ) : (
            <SavedBankCardsGallery
              cards={savedCards}
              onSetDefault={onSetDefault}
              onRemoveCard={onRemoveCard}
              onReplaceCard={onReplaceCard}
            />
          )}
        </CardContent>
      </Card>

      {/* Add Payment Method Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>
              Add a new payment method to your account
            </DialogDescription>
          </DialogHeader>
          <PaymentForm
            onSuccess={handlePaymentSuccess}
            onCancel={() => setShowAddDialog(false)}
            showCardPreview={true}
            buttonText="Add Payment Method"
          />
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
