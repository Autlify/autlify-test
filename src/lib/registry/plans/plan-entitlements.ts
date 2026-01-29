/**
 * @abstraction Plan Entitlements Registry
 * @description Static plan entitlements mapping. These get seeded to PlanFeature table.
 * 
 * Plan Structure (matches pricing cards):
 * - Starter (price_1SpVOXJglUPlULDQt9Ejhunb): RM 79/mo - 3 sub-accounts, 2 team members, unlimited pipelines
 * - Basic (price_1SpVOYJglUPlULDQhsRkA5YV): RM 149/mo - Unlimited sub-accounts & team members
 * - Advanced (price_1SpVOZJglUPlULDQoFq3iPES): RM 399/mo - Everything + Rebilling + 24/7 support
 * 
 * @namespace Autlify.Lib.Registry.Plans.PlanEntitlements
 * @module REGISTRY
 * @author Autlify Team
 * @created 2026-01-29
 */

import type { LimitEnforcement, OverageMode } from '@/generated/prisma/client'

/** Plan IDs (Stripe Price IDs) */
export const PLAN_IDS = {
  STARTER: 'price_1SpVOXJglUPlULDQt9Ejhunb',
  BASIC: 'price_1SpVOYJglUPlULDQhsRkA5YV',
  ADVANCED: 'price_1SpVOZJglUPlULDQoFq3iPES',
  // Add-ons
  PRIORITY_SUPPORT: 'price_1SpVObJglUPlULDQRfhLJNEo',
} as const

export type PlanId = typeof PLAN_IDS[keyof typeof PLAN_IDS]

/** Plan entitlement seed for database seeding */
export type PlanEntitlementSeed = {
  planId: string // Stripe recurring priceId
  featureKey: string
  isEnabled?: boolean
  isUnlimited?: boolean
  includedInt?: number
  maxInt?: number
  includedDec?: string
  maxDec?: string
  enforcement?: LimitEnforcement
  overageMode?: OverageMode
  recurringCreditGrantInt?: number
  recurringCreditGrantDec?: string
  rolloverCredits?: boolean
  topUpEnabled?: boolean
  topUpPriceId?: string
}

/**
 * Master plan entitlements configuration.
 * Use this to seed the PlanFeature table.
 */
