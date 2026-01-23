import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { auth } from '@/auth'
import type { MeteringScope } from '@/generated/prisma/client'
import { canPerform } from '@/lib/iam/policy/can'
import { consumeUsage } from '@/lib/core/billing/usage/consume'

export async function POST(req: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json({ ok: false, reason: 'NO_SESSION' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body?.agencyId || !body?.featureKey) {
    return NextResponse.json({ ok: false, reason: 'BAD_REQUEST' }, { status: 400 })
  }

  const agencyId: string = body.agencyId
  const subAccountId: string | null = body.subAccountId ?? null
  const scope: MeteringScope = (body.scope as MeteringScope) ?? (subAccountId ? 'SUBACCOUNT' : 'AGENCY')
  const featureKey: string = body.featureKey
  const quantityRaw = body.quantity ?? 1
  const quantity = Number(quantityRaw)
  const idempotencyKey: string | undefined = body.idempotencyKey
  const actionKey: string | null = body.actionKey ?? null

  if (!idempotencyKey) {
    return NextResponse.json({ ok: false, reason: 'MISSING_IDEMPOTENCY_KEY' }, { status: 400 })
  }
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return NextResponse.json({ ok: false, reason: 'INVALID_QUANTITY' }, { status: 400 })
  }

  const requiredPermissionKey: string | undefined = body.requiredPermissionKey
  const requiredPermissionKeys: string[] = Array.isArray(body.requiredPermissionKeys)
    ? body.requiredPermissionKeys
    : requiredPermissionKey
      ? [requiredPermissionKey]
      : []

  const decision = await canPerform({
    userId,
     // REMOVED scope because canPerform doesn't accept it
    agencyId,
    subAccountId,
    requiredPermissionKeys,
    featureKey,
    quantity,
    // REMOVED actionKey as it is not yet supported in usage checks

    // RENAMED from requireSubscription to requireActiveSubscription
    requireActiveSubscription: body.requireActiveSubscription ?? true,
    billingPermissionKeys: body.billingPermissionKeys,
  })

  if (!decision.allowed) {
    return NextResponse.json({ ok: false, ...decision }, { status: 403 })
  }

  const result = await consumeUsage({
    scope,
    agencyId,
    subAccountId,
    featureKey,
    quantity,
    actionKey,
    idempotencyKey,
  })

  return NextResponse.json({ ok: true, result })
}
