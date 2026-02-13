
/**
 * FI-AR Receipts Server Actions
 *
 * Backed by Prisma `finance.ArReceipt` + `finance.ArReceiptAllocation`.
 */

'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { hasAgencyPermission, hasSubAccountPermission } from '@/lib/features/iam/authz/permissions'
import { KEYS } from '@/lib/registry/keys/permissions'
import { reserveDocumentNumber } from '@/lib/features/fi/general-ledger/utils/number-ranges'
import {
  arReceiptCreateSchema,
  arReceiptUpdateSchema,
  submitArReceiptSchema,
  approveArReceiptSchema,
  rejectArReceiptSchema,
  depositArReceiptSchema,
  clearArReceiptSchema,
  bounceArReceiptSchema,
  voidArReceiptSchema,
  applyArReceiptSchema,
  getArReceiptsFilterSchema,
  type ArReceiptCreate,
  type ArReceiptUpdate,
  type SubmitArReceiptInput,
  type ApproveArReceiptInput,
  type RejectArReceiptInput,
  type DepositArReceiptInput,
  type ClearArReceiptInput,
  type BounceArReceiptInput,
  type VoidArReceiptInput,
  type ApplyArReceiptInput,
  type GetArReceiptsFilter,
} from '@/lib/schemas/fi/accounts-receivable/ar-receipt'

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

const ensureScope = (ctx: FiContext, row: { agencyId: string; subAccountId: string | null }) => {
  if (row.agencyId !== ctx.agencyId) return false
  if (ctx.subAccountId) return row.subAccountId === ctx.subAccountId
  return row.subAccountId === null
}

// Minimal permission key (not yet modeled in registry as a full AR receipts capability)
const PERM_READ = KEYS.fi.accounts_receivable.receipts.read
const PERM_CREATE = KEYS.fi.accounts_receivable.receipts.create
const PERM_UPDATE = KEYS.fi.accounts_receivable.receipts.update
const PERM_SUBMIT = KEYS.fi.accounts_receivable.receipts.submit
const PERM_APPROVE = KEYS.fi.accounts_receivable.receipts.approve
const PERM_DEPOSIT = KEYS.fi.accounts_receivable.receipts.deposit
const PERM_CLEAR = KEYS.fi.accounts_receivable.receipts.clear
const PERM_BOUNCE = KEYS.fi.accounts_receivable.receipts.bounce
const PERM_VOID = KEYS.fi.accounts_receivable.receipts.void
const PERM_ALLOCATE = KEYS.fi.accounts_receivable.receipts.allocate
const generateReceiptNumber = async (ctx: FiContext) => {
  const cfg = await db.gLConfiguration.findFirst({
    where: {
      agencyId: ctx.agencyId,
    },
    orderBy: { updatedAt: 'desc' },
    select: { receiptFormat: true, documentNumberResetRule: true },
  })

  const scope = ctx.subAccountId
    ? { kind: 'subaccount' as const, subAccountId: ctx.subAccountId }
    : { kind: 'agency' as const, agencyId: ctx.agencyId }

  const { docNumber } = await reserveDocumentNumber(scope, {
    rangeKey: 'ar.receipt',
    format: cfg?.receiptFormat ?? null,
    prefixFallback: 'RCP',
    reset: (cfg?.documentNumberResetRule as any) ?? 'YEARLY',
    date: new Date(),
  })

  return docNumber
}

