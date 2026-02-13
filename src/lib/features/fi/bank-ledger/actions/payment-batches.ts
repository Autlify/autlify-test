/**
 * Payment Batch Server Actions
 *
 * Batch processing for vendor (AP) payments and customer (AR) collections.
 */

'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { hasAgencyPermission, hasSubAccountPermission } from '@/lib/features/iam/authz/permissions'
import { KEYS } from '@/lib/registry/keys/permissions'
import { reserveDocumentNumber } from '@/lib/features/fi/general-ledger/utils/number-ranges'
import { z } from 'zod'

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

const PERM_READ = KEYS.fi.bank_ledger.payment_batches.read
const PERM_CREATE = KEYS.fi.bank_ledger.payment_batches.create
const PERM_UPDATE = KEYS.fi.bank_ledger.payment_batches.update
const PERM_SUBMIT = KEYS.fi.bank_ledger.payment_batches.submit
const PERM_APPROVE = KEYS.fi.bank_ledger.payment_batches.approve
const PERM_PROCESS = KEYS.fi.bank_ledger.payment_batches.process
const PERM_VOID = KEYS.fi.bank_ledger.payment_batches.void

const createSchema = z.object({
  batchType: z.enum(['AP_PAYMENT', 'AR_COLLECTION']),
  bankAccountId: z.string().uuid(),
  paymentDate: z.coerce.date(),
  paymentMethod: z.enum(['BANK_TRANSFER', 'CHECK', 'ACH', 'WIRE']).optional(),
  description: z.string().optional(),
  totalAmount: z.number().nonnegative().optional(),
  currency: z.string().length(3).optional(),
})

const addItemSchema = z.object({
  batchId: z.string().uuid(),
  vendorId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  invoiceId: z.string().uuid().optional(),
  amount: z.number().positive(),
  currency: z.string().length(3),
  reference: z.string().optional(),
})

const listFilterSchema = z.object({
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PROCESSING', 'COMPLETED', 'VOID']).optional(),
  batchType: z.enum(['AP_PAYMENT', 'AR_COLLECTION']).optional(),
  bankAccountId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(25),
}).optional()

const generateBatchNumber = async (ctx: FiContext, batchType: 'AP_PAYMENT' | 'AR_COLLECTION') => {
  const prefix = batchType === 'AP_PAYMENT' ? 'PAY' : 'COL'
  const rangeKey = batchType === 'AP_PAYMENT' ? 'bank.payment_batch.ap' : 'bank.payment_batch.ar'
  const cfg = await db.gLConfiguration.findFirst({
    where: { agencyId: ctx.agencyId },
    orderBy: { updatedAt: 'desc' },
    select: { documentNumberResetRule: true },
  })
  const scope = ctx.subAccountId
    ? { kind: 'subaccount' as const, subAccountId: ctx.subAccountId }
    : { kind: 'agency' as const, agencyId: ctx.agencyId }
  const { docNumber } = await reserveDocumentNumber(scope, {
    rangeKey,
    format: `${prefix}-{YYYY}-{######}`,
    prefixFallback: prefix,
    reset: (cfg?.documentNumberResetRule as any) ?? 'YEARLY',
    date: new Date(),
  })
  return docNumber
}

export const listPaymentBatches = async (
  filter?: z.infer<typeof listFilterSchema>
): Promise<ActionResult<any[]>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_READ)
    if (!ok) return { success: false, error: 'Missing permission' }

    const f = listFilterSchema.parse(filter ?? {})
    const where: any = { ...scopeWhere(ctx) }
    if (f?.status) where.status = f.status
    if (f?.batchType) where.batchType = f.batchType
    if (f?.bankAccountId) where.bankAccountId = f.bankAccountId
    if (f?.search) {
      where.OR = [
        { batchNumber: { contains: f.search, mode: 'insensitive' } },
        { description: { contains: f.search, mode: 'insensitive' } },
      ]
    }

    const rows = await db.paymentBatch.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      take: f?.pageSize ?? 25,
      skip: ((f?.page ?? 1) - 1) * (f?.pageSize ?? 25),
      include: {
        BankAccount: { select: { id: true, accountNumber: true, name: true } },
        _count: { select: { items: true } },
      },
    })
    return { success: true, data: rows }
  } catch (e) {
    console.error('listPaymentBatches error', e)
    return { success: false, error: 'Failed to list payment batches' }
  }
}

export const getPaymentBatch = async (id: string): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_READ)
    if (!ok) return { success: false, error: 'Missing permission' }

    const row = await db.paymentBatch.findUnique({
      where: { id },
      include: {
        BankAccount: { select: { id: true, accountNumber: true, name: true } },
        items: {
          include: {
            Vendor: { select: { id: true, name: true, code: true } },
            Customer: { select: { id: true, name: true, code: true } },
            
          },
        },
      },
    })
    if (!row) return { success: false, error: 'Payment batch not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }
    return { success: true, data: row }
  } catch (e) {
    console.error('getPaymentBatch error', e)
    return { success: false, error: 'Failed to fetch payment batch' }
  }
}

export const createPaymentBatch = async (
  input: z.infer<typeof createSchema>
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_CREATE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const data = createSchema.parse(input)
    const batchNumber = await generateBatchNumber(ctx, data.batchType)

    const row = await db.paymentBatch.create({
      data: {
        ...data,
        batchNumber,
        agencyId: ctx.agencyId,
        subAccountId: ctx.subAccountId ?? null,
        status: 'DRAFT',
        itemCount: 0,
        createdBy: ctx.userId,
      } as any,
    })

    revalidatePath('/fi/bank')
    return { success: true, data: row }
  } catch (e: any) {
    console.error('createPaymentBatch error', e)
    return { success: false, error: e?.message ?? 'Failed to create payment batch' }
  }
}

