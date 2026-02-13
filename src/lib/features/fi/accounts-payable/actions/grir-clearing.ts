/**
 * FI-AP GR/IR Clearing (Stub)
 *
 * Matching Goods Receipts (GR) and Invoice Receipts (IR) usually posts to a GR/IR
 * clearing account and updates PO/GR history. This requires inventory/procurement
 * integration and a dedicated matching engine.
 *
 * MVP: provide a validated action boundary for future implementation.
 */

'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { hasAgencyPermission, hasSubAccountPermission } from '@/lib/features/iam/authz/permissions'
import { KEYS } from '@/lib/registry/keys/permissions'
import {
  grirClearingRunInputSchema,
  type GrirClearingRunInput,
  type GrirClearingRunResult,
} from '@/lib/schemas/fi/accounts-payable/grir-clearing'

type ActionResult<T> = { success: true; data: T } | { success: false; error: string }

type FiContext = {
  userId: string
  agencyId: string
  subAccountId?: string
}

const getContext = async (): Promise<FiContext | null> => {
  const session = await auth()
  if (!session?.user?.id) return null

  const dbSession = await db.session.findFirst({
    where: { userId: session.user.id },
    select: { activeAgencyId: true, activeSubAccountId: true },
  })

  if (!dbSession?.activeAgencyId) return null

  return {
    userId: session.user.id,
    agencyId: dbSession.activeAgencyId,
    subAccountId: dbSession.activeSubAccountId ?? undefined,
  }
}

const checkPermission = async (ctx: FiContext, key: string) => {
  if (ctx.subAccountId) return hasSubAccountPermission(ctx.subAccountId, key as any)
  return hasAgencyPermission(ctx.agencyId, key as any)
}

export const runGrirClearing = async (
  input: GrirClearingRunInput
): Promise<ActionResult<GrirClearingRunResult>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, KEYS.fi.accounts_payable.grir_clearing.run)
    if (!ok) return { success: false, error: 'Missing permission' }

    const data = grirClearingRunInputSchema.parse(input)

    const totalAmount = data.items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0)

    return {
      success: true,
      data: {
        dryRun: data.dryRun,
        itemsProcessed: data.items.length,
        totalAmount,
        message: 'GR/IR clearing engine is not implemented yet (schema + action boundary only).',
      },
    }
  } catch (e) {
    console.error('runGrirClearing error', e)
    return { success: false, error: 'Failed to run GR/IR clearing' }
  }
}
