/**
 * FI-AR Cash Application (Auto Allocation)
 *
 * Applies an AR receipt to customer open items and records both:
 * - `finance.ArReceiptAllocation` (receipt-level trace)
 * - `finance.OpenItemAllocation` + updates `finance.OpenItem` remaining amounts
 */

'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { Decimal } from 'decimal.js'
import { hasAgencyPermission, hasSubAccountPermission } from '@/lib/features/iam/authz/permissions'
import { KEYS } from '@/lib/registry/keys/permissions'
import {
  cashApplicationInputSchema,
  type CashApplicationInput,
  type CashApplicationResult,
} from '@/lib/schemas/fi/accounts-receivable/cash-application'

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

const toNumber = (v: any) => {
  if (v == null) return 0
  if (typeof v === 'number') return v
  if (v instanceof Decimal) return v.toNumber()
  return Number(v)
}

export const applyReceiptToOpenItems = async (
  input: CashApplicationInput
): Promise<ActionResult<CashApplicationResult>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, KEYS.fi.accounts_receivable.cash_application.run)
    if (!ok) return { success: false, error: 'Missing permission' }

    const data = cashApplicationInputSchema.parse(input)

    const receipt = await db.arReceipt.findFirst({
      where: {
        id: data.receiptId,
        ...scopeWhere(ctx),
      },
      include: { ReceiptAllocations: true },
    })

    if (!receipt) return { success: false, error: 'Receipt not found' }

    const alreadyAllocatedIds = new Set(
      (receipt.ReceiptAllocations ?? [])
        .map((a) => a.openItemId)
        .filter(Boolean) as string[]
    )

    const allocatedSoFar = (receipt.ReceiptAllocations ?? []).reduce(
      (sum, a) => sum + toNumber(a.allocatedAmount),
      0
    )

    const receiptAmount = toNumber(receipt.amount)
    let remaining = receiptAmount - allocatedSoFar
    if (remaining <= 0 && !data.allowOverapply) {
      return {
        success: true,
        data: {
          receiptId: receipt.id,
          receiptNumber: receipt.receiptNumber,
          customerId: receipt.customerId,
          appliedAmount: 0,
          remainingUnappliedAmount: Math.max(0, remaining),
          allocations: [],
        },
      }
    }

    const asOf = data.asOfDate ?? new Date()

    const openItems = await db.openItem.findMany({
      where: {
        ...scopeWhere(ctx),
        partnerType: 'CUSTOMER',
        customerId: receipt.customerId,
        status: { in: ['OPEN', 'PARTIALLY_CLEARED'] },
        ...(data.includeNotYetDue ? {} : { dueDate: { lte: asOf } }),
      },
      orderBy:
        data.orderBy === 'DOCUMENT_DATE'
          ? [{ documentDate: 'asc' }, { createdAt: 'asc' }]
          : data.orderBy === 'OLDEST_ENTRY'
            ? [{ createdAt: 'asc' }]
            : [{ dueDate: 'asc' }, { documentDate: 'asc' }, { createdAt: 'asc' }],
      take: data.maxOpenItems,
    })

    const allocations: CashApplicationResult['allocations'] = []
    let applied = 0

    await db.$transaction(async (tx) => {
      for (const oi of openItems) {
        if (remaining <= 0 && !data.allowOverapply) break
        if (alreadyAllocatedIds.has(oi.id)) continue

        const remainingOi = toNumber((oi as any).localRemainingAmount)
        if (!Number.isFinite(remainingOi) || remainingOi <= 0.000001) continue

        const alloc = data.allowOverapply ? remainingOi : Math.min(remainingOi, remaining)
        if (alloc <= 0.000001) continue

        // Pro-rate document currency clearing amount if possible
        const docRemaining = toNumber((oi as any).documentRemainingAmount)
        const docAlloc = remainingOi !== 0 ? (docRemaining * alloc) / remainingOi : 0

        // Receipt allocation trace
        await tx.arReceiptAllocation.create({
          data: {
            receiptId: receipt.id,
            openItemId: oi.id,
            allocatedAmount: alloc,
            allocatedAmountBase: receipt.exchangeRate ? alloc * toNumber(receipt.exchangeRate) : null,
          },
        })

        // Open item allocation (clearing)
        await tx.openItemAllocation.create({
          data: {
            openItemId: oi.id,
            clearedById: receipt.id,
            clearedByType: 'RECEIPT',
            clearedByRef: receipt.receiptNumber,
            localAmount: alloc,
            documentAmount: docAlloc,
            exchangeDifference: 0,
            allocatedAt: new Date(),
            allocatedBy: ctx.userId,
            notes: data.notes ?? undefined,
          },
        })

        const newRemaining = toNumber((oi as any).localRemainingAmount) - alloc
        const newDocRemaining = toNumber((oi as any).documentRemainingAmount) - docAlloc

        const newStatus = Math.abs(newRemaining) < 0.01 ? 'CLEARED' : 'PARTIALLY_CLEARED'

        await tx.openItem.update({
          where: { id: oi.id },
          data: {
            localRemainingAmount: new Decimal(newRemaining),
            documentRemainingAmount: new Decimal(newDocRemaining),
            status: newStatus,
            clearingDate: newStatus === 'CLEARED' ? new Date() : null,
            clearingDocumentId: newStatus === 'CLEARED' ? receipt.receiptNumber : null,
            clearedAt: newStatus === 'CLEARED' ? new Date() : null,
            clearedBy: newStatus === 'CLEARED' ? ctx.userId : null,
          },
        })

        applied += alloc
        remaining -= alloc

        allocations.push({
          openItemId: oi.id,
          allocatedAmount: alloc,
          remainingOpenItemAmount: Math.max(0, newRemaining),
          openItemStatus: newStatus,
        })

        alreadyAllocatedIds.add(oi.id)
      }

      if (!receipt.clearingDocumentNumber) {
        await tx.arReceipt.update({
          where: { id: receipt.id },
          data: { clearingDocumentNumber: receipt.receiptNumber },
        })
      }
    })

    return {
      success: true,
      data: {
        receiptId: receipt.id,
        receiptNumber: receipt.receiptNumber,
        customerId: receipt.customerId,
        appliedAmount: applied,
        remainingUnappliedAmount: Math.max(0, remaining),
        allocations,
      },
    }
  } catch (e) {
    console.error('applyReceiptToOpenItems error', e)
    return { success: false, error: 'Failed to apply receipt' }
  }
}