export const PLAN_ENTITLEMENTS: PlanEntitlementSeed[] = [
  // ─────────────────────────────────────────────────────────
  // STARTER PLAN (RM 79/mo)
  // ─────────────────────────────────────────────────────────
  {
    planId: PLAN_IDS.STARTER,
    featureKey: 'core.agency.subaccounts',
    isEnabled: true,
    maxInt: 3,
    enforcement: 'HARD',
  },
  {
    planId: PLAN_IDS.STARTER,
    featureKey: 'core.agency.team_members',
    isEnabled: true,
    maxInt: 2,
    enforcement: 'HARD',
  },
  {
    planId: PLAN_IDS.STARTER,
    featureKey: 'core.agency.storage',
    isEnabled: true,
    maxDec: '5.0', // 5 GB
    enforcement: 'SOFT',
  },
  {
    planId: PLAN_IDS.STARTER,
    featureKey: 'crm.funnels.count',
    isEnabled: true,
    maxInt: 5,
    enforcement: 'HARD',
  },
  {
    planId: PLAN_IDS.STARTER,
    featureKey: 'crm.pipelines.count',
    isEnabled: true,
    isUnlimited: true,
  },
  {
    planId: PLAN_IDS.STARTER,
    featureKey: 'crm.contacts.count',
    isEnabled: true,
    maxInt: 500,
    enforcement: 'SOFT',
  },
  {
    planId: PLAN_IDS.STARTER,
    featureKey: 'billing.rebilling',
    isEnabled: false,
  },
  {
    planId: PLAN_IDS.STARTER,
    featureKey: 'billing.priority_support',
    isEnabled: false,
  },
  {
    planId: PLAN_IDS.STARTER,
    featureKey: 'apps.integrations.api_keys',
    isEnabled: true,
    maxInt: 3,
    enforcement: 'HARD',
  },
  {
    planId: PLAN_IDS.STARTER,
    featureKey: 'apps.webhooks.subscriptions',
    isEnabled: true,
    maxInt: 5,
    enforcement: 'HARD',
  },
  {
    planId: PLAN_IDS.STARTER,
    featureKey: 'apps.webhooks.deliveries_month',
    isEnabled: true,
    maxInt: 1000,
    enforcement: 'SOFT',
    recurringCreditGrantInt: 1000,
    rolloverCredits: false,
  },

  // ─────────────────────────────────────────────────────────
  // BASIC PLAN (RM 149/mo)
  // ─────────────────────────────────────────────────────────
  {
    planId: PLAN_IDS.BASIC,
    featureKey: 'core.agency.subaccounts',
    isEnabled: true,
    isUnlimited: true,
  },
  {
    planId: PLAN_IDS.BASIC,
    featureKey: 'core.agency.team_members',
    isEnabled: true,
    isUnlimited: true,
  },
  {
    planId: PLAN_IDS.BASIC,
    featureKey: 'core.agency.storage',
    isEnabled: true,
    maxDec: '25.0', // 25 GB
    enforcement: 'SOFT',
  },
  {
    planId: PLAN_IDS.BASIC,
    featureKey: 'crm.funnels.count',
    isEnabled: true,
    maxInt: 25,
    enforcement: 'SOFT',
  },
  {
    planId: PLAN_IDS.BASIC,
    featureKey: 'crm.pipelines.count',
    isEnabled: true,
    isUnlimited: true,
  },
  {
    planId: PLAN_IDS.BASIC,
    featureKey: 'crm.contacts.count',
    isEnabled: true,
    maxInt: 5000,
    enforcement: 'SOFT',
  },
  {
    planId: PLAN_IDS.BASIC,
    featureKey: 'billing.rebilling',
    isEnabled: false,
  },
  {
    planId: PLAN_IDS.BASIC,
    featureKey: 'billing.priority_support',
    isEnabled: false,
  },
  {
    planId: PLAN_IDS.BASIC,
    featureKey: 'apps.integrations.api_keys',
    isEnabled: true,
    maxInt: 10,
    enforcement: 'HARD',
  },
  {
    planId: PLAN_IDS.BASIC,
    featureKey: 'apps.webhooks.subscriptions',
    isEnabled: true,
    maxInt: 25,
    enforcement: 'HARD',
  },
  {
    planId: PLAN_IDS.BASIC,
    featureKey: 'apps.webhooks.deliveries_month',
    isEnabled: true,
    maxInt: 10000,
    enforcement: 'SOFT',
    recurringCreditGrantInt: 10000,
    rolloverCredits: false,
  },

  // ─────────────────────────────────────────────────────────
  // ADVANCED PLAN (RM 399/mo)
  // ─────────────────────────────────────────────────────────
  {
    planId: PLAN_IDS.ADVANCED,
    featureKey: 'core.agency.subaccounts',
    isEnabled: true,
    isUnlimited: true,
  },
  {
    planId: PLAN_IDS.ADVANCED,
    featureKey: 'core.agency.team_members',
    isEnabled: true,
    isUnlimited: true,
  },
  {
    planId: PLAN_IDS.ADVANCED,
    featureKey: 'core.agency.storage',
    isEnabled: true,
    maxDec: '100.0', // 100 GB
    enforcement: 'SOFT',
  },
  {
    planId: PLAN_IDS.ADVANCED,
    featureKey: 'crm.funnels.count',
    isEnabled: true,
    isUnlimited: true,
  },
  {
    planId: PLAN_IDS.ADVANCED,
    featureKey: 'crm.pipelines.count',
    isEnabled: true,
    isUnlimited: true,
  },
  {
    planId: PLAN_IDS.ADVANCED,
    featureKey: 'crm.contacts.count',
    isEnabled: true,
    isUnlimited: true,
  },
  {
    planId: PLAN_IDS.ADVANCED,
    featureKey: 'billing.rebilling',
    isEnabled: true, // Rebilling enabled for Advanced
  },
  {
    planId: PLAN_IDS.ADVANCED,
    featureKey: 'billing.priority_support',
    isEnabled: true, // 24/7 support enabled for Advanced
  },
  {
    planId: PLAN_IDS.ADVANCED,
    featureKey: 'apps.integrations.api_keys',
    isEnabled: true,
    isUnlimited: true,
  },
  {
    planId: PLAN_IDS.ADVANCED,
    featureKey: 'apps.webhooks.subscriptions',
    isEnabled: true,
    isUnlimited: true,
  },
  {
    planId: PLAN_IDS.ADVANCED,
    featureKey: 'apps.webhooks.deliveries_month',
    isEnabled: true,
    isUnlimited: true,
  },

  // ─────────────────────────────────────────────────────────
  // PRIORITY SUPPORT ADD-ON (RM 99/mo)
  // ─────────────────────────────────────────────────────────
  {
    planId: PLAN_IDS.PRIORITY_SUPPORT,
    featureKey: 'billing.priority_support',
    isEnabled: true,
  },
]

/** Get entitlements for a specific plan */
export function getPlanEntitlements(planId: string): PlanEntitlementSeed[] {
  return PLAN_ENTITLEMENTS.filter(e => e.planId === planId)
}

/** Get a specific entitlement for a plan + feature */
export function getPlanEntitlement(planId: string, featureKey: string): PlanEntitlementSeed | undefined {
  return PLAN_ENTITLEMENTS.find(e => e.planId === planId && e.featureKey === featureKey)
}

/** Plan metadata for UI display */
export const PLAN_METADATA = {
  [PLAN_IDS.STARTER]: {
    name: 'Starter',
    description: 'Perfect for trying out plura',
    price: 'RM 79',
    trialDays: 14,
    highlight: 'Key features',
  },
  [PLAN_IDS.BASIC]: {
    name: 'Basic',
    description: 'For serious agency owners',
    price: 'RM 149',
    trialDays: 14,
    highlight: 'Everything in Starter, plus',
  },
  [PLAN_IDS.ADVANCED]: {
    name: 'Advanced',
    description: 'The ultimate agency kit',
    price: 'RM 399',
    trialDays: 0,
    highlight: 'Everything unlimited',
  },
} as const

