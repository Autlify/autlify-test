/**
 * Open Item Write-Off Actions
 *
 * MVP: mark open items as WRITTEN_OFF and create OpenItemAllocation rows.
 * Future: optionally emit fanout event to create Journal Entries.
 */

'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { Decimal } from 'decimal.js'
import { hasAgencyPermission, hasSubAccountPermission } from '@/lib/features/iam/authz/permissions'
import { KEYS } from '@/lib/registry/keys/permissions'
import { buildNextDocNumber } from '../utils/document-number'
import { logGLAudit } from './audit'
import {
  writeOffOpenItemsInputSchema,
  type WriteOffOpenItemsInput,
  type WriteOffOpenItemsResult,
} from '@/lib/schemas/fi/general-ledger/write-off'

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

const scopeWhere = (ctx: FiContext) =>
  ctx.subAccountId
    ? { agencyId: ctx.agencyId, subAccountId: ctx.subAccountId }
    : { agencyId: ctx.agencyId, subAccountId: null }

export const writeOffOpenItems = async (
  input: WriteOffOpenItemsInput
): Promise<ActionResult<WriteOffOpenItemsResult>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, KEYS.fi.general_ledger.write_off.manage)
    if (!ok) return { success: false, error: 'Missing permission' }

    const data = writeOffOpenItemsInputSchema.parse(input)
    const writeOffDate = data.writeOffDate ?? new Date()

    // Generate doc number (lightweight; no number-range table yet)
    const scope = scopeWhere(ctx)

    const seq =
      (await db.openItemAllocation.count({
        where: {
          OpenItem: scope,
          clearedByType: 'WRITE_OFF',
          allocatedAt: {
            gte: new Date(writeOffDate.getFullYear(), 0, 1),
            lt: new Date(writeOffDate.getFullYear() + 1, 0, 1),
          },
        },
      })) + 1

    const documentNumber =
      data.documentNumber ??
      buildNextDocNumber({
        format: null,
        prefixFallback: 'WO',
        date: writeOffDate,
        sequence: seq,
      })

    let total = new Decimal(0)
    const writtenOffIds: string[] = []

    await db.$transaction(async (tx) => {
      for (const id of data.openItemIds) {
        const oi = await tx.openItem.findFirst({
          where: { id, ...scope },
        })
        if (!oi) continue
        if (oi.status === 'CLEARED' || oi.status === 'WRITTEN_OFF') continue

        const remLocal = new Decimal(oi.localRemainingAmount)
        const remDoc = new Decimal(oi.documentRemainingAmount)
        if (remLocal.abs().lt(0.01)) continue

        // Create allocation to bring remaining to 0
        await tx.openItemAllocation.create({
          data: {
            openItemId: oi.id,
            clearedById: documentNumber,
            clearedByType: 'WRITE_OFF',
            clearedByRef: documentNumber,
            localAmount: remLocal.toNumber(),
            documentAmount: remDoc.toNumber(),
            exchangeDifference: 0,
            allocatedAt: writeOffDate,
            allocatedBy: ctx.userId,
            notes: data.notes ?? data.reason,
          },
        })

        await tx.openItem.update({
          where: { id: oi.id },
          data: {
            localRemainingAmount: 0,
            documentRemainingAmount: 0,
            status: 'WRITTEN_OFF',
            clearingDate: writeOffDate,
            clearingDocumentId: documentNumber,
            clearedAt: new Date(),
            clearedBy: ctx.userId,
          },
        })

        total = total.plus(remLocal)
        writtenOffIds.push(oi.id)
      }
    })

    await logGLAudit({
      action: 'POST',
      entityType: 'OpenItem',
      entityId: documentNumber,
      description: `Write-off ${writtenOffIds.length} open items (${documentNumber})`,
      newValues: JSON.stringify({ openItemIds: writtenOffIds, reason: data.reason }),
    })

    const basePath = ctx.subAccountId ? `/subaccount/${ctx.subAccountId}` : `/agency/${ctx.agencyId}`
    revalidatePath(`${basePath}/fi/general-ledger/open-items`)

    return {
      success: true,
      data: {
        documentNumber,
        writeOffDate,
        itemsWrittenOff: writtenOffIds.length,
        totalLocalAmount: total.toNumber(),
        openItemIds: writtenOffIds,
      },
    }
  } catch (e) {
    console.error('writeOffOpenItems error', e)
    return { success: false, error: 'Failed to write off open items' }
  }
}
