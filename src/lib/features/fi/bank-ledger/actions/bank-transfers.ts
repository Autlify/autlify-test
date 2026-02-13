/**
 * Bank Transfer Server Actions
 *
 * Internal bank transfers between company bank accounts.
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

const PERM_READ = KEYS.fi.bank_ledger.transfers.read
const PERM_CREATE = KEYS.fi.bank_ledger.transfers.create
const PERM_UPDATE = KEYS.fi.bank_ledger.transfers.update
const PERM_SUBMIT = KEYS.fi.bank_ledger.transfers.submit
const PERM_APPROVE = KEYS.fi.bank_ledger.transfers.approve
const PERM_PROCESS = KEYS.fi.bank_ledger.transfers.process
const PERM_VOID = KEYS.fi.bank_ledger.transfers.void

const createSchema = z.object({
  fromBankAccountId: z.string().uuid(),
  toBankAccountId: z.string().uuid(),
  transferDate: z.coerce.date(),
  valueDate: z.coerce.date().optional(),
  amount: z.number().positive(),
  currency: z.string().length(3),
  exchangeRate: z.number().positive().optional(),
  toAmount: z.number().positive().optional(),
  toCurrency: z.string().length(3).optional(),
  description: z.string().optional(),
  reference: z.string().optional(),
})

const listFilterSchema = z.object({
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PROCESSED', 'VOID']).optional(),
  fromBankAccountId: z.string().uuid().optional(),
  toBankAccountId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(25),
}).optional()

const generateTransferNumber = async (ctx: FiContext) => {
  const cfg = await db.gLConfiguration.findFirst({
    where: { agencyId: ctx.agencyId },
    orderBy: { updatedAt: 'desc' },
    select: { documentNumberResetRule: true },
  })
  const scope = ctx.subAccountId
    ? { kind: 'subaccount' as const, subAccountId: ctx.subAccountId }
    : { kind: 'agency' as const, agencyId: ctx.agencyId }
  const { docNumber } = await reserveDocumentNumber(scope, {
    rangeKey: 'bank.transfer',
    format: 'TRF-{YYYY}-{######}',
    prefixFallback: 'TRF',
    reset: (cfg?.documentNumberResetRule as any) ?? 'YEARLY',
    date: new Date(),
  })
  return docNumber
}

export const listBankTransfers = async (
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
    if (f?.fromBankAccountId) where.fromBankAccountId = f.fromBankAccountId
    if (f?.toBankAccountId) where.toBankAccountId = f.toBankAccountId
    if (f?.search) {
      where.OR = [
        { transferNumber: { contains: f.search, mode: 'insensitive' } },
        { reference: { contains: f.search, mode: 'insensitive' } },
        { description: { contains: f.search, mode: 'insensitive' } },
      ]
    }

    const rows = await db.bankTransfer.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      take: f?.pageSize ?? 25,
      skip: ((f?.page ?? 1) - 1) * (f?.pageSize ?? 25),
      include: {
        FromBankAccount: { select: { id: true, accountNumber: true, name: true } },
        ToBankAccount: { select: { id: true, accountNumber: true, name: true } },
      },
    })
    return { success: true, data: rows }
  } catch (e) {
    console.error('listBankTransfers error', e)
    return { success: false, error: 'Failed to list bank transfers' }
  }
}

export const getBankTransfer = async (id: string): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_READ)
    if (!ok) return { success: false, error: 'Missing permission' }

    const row = await db.bankTransfer.findUnique({
      where: { id },
      include: {
        FromBankAccount: { select: { id: true, accountNumber: true, name: true } },
        ToBankAccount: { select: { id: true, accountNumber: true, name: true } },
      },
    })
    if (!row) return { success: false, error: 'Bank transfer not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }
    return { success: true, data: row }
  } catch (e) {
    console.error('getBankTransfer error', e)
    return { success: false, error: 'Failed to fetch bank transfer' }
  }
}

export const createBankTransfer = async (
  input: z.infer<typeof createSchema>
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_CREATE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const data = createSchema.parse(input)
    if (data.fromBankAccountId === data.toBankAccountId) {
      return { success: false, error: 'Source and destination accounts must be different' }
    }

    const transferNumber = await generateTransferNumber(ctx)

    const row = await db.bankTransfer.create({
      data: {
        ...data,
        transferNumber,
        agencyId: ctx.agencyId,
        subAccountId: ctx.subAccountId ?? null,
        status: 'DRAFT',
        createdBy: ctx.userId,
      } as any,
    })

    revalidatePath('/fi/bank')
    return { success: true, data: row }
  } catch (e: any) {
    console.error('createBankTransfer error', e)
    return { success: false, error: e?.message ?? 'Failed to create bank transfer' }
  }
}

const idSchema = z.object({ id: z.string().uuid() })

export const submitBankTransfer = async (input: z.infer<typeof idSchema>): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_SUBMIT)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id } = idSchema.parse(input)
    const row = await db.bankTransfer.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Bank transfer not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }
    if (row.status !== 'DRAFT') return { success: false, error: 'Cannot submit from current status' }

    const updated = await db.bankTransfer.update({
      where: { id },
      data: { status: 'PENDING_APPROVAL', submittedAt: new Date(), submittedBy: ctx.userId, updatedBy: ctx.userId },
    })
    revalidatePath('/fi/bank')
    return { success: true, data: updated }
  } catch (e) {
    console.error('submitBankTransfer error', e)
    return { success: false, error: 'Failed to submit bank transfer' }
  }
}

export const approveBankTransfer = async (input: z.infer<typeof idSchema>): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_APPROVE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id } = idSchema.parse(input)
    const row = await db.bankTransfer.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Bank transfer not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }
    if (row.status !== 'PENDING_APPROVAL') return { success: false, error: 'Not pending approval' }

    const updated = await db.bankTransfer.update({
      where: { id },
      data: { status: 'APPROVED', approvedAt: new Date(), approvedBy: ctx.userId, updatedBy: ctx.userId },
    })
    revalidatePath('/fi/bank')
    return { success: true, data: updated }
  } catch (e) {
    console.error('approveBankTransfer error', e)
    return { success: false, error: 'Failed to approve bank transfer' }
  }
}

export const processBankTransfer = async (input: z.infer<typeof idSchema>): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_PROCESS)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id } = idSchema.parse(input)
    const row = await db.bankTransfer.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Bank transfer not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }
    if (row.status !== 'APPROVED') return { success: false, error: 'Must be approved before processing' }

    // TODO: Create journal entry for the transfer
    // TODO: Update bank account balances

    const updated = await db.bankTransfer.update({
      where: { id },
      data: { status: 'PROCESSED', processedAt: new Date(), processedBy: ctx.userId, updatedBy: ctx.userId },
    })
    revalidatePath('/fi/bank')
    return { success: true, data: updated }
  } catch (e) {
    console.error('processBankTransfer error', e)
    return { success: false, error: 'Failed to process bank transfer' }
  }
}

const voidSchema = z.object({ id: z.string().uuid(), reason: z.string().min(1).max(500) })

export const voidBankTransfer = async (input: z.infer<typeof voidSchema>): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_VOID)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id, reason } = voidSchema.parse(input)
    const row = await db.bankTransfer.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Bank transfer not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }
    if (['PROCESSED', 'VOID'].includes(row.status)) return { success: false, error: 'Cannot void in current status' }

    const updated = await db.bankTransfer.update({
      where: { id },
      data: { status: 'VOID', voidedAt: new Date(), voidedBy: ctx.userId, voidReason: reason, updatedBy: ctx.userId },
    })
    revalidatePath('/fi/bank')
    return { success: true, data: updated }
  } catch (e) {
    console.error('voidBankTransfer error', e)
    return { success: false, error: 'Failed to void bank transfer' }
  }
}
