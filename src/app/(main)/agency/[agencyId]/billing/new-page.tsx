import React from 'react'
import { redirect } from 'next/navigation'
import { stripe } from '@/lib/stripe'
import { pricingCards } from '@/lib/constants'
import { db } from '@/lib/db'
import { SubscriptionManagement } from '@/components/billing-sdk/subscription-management'
import type { CurrentPlan, Plan } from '@/lib/features/core/billing/billingsdk-config'

type Props = {
  params: Promise<{ agencyId: string }>
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

const page = async ({ params }: Props) => {
  const { agencyId } = await params

  const agencySubscription = await db.agency.findUnique({
    where: { id: agencyId },
    select: {
      customerId: true,
      Subscription: true,
    },
  })

  const currentPlanDetails = pricingCards.find(
    (c) => c.priceId === agencySubscription?.Subscription?.priceId
  )

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
          currentPlan={currentPlan}
          updatePlan={{
            currentPlan: currentPlan.plan,
            plans: pricingCards.map(mapPricingCardsToPlan),
            onPlanChange: async (planId) => {
              'use server'
              // Handle plan upgrade/change
              console.log('Update plan to:', planId)
              // Redirect to Stripe checkout or your payment flow
            },
            triggerText: 'Upgrade Plan',
          }}
          cancelSubscription={{
            title: 'No Active Subscription',
            description: 'You do not have an active subscription.',
            leftPanelImageUrl: '/assets/preview.png',
            plan: currentPlan.plan,
            warningTitle: 'Get started today',
            warningText: 'Choose a plan that works for you and unlock all features.',
            onCancel: async () => {
              'use server'
              console.log('No subscription to cancel')
            },
            onKeepSubscription: async () => {
              'use server'
              console.log('Keeping free tier')
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

}

export default page