export const addPaymentBatchItem = async (
  input: z.infer<typeof addItemSchema>
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_UPDATE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const data = addItemSchema.parse(input)
    const batch = await db.paymentBatch.findUnique({ where: { id: data.batchId } })
    if (!batch) return { success: false, error: 'Batch not found' }
    if (!ensureScope(ctx, batch)) return { success: false, error: 'Not allowed' }
    if (batch.status !== 'DRAFT') return { success: false, error: 'Can only add items to draft batches' }

    const item = await db.paymentBatchItem.create({
      data: {
        batchId: data.batchId,
        vendorId: data.vendorId ?? null,
        customerId: data.customerId ?? null,
        invoiceId: data.invoiceId ?? null,
        amount: data.amount,
        currency: data.currency,
        reference: data.reference ?? null,
        status: 'PENDING',
      } as any,
    })

    // Update batch totals
    const totals = await db.paymentBatchItem.aggregate({
      where: { batchId: data.batchId },
      _sum: { amount: true },
      _count: { id: true },
    })

    await db.paymentBatch.update({
      where: { id: data.batchId },
      data: {
        totalAmount: totals._sum.amount ?? 0,
        itemCount: totals._count.id ?? 0,
        updatedBy: ctx.userId,
      },
    })

    revalidatePath('/fi/bank')
    return { success: true, data: item }
  } catch (e: any) {
    console.error('addPaymentBatchItem error', e)
    return { success: false, error: e?.message ?? 'Failed to add batch item' }
  }
}

const idSchema = z.object({ id: z.string().uuid() })

export const submitPaymentBatch = async (input: z.infer<typeof idSchema>): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_SUBMIT)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id } = idSchema.parse(input)
    const row = await db.paymentBatch.findUnique({
      where: { id },
      include: { _count: { select: { items: true } } },
    })
    if (!row) return { success: false, error: 'Batch not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }
    if (row.status !== 'DRAFT') return { success: false, error: 'Cannot submit from current status' }
    if ((row._count?.items ?? 0) === 0) return { success: false, error: 'Batch has no items' }

    const updated = await db.paymentBatch.update({
      where: { id },
      data: { status: 'PENDING_APPROVAL', submittedAt: new Date(), submittedBy: ctx.userId, updatedBy: ctx.userId },
    })
    revalidatePath('/fi/bank')
    return { success: true, data: updated }
  } catch (e) {
    console.error('submitPaymentBatch error', e)
    return { success: false, error: 'Failed to submit batch' }
  }
}

export const approvePaymentBatch = async (input: z.infer<typeof idSchema>): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_APPROVE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id } = idSchema.parse(input)
    const row = await db.paymentBatch.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Batch not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }
    if (row.status !== 'PENDING_APPROVAL') return { success: false, error: 'Not pending approval' }

    const updated = await db.paymentBatch.update({
      where: { id },
      data: { status: 'APPROVED', approvedAt: new Date(), approvedBy: ctx.userId, updatedBy: ctx.userId },
    })
    revalidatePath('/fi/bank')
    return { success: true, data: updated }
  } catch (e) {
    console.error('approvePaymentBatch error', e)
    return { success: false, error: 'Failed to approve batch' }
  }
}

export const processPaymentBatch = async (input: z.infer<typeof idSchema>): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_PROCESS)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id } = idSchema.parse(input)
    const row = await db.paymentBatch.findUnique({
      where: { id },
      include: { items: true },
    })
    if (!row) return { success: false, error: 'Batch not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }
    if (row.status !== 'APPROVED') return { success: false, error: 'Must be approved before processing' }

    // Update batch to processing
    await db.paymentBatch.update({
      where: { id },
      data: { status: 'PROCESSING', processedAt: new Date(), processedBy: ctx.userId, updatedBy: ctx.userId },
    })

    // Process each item
    // TODO: Create actual payments/collections and update invoices
    for (const item of row.items ?? []) {
      await db.paymentBatchItem.update({
        where: { id: item.id },
        data: { status: 'COMPLETED', processedAt: new Date() },
      })
    }

    const updated = await db.paymentBatch.update({
      where: { id },
      data: { status: 'COMPLETED' },
    })

    revalidatePath('/fi/bank')
    return { success: true, data: updated }
  } catch (e) {
    console.error('processPaymentBatch error', e)
    return { success: false, error: 'Failed to process batch' }
  }
}

const voidSchema = z.object({ id: z.string().uuid(), reason: z.string().min(1).max(500) })

export const voidPaymentBatch = async (input: z.infer<typeof voidSchema>): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_VOID)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id, reason } = voidSchema.parse(input)
    const row = await db.paymentBatch.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Batch not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }
    if (['COMPLETED', 'VOID'].includes(row.status)) return { success: false, error: 'Cannot void in current status' }

    // Void all items
    await db.paymentBatchItem.updateMany({
      where: { batchId: id },
      data: { status: 'VOID' },
    })

    const updated = await db.paymentBatch.update({
      where: { id },
      data: { status: 'VOID', voidedAt: new Date(), voidedBy: ctx.userId, voidReason: reason, updatedBy: ctx.userId },
    })
    revalidatePath('/fi/bank')
    return { success: true, data: updated }
  } catch (e) {
    console.error('voidPaymentBatch error', e)
    return { success: false, error: 'Failed to void batch' }
  }
}
