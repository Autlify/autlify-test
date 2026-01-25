'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { SavedBankCardsGallery } from '@/components/ui/bank-card'
import { useToast } from '@/components/ui/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { setDefaultPaymentMethod, removePaymentMethod, getReplaceCardUrl } from '../actions'

type BankCard = {
  id: string
  cardNumber: string
  cardholderName: string
  expiryMonth: string
  expiryYear: string
  variant: 'default' | 'premium' | 'platinum' | 'black'
  isDefault?: boolean
  brand?: string
}

type Props = {
  agencyId: string
  cards: BankCard[]
}

export function PaymentMethodsClient({ agencyId, cards }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(false)
  const [cardToRemove, setCardToRemove] = React.useState<string | null>(null)

  const handleSetDefault = async (cardId: string) => {
    setIsLoading(true)
    try {
      const result = await setDefaultPaymentMethod(agencyId, cardId)
      
      if (result.success) {
        toast({
          title: 'Default card updated',
          description: 'Your default payment method has been updated successfully.',
        })
        router.refresh()
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveCard = async (cardId: string) => {
    setCardToRemove(cardId)
  }

  const confirmRemoveCard = async () => {
    if (!cardToRemove) return

    setIsLoading(true)
    try {
      const result = await removePaymentMethod(agencyId, cardToRemove)
      
      if (result.success) {
        toast({
          title: 'Card removed',
          description: 'Your payment method has been removed successfully.',
        })
        router.refresh()
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
      setCardToRemove(null)
    }
  }

  const handleReplaceCard = async (cardId: string) => {
    const result = await getReplaceCardUrl()
    if (result.success) {
      router.push(result.data)
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      })
    }
  }

  const handleAddCard = () => {
    router.push('/site/pricing')
  }

  return (
    <>
      <SavedBankCardsGallery
        cards={cards}
        compact={false}
        onAddCard={handleAddCard}
        onSetDefault={handleSetDefault}
        onRemoveCard={handleRemoveCard}
        onReplaceCard={handleReplaceCard}
      />

      <AlertDialog open={cardToRemove !== null} onOpenChange={(open) => !open && setCardToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove payment method?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the card from your account. If this is your default payment method, 
              you'll need to set a new default before the next billing cycle.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveCard}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Removing...' : 'Remove Card'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
