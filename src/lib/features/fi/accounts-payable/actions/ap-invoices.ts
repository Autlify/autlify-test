/**
 * FI-AP Invoice Server Actions
 *
 * Vendor invoice CRUD and workflow operations.
 * Supports 3-way matching (PO/GR/Invoice) when enabled.
 */

'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { hasAgencyPermission, hasSubAccountPermission } from '@/lib/features/iam/authz/permissions'
import { KEYS } from '@/lib/registry/keys/permissions'
import {
  apInvoiceCreateSchema,
  apInvoiceUpdateSchema,
  type ApInvoiceCreate,
  type ApInvoiceUpdate,
} from '@/lib/schemas/fi/accounts-payable/ap-invoice'
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

const PERM_READ = KEYS.fi.accounts_payable.invoices.read
const PERM_CREATE = KEYS.fi.accounts_payable.invoices.create
const PERM_UPDATE = KEYS.fi.accounts_payable.invoices.update
const PERM_SUBMIT = KEYS.fi.accounts_payable.invoices.submit
const PERM_APPROVE = KEYS.fi.accounts_payable.invoices.approve
const PERM_REJECT = KEYS.fi.accounts_payable.invoices.reject
const PERM_POST = KEYS.fi.accounts_payable.invoices.post
const PERM_VOID = KEYS.fi.accounts_payable.invoices.void

const listFilterSchema = z.object({
  status: z.enum(['DRAFT', 'RECEIVED', 'PENDING_APPROVAL', 'APPROVED', 'POSTED', 'PARTIALLY_PAID', 'PAID', 'VOID']).optional(),
  vendorId: z.string().uuid().optional(),
  invoiceDateFrom: z.coerce.date().optional(),
  invoiceDateTo: z.coerce.date().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(25),
}).optional()

const generateInvoiceNumber = async (ctx: FiContext) => {
  const cfg = await db.gLConfiguration.findFirst({
    where: { agencyId: ctx.agencyId },
    orderBy: { updatedAt: 'desc' },
    select: { documentNumberResetRule: true },
  })

  const scope = ctx.subAccountId
    ? { kind: 'subaccount' as const, subAccountId: ctx.subAccountId }
    : { kind: 'agency' as const, agencyId: ctx.agencyId }

  const { docNumber } = await reserveDocumentNumber(scope, {
    rangeKey: 'ap.invoice',
    format: 'APINV-{YYYY}-{######}',
    prefixFallback: 'APINV',
    reset: (cfg?.documentNumberResetRule as any) ?? 'YEARLY',
    date: new Date(),
  })

  return docNumber
}

export const listApInvoices = async (
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
    if (f?.invoiceDateFrom || f?.invoiceDateTo) {
      where.invoiceDate = {}
      if (f.invoiceDateFrom) where.invoiceDate.gte = f.invoiceDateFrom
      if (f.invoiceDateTo) where.invoiceDate.lte = f.invoiceDateTo
    }
    if (f?.search) {
      where.OR = [
        { invoiceNumber: { contains: f.search, mode: 'insensitive' } },
        { vendorInvoiceRef: { contains: f.search, mode: 'insensitive' } },
        { description: { contains: f.search, mode: 'insensitive' } },
      ]
    }

    const rows = await db.aPInvoice.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      take: f?.pageSize ?? 25,
      skip: ((f?.page ?? 1) - 1) * (f?.pageSize ?? 25),
      include: {
        Vendor: { select: { id: true, code: true, name: true } },
      },
    })

    return { success: true, data: rows }
  } catch (e) {
    console.error('listApInvoices error', e)
    return { success: false, error: 'Failed to list AP invoices' }
  }
}

export const getApInvoice = async (id: string): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_READ)
    if (!ok) return { success: false, error: 'Missing permission' }

    const row = await db.aPInvoice.findUnique({
      where: { id },
      include: {
        Vendor: { select: { id: true, code: true, name: true } },
        LineItems: true,
      },
    })

    if (!row) return { success: false, error: 'Invoice not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    return { success: true, data: row }
  } catch (e) {
    console.error('getApInvoice error', e)
    return { success: false, error: 'Failed to fetch invoice' }
  }
}

