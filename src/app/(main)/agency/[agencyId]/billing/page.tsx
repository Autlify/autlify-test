import React from 'react'
import { redirect } from 'next/navigation'
import { stripe } from '@/lib/stripe'
import { addOnProducts, pricingCards } from '@/lib/constants'
import { db } from '@/lib/db'
import { SubscriptionManagement } from '@autlify/billing-sdk/components'
import type { CurrentPlan, Plan } from '@/lib/features/core/billing/billingsdk-config'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import clsx from 'clsx'
import SubscriptionHelper from '../billing/_components/subscription-helper'
import PricingCard from './_components/pricing-card'

type Props = {
  params: Promise<{ agencyId: string }>
  version?: 'new' | 'existing'
}
// Helper function to map pricingCards to SDK Plan format
function mapPricingCardsToPlan(card: typeof pricingCards[0]): Plan {
  return {
    id: card.priceId,
    title: card.title,
    description: card.description,
    currency: 'RM',
    monthlyPrice: card.price.replace('RM ', ''),
    yearlyPrice: card.price.replace('RM ', ''), // You can calculate yearly if needed
    buttonText: 'Select Plan',
    features: card.features.map((feature) => ({
      name: feature,
      icon: 'check',
      iconColor: 'text-green-500',
    })),
  }
}

