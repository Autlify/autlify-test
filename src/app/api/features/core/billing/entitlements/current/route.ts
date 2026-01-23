import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import type { MeteringScope } from '@/generated/prisma/client'
import { getAgencySubscriptionState } from '@/lib/iam/authz/resolver'
import { resolveEffectiveEntitlements } from '@/lib/core/billing/entitlements/resolve'

export async function GET(req: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const agencyId = searchParams.get('agencyId')
  const subAccountId = searchParams.get('subAccountId')
  if (!agencyId) return NextResponse.json({ error: 'agencyId is required' }, { status: 400 })

  const scope: MeteringScope = subAccountId ? 'SUBACCOUNT' : 'AGENCY'

  // Membership check (avoid leaking entitlements)
  if (scope === 'AGENCY') {
    const m = await db.agencyMembership.findFirst({ where: { userId, agencyId, isActive: true }, select: { id: true } })
    if (!m) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  } else {
    const m = await db.subAccountMembership.findFirst({ where: { userId, subAccountId: subAccountId!, isActive: true }, select: { id: true } })
    if (!m) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const subscriptionState = await getAgencySubscriptionState(agencyId)
  const entitlements = await resolveEffectiveEntitlements({
    scope,
    agencyId,
    subAccountId: subAccountId ?? null,
  })

  return NextResponse.json({
    scope,
    agencyId,
    subAccountId: subAccountId ?? null,
    subscription: subscriptionState,
    entitlements,
  })
}
