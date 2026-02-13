/**
 * FI-AP Purchase Order Server Actions
 *
 * Purchase order CRUD and workflow operations.
 * Links to Goods Receipts and AP Invoices for 3-way matching.
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

const PERM_READ = KEYS.fi.accounts_payable.purchase_orders.read
const PERM_CREATE = KEYS.fi.accounts_payable.purchase_orders.create
const PERM_UPDATE = KEYS.fi.accounts_payable.purchase_orders.update
const PERM_SUBMIT = KEYS.fi.accounts_payable.purchase_orders.submit
const PERM_APPROVE = KEYS.fi.accounts_payable.purchase_orders.approve
const PERM_REJECT = KEYS.fi.accounts_payable.purchase_orders.reject
const PERM_VOID = KEYS.fi.accounts_payable.purchase_orders.void

const createSchema = z.object({
  vendorId: z.string().uuid().optional(),
  vendorCode: z.string().optional(),
  orderDate: z.coerce.date(),
  expectedDeliveryDate: z.coerce.date().optional(),
  currency: z.string().length(3),
  description: z.string().optional(),
  vendorQuoteRef: z.string().optional(),
  deliveryAddress: z.record(z.string(), z.unknown()).optional(),
  paymentTermDays: z.number().int().nonnegative().optional(),
  netAmount: z.number().nonnegative(),
  taxAmount: z.number().nonnegative().default(0),
  grossAmount: z.number().nonnegative(),
  lines: z.array(z.object({
    lineNumber: z.number().int().min(1),
    itemCode: z.string().optional(),
    description: z.string(),
    quantity: z.number().positive(),
    unitPrice: z.number().nonnegative(),
    taxRate: z.number().min(0).max(100).optional(),
    lineNetAmount: z.number().nonnegative(),
  })).optional(),
})

const listFilterSchema = z.object({
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CLOSED', 'VOID']).optional(),
  vendorId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(25),
}).optional()

const generatePoNumber = async (ctx: FiContext) => {
  const cfg = await db.gLConfiguration.findFirst({
    where: { agencyId: ctx.agencyId },
    orderBy: { updatedAt: 'desc' },
    select: { documentNumberResetRule: true },
  })
  const scope = ctx.subAccountId
    ? { kind: 'subaccount' as const, subAccountId: ctx.subAccountId }
    : { kind: 'agency' as const, agencyId: ctx.agencyId }
  const { docNumber } = await reserveDocumentNumber(scope, {
    rangeKey: 'ap.purchase_order',
    format: 'PO-{YYYY}-{######}',
    prefixFallback: 'PO',
    reset: (cfg?.documentNumberResetRule as any) ?? 'YEARLY',
    date: new Date(),
  })
  return docNumber
}

export const listPurchaseOrders = async (
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
    if (f?.vendorId) where.vendorId = f.vendorId
    if (f?.search) {
      where.OR = [
        { orderNumber: { contains: f.search, mode: 'insensitive' } },
        { description: { contains: f.search, mode: 'insensitive' } },
      ]
    }

    const rows = await db.purchaseOrder.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      take: f?.pageSize ?? 25,
      skip: ((f?.page ?? 1) - 1) * (f?.pageSize ?? 25),
      include: { Vendor: { select: { id: true, code: true, name: true } } },
    })
    return { success: true, data: rows }
  } catch (e) {
    console.error('listPurchaseOrders error', e)
    return { success: false, error: 'Failed to list purchase orders' }
  }
}

export const getPurchaseOrder = async (id: string): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_READ)
    if (!ok) return { success: false, error: 'Missing permission' }

    const row = await db.purchaseOrder.findUnique({
      where: { id },
      include: {
        Vendor: { select: { id: true, code: true, name: true } },
        LineItems: true,
      },
    })
    if (!row) return { success: false, error: 'Purchase order not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }
    return { success: true, data: row }
  } catch (e) {
    console.error('getPurchaseOrder error', e)
    return { success: false, error: 'Failed to fetch purchase order' }
  }
}

export const createPurchaseOrder = async (
  input: z.infer<typeof createSchema>
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_CREATE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const data = createSchema.parse(input)
    const orderNumber = await generatePoNumber(ctx)
    const { lines, ...poData } = data

    const row = await db.purchaseOrder.create({
      data: {
        ...poData,
        orderNumber,
        agencyId: ctx.agencyId,
        subAccountId: ctx.subAccountId ?? null,
        status: 'DRAFT',
        createdBy: ctx.userId,
        ...(lines?.length && {
          LineItems: {
            create: lines.map((line) => ({
              ...line,
              agencyId: ctx.agencyId,
              subAccountId: ctx.subAccountId ?? null,
              createdBy: ctx.userId,
            })),
          },
        }),
      } as any,
      include: { LineItems: true },
    })

    revalidatePath('/fi/ap')
    return { success: true, data: row }
  } catch (e: any) {
    console.error('createPurchaseOrder error', e)
    return { success: false, error: e?.message ?? 'Failed to create purchase order' }
  }
}

const idSchema = z.object({ id: z.string().uuid() })

export const submitPurchaseOrder = async (input: z.infer<typeof idSchema>): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_SUBMIT)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id } = idSchema.parse(input)
    const row = await db.purchaseOrder.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Purchase order not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }
    if (row.status !== 'DRAFT') return { success: false, error: 'Cannot submit from current status' }

    const updated = await db.purchaseOrder.update({
      where: { id },
      data: { status: 'PENDING_APPROVAL', submittedAt: new Date(), submittedBy: ctx.userId, updatedBy: ctx.userId },
    })
    revalidatePath('/fi/ap')
    return { success: true, data: updated }
  } catch (e) {
    console.error('submitPurchaseOrder error', e)
    return { success: false, error: 'Failed to submit purchase order' }
  }
}

export const approvePurchaseOrder = async (input: z.infer<typeof idSchema>): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_APPROVE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id } = idSchema.parse(input)
    const row = await db.purchaseOrder.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Purchase order not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }
    if (row.status !== 'PENDING_APPROVAL') return { success: false, error: 'Not pending approval' }

    const updated = await db.purchaseOrder.update({
      where: { id },
      data: { status: 'APPROVED', approvedAt: new Date(), approvedBy: ctx.userId, updatedBy: ctx.userId },
    })
    revalidatePath('/fi/ap')
    return { success: true, data: updated }
  } catch (e) {
    console.error('approvePurchaseOrder error', e)
    return { success: false, error: 'Failed to approve purchase order' }
  }
}

const rejectSchema = z.object({ id: z.string().uuid(), reason: z.string().min(1).max(500) })

export const rejectPurchaseOrder = async (input: z.infer<typeof rejectSchema>): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_REJECT)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id, reason } = rejectSchema.parse(input)
    const row = await db.purchaseOrder.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Purchase order not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }
    if (row.status !== 'PENDING_APPROVAL') return { success: false, error: 'Not pending approval' }

    const updated = await db.purchaseOrder.update({
      where: { id },
      data: { status: 'DRAFT', rejectedAt: new Date(), rejectedBy: ctx.userId, rejectionReason: reason, updatedBy: ctx.userId },
    })
    revalidatePath('/fi/ap')
    return { success: true, data: updated }
  } catch (e) {
    console.error('rejectPurchaseOrder error', e)
    return { success: false, error: 'Failed to reject purchase order' }
  }
}

export const voidPurchaseOrder = async (input: z.infer<typeof rejectSchema>): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_VOID)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id, reason } = rejectSchema.parse(input)
    const row = await db.purchaseOrder.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Purchase order not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }
    if (['RECEIVED', 'CLOSED', 'VOID'].includes(row.status)) return { success: false, error: 'Cannot void in current status' }

    const updated = await db.purchaseOrder.update({
      where: { id },
      data: { status: 'VOID', voidedAt: new Date(), voidedBy: ctx.userId, voidReason: reason, updatedBy: ctx.userId },
    })
    revalidatePath('/fi/ap')
    return { success: true, data: updated }
  } catch (e) {
    console.error('voidPurchaseOrder error', e)
    return { success: false, error: 'Failed to void purchase order' }
  }
}
