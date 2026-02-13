
/**
 * FI-AP Payments Server Actions
 *
 * Backed by Prisma `finance.ApPayment` + `finance.ApPaymentAllocation`.
 */

'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { hasAgencyPermission, hasSubAccountPermission } from '@/lib/features/iam/authz/permissions'
import { KEYS } from '@/lib/registry/keys/permissions'
import {
  apPaymentCreateSchema,
  apPaymentUpdateSchema,
  submitApPaymentSchema,
  approveApPaymentSchema,
  rejectApPaymentSchema,
  scheduleApPaymentSchema,
  processApPaymentSchema,
  voidApPaymentSchema,
  getApPaymentsFilterSchema,
  type ApPaymentCreate,
  type ApPaymentUpdate,
  type SubmitApPaymentInput,
  type ApproveApPaymentInput,
  type RejectApPaymentInput,
  type ScheduleApPaymentInput,
  type ProcessApPaymentInput,
  type VoidApPaymentInput,
  type GetApPaymentsFilter,
} from '@/lib/schemas/fi/accounts-payable/ap-payment'
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

// Minimal permission key (not yet modeled in registry as a full AP payments capability)
const PERM_READ = KEYS.fi.accounts_payable.payments.read
const PERM_CREATE = KEYS.fi.accounts_payable.payments.create
const PERM_UPDATE = KEYS.fi.accounts_payable.payments.update
const PERM_SUBMIT = KEYS.fi.accounts_payable.payments.submit
const PERM_APPROVE = KEYS.fi.accounts_payable.payments.approve
const PERM_PROCESS = KEYS.fi.accounts_payable.payments.process
const PERM_VOID = KEYS.fi.accounts_payable.payments.void
const generatePaymentNumber = async (ctx: FiContext) => {
  const cfg = await db.gLConfiguration.findFirst({
    where: {
      agencyId: ctx.agencyId,
    },
    orderBy: { updatedAt: 'desc' },
    select: { paymentFormat: true, documentNumberResetRule: true },
  })

  const scope = ctx.subAccountId
    ? { kind: 'subaccount' as const, subAccountId: ctx.subAccountId }
    : { kind: 'agency' as const, agencyId: ctx.agencyId }

  const { docNumber } = await reserveDocumentNumber(scope, {
    rangeKey: 'ap.payment',
    format: cfg?.paymentFormat ?? null,
    prefixFallback: 'PAY',
    reset: (cfg?.documentNumberResetRule as any) ?? 'YEARLY',
    date: new Date(),
  })

  return docNumber
}

export const listApPayments = async (
  filter?: GetApPaymentsFilter
): Promise<ActionResult<any[]>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_READ)
    if (!ok) return { success: false, error: 'Missing permission' }

    const f = getApPaymentsFilterSchema.parse(filter ?? {})

    const where: any = { ...scopeWhere(ctx) }
    if (f.vendorId) where.vendorId = f.vendorId
    if (f.status) where.status = f.status
    if (f.paymentDateFrom || f.paymentDateTo) {
      where.paymentDate = {
        ...(f.paymentDateFrom ? { gte: f.paymentDateFrom } : {}),
        ...(f.paymentDateTo ? { lte: f.paymentDateTo } : {}),
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

    const rows = await db.apPayment.findMany({
      where,
      include: { Vendor: true, PaymentAllocations: true },
      orderBy: [{ paymentDate: 'desc' }, { createdAt: 'desc' }],
      take,
      skip,
    })

    return { success: true, data: rows }
  } catch (e) {
    console.error('listApPayments error', e)
    return { success: false, error: 'Failed to list AP payments' }
  }
}

export const getApPayment = async (id: string): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_READ)
    if (!ok) return { success: false, error: 'Missing permission' }

    const row = await db.apPayment.findUnique({
      where: { id },
      include: { Vendor: true, PaymentAllocations: true },
    })
    if (!row) return { success: false, error: 'Payment not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    return { success: true, data: row }
  } catch (e) {
    console.error('getApPayment error', e)
    return { success: false, error: 'Failed to fetch payment' }
  }
}

export const createApPayment = async (input: ApPaymentCreate): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_CREATE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const data = apPaymentCreateSchema.parse(input)
    const paymentNumber = await generatePaymentNumber(ctx)

    const row = await db.apPayment.create({
      data: {
        ...data,
        agencyId: ctx.agencyId,
        subAccountId: ctx.subAccountId ?? null,
        createdBy: ctx.userId,
        paymentNumber,
        PaymentAllocations: data.allocations?.length
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
      include: { Vendor: true, PaymentAllocations: true },
    })

    revalidatePath('/fi')
    return { success: true, data: row }
  } catch (e: any) {
    console.error('createApPayment error', e)
    const msg = typeof e?.message === 'string' ? e.message : 'Failed to create payment'
    return { success: false, error: msg }
  }
}

export const updateApPayment = async (
  id: string,
  input: ApPaymentUpdate
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, PERM_UPDATE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const existing = await db.apPayment.findUnique({ where: { id } })
    if (!existing) return { success: false, error: 'Payment not found' }
    if (!ensureScope(ctx, existing)) return { success: false, error: 'Not allowed' }

    const data = apPaymentUpdateSchema.parse(input)

    const row = await db.$transaction(async (tx) => {
      await tx.apPayment.update({
        where: { id },
        data: {
          ...data,
          updatedBy: ctx.userId,
        } as any,
      })

      await tx.apPaymentAllocation.deleteMany({ where: { paymentId: id } })
      if (data.allocations?.length) {
        await tx.apPaymentAllocation.createMany({
          data: data.allocations.map((a) => ({
            paymentId: id,
            openItemId: a.openItemId ?? null,
            invoiceNumber: a.invoiceNumber ?? null,
            allocatedAmount: a.allocatedAmount,
            allocatedAmountBase: a.allocatedAmountBase ?? null,
            exchangeDifference: a.exchangeDifference ?? null,
          })),
        })
      }

      return tx.apPayment.findUnique({
        where: { id },
        include: { Vendor: true, PaymentAllocations: true },
      })
    })

    revalidatePath('/fi')
    return { success: true, data: row }
  } catch (e: any) {
    console.error('updateApPayment error', e)
    const msg = typeof e?.message === 'string' ? e.message : 'Failed to update payment'
    return { success: false, error: msg }
  }
}

