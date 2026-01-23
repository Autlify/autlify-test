import 'server-only'

import { db } from '@/lib/db'
import type { MeteringScope } from '@/generated/prisma/client'
import type { EffectiveEntitlement, ResolveEntitlementsArgs } from '@/lib/core/billing/entitlements/types'
import { normalizeEntitlement } from '@/lib/core/billing/entitlements/normalize'

const ACTIVE_STATUSES = new Set(['ACTIVE', 'TRIALING'] as const)

export async function resolvePlanIdForAgency(agencyId: string, now: Date = new Date()): Promise<string | null> {
  const sub = await db.subscription.findFirst({
    where: {
      agencyId,
      status: { in: Array.from(ACTIVE_STATUSES) as any },
      currentPeriodEndDate: { gt: now },
    },
    select: { priceId: true },
  })
  return sub?.priceId ?? null
}

export async function resolveEffectiveEntitlements(args: ResolveEntitlementsArgs): Promise<Record<string, EffectiveEntitlement>> {
  const now = args.now ?? new Date()
  const planId = args.planId ?? (await resolvePlanIdForAgency(args.agencyId, now))
  if (!planId) return {}

  const planFeatures = await db.planFeature.findMany({
    where: { planId },
    include: { EntitlementFeature: true },
  })

  const overrides = await db.entitlementOverride.findMany({
    where: {
      scope: args.scope,
      agencyId: args.agencyId,
      subAccountId: args.subAccountId || null,
      startsAt: { lte: now },
      OR: [{ endsAt: null }, { endsAt: { gte: now } }],
    },
  })
  const overrideMap = new Map<string, typeof overrides[number]>()
  for (const o of overrides) overrideMap.set(o.featureKey, o)

  const out: Record<string, EffectiveEntitlement> = {}
  for (const pf of planFeatures) {
    out[pf.featureKey as string] = normalizeEntitlement(pf, overrideMap.get(pf.featureKey) || null)
  }

  // Overrides can exist for keys not present in the plan. Keep them visible (disabled by default).
  for (const o of overrides) {
    if (out[o.featureKey]) continue
    const f = await db.entitlementFeature.findUnique({ where: { key: o.featureKey } })
    if (!f) continue
    out[o.featureKey] = {
      featureKey: f.key,
      name: f.name,
      category: f.category,
      description: f.description,
      valueType: f.valueType,
      unit: f.unit,
      metering: f.metering,
      aggregation: f.aggregation,
      scope: f.scope,
      period: f.period,
      isEnabled: o.isEnabled ?? false,
      isUnlimited: o.isUnlimited ?? false,
      includedInt: 0,
      maxInt: o.maxOverrideInt ?? o.maxDeltaInt ?? null,
      includedDec: '0',
      maxDec: o.maxOverrideDec ? o.maxOverrideDec.toString() : o.maxDeltaDec ? o.maxDeltaDec.toString() : null,
      enforcement: 'HARD' as any,
      overageMode: 'NONE' as any,
      creditEnabled: f.creditEnabled,
      creditUnit: f.creditUnit ?? null,
      creditExpires: f.creditExpires,
      creditPriority: f.creditPriority,
      recurringCreditGrantInt: null,
      recurringCreditGrantDec: null,
      rolloverCredits: false,
      topUpEnabled: false,
      topUpPriceId: null,
    }
  }

  return out
}

export function inferScopeFromIds(subAccountId?: string | null): MeteringScope {
  return subAccountId ? ('SUBACCOUNT' as any) : ('AGENCY' as any)
}
