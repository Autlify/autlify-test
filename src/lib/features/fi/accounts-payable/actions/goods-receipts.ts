/**
 * FI-AP Goods Receipt Server Actions
 *
 * Goods receipt CRUD operations for 3-way matching.
 * Links to Purchase Orders and AP Invoices.
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

const PERM_READ = KEYS.fi.accounts_payable.goods_receipts.read
const PERM_CREATE = KEYS.fi.accounts_payable.goods_receipts.create
const PERM_UPDATE = KEYS.fi.accounts_payable.goods_receipts.update
const PERM_POST = KEYS.fi.accounts_payable.goods_receipts.post
const PERM_REVERSE = KEYS.fi.accounts_payable.goods_receipts.reverse

const createSchema = z.object({
  purchaseOrderId: z.string().uuid().optional(),
  vendorId: z.string().uuid().optional(),
  receiptDate: z.coerce.date(),
  deliveryNoteRef: z.string().optional(),
  warehouseId: z.string().uuid().optional(),
  description: z.string().optional(),
  lines: z.array(z.object({
    lineNumber: z.number().int().min(1),
    purchaseOrderLineId: z.string().uuid().optional(),
    itemCode: z.string().optional(),
    description: z.string(),
    quantityOrdered: z.number().nonnegative().optional(),
    quantityReceived: z.number().positive(),
    unitPrice: z.number().nonnegative().optional(),
    lineAmount: z.number().nonnegative().optional(),
  })).min(1),
})

const listFilterSchema = z.object({
  status: z.enum(['DRAFT', 'POSTED', 'REVERSED']).optional(),
  purchaseOrderId: z.string().uuid().optional(),
  vendorId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(25),
}).optional()

const generateGrNumber = async (ctx: FiContext) => {
  const cfg = await db.gLConfiguration.findFirst({
    where: { agencyId: ctx.agencyId },
    orderBy: { updatedAt: 'desc' },
    select: { documentNumberResetRule: true },
  })
  const scope = ctx.subAccountId
    ? { kind: 'subaccount' as const, subAccountId: ctx.subAccountId }
    : { kind: 'agency' as const, agencyId: ctx.agencyId }
  const { docNumber } = await reserveDocumentNumber(scope, {
    rangeKey: 'ap.goods_receipt',
    format: 'GR-{YYYY}-{######}',
    prefixFallback: 'GR',
    reset: (cfg?.documentNumberResetRule as any) ?? 'YEARLY',
    date: new Date(),
  })
  return docNumber
}

export const listGoodsReceipts = async (
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
    if (f?.purchaseOrderId) where.purchaseOrderId = f.purchaseOrderId
    if (f?.vendorId) where.vendorId = f.vendorId
    if (f?.search) {
      where.OR = [
        { receiptNumber: { contains: f.search, mode: 'insensitive' } },
        { deliveryNoteRef: { contains: f.search, mode: 'insensitive' } },
        { description: { contains: f.search, mode: 'insensitive' } },
      ]
    }

    const rows = await db.goodsReceipt.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      take: f?.pageSize ?? 25,
      skip: ((f?.page ?? 1) - 1) * (f?.pageSize ?? 25),
      include: {
        Vendor: { select: { id: true, code: true, name: true } },
        PurchaseOrder: { select: { id: true, orderNumber: true } },
      },
    })
    return { success: true, data: rows }
  } catch (e) {
    console.error('listGoodsReceipts error', e)
    return { success: false, error: 'Failed to list goods receipts' }
  }
}

export const getGoodsReceipt = async (id: string): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_READ)
    if (!ok) return { success: false, error: 'Missing permission' }

    const row = await db.goodsReceipt.findUnique({
      where: { id },
      include: {
        Vendor: { select: { id: true, code: true, name: true } },
        PurchaseOrder: { select: { id: true, orderNumber: true } },
        LineItems: true,
      },
    })
    if (!row) return { success: false, error: 'Goods receipt not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }
    return { success: true, data: row }
  } catch (e) {
    console.error('getGoodsReceipt error', e)
    return { success: false, error: 'Failed to fetch goods receipt' }
  }
}

export const createGoodsReceipt = async (
  input: z.infer<typeof createSchema>
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_CREATE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const data = createSchema.parse(input)
    const receiptNumber = await generateGrNumber(ctx)
    const { lines, ...grData } = data

    const row = await db.goodsReceipt.create({
      data: {
        ...grData,
        receiptNumber,
        agencyId: ctx.agencyId,
        subAccountId: ctx.subAccountId ?? null,
        status: 'DRAFT',
        createdBy: ctx.userId,
        LineItems: {
          create: lines.map((line) => ({
            ...line,
            agencyId: ctx.agencyId,
            subAccountId: ctx.subAccountId ?? null,
            createdBy: ctx.userId,
          })),
        },
      } as any,
      include: { LineItems: true },
    })

    revalidatePath('/fi/ap')
    return { success: true, data: row }
  } catch (e: any) {
    console.error('createGoodsReceipt error', e)
    return { success: false, error: e?.message ?? 'Failed to create goods receipt' }
  }
}

const idSchema = z.object({ id: z.string().uuid() })

export const postGoodsReceipt = async (input: z.infer<typeof idSchema>): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_POST)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id } = idSchema.parse(input)
    const row = await db.goodsReceipt.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Goods receipt not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }
    if (row.status !== 'DRAFT') return { success: false, error: 'Cannot post from current status' }

    // TODO: Update inventory quantities
    // TODO: Create GR/IR clearing entry
    // TODO: Update PO received quantities

    const updated = await db.goodsReceipt.update({
      where: { id },
      data: { status: 'POSTED', postedAt: new Date(), postedBy: ctx.userId, updatedBy: ctx.userId },
    })
    revalidatePath('/fi/ap')
    return { success: true, data: updated }
  } catch (e) {
    console.error('postGoodsReceipt error', e)
    return { success: false, error: 'Failed to post goods receipt' }
  }
}

const reverseSchema = z.object({ id: z.string().uuid(), reason: z.string().min(1).max(500) })

export const reverseGoodsReceipt = async (input: z.infer<typeof reverseSchema>): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_REVERSE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id, reason } = reverseSchema.parse(input)
    const row = await db.goodsReceipt.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Goods receipt not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }
    if (row.status !== 'POSTED') return { success: false, error: 'Only posted receipts can be reversed' }

    // TODO: Reverse inventory quantities
    // TODO: Reverse GR/IR clearing entry

    const updated = await db.goodsReceipt.update({
      where: { id },
      data: { status: 'REVERSED', reversedAt: new Date(), reversedBy: ctx.userId, reverseReason: reason, updatedBy: ctx.userId },
    })
    revalidatePath('/fi/ap')
    return { success: true, data: updated }
  } catch (e) {
    console.error('reverseGoodsReceipt error', e)
    return { success: false, error: 'Failed to reverse goods receipt' }
  }
}
