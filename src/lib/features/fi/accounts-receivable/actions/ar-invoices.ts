/**
 * FI-AR Invoice Server Actions
 *
 * Customer invoice CRUD and workflow operations.
 * Supports e-invoice generation and submission.
 */

'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { hasAgencyPermission, hasSubAccountPermission } from '@/lib/features/iam/authz/permissions'
import { KEYS } from '@/lib/registry/keys/permissions'
import {
  arInvoiceCreateSchema,
  arInvoiceUpdateSchema,
  submitArInvoiceSchema,
  approveArInvoiceSchema,
  rejectArInvoiceSchema,
  postArInvoiceSchema,
  voidArInvoiceSchema,
  getArInvoicesFilterSchema,
  type ArInvoiceCreate,
  type ArInvoiceUpdate,
  type SubmitArInvoiceInput,
  type ApproveArInvoiceInput,
  type RejectArInvoiceInput,
  type PostArInvoiceInput,
  type VoidArInvoiceInput,
  type GetArInvoicesFilter,
} from '@/lib/schemas/fi/accounts-receivable/ar-invoice'
import { reserveDocumentNumber } from '@/lib/features/fi/general-ledger/utils/number-ranges'

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

const PERM_READ = KEYS.fi.accounts_receivable.invoices.read
const PERM_CREATE = KEYS.fi.accounts_receivable.invoices.create
const PERM_UPDATE = KEYS.fi.accounts_receivable.invoices.update
const PERM_SUBMIT = KEYS.fi.accounts_receivable.invoices.submit
const PERM_APPROVE = KEYS.fi.accounts_receivable.invoices.approve
const PERM_REJECT = KEYS.fi.accounts_receivable.invoices.reject
const PERM_POST = KEYS.fi.accounts_receivable.invoices.post
const PERM_VOID = KEYS.fi.accounts_receivable.invoices.void

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
    rangeKey: 'ar.invoice',
    format: 'INV-{YYYY}-{######}',
    prefixFallback: 'INV',
    reset: (cfg?.documentNumberResetRule as any) ?? 'YEARLY',
    date: new Date(),
  })

  return docNumber
}

export const listArInvoices = async (
  filter?: GetArInvoicesFilter
): Promise<ActionResult<any[]>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_READ)
    if (!ok) return { success: false, error: 'Missing permission' }

    const f = getArInvoicesFilterSchema.parse(filter ?? {})
    const where: any = { ...scopeWhere(ctx) }

    if (f.status) where.status = f.status
    if (f.statusIn?.length) where.status = { in: f.statusIn }
    if (f.customerId) where.customerId = f.customerId
    if (f.issueDateFrom || f.issueDateTo) {
      where.issueDate = {}
      if (f.issueDateFrom) where.issueDate.gte = f.issueDateFrom
      if (f.issueDateTo) where.issueDate.lte = f.issueDateTo
    }
    if (f.dueDateFrom || f.dueDateTo) {
      where.dueDate = {}
      if (f.dueDateFrom) where.dueDate.gte = f.dueDateFrom
      if (f.dueDateTo) where.dueDate.lte = f.dueDateTo
    }
    if (f.overdueOnly) {
      where.dueDate = { lt: new Date() }
      where.status = { notIn: ['PAID', 'VOID', 'WRITE_OFF'] }
    }
    if (f.inDispute !== undefined) where.inDispute = f.inDispute
    if (f.deliveryStatus) where.deliveryStatus = f.deliveryStatus
    if (f.search) {
      where.OR = [
        { documentNumber: { contains: f.search, mode: 'insensitive' } },
        { customerReference: { contains: f.search, mode: 'insensitive' } },
        { description: { contains: f.search, mode: 'insensitive' } },
      ]
    }

    const orderBy: any = {}
    orderBy[f.sortBy] = f.sortOrder

    const rows = await db.aRInvoice.findMany({
      where,
      orderBy,
      take: f.pageSize,
      skip: (f.page - 1) * f.pageSize,
      include: {
        Customer: { select: { id: true, code: true, name: true } },
      },
    })

    return { success: true, data: rows }
  } catch (e) {
    console.error('listArInvoices error', e)
    return { success: false, error: 'Failed to list AR invoices' }
  }
}

export const getArInvoice = async (id: string): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_READ)
    if (!ok) return { success: false, error: 'Missing permission' }

    const row = await db.aRInvoice.findUnique({
      where: { id },
      include: {
        Customer: { select: { id: true, code: true, name: true } },
        LineItems: true,
      },
    })

    if (!row) return { success: false, error: 'Invoice not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    return { success: true, data: row }
  } catch (e) {
    console.error('getArInvoice error', e)
    return { success: false, error: 'Failed to fetch invoice' }
  }
}

