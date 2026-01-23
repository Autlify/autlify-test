// Optional static plan registry.
// Recommended long-term: keep the source of truth in DB (PlanFeature/EntitlementFeature).
// Use this file only if you want a code-first seed/catalog.

export type PlanEntitlementSeed = {
  planId: string // Stripe recurring priceId
  featureKey: string
  isEnabled?: boolean
  isUnlimited?: boolean
  includedInt?: number
  maxInt?: number
  includedDec?: string
  maxDec?: string
  recurringCreditGrantInt?: number
  recurringCreditGrantDec?: string
  topUpEnabled?: boolean
  topUpPriceId?: string
}

export const PLAN_ENTITLEMENTS: PlanEntitlementSeed[] = []
