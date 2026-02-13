/**
 * FI-AR Credit Note Server Actions
 *
 * Customer credit note CRUD and workflow operations.
 * Credit notes reduce customer liability.
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

const PERM_READ = KEYS.fi.accounts_receivable.credit_notes.read
const PERM_CREATE = KEYS.fi.accounts_receivable.credit_notes.create
const PERM_UPDATE = KEYS.fi.accounts_receivable.credit_notes.update
const PERM_SUBMIT = KEYS.fi.accounts_receivable.credit_notes.submit
const PERM_APPROVE = KEYS.fi.accounts_receivable.credit_notes.approve
const PERM_REJECT = KEYS.fi.accounts_receivable.credit_notes.reject
const PERM_POST = KEYS.fi.accounts_receivable.credit_notes.post
const PERM_VOID = KEYS.fi.accounts_receivable.credit_notes.void

const createSchema = z.object({
  customerId: z.string().uuid().optional(),
  customerCode: z.string().optional(),
  kind: z.enum(['CREDIT_NOTE', 'DEBIT_NOTE']).default('CREDIT_NOTE'),
  issueDate: z.coerce.date(),
  dueDate: z.coerce.date().optional(),
  currency: z.string().length(3),
  description: z.string().optional(),
  customerReference: z.string().optional(),
  originalInvoiceNumber: z.string().optional(),
  netAmount: z.number().nonnegative(),
  taxAmount: z.number().nonnegative().default(0),
  grossAmount: z.number().nonnegative(),
})

const updateSchema = createSchema.partial().extend({
  id: z.string().uuid(),
})

const listFilterSchema = z.object({
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT', 'POSTED', 'APPLIED', 'VOID']).optional(),
  customerId: z.string().uuid().optional(),
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

  const rangeKey = kind === 'DEBIT_NOTE' ? 'ar.debit_note' : 'ar.credit_note'
  const prefix = kind === 'DEBIT_NOTE' ? 'DN' : 'CN'

  const { docNumber } = await reserveDocumentNumber(scope, {
    rangeKey,
    format: `${prefix}-{YYYY}-{######}`,
    prefixFallback: prefix,
    reset: (cfg?.documentNumberResetRule as any) ?? 'YEARLY',
    date: new Date(),
  })

  return docNumber
}

export const listArCreditNotes = async (
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
    if (f?.kind) where.kind = f.kind
    if (f?.search) {
      where.OR = [
        { documentNumber: { contains: f.search, mode: 'insensitive' } },
        { customerReference: { contains: f.search, mode: 'insensitive' } },
        { description: { contains: f.search, mode: 'insensitive' } },
      ]
    }

    const rows = await db.aRCreditNote.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      take: f?.pageSize ?? 25,
      skip: ((f?.page ?? 1) - 1) * (f?.pageSize ?? 25),
      include: {
        Customer: { select: { id: true, code: true, name: true } },
      },
    })

    return { success: true, data: rows }
  } catch (e) {
    console.error('listArCreditNotes error', e)
    return { success: false, error: 'Failed to list credit notes' }
  }
}

export const getArCreditNote = async (id: string): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_READ)
    if (!ok) return { success: false, error: 'Missing permission' }

    const row = await db.aRCreditNote.findUnique({
      where: { id },
      include: {
        Customer: { select: { id: true, code: true, name: true } },
      },
    })

    if (!row) return { success: false, error: 'Credit note not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    return { success: true, data: row }
  } catch (e) {
    console.error('getArCreditNote error', e)
    return { success: false, error: 'Failed to fetch credit note' }
  }
}

export const createArCreditNote = async (
  input: z.infer<typeof createSchema>
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_CREATE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const data = createSchema.parse(input)
    const documentNumber = await generateDocNumber(ctx, data.kind)

    const row = await db.aRCreditNote.create({
      data: {
        ...data,
        documentNumber,
        agencyId: ctx.agencyId,
        subAccountId: ctx.subAccountId ?? null,
        status: 'DRAFT',
        deliveryStatus: 'NOT_SENT',
        createdBy: ctx.userId,
      } as any,
    })

    revalidatePath('/fi/ar')
    return { success: true, data: row }
  } catch (e: any) {
    console.error('createArCreditNote error', e)
    return { success: false, error: e?.message ?? 'Failed to create credit note' }
  }
}

export const updateArCreditNote = async (
  id: string,
  input: z.infer<typeof updateSchema>
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_UPDATE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const row = await db.aRCreditNote.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Credit note not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    if (row.status !== 'DRAFT') {
      return { success: false, error: 'Credit note cannot be edited in current status' }
    }

    const data = updateSchema.parse({ ...input, id })

    const updated = await db.aRCreditNote.update({
      where: { id },
      data: {
        ...data,
        updatedBy: ctx.userId,
      } as any,
    })

    revalidatePath('/fi/ar')
    return { success: true, data: updated }
  } catch (e: any) {
    console.error('updateArCreditNote error', e)
    return { success: false, error: e?.message ?? 'Failed to update credit note' }
  }
}

const idSchema = z.object({ id: z.string().uuid() })

export const submitArCreditNote = async (
  input: z.infer<typeof idSchema>
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_SUBMIT)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id } = idSchema.parse(input)

    const row = await db.aRCreditNote.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Credit note not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    if (row.status !== 'DRAFT') {
      return { success: false, error: 'Credit note cannot be submitted from current status' }
    }

    const updated = await db.aRCreditNote.update({
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
    console.error('submitArCreditNote error', e)
    return { success: false, error: 'Failed to submit credit note' }
  }
}

export const approveArCreditNote = async (
  input: z.infer<typeof idSchema>
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_APPROVE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id } = idSchema.parse(input)

    const row = await db.aRCreditNote.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Credit note not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    if (row.status !== 'PENDING_APPROVAL') {
      return { success: false, error: 'Credit note is not pending approval' }
    }

    const updated = await db.aRCreditNote.update({
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
    console.error('approveArCreditNote error', e)
    return { success: false, error: 'Failed to approve credit note' }
  }
}

const rejectSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(1).max(500),
})

export const rejectArCreditNote = async (
  input: z.infer<typeof rejectSchema>
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_REJECT)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id, reason } = rejectSchema.parse(input)

    const row = await db.aRCreditNote.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Credit note not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    if (row.status !== 'PENDING_APPROVAL') {
      return { success: false, error: 'Credit note is not pending approval' }
    }

    const updated = await db.aRCreditNote.update({
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
    console.error('rejectArCreditNote error', e)
    return { success: false, error: 'Failed to reject credit note' }
  }
}

export const postArCreditNote = async (
  input: z.infer<typeof idSchema>
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_POST)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id } = idSchema.parse(input)

    const row = await db.aRCreditNote.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Credit note not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    if (!['APPROVED', 'SENT'].includes(row.status)) {
      return { success: false, error: 'Credit note must be approved before posting' }
    }

    // TODO: Create journal entry for credit note posting
    // TODO: Create/update open item for clearing

    const updated = await db.aRCreditNote.update({
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
    console.error('postArCreditNote error', e)
    return { success: false, error: 'Failed to post credit note' }
  }
}

const voidSchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(1).max(500),
})

export const voidArCreditNote = async (
  input: z.infer<typeof voidSchema>
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_VOID)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id, reason } = voidSchema.parse(input)

    const row = await db.aRCreditNote.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Credit note not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    if (['APPLIED', 'VOID'].includes(row.status)) {
      return { success: false, error: 'Cannot void credit note in current status' }
    }

    const updated = await db.aRCreditNote.update({
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
    console.error('voidArCreditNote error', e)
    return { success: false, error: 'Failed to void credit note' }
  }
}