export const listArReceipts = async (
  filter?: GetArReceiptsFilter
): Promise<ActionResult<any[]>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_READ)
    if (!ok) return { success: false, error: 'Missing permission' }

    const f = getArReceiptsFilterSchema.parse(filter ?? {})

    const where: any = { ...scopeWhere(ctx) }
    if (f.customerId) where.customerId = f.customerId
    if (f.status) where.status = f.status
    if (f.receiptDateFrom || f.receiptDateTo) {
      where.receiptDate = {
        ...(f.receiptDateFrom ? { gte: f.receiptDateFrom } : {}),
        ...(f.receiptDateTo ? { lte: f.receiptDateTo } : {}),
      }
    }
    if (f.minAmount || f.maxAmount) {
      where.amount = {
        ...(f.minAmount ? { gte: f.minAmount } : {}),
        ...(f.maxAmount ? { lte: f.maxAmount } : {}),
      }
    }

    const skip = (f.page - 1) * f.pageSize
    const take = f.pageSize

    const rows = await db.arReceipt.findMany({
      where,
      include: { Customer: true, ReceiptAllocations: true },
      orderBy: [{ receiptDate: 'desc' }, { createdAt: 'desc' }],
      take,
      skip,
    })

    return { success: true, data: rows }
  } catch (e) {
    console.error('listArReceipts error', e)
    return { success: false, error: 'Failed to list receipts' }
  }
}

export const getArReceipt = async (id: string): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_READ)
    if (!ok) return { success: false, error: 'Missing permission' }

    const row = await db.arReceipt.findUnique({
      where: { id },
      include: { Customer: true, ReceiptAllocations: true },
    })
    if (!row) return { success: false, error: 'Receipt not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    return { success: true, data: row }
  } catch (e) {
    console.error('getArReceipt error', e)
    return { success: false, error: 'Failed to fetch receipt' }
  }
}

export const createArReceipt = async (input: ArReceiptCreate): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_CREATE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const data = arReceiptCreateSchema.parse(input)
    const receiptNumber = await generateReceiptNumber(ctx)

    const row = await db.arReceipt.create({
      data: {
        ...data,
        agencyId: ctx.agencyId,
        subAccountId: ctx.subAccountId ?? null,
        createdBy: ctx.userId,
        receiptNumber,
        ReceiptAllocations: data.allocations?.length
          ? {
              create: data.allocations.map((a) => ({
                openItemId: a.openItemId ?? null,
                invoiceNumber: a.invoiceNumber ?? null,
                allocatedAmount: a.allocatedAmount,
                allocatedAmountBase: a.allocatedAmountBase ?? null,
                exchangeDifference: a.exchangeDifference ?? null,
              })),
            }
          : undefined,
      } as any,
      include: { Customer: true, ReceiptAllocations: true },
    })

    revalidatePath('/fi')
    return { success: true, data: row }
  } catch (e: any) {
    console.error('createArReceipt error', e)
    const msg = typeof e?.message === 'string' ? e.message : 'Failed to create receipt'
    return { success: false, error: msg }
  }
}

export const updateArReceipt = async (
  id: string,
  input: ArReceiptUpdate
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_UPDATE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const existing = await db.arReceipt.findUnique({ where: { id } })
    if (!existing) return { success: false, error: 'Receipt not found' }
    if (!ensureScope(ctx, existing)) return { success: false, error: 'Not allowed' }

    const data = arReceiptUpdateSchema.parse(input)

    const row = await db.$transaction(async (tx) => {
      await tx.arReceipt.update({
        where: { id },
        data: {
          ...data,
          updatedBy: ctx.userId,
        } as any,
      })

      await tx.arReceiptAllocation.deleteMany({ where: { receiptId: id } })
      if (data.allocations?.length) {
        await tx.arReceiptAllocation.createMany({
          data: data.allocations.map((a) => ({
            receiptId: id,
            openItemId: a.openItemId ?? null,
            invoiceNumber: a.invoiceNumber ?? null,
            allocatedAmount: a.allocatedAmount,
            allocatedAmountBase: a.allocatedAmountBase ?? null,
            exchangeDifference: a.exchangeDifference ?? null,
          })),
        })
      }

      return tx.arReceipt.findUnique({
        where: { id },
        include: { Customer: true, ReceiptAllocations: true },
      })
    })

    revalidatePath('/fi')
    return { success: true, data: row }
  } catch (e: any) {
    console.error('updateArReceipt error', e)
    const msg = typeof e?.message === 'string' ? e.message : 'Failed to update receipt'
    return { success: false, error: msg }
  }
}