export const createApInvoice = async (input: ApInvoiceCreate): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_CREATE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const data = apInvoiceCreateSchema.parse(input)
    const invoiceNumber = await generateInvoiceNumber(ctx)

    const { lines, ...invoiceData } = data as any

    const row = await db.aPInvoice.create({
      data: {
        ...invoiceData,
        invoiceNumber,
        agencyId: ctx.agencyId,
        subAccountId: ctx.subAccountId ?? null,
        status: 'DRAFT',
        createdBy: ctx.userId,
        ...(lines?.length && {
          LineItems: {
            create: lines.map((line: any, idx: number) => ({
              ...line,
              lineNumber: idx + 1,
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
    console.error('createApInvoice error', e)
    return { success: false, error: e?.message ?? 'Failed to create invoice' }
  }
}

export const updateApInvoice = async (
  id: string,
  input: ApInvoiceUpdate
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_UPDATE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const row = await db.aPInvoice.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Invoice not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    if (!['DRAFT', 'RECEIVED'].includes(row.status)) {
      return { success: false, error: 'Invoice cannot be edited in current status' }
    }

    const data = apInvoiceUpdateSchema.parse({ ...input, id })
    const { lines, ...invoiceData } = data as any

    const updated = await db.aPInvoice.update({
      where: { id },
      data: {
        ...invoiceData,
        updatedBy: ctx.userId,
      } as any,
    })

    revalidatePath('/fi/ap')
    return { success: true, data: updated }
  } catch (e: any) {
    console.error('updateApInvoice error', e)
    return { success: false, error: e?.message ?? 'Failed to update invoice' }
  }
}

const submitSchema = z.object({ id: z.string().uuid() })

export const submitApInvoice = async (
  input: z.infer<typeof submitSchema>
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_SUBMIT)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id } = submitSchema.parse(input)

    const row = await db.aPInvoice.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Invoice not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    if (!['DRAFT', 'RECEIVED'].includes(row.status)) {
      return { success: false, error: 'Invoice cannot be submitted from current status' }
    }

    const updated = await db.aPInvoice.update({
      where: { id },
      data: {
        status: 'PENDING_APPROVAL',
        updatedBy: ctx.userId,
      },
    })

    revalidatePath('/fi/ap')
    return { success: true, data: updated }
  } catch (e) {
    console.error('submitApInvoice error', e)
    return { success: false, error: 'Failed to submit invoice' }
  }
}

const approveSchema = z.object({
  id: z.string().uuid(),
  notes: z.string().max(500).optional(),
})

export const approveApInvoice = async (
  input: z.infer<typeof approveSchema>
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_APPROVE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id } = approveSchema.parse(input)

    const row = await db.aPInvoice.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Invoice not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    if (row.status !== 'PENDING_APPROVAL') {
      return { success: false, error: 'Invoice is not pending approval' }
    }

    const updated = await db.aPInvoice.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: ctx.userId,
        updatedBy: ctx.userId,
      },
    })

    revalidatePath('/fi/ap')
    return { success: true, data: updated }
  } catch (e) {
    console.error('approveApInvoice error', e)
    return { success: false, error: 'Failed to approve invoice' }
  }
}

const rejectSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(1).max(500),
})

export const rejectApInvoice = async (
  input: z.infer<typeof rejectSchema>
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_REJECT)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id, reason } = rejectSchema.parse(input)

    const row = await db.aPInvoice.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Invoice not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    if (row.status !== 'PENDING_APPROVAL') {
      return { success: false, error: 'Invoice is not pending approval' }
    }

    const updated = await db.aPInvoice.update({
      where: { id },
      data: {
        status: 'DRAFT',
        rejectedAt: new Date(),
        rejectedBy: ctx.userId,
        rejectionReason: reason,
        updatedBy: ctx.userId,
      },
    })

    revalidatePath('/fi/ap')
    return { success: true, data: updated }
  } catch (e) {
    console.error('rejectApInvoice error', e)
    return { success: false, error: 'Failed to reject invoice' }
  }
}

const postSchema = z.object({ id: z.string().uuid() })

export const postApInvoice = async (
  input: z.infer<typeof postSchema>
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_POST)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id } = postSchema.parse(input)

    const row = await db.aPInvoice.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Invoice not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    if (row.status !== 'APPROVED') {
      return { success: false, error: 'Invoice must be approved before posting' }
    }

    // TODO: Create journal entry for AP posting
    // TODO: Create open item for clearing

    const updated = await db.aPInvoice.update({
      where: { id },
      data: {
        status: 'POSTED',
        postedAt: new Date(),
        postedBy: ctx.userId,
        updatedBy: ctx.userId,
      },
    })

    revalidatePath('/fi/ap')
    return { success: true, data: updated }
  } catch (e) {
    console.error('postApInvoice error', e)
    return { success: false, error: 'Failed to post invoice' }
  }
}

const voidSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(1).max(500),
})

export const voidApInvoice = async (
  input: z.infer<typeof voidSchema>
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_VOID)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id, reason } = voidSchema.parse(input)

    const row = await db.aPInvoice.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Invoice not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    if (['PAID', 'PARTIALLY_PAID', 'VOID'].includes(row.status)) {
      return { success: false, error: 'Cannot void invoice in current status' }
    }

    const updated = await db.aPInvoice.update({
      where: { id },
      data: {
        status: 'VOID',
        voidedAt: new Date(),
        voidedBy: ctx.userId,
        voidReason: reason,
        updatedBy: ctx.userId,
      },
    })

    revalidatePath('/fi/ap')
    return { success: true, data: updated }
  } catch (e) {
    console.error('voidApInvoice error', e)
    return { success: false, error: 'Failed to void invoice' }
  }
}
