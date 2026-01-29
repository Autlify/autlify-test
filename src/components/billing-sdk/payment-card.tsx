"use client";

import React, { useState } from "react";
import { BankCard, type CardIssuer } from "@/components/ui/bank-card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Check, MoreVertical, Trash2, Edit, Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface PaymentCardData {
  id: string;
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
  cardholderName?: string;
  isDefault?: boolean;
  issuer?: CardIssuer;
}

export interface PaymentCardProps {
  card: PaymentCardData;
  onSetDefault?: (cardId: string) => void | Promise<void>;
  onRemove?: (cardId: string) => void | Promise<void>;
  onUpdate?: (cardId: string) => void | Promise<void>;
  showActions?: boolean;
  className?: string;
  variant?: "default" | "premium" | "platinum" | "black";
}

export function PaymentCard({
  card,
  onSetDefault,
  onRemove,
  onUpdate,
  showActions = true,
  className,
  variant = "default",
}: PaymentCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const handleSetDefault = async () => {
    if (!onSetDefault || card.isDefault) return;

    setIsSettingDefault(true);
    try {
      await onSetDefault(card.id);
      toast.success("Default payment method updated");
    } catch (error: any) {
      console.error("Error setting default:", error);
      toast.error(error.message || "Failed to set default payment method");
    } finally {
      setIsSettingDefault(false);
    }
  };

  const handleRemove = async () => {
    if (!onRemove) return;

    setIsRemoving(true);
    try {
      await onRemove(card.id);
      toast.success("Payment method removed");
      setShowRemoveDialog(false);
    } catch (error: any) {
      console.error("Error removing card:", error);
      toast.error(error.message || "Failed to remove payment method");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleUpdate = async () => {
    if (!onUpdate) return;

    try {
      await onUpdate(card.id);
    } catch (error: any) {
      console.error("Error updating card:", error);
      toast.error(error.message || "Failed to update payment method");
    }
  };

  const maskedCardNumber = `•••• •••• •••• ${card.last4}`;
  const expiryDate = `${String(card.expMonth).padStart(2, "0")}/${String(card.expYear).slice(-2)}`;

  return (
    <div className={cn("relative group", className)}>
      {/* Card Display */}
      <div className="relative">
        <BankCard
          cardNumber={maskedCardNumber}
          cardholderName={card.cardholderName || "CARDHOLDER NAME"}
          expiryMonth={expiryDate?.split('/')[0] || "MM"}
          expiryYear={expiryDate?.split('/')[1] || "YY"}
          variant={variant}
          issuer={card.issuer}
          showBankLogo={true}
          className="w-full"
        />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {card.isDefault && (
            <Badge
              variant="default"
              className="bg-gradient-to-r from-green-500 to-green-600 text-white border-white/80 shadow-lg backdrop-blur-sm"
            >
              <Check className="h-3 w-3 mr-1" />
              Default
            </Badge>
          )}
        </div>

        {/* Actions Menu */}
        {showActions && (
          <div className="absolute top-4 right-4">
            <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-white/90 dark:bg-neutral-800/90 hover:bg-white dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 shadow-sm"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {!card.isDefault && onSetDefault && (
                    <>
                      <DropdownMenuItem
                        onClick={handleSetDefault}
                        disabled={isSettingDefault}
                        className="cursor-pointer"
                      >
                        {isSettingDefault ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Star className="mr-2 h-4 w-4" />
                        )}
                        Set as Default
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {onUpdate && (
                    <>
                      <DropdownMenuItem onClick={handleUpdate} className="cursor-pointer">
                        <Edit className="mr-2 h-4 w-4" />
                        Update Card
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {onRemove && (
                    <DialogTrigger asChild>
                      <DropdownMenuItem
                        className="cursor-pointer text-destructive focus:text-destructive"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove Card
                      </DropdownMenuItem>
                    </DialogTrigger>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Remove Confirmation Dialog */}
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Remove Payment Method</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to remove this payment method ending in {card.last4}?
                    This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowRemoveDialog(false)}
                    disabled={isRemoving}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleRemove}
                    disabled={isRemoving}
                  >
                    {isRemoving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Remove
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Card Info Below (Optional) */}
      <div className="mt-3 px-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {card.brand} •••• {card.last4}
          </span>
          <span className="text-muted-foreground">Expires {expiryDate}</span>
        </div>
      </div>
    </div>
  );
}

// Gallery Component for Multiple Cards
export interface PaymentCardsGalleryProps {
  cards: PaymentCardData[];
  onSetDefault?: (cardId: string) => void | Promise<void>;
  onRemove?: (cardId: string) => void | Promise<void>;
  onUpdate?: (cardId: string) => void | Promise<void>;
  onAddNew?: () => void;
  className?: string;
  emptyMessage?: string;
}

export function PaymentCardsGallery({
  cards,
  onSetDefault,
  onRemove,
  onUpdate,
  onAddNew,
  className,
  emptyMessage = "No payment methods saved",
}: PaymentCardsGalleryProps) {
  if (cards.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="text-muted-foreground mb-4">{emptyMessage}</div>
        {onAddNew && (
          <Button onClick={onAddNew} className="shadow-lg hover:shadow-xl transition-all">
            Add Payment Method
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <PaymentCard
            key={card.id}
            card={card}
            onSetDefault={onSetDefault}
            onRemove={onRemove}
            onUpdate={onUpdate}
            showActions={true}
          />
        ))}
      </div>

      {onAddNew && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={onAddNew}
            variant="outline"
            className="shadow-lg hover:shadow-xl transition-all"
          >
            Add New Payment Method
          </Button>
        </div>
      )}
    </div>
  );
}
