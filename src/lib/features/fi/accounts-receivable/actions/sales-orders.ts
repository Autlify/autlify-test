/**
 * FI-AR Sales Order Server Actions
 *
 * Sales order CRUD and workflow operations.
 * Links to Delivery Notes and AR Invoices.
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

const PERM_READ = KEYS.fi.accounts_receivable.sales_orders.read
const PERM_CREATE = KEYS.fi.accounts_receivable.sales_orders.create
const PERM_UPDATE = KEYS.fi.accounts_receivable.sales_orders.update
const PERM_SUBMIT = KEYS.fi.accounts_receivable.sales_orders.submit
const PERM_APPROVE = KEYS.fi.accounts_receivable.sales_orders.approve
const PERM_REJECT = KEYS.fi.accounts_receivable.sales_orders.reject
const PERM_VOID = KEYS.fi.accounts_receivable.sales_orders.void

const createSchema = z.object({
  customerId: z.string().uuid().optional(),
  customerCode: z.string().optional(),
  orderDate: z.coerce.date(),
  requestedDeliveryDate: z.coerce.date().optional(),
  currency: z.string().length(3),
  description: z.string().optional(),
  customerPurchaseOrder: z.string().optional(),
  shippingAddress: z.record(z.string(), z.unknown()).optional(),
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
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PARTIALLY_FULFILLED', 'FULFILLED', 'CLOSED', 'VOID']).optional(),
  customerId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(25),
}).optional()

const generateSoNumber = async (ctx: FiContext) => {
  const cfg = await db.gLConfiguration.findFirst({
    where: { agencyId: ctx.agencyId },
    orderBy: { updatedAt: 'desc' },
    select: { documentNumberResetRule: true },
  })
  const scope = ctx.subAccountId
    ? { kind: 'subaccount' as const, subAccountId: ctx.subAccountId }
    : { kind: 'agency' as const, agencyId: ctx.agencyId }
  const { docNumber } = await reserveDocumentNumber(scope, {
    rangeKey: 'ar.sales_order',
    format: 'SO-{YYYY}-{######}',
    prefixFallback: 'SO',
    reset: (cfg?.documentNumberResetRule as any) ?? 'YEARLY',
    date: new Date(),
  })
  return docNumber
}

export const listSalesOrders = async (
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
    if (f?.customerId) where.customerId = f.customerId
    if (f?.search) {
      where.OR = [
        { orderNumber: { contains: f.search, mode: 'insensitive' } },
        { customerPurchaseOrder: { contains: f.search, mode: 'insensitive' } },
        { description: { contains: f.search, mode: 'insensitive' } },
      ]
    }

    const rows = await db.salesOrder.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      take: f?.pageSize ?? 25,
      skip: ((f?.page ?? 1) - 1) * (f?.pageSize ?? 25),
      include: { Customer: { select: { id: true, code: true, name: true } } },
    })
    return { success: true, data: rows }
  } catch (e) {
    console.error('listSalesOrders error', e)
    return { success: false, error: 'Failed to list sales orders' }
  }
}

export const getSalesOrder = async (id: string): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_READ)
    if (!ok) return { success: false, error: 'Missing permission' }

    const row = await db.salesOrder.findUnique({
      where: { id },
      include: {
        Customer: { select: { id: true, code: true, name: true } },
        LineItems: true,
      },
    })
    if (!row) return { success: false, error: 'Sales order not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }
    return { success: true, data: row }
  } catch (e) {
    console.error('getSalesOrder error', e)
    return { success: false, error: 'Failed to fetch sales order' }
  }
}

export const createSalesOrder = async (
  input: z.infer<typeof createSchema>
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_CREATE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const data = createSchema.parse(input)
    const orderNumber = await generateSoNumber(ctx)
    const { lines, ...soData } = data

    const row = await db.salesOrder.create({
      data: {
        ...soData,
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

    revalidatePath('/fi/ar')
    return { success: true, data: row }
  } catch (e: any) {
    console.error('createSalesOrder error', e)
    return { success: false, error: e?.message ?? 'Failed to create sales order' }
  }
}

const idSchema = z.object({ id: z.string().uuid() })

export const submitSalesOrder = async (input: z.infer<typeof idSchema>): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_SUBMIT)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id } = idSchema.parse(input)
    const row = await db.salesOrder.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Sales order not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }
    if (row.status !== 'DRAFT') return { success: false, error: 'Cannot submit from current status' }

    const updated = await db.salesOrder.update({
      where: { id },
      data: { status: 'PENDING_APPROVAL', submittedAt: new Date(), submittedBy: ctx.userId, updatedBy: ctx.userId },
    })
    revalidatePath('/fi/ar')
    return { success: true, data: updated }
  } catch (e) {
    console.error('submitSalesOrder error', e)
    return { success: false, error: 'Failed to submit sales order' }
  }
}

export const approveSalesOrder = async (input: z.infer<typeof idSchema>): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_APPROVE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id } = idSchema.parse(input)
    const row = await db.salesOrder.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Sales order not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }
    if (row.status !== 'PENDING_APPROVAL') return { success: false, error: 'Not pending approval' }

    const updated = await db.salesOrder.update({
      where: { id },
      data: { status: 'APPROVED', approvedAt: new Date(), approvedBy: ctx.userId, updatedBy: ctx.userId },
    })
    revalidatePath('/fi/ar')
    return { success: true, data: updated }
  } catch (e) {
    console.error('approveSalesOrder error', e)
    return { success: false, error: 'Failed to approve sales order' }
  }
}

const rejectSchema = z.object({ id: z.string().uuid(), reason: z.string().min(1).max(500) })

export const rejectSalesOrder = async (input: z.infer<typeof rejectSchema>): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_REJECT)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id, reason } = rejectSchema.parse(input)
    const row = await db.salesOrder.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Sales order not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }
    if (row.status !== 'PENDING_APPROVAL') return { success: false, error: 'Not pending approval' }

    const updated = await db.salesOrder.update({
      where: { id },
      data: { status: 'DRAFT', rejectedAt: new Date(), rejectedBy: ctx.userId, rejectionReason: reason, updatedBy: ctx.userId },
    })
    revalidatePath('/fi/ar')
    return { success: true, data: updated }
  } catch (e) {
    console.error('rejectSalesOrder error', e)
    return { success: false, error: 'Failed to reject sales order' }
  }
}

export const voidSalesOrder = async (input: z.infer<typeof rejectSchema>): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_VOID)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id, reason } = rejectSchema.parse(input)
    const row = await db.salesOrder.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Sales order not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }
    if (['FULFILLED', 'CLOSED', 'VOID'].includes(row.status)) return { success: false, error: 'Cannot void in current status' }

    const updated = await db.salesOrder.update({
      where: { id },
      data: { status: 'VOID', voidedAt: new Date(), voidedBy: ctx.userId, voidReason: reason, updatedBy: ctx.userId },
    })
    revalidatePath('/fi/ar')
    return { success: true, data: updated }
  } catch (e) {
    console.error('voidSalesOrder error', e)
    return { success: false, error: 'Failed to void sales order' }
  }
}