// Helper function to format date
function formatDate(date: Date | null): string {
  if (!date) return 'Not set'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

// Helper function to get subscription status
function getSubscriptionStatus(
  status: string | null
): CurrentPlan['status'] {
  if (!status) return 'inactive'
  const statusMap: Record<string, CurrentPlan['status']> = {
    ACTIVE: 'active',
    TRIALING: 'active',
    PAST_DUE: 'past_due',
    CANCELLED: 'cancelled',
    CANCELED: 'cancelled',
  }
  return statusMap[status] || 'inactive'
}

const Page = async ({ params, version = 'new' }: Props) => {
  const { agencyId } = await params

  //CHALLENGE : Create the add on  products
  const addOns = await stripe.products.list({
    ids: addOnProducts.map((product) => product.id),
    expand: ['data.default_price'],
  })

  const agencySubscription = await db.agency.findUnique({
    where: { id: agencyId },
    select: {
      customerId: true,
      Subscription: true,
    },
  })

  const prices = await stripe.prices.list({
    product: process.env.NEXT_AUTLIFY_PRODUCT_ID,
    active: true,
  })

  const currentPlanDetails = pricingCards.find(
    (c) => c.priceId === agencySubscription?.Subscription?.priceId
  )

  // Check if subscription is truly active (both ACTIVE and TRIALING are considered active)
  const isSubscriptionActive =
    agencySubscription?.Subscription?.active === true &&
    (agencySubscription?.Subscription?.status === 'ACTIVE' ||
      agencySubscription?.Subscription?.status === 'TRIALING')

  const charges = await stripe.charges.list({
    limit: 50,
    customer: agencySubscription?.customerId,
  })

  const invoices = await stripe.invoices.list({
    limit: 50,
    customer: agencySubscription?.customerId,
  })

  const allCharges = [
    ...charges.data.map((charge) => ({
      description: charge.description,
      id: charge.id,
      date: `${new Date(charge.created * 1000).toLocaleTimeString()} ${new Date(
        charge.created * 1000
      ).toLocaleDateString()}`,
      status: 'Paid',
      amount: `RM ${charge.amount / 100}`,
    })),

    ...invoices.data.map((invoice) => ({
      description: invoice.lines.data[0]?.description || 'Subscription Invoice',
      id: invoice.id,
      date: `${new Date(invoice.created * 1000).toLocaleTimeString()} ${new Date(
        invoice.created * 1000
      ).toLocaleDateString()}`,
      status: invoice.status === 'paid' ? 'Paid' : invoice.status === 'open' ? 'Pending' : 'Failed',
      amount: `RM ${(invoice.amount_paid / 100).toFixed(2)}`,
    })),
  ].sort((a, b) => {
    const dateA = new Date(a.date.split(' ').slice(1).join(' '))
    const dateB = new Date(b.date.split(' ').slice(1).join(' '))
    return dateB.getTime() - dateA.getTime()
  })

  // If no subscription, redirect to onboarding or show free plan
  if (!currentPlanDetails) {
    // You can either redirect or show a default free plan
    // For now, let's use the first plan (Starter) as default
    const defaultPlan = pricingCards[0]
    const currentPlan: CurrentPlan = {
      plan: mapPricingCardsToPlan(defaultPlan),
      type: 'monthly',
      price: defaultPlan.price,
      nextBillingDate: 'Not set',
      paymentMethod: 'No payment method',
      status: 'inactive',
    }

    return (
      <div className="container mx-auto py-6">
      <SubscriptionManagement
             className="mx-auto max-w-2xl"
             currentPlan={currentPlan}
             updatePlan={{
               currentPlan: currentPlan.plan,
               plans: pricingCards.map(mapPricingCardsToPlan),
               onPlanChange: (planId) => {
                 console.log("update plan", planId);
               },
               triggerText: "Update Plan",
             }}
             cancelSubscription={{
               title: "Cancel Subscription",
               description: "Are you sure you want to cancel your subscription?",
               leftPanelImageUrl:
                 "https://img.freepik.com/free-vector/abstract-paper-cut-shape-wave-background_474888-4649.jpg?semt=ais_hybrid&w=740&q=80",
               plan: currentPlan.plan,
               warningTitle: "You will lose access to your account",
               warningText:
                 "If you cancel your subscription, you will lose access to your account and all your data will be deleted.",
               onCancel: async (planId) => {
                 console.log("cancel subscription", planId);
                 return new Promise((resolve) => {
                   setTimeout(() => {
                     resolve(void 0);
                   }, 1000);
                 });
               },
               onKeepSubscription: async (planId) => {
                 console.log("keep subscription", planId);
               },
             }}
           />
      </div>
    )
  }

  // Build current plan object for SDK
  const currentPlan: CurrentPlan = {
    plan: mapPricingCardsToPlan(currentPlanDetails),
    type: 'monthly', // You can determine this from your subscription data
    price: currentPlanDetails.price,
    nextBillingDate: formatDate(
      agencySubscription?.Subscription?.currentPeriodEndDate || null
    ),
    paymentMethod: agencySubscription?.customerId
      ? 'Credit Card ••••'
      : 'Not set',
    status: getSubscriptionStatus(
      agencySubscription?.Subscription?.status || null
    ),
  }

  return (
    (version === 'existing') ? (
        <div className="space-y-6">
      <SubscriptionHelper
        prices={prices.data}
        customerId={agencySubscription?.customerId || ''}
        planExists={isSubscriptionActive}
        subscriptionStatus={agencySubscription?.Subscription?.status || null}
        trialEndDate={agencySubscription?.Subscription?.trialEndedAt || null}
        currentPeriodEndDate={agencySubscription?.Subscription?.currentPeriodEndDate || null}
        planTitle={currentPlanDetails?.title}
        currentPriceId={agencySubscription?.Subscription?.priceId}
      />

      <Card className="p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Current plan</h2>
              <Badge variant={isSubscriptionActive ? 'default' : 'secondary'} className="font-mono text-xs">
                {isSubscriptionActive ? (agencySubscription?.Subscription?.status || 'ACTIVE') : 'FREE'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Upgrade, change plan, or add-ons. Trial subscriptions are treated as active.
            </p>
          </div>

          <div className="rounded-lg border bg-card/50 p-3">
            <div className="text-xs text-muted-foreground">Customer</div>
            <div className="mt-1 font-mono text-xs text-muted-foreground">
              {agencySubscription?.customerId || '—'}
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex flex-col lg:!flex-row justify-between gap-8">
        <PricingCard
          planExists={isSubscriptionActive}
          prices={prices.data}
          customerId={agencySubscription?.customerId || ''}
          amt={
            isSubscriptionActive
              ? currentPlanDetails?.price || 'Free'
              : 'Free'
          }
          buttonCta={
            isSubscriptionActive
              ? 'Change Plan'
              : 'Get Started'
          }
          highlightDescription="Want to modify your plan? You can do this here. If you have
          further question contact support@autlify.com"
          highlightTitle="Plan Options"
          description={
            isSubscriptionActive
              ? currentPlanDetails?.description || 'Lets get started'
              : 'Lets get started! Pick a plan that works best for you.'
          }
          duration="/ month"
          features={
            isSubscriptionActive
              ? currentPlanDetails?.features || []
              : currentPlanDetails?.features ||
                pricingCards.find((pricing) => pricing.title === 'Starter')
                  ?.features ||
                []
          }
          title={
            isSubscriptionActive
              ? currentPlanDetails?.title || 'Starter'
              : 'Starter'
          }
        />
        {addOns.data.map((addOn) => (
          <PricingCard
            planExists={isSubscriptionActive}
            prices={prices.data}
            customerId={agencySubscription?.customerId || ''}
            key={addOn.id}
            amt={
              //@ts-ignore
              addOn.default_price?.unit_amount
                ? //@ts-ignore
                  `RM ${addOn.default_price.unit_amount / 100}`
                : 'RM 0'
            }
            buttonCta="Subscribe"
            description="Dedicated support line & teams channel for support"
            duration="/ month"
            features={[]}
            title={'24/7 priority support'}
            highlightTitle="Get support now!"
            highlightDescription="Get priority support and skip the long long with the click of a button."
          />
        ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Payment history</h3>
            <p className="mt-1 text-sm text-muted-foreground">Charges and invoices (Stripe).</p>
          </div>
          <Badge variant="outline" className="font-mono text-xs">{allCharges.length} entries</Badge>
        </div>

        <Separator className="my-4" />

        <Table className="bg-card border-[1px] border rounded-md">
          <TableHeader className="rounded-md">
            <TableRow>
              <TableHead className="w-[200px]">Description</TableHead>
              <TableHead className="w-[240px]">Reference</TableHead>
              <TableHead className="w-[300px]">Date</TableHead>
              <TableHead className="w-[200px]">Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="font-medium truncate">
            {allCharges.map((charge) => (
              <TableRow key={charge.id}>
                <TableCell className="max-w-[320px] truncate">{charge.description}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground max-w-[280px] truncate">
                  {charge.id}
                </TableCell>
                <TableCell>{charge.date}</TableCell>
                <TableCell>
                  <p
                    className={clsx('text-xs font-semibold tracking-wide', {
                      'text-emerald-500': charge.status.toLowerCase() === 'paid',
                      'text-orange-600': charge.status.toLowerCase() === 'pending',
                      'text-red-600': charge.status.toLowerCase() === 'failed',
                    })}
                  >
                    {charge.status.toUpperCase()}
                  </p>
                </TableCell>
                <TableCell className="text-right">{charge.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
    ) : (
      <div className="container mx-auto py-6">
        <SubscriptionManagement
          currentPlan={currentPlan}
          updatePlan={{
            currentPlan: currentPlan.plan,
            plans: pricingCards.map(mapPricingCardsToPlan),
            onPlanChange: async (planId) => {
              'use server'
              // TODO: Implement plan change logic
              // 1. Create Stripe checkout session or update subscription
              // 2. Update database
              // 3. Redirect to confirmation page
              console.log('Update plan to:', planId, 'for agency:', agencyId)

              // Example redirect to Stripe
              // const session = await stripe.checkout.sessions.create({...})
              // redirect(session.url)
            },
            triggerText: 'Update Plan',
          }}
          cancelSubscription={{
            title: 'Cancel Subscription',
            description: 'Are you sure you want to cancel your subscription?',
            leftPanelImageUrl: '/assets/preview.png',
            plan: currentPlan.plan,
            warningTitle: 'You will lose access to premium features',
            warningText:
              'If you cancel your subscription, you will lose access to all premium features at the end of your billing period. Your data will be retained for 30 days.',
            onCancel: async (planId) => {
              'use server'
              // TODO: Implement subscription cancellation
              // 1. Cancel Stripe subscription
              // 2. Update database subscription status
              // 3. Send confirmation email
              console.log('Cancel subscription for plan:', planId, 'agency:', agencyId)

              if (agencySubscription?.Subscription?.subscritiptionId) {
                // await stripe.subscriptions.update(
                //   agencySubscription.Subscription.subscritiptionId,
                //   { cancel_at_period_end: true }
                // )
              }
            },
            onKeepSubscription: async (planId) => {
              'use server'
              console.log('Keep subscription for plan:', planId)
            },
          }}
        />
      </div>
    )
  )
}

export default Page
