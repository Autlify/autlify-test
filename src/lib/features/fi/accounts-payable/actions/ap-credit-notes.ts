/**
 * FI-AP Credit Note Server Actions
 *
 * Vendor credit note CRUD and workflow operations.
 * Credit notes reduce vendor liability.
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

const PERM_READ = KEYS.fi.accounts_payable.credit_notes.read
const PERM_CREATE = KEYS.fi.accounts_payable.credit_notes.create
const PERM_UPDATE = KEYS.fi.accounts_payable.credit_notes.update
const PERM_SUBMIT = KEYS.fi.accounts_payable.credit_notes.submit
const PERM_APPROVE = KEYS.fi.accounts_payable.credit_notes.approve
const PERM_REJECT = KEYS.fi.accounts_payable.credit_notes.reject
const PERM_POST = KEYS.fi.accounts_payable.credit_notes.post
const PERM_VOID = KEYS.fi.accounts_payable.credit_notes.void

const createSchema = z.object({
  vendorId: z.string().uuid().optional(),
  vendorCode: z.string().optional(),
  kind: z.enum(['CREDIT_NOTE', 'DEBIT_NOTE']).default('CREDIT_NOTE'),
  issueDate: z.coerce.date(),
  dueDate: z.coerce.date().optional(),
  currency: z.string().length(3),
  description: z.string().optional(),
  vendorCreditNoteRef: z.string().optional(),
  originalInvoiceNumber: z.string().optional(),
  netAmount: z.number().nonnegative(),
  taxAmount: z.number().nonnegative().default(0),
  grossAmount: z.number().nonnegative(),
})

const updateSchema = createSchema.partial().extend({
  id: z.string().uuid(),
})

const listFilterSchema = z.object({
  status: z.enum(['DRAFT', 'RECEIVED', 'PENDING_APPROVAL', 'APPROVED', 'POSTED', 'APPLIED', 'VOID']).optional(),
  vendorId: z.string().uuid().optional(),
  kind: z.enum(['CREDIT_NOTE', 'DEBIT_NOTE']).optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(25),
}).optional()

const generateDocNumber = async (ctx: FiContext, kind: string) => {
  const cfg = await db.gLConfiguration.findFirst({
    where: { agencyId: ctx.agencyId },
    orderBy: { updatedAt: 'desc' },
    select: { documentNumberResetRule: true },
  })

  const scope = ctx.subAccountId
    ? { kind: 'subaccount' as const, subAccountId: ctx.subAccountId }
    : { kind: 'agency' as const, agencyId: ctx.agencyId }

  const rangeKey = kind === 'DEBIT_NOTE' ? 'ap.debit_note' : 'ap.credit_note'
  const prefix = kind === 'DEBIT_NOTE' ? 'APDN' : 'APCN'

  const { docNumber } = await reserveDocumentNumber(scope, {
    rangeKey,
    format: `${prefix}-{YYYY}-{######}`,
    prefixFallback: prefix,
    reset: (cfg?.documentNumberResetRule as any) ?? 'YEARLY',
    date: new Date(),
  })

  return docNumber
}

export const listApCreditNotes = async (
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
    if (f?.kind) where.kind = f.kind
    if (f?.search) {
      where.OR = [
        { documentNumber: { contains: f.search, mode: 'insensitive' } },
        { vendorCreditNoteRef: { contains: f.search, mode: 'insensitive' } },
        { description: { contains: f.search, mode: 'insensitive' } },
      ]
    }

    const rows = await db.aPCreditNote.findMany({
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
    console.error('listApCreditNotes error', e)
    return { success: false, error: 'Failed to list credit notes' }
  }
}

export const getApCreditNote = async (id: string): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_READ)
    if (!ok) return { success: false, error: 'Missing permission' }

    const row = await db.aPCreditNote.findUnique({
      where: { id },
      include: {
        Vendor: { select: { id: true, code: true, name: true } },
      },
    })

    if (!row) return { success: false, error: 'Credit note not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    return { success: true, data: row }
  } catch (e) {
    console.error('getApCreditNote error', e)
    return { success: false, error: 'Failed to fetch credit note' }
  }
}

export const createApCreditNote = async (
  input: z.infer<typeof createSchema>
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_CREATE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const data = createSchema.parse(input)
    const documentNumber = await generateDocNumber(ctx, data.kind)

    const row = await db.aPCreditNote.create({
      data: {
        ...data,
        documentNumber,
        agencyId: ctx.agencyId,
        subAccountId: ctx.subAccountId ?? null,
        status: 'DRAFT',
        createdBy: ctx.userId,
      } as any,
    })

    revalidatePath('/fi/ap')
    return { success: true, data: row }
  } catch (e: any) {
    console.error('createApCreditNote error', e)
    return { success: false, error: e?.message ?? 'Failed to create credit note' }
  }
}

export const updateApCreditNote = async (
  id: string,
  input: z.infer<typeof updateSchema>
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_UPDATE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const row = await db.aPCreditNote.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Credit note not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    if (!['DRAFT', 'RECEIVED'].includes(row.status)) {
      return { success: false, error: 'Credit note cannot be edited in current status' }
    }

    const data = updateSchema.parse({ ...input, id })

    const updated = await db.aPCreditNote.update({
      where: { id },
      data: {
        ...data,
        updatedBy: ctx.userId,
      } as any,
    })

    revalidatePath('/fi/ap')
    return { success: true, data: updated }
  } catch (e: any) {
    console.error('updateApCreditNote error', e)
    return { success: false, error: e?.message ?? 'Failed to update credit note' }
  }
}

const idSchema = z.object({ id: z.string().uuid() })

export const submitApCreditNote = async (
  input: z.infer<typeof idSchema>
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_SUBMIT)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id } = idSchema.parse(input)

    const row = await db.aPCreditNote.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Credit note not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    if (!['DRAFT', 'RECEIVED'].includes(row.status)) {
      return { success: false, error: 'Credit note cannot be submitted from current status' }
    }

    const updated = await db.aPCreditNote.update({
      where: { id },
      data: {
        status: 'PENDING_APPROVAL',
        updatedBy: ctx.userId,
      },
    })

    revalidatePath('/fi/ap')
    return { success: true, data: updated }
  } catch (e) {
    console.error('submitApCreditNote error', e)
    return { success: false, error: 'Failed to submit credit note' }
  }
}

export const approveApCreditNote = async (
  input: z.infer<typeof idSchema>
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_APPROVE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id } = idSchema.parse(input)

    const row = await db.aPCreditNote.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Credit note not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    if (row.status !== 'PENDING_APPROVAL') {
      return { success: false, error: 'Credit note is not pending approval' }
    }

    const updated = await db.aPCreditNote.update({
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
    console.error('approveApCreditNote error', e)
    return { success: false, error: 'Failed to approve credit note' }
  }
}

const rejectSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(1).max(500),
})

export const rejectApCreditNote = async (
  input: z.infer<typeof rejectSchema>
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_REJECT)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id, reason } = rejectSchema.parse(input)

    const row = await db.aPCreditNote.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Credit note not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    if (row.status !== 'PENDING_APPROVAL') {
      return { success: false, error: 'Credit note is not pending approval' }
    }

    const updated = await db.aPCreditNote.update({
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
    console.error('rejectApCreditNote error', e)
    return { success: false, error: 'Failed to reject credit note' }
  }
}

export const postApCreditNote = async (
  input: z.infer<typeof idSchema>
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_POST)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id } = idSchema.parse(input)

    const row = await db.aPCreditNote.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Credit note not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    if (row.status !== 'APPROVED') {
      return { success: false, error: 'Credit note must be approved before posting' }
    }

    // TODO: Create journal entry for credit note posting
    // TODO: Create/update open item for clearing

    const updated = await db.aPCreditNote.update({
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
    console.error('postApCreditNote error', e)
    return { success: false, error: 'Failed to post credit note' }
  }
}

const voidSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(1).max(500),
})

export const voidApCreditNote = async (
  input: z.infer<typeof voidSchema>
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_VOID)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id, reason } = voidSchema.parse(input)

    const row = await db.aPCreditNote.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Credit note not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    if (['APPLIED', 'VOID'].includes(row.status)) {
      return { success: false, error: 'Cannot void credit note in current status' }
    }

    const updated = await db.aPCreditNote.update({
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
    console.error('voidApCreditNote error', e)
    return { success: false, error: 'Failed to void credit note' }
  }
}