export const submitApPayment = async (input: SubmitApPaymentInput): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_SUBMIT)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id } = submitApPaymentSchema.parse(input)
    const existing = await db.apPayment.findUnique({ where: { id } })
    if (!existing) return { success: false, error: 'Payment not found' }
    if (!ensureScope(ctx, existing)) return { success: false, error: 'Not allowed' }

    const row = await db.apPayment.update({
      where: { id },
      data: {
        status: 'PENDING_APPROVAL',
        submittedAt: new Date(),
        submittedBy: ctx.userId,
        updatedBy: ctx.userId,
      },
      include: { Vendor: true, PaymentAllocations: true },
    })

    revalidatePath('/fi')
    return { success: true, data: row }
  } catch (e) {
    console.error('submitApPayment error', e)
    return { success: false, error: 'Failed to submit payment' }
  }
}

export const approveApPayment = async (input: ApproveApPaymentInput): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_APPROVE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id, notes } = approveApPaymentSchema.parse(input)
    const existing = await db.apPayment.findUnique({ where: { id } })
    if (!existing) return { success: false, error: 'Payment not found' }
    if (!ensureScope(ctx, existing)) return { success: false, error: 'Not allowed' }

    const row = await db.apPayment.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: ctx.userId,
        notes: notes ?? existing.notes ?? null,
        updatedBy: ctx.userId,
      },
      include: { Vendor: true, PaymentAllocations: true },
    })

    revalidatePath('/fi')
    return { success: true, data: row }
  } catch (e) {
    console.error('approveApPayment error', e)
    return { success: false, error: 'Failed to approve payment' }
  }
}

export const rejectApPayment = async (input: RejectApPaymentInput): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_APPROVE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id, reason } = rejectApPaymentSchema.parse(input)
    const existing = await db.apPayment.findUnique({ where: { id } })
    if (!existing) return { success: false, error: 'Payment not found' }
    if (!ensureScope(ctx, existing)) return { success: false, error: 'Not allowed' }

    const row = await db.apPayment.update({
      where: { id },
      data: {
        status: 'FAILED',
        rejectedAt: new Date(),
        rejectedBy: ctx.userId,
        rejectionReason: reason,
        updatedBy: ctx.userId,
      },
      include: { Vendor: true, PaymentAllocations: true },
    })

    revalidatePath('/fi')
    return { success: true, data: row }
  } catch (e) {
    console.error('rejectApPayment error', e)
    return { success: false, error: 'Failed to reject payment' }
  }
}

export const scheduleApPayment = async (
  input: ScheduleApPaymentInput
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_UPDATE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id, scheduledDate, notes } = scheduleApPaymentSchema.parse(input)
    const existing = await db.apPayment.findUnique({ where: { id } })
    if (!existing) return { success: false, error: 'Payment not found' }
    if (!ensureScope(ctx, existing)) return { success: false, error: 'Not allowed' }

    const row = await db.apPayment.update({
      where: { id },
      data: {
        status: 'SCHEDULED',
        paymentDate: scheduledDate,
        notes: notes ?? existing.notes ?? null,
        updatedBy: ctx.userId,
      },
      include: { Vendor: true, PaymentAllocations: true },
    })

    revalidatePath('/fi')
    return { success: true, data: row }
  } catch (e) {
    console.error('scheduleApPayment error', e)
    return { success: false, error: 'Failed to schedule payment' }
  }
}

export const processApPayment = async (
  input: ProcessApPaymentInput
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_PROCESS)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id, bankReference, notes } = processApPaymentSchema.parse(input)
    const existing = await db.apPayment.findUnique({ where: { id } })
    if (!existing) return { success: false, error: 'Payment not found' }
    if (!ensureScope(ctx, existing)) return { success: false, error: 'Not allowed' }

    const row = await db.apPayment.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        processedAt: new Date(),
        processedBy: ctx.userId,
        bankReference: bankReference ?? existing.bankReference ?? null,
        notes: notes ?? existing.notes ?? null,
        updatedBy: ctx.userId,
      },
      include: { Vendor: true, PaymentAllocations: true },
    })

    revalidatePath('/fi')
    return { success: true, data: row }
  } catch (e) {
    console.error('processApPayment error', e)
    return { success: false, error: 'Failed to process payment' }
  }
}

export const voidApPayment = async (input: VoidApPaymentInput): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_VOID)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id, reason } = voidApPaymentSchema.parse(input)
    const existing = await db.apPayment.findUnique({ where: { id } })
    if (!existing) return { success: false, error: 'Payment not found' }
    if (!ensureScope(ctx, existing)) return { success: false, error: 'Not allowed' }

    const row = await db.apPayment.update({
      where: { id },
      data: {
        status: 'VOID',
        voidedAt: new Date(),
        voidedBy: ctx.userId,
        voidReason: reason,
        updatedBy: ctx.userId,
      },
      include: { Vendor: true, PaymentAllocations: true },
    })

    revalidatePath('/fi')
    return { success: true, data: row }
  } catch (e) {
    console.error('voidApPayment error', e)
    return { success: false, error: 'Failed to void payment' }
  }
}
