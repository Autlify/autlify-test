import React from 'react'

import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { CreditCard, Plus, AlertCircle } from 'lucide-react'
import Stripe from 'stripe'
import { PaymentMethodsClient } from './_components/payment-methods-client'

type Props = { params: Promise<{ agencyId: string }> }

export default async function PaymentMethodsPage({ params }: Props) {
  const { agencyId } = await params

  const agency = await db.agency.findUnique({ where: { id: agencyId }, select: { customerId: true } })
  const customerId = agency?.customerId ?? null

  const methods = customerId
    ? await stripe.paymentMethods.list({ customer: customerId, type: 'card', limit: 10 })
    : { data: [] }

  const customer = customerId ? await stripe.customers.retrieve(customerId) as Stripe.Customer : null

  const defaultPm =
    customer && typeof customer !== 'string'
      ? (customer?.invoice_settings?.default_payment_method as any)?.id ?? null
      : null

  // Transform Stripe payment methods to bank card format
  const bankCards = methods.data.map((pm) => ({
    id: pm.id,
    cardNumber: `**** **** **** ${pm.card?.last4 || '****'}`,
    cardholderName: customer && typeof customer !== 'string' ? customer.name || 'Card Holder' : 'Card Holder',
    expiryMonth: String(pm.card?.exp_month || '').padStart(2, '0'),
    expiryYear: String(pm.card?.exp_year || '').slice(-2),
    variant: (defaultPm === pm.id ? 'premium' : 'default') as 'default' | 'premium' | 'platinum' | 'black',
    isDefault: defaultPm === pm.id,
    brand: pm.card?.brand?.toLowerCase() || 'visa',
  }))

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-card/50 via-card to-card/80 border-border/50 backdrop-blur-sm">
        <div className="p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">Payment Methods</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Manage your saved cards and payment options
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {customerId ? (
                <Badge variant="secondary" className="font-mono text-xs h-7 px-3">
                  {customerId}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs h-7 px-3">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  No customer
                </Badge>
              )}
              <Button asChild size="sm" className="h-8">
                <Link href="/site/pricing">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Card
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Payment Methods Gallery */}
      <Card className="p-6">
        {methods.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No payment methods found</h3>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
              Add a payment method by completing a checkout or subscribing to a plan.
            </p>
            <Button asChild>
              <Link href="/site/pricing">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Card
              </Link>
            </Button>
          </div>
        ) : (
          <PaymentMethodsClient agencyId={agencyId} cards={bankCards} />
        )}
      </Card>

      {/* Additional Info Card */}
      {methods.data.length > 0 && (
        <Card className="bg-muted/30 border-dashed">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Card Management</p>
                <p className="text-xs text-muted-foreground">
                  Your payment methods are securely stored by Stripe. You can manage them during checkout or by updating your subscription.
                  Default cards are automatically used for recurring charges.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