export const submitArReceipt = async (input: SubmitArReceiptInput): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_SUBMIT)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id } = submitArReceiptSchema.parse(input)
    const existing = await db.arReceipt.findUnique({ where: { id } })
    if (!existing) return { success: false, error: 'Receipt not found' }
    if (!ensureScope(ctx, existing)) return { success: false, error: 'Not allowed' }

    const row = await db.arReceipt.update({
      where: { id },
      data: {
        status: 'PENDING_APPROVAL',
        submittedAt: new Date(),
        submittedBy: ctx.userId,
        updatedBy: ctx.userId,
      },
      include: { Customer: true, ReceiptAllocations: true },
    })

    revalidatePath('/fi')
    return { success: true, data: row }
  } catch (e) {
    console.error('submitArReceipt error', e)
    return { success: false, error: 'Failed to submit receipt' }
  }
}

export const approveArReceipt = async (input: ApproveArReceiptInput): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_APPROVE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id, notes } = approveArReceiptSchema.parse(input)
    const existing = await db.arReceipt.findUnique({ where: { id } })
    if (!existing) return { success: false, error: 'Receipt not found' }
    if (!ensureScope(ctx, existing)) return { success: false, error: 'Not allowed' }

    const row = await db.arReceipt.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: ctx.userId,
        notes: notes ?? existing.notes ?? null,
        updatedBy: ctx.userId,
      },
      include: { Customer: true, ReceiptAllocations: true },
    })

    revalidatePath('/fi')
    return { success: true, data: row }
  } catch (e) {
    console.error('approveArReceipt error', e)
    return { success: false, error: 'Failed to approve receipt' }
  }
}

export const rejectArReceipt = async (input: RejectArReceiptInput): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_APPROVE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id, reason } = rejectArReceiptSchema.parse(input)
    const existing = await db.arReceipt.findUnique({ where: { id } })
    if (!existing) return { success: false, error: 'Receipt not found' }
    if (!ensureScope(ctx, existing)) return { success: false, error: 'Not allowed' }

    // Receipt status doesn't have "REJECTED"; keep it in DRAFT with audit fields.
    const row = await db.arReceipt.update({
      where: { id },
      data: {
        status: 'DRAFT',
        rejectedAt: new Date(),
        rejectedBy: ctx.userId,
        rejectionReason: reason,
        updatedBy: ctx.userId,
      },
      include: { Customer: true, ReceiptAllocations: true },
    })

    revalidatePath('/fi')
    return { success: true, data: row }
  } catch (e) {
    console.error('rejectArReceipt error', e)
    return { success: false, error: 'Failed to reject receipt' }
  }
}

export const depositArReceipt = async (input: DepositArReceiptInput): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_DEPOSIT)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id, bankAccountId, depositDate, depositReference, notes } =
      depositArReceiptSchema.parse(input)
    const existing = await db.arReceipt.findUnique({ where: { id } })
    if (!existing) return { success: false, error: 'Receipt not found' }
    if (!ensureScope(ctx, existing)) return { success: false, error: 'Not allowed' }

    const row = await db.arReceipt.update({
      where: { id },
      data: {
        status: 'DEPOSITED',
        depositBankAccountId: bankAccountId,
        bankReference: depositReference ?? existing.bankReference ?? null,
        depositedAt: depositDate,
        depositedBy: ctx.userId,
        notes: notes ?? existing.notes ?? null,
        updatedBy: ctx.userId,
      },
      include: { Customer: true, ReceiptAllocations: true },
    })

    revalidatePath('/fi')
    return { success: true, data: row }
  } catch (e) {
    console.error('depositArReceipt error', e)
    return { success: false, error: 'Failed to deposit receipt' }
  }
}

