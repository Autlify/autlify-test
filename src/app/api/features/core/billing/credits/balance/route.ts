import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import type { MeteringScope } from '@/generated/prisma/client'

export async function GET(req: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json({ ok: false, reason: 'NO_SESSION' }, { status: 401 })
  }

  const url = new URL(req.url)
  const agencyId = url.searchParams.get('agencyId')
  const subAccountId = url.searchParams.get('subAccountId')
  const featureKey = url.searchParams.get('featureKey')

  if (!agencyId) {
    return NextResponse.json({ ok: false, reason: 'BAD_REQUEST' }, { status: 400 })
  }

  const scope: MeteringScope = (url.searchParams.get('scope') as MeteringScope) ?? (subAccountId ? 'SUBACCOUNT' : 'AGENCY')

  // Membership guard (read-only)
  if (scope === 'SUBACCOUNT') {
    if (!subAccountId) {
      return NextResponse.json({ ok: false, reason: 'BAD_REQUEST' }, { status: 400 })
    }
    const m = await db.subAccountMembership.findFirst({ where: { userId, subAccountId, isActive: true } })
    if (!m) {
      return NextResponse.json({ ok: false, reason: 'NO_MEMBERSHIP' }, { status: 403 })
    }
  } else {
    const m = await db.agencyMembership.findFirst({ where: { userId, agencyId, isActive: true } })
    if (!m) {
      return NextResponse.json({ ok: false, reason: 'NO_MEMBERSHIP' }, { status: 403 })
    }
  }

  const where = {
    scope,
    agencyId,
    subAccountId: subAccountId ?? null,
    ...(featureKey ? { featureKey } : {}),
  }

  const rows = await db.featureCreditBalance.findMany({ where, orderBy: { featureKey: 'asc' } })

  // Filter out expired balances
  const now = new Date()
  const balances = rows
    .filter((b) => !b.expiresAt || b.expiresAt > now)
    .map((b) => ({
      ...b,
      balance: b.balance.toString(),
    }))

  return NextResponse.json({ ok: true, balances })
}