export const createArInvoice = async (input: ArInvoiceCreate): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_CREATE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const data = arInvoiceCreateSchema.parse(input)
    const documentNumber = await generateInvoiceNumber(ctx)

    const { lines, ...invoiceData } = data as any

    const row = await db.aRInvoice.create({
      data: {
        ...invoiceData,
        documentNumber,
        agencyId: ctx.agencyId,
        subAccountId: ctx.subAccountId ?? null,
        status: 'DRAFT',
        deliveryStatus: 'NOT_SENT',
        createdBy: ctx.userId,
        ...(lines?.length && {
          LineItems: {
            create: lines.map((line: any, idx: number) => ({
              ...line,
              lineNo: idx + 1,
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
    console.error('createArInvoice error', e)
    return { success: false, error: e?.message ?? 'Failed to create invoice' }
  }
}

export const updateArInvoice = async (
  id: string,
  input: ArInvoiceUpdate
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_UPDATE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const row = await db.aRInvoice.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Invoice not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    if (!['DRAFT'].includes(row.status)) {
      return { success: false, error: 'Invoice cannot be edited in current status' }
    }

    const data = arInvoiceUpdateSchema.parse({ ...input, id })
    const { lines, ...invoiceData } = data as any

    const updated = await db.aRInvoice.update({
      where: { id },
      data: {
        ...invoiceData,
        updatedBy: ctx.userId,
      } as any,
    })

    revalidatePath('/fi/ar')
    return { success: true, data: updated }
  } catch (e: any) {
    console.error('updateArInvoice error', e)
    return { success: false, error: e?.message ?? 'Failed to update invoice' }
  }
}

export const submitArInvoice = async (
  input: SubmitArInvoiceInput
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_SUBMIT)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id } = submitArInvoiceSchema.parse(input)

    const row = await db.aRInvoice.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Invoice not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    if (row.status !== 'DRAFT') {
      return { success: false, error: 'Invoice cannot be submitted from current status' }
    }

    const updated = await db.aRInvoice.update({
      where: { id },
      data: {
        status: 'PENDING_APPROVAL',
        submittedAt: new Date(),
        submittedBy: ctx.userId,
        updatedBy: ctx.userId,
      },
    })

    revalidatePath('/fi/ar')
    return { success: true, data: updated }
  } catch (e) {
    console.error('submitArInvoice error', e)
    return { success: false, error: 'Failed to submit invoice' }
  }
}

export const approveArInvoice = async (
  input: ApproveArInvoiceInput
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_APPROVE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id } = approveArInvoiceSchema.parse(input)

    const row = await db.aRInvoice.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Invoice not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    if (row.status !== 'PENDING_APPROVAL') {
      return { success: false, error: 'Invoice is not pending approval' }
    }

    const updated = await db.aRInvoice.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: ctx.userId,
        updatedBy: ctx.userId,
      },
    })

    revalidatePath('/fi/ar')
    return { success: true, data: updated }
  } catch (e) {
    console.error('approveArInvoice error', e)
    return { success: false, error: 'Failed to approve invoice' }
  }
}

export const rejectArInvoice = async (
  input: RejectArInvoiceInput
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_REJECT)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id, reason } = rejectArInvoiceSchema.parse(input)

    const row = await db.aRInvoice.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Invoice not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    if (row.status !== 'PENDING_APPROVAL') {
      return { success: false, error: 'Invoice is not pending approval' }
    }

    const updated = await db.aRInvoice.update({
      where: { id },
      data: {
        status: 'DRAFT',
        rejectedAt: new Date(),
        rejectedBy: ctx.userId,
        rejectionReason: reason,
        updatedBy: ctx.userId,
      },
    })

    revalidatePath('/fi/ar')
    return { success: true, data: updated }
  } catch (e) {
    console.error('rejectArInvoice error', e)
    return { success: false, error: 'Failed to reject invoice' }
  }
}

export const postArInvoice = async (
  input: PostArInvoiceInput
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_POST)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id } = postArInvoiceSchema.parse(input)

    const row = await db.aRInvoice.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Invoice not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    if (!['APPROVED', 'SENT'].includes(row.status)) {
      return { success: false, error: 'Invoice must be approved/sent before posting' }
    }

    // TODO: Create journal entry for AR posting
    // TODO: Create open item for clearing

    const updated = await db.aRInvoice.update({
      where: { id },
      data: {
        status: 'POSTED',
        postedAt: new Date(),
        postedBy: ctx.userId,
        updatedBy: ctx.userId,
      },
    })

    revalidatePath('/fi/ar')
    return { success: true, data: updated }
  } catch (e) {
    console.error('postArInvoice error', e)
    return { success: false, error: 'Failed to post invoice' }
  }
}

export const voidArInvoice = async (
  input: VoidArInvoiceInput
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_VOID)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id, reason } = voidArInvoiceSchema.parse(input)

    const row = await db.aRInvoice.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Invoice not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    if (['PAID', 'PARTIALLY_PAID', 'VOID', 'WRITE_OFF'].includes(row.status)) {
      return { success: false, error: 'Cannot void invoice in current status' }
    }

    const updated = await db.aRInvoice.update({
      where: { id },
      data: {
        status: 'VOID',
        voidedAt: new Date(),
        voidedBy: ctx.userId,
        voidReason: reason,
        updatedBy: ctx.userId,
      },
    })

    revalidatePath('/fi/ar')
    return { success: true, data: updated }
  } catch (e) {
    console.error('voidArInvoice error', e)
    return { success: false, error: 'Failed to void invoice' }
  }
}