export const clearArReceipt = async (input: ClearArReceiptInput): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_CLEAR)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id, clearedDate, bankReference, notes } = clearArReceiptSchema.parse(input)
    const existing = await db.arReceipt.findUnique({ where: { id } })
    if (!existing) return { success: false, error: 'Receipt not found' }
    if (!ensureScope(ctx, existing)) return { success: false, error: 'Not allowed' }

    const row = await db.arReceipt.update({
      where: { id },
      data: {
        status: 'CLEARED',
        clearedAt: clearedDate,
        clearedBy: ctx.userId,
        bankReference: bankReference ?? existing.bankReference ?? null,
        notes: notes ?? existing.notes ?? null,
        updatedBy: ctx.userId,
      },
      include: { Customer: true, ReceiptAllocations: true },
    })

    revalidatePath('/fi')
    return { success: true, data: row }
  } catch (e) {
    console.error('clearArReceipt error', e)
    return { success: false, error: 'Failed to clear receipt' }
  }
}

export const bounceArReceipt = async (input: BounceArReceiptInput): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_BOUNCE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id, reason, bounceDate } = bounceArReceiptSchema.parse(input)
    const existing = await db.arReceipt.findUnique({ where: { id } })
    if (!existing) return { success: false, error: 'Receipt not found' }
    if (!ensureScope(ctx, existing)) return { success: false, error: 'Not allowed' }

    const row = await db.arReceipt.update({
      where: { id },
      data: {
        status: 'BOUNCED',
        bouncedAt: bounceDate,
        bouncedBy: ctx.userId,
        bounceReason: reason,
        updatedBy: ctx.userId,
      },
      include: { Customer: true, ReceiptAllocations: true },
    })

    revalidatePath('/fi')
    return { success: true, data: row }
  } catch (e) {
    console.error('bounceArReceipt error', e)
    return { success: false, error: 'Failed to bounce receipt' }
  }
}

export const voidArReceipt = async (input: VoidArReceiptInput): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_VOID)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id, reason } = voidArReceiptSchema.parse(input)
    const existing = await db.arReceipt.findUnique({ where: { id } })
    if (!existing) return { success: false, error: 'Receipt not found' }
    if (!ensureScope(ctx, existing)) return { success: false, error: 'Not allowed' }

    const row = await db.arReceipt.update({
      where: { id },
      data: {
        status: 'VOID',
        voidedAt: new Date(),
        voidedBy: ctx.userId,
        voidReason: reason,
        updatedBy: ctx.userId,
      },
      include: { Customer: true, ReceiptAllocations: true },
    })

    revalidatePath('/fi')
    return { success: true, data: row }
  } catch (e) {
    console.error('voidArReceipt error', e)
    return { success: false, error: 'Failed to void receipt' }
  }
}

export const applyArReceipt = async (input: ApplyArReceiptInput): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_ALLOCATE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id, allocations } = applyArReceiptSchema.parse(input)
    const existing = await db.arReceipt.findUnique({ where: { id } })
    if (!existing) return { success: false, error: 'Receipt not found' }
    if (!ensureScope(ctx, existing)) return { success: false, error: 'Not allowed' }

    const row = await db.$transaction(async (tx) => {
      await tx.arReceiptAllocation.deleteMany({ where: { receiptId: id } })
      if (allocations?.length) {
        await tx.arReceiptAllocation.createMany({
          data: allocations.map((a) => ({
            receiptId: id,
            openItemId: a.openItemId ?? null,
            invoiceNumber: a.invoiceNumber ?? null,
            allocatedAmount: a.allocatedAmount,
            allocatedAmountBase: a.allocatedAmountBase ?? null,
            exchangeDifference: a.exchangeDifference ?? null,
          })),
        })
      }

      return tx.arReceipt.update({
        where: { id },
        data: {
          updatedBy: ctx.userId,
        },
        include: { Customer: true, ReceiptAllocations: true },
      })
    })

    revalidatePath('/fi')
    return { success: true, data: row }
  } catch (e) {
    console.error('applyArReceipt error', e)
    return { success: false, error: 'Failed to apply receipt allocations' }
  }
}
