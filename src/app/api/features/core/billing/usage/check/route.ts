import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { auth } from '@/auth'
import type { MeteringScope } from '@/generated/prisma/client'
import { canPerform } from '@/lib/iam/policy/can'

export async function POST(req: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const body = await req.json().catch(() => null) as any
  if (!body || !body.agencyId || !body.featureKey) {
    return NextResponse.json({ error: 'agencyId and featureKey are required' }, { status: 400 })
  }

  const scope: MeteringScope = body.subAccountId ? 'SUBACCOUNT' : 'AGENCY'
  const quantity = body.quantity ?? 1

  const decision = await canPerform({
    userId,
    // REMOVED scope because canPerform doesn't accept it
    agencyId: body.agencyId,
    subAccountId: body.subAccountId ?? null,
    requiredPermissionKey: body.requiredPermissionKey,
    requiredPermissionKeys: body.requiredPermissionKeys,
    billingPermissionKeys: body.billingPermissionKeys,
    featureKey: body.featureKey,
    quantity,
    actionKey: body.actionKey,

    // RENAMED from requireSubscription to requireActiveSubscription
    requireActiveSubscription: body.requireActiveSubscription ?? true,
  })

  return NextResponse.json(decision)
}
