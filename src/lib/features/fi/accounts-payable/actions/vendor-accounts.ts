
/**
 * FI-AP Vendor (Master Data) Server Actions
 *
 * Backed by Prisma `finance.Vendor`.
 */

'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { hasAgencyPermission, hasSubAccountPermission } from '@/lib/features/iam/authz/permissions'
import { KEYS } from '@/lib/registry/keys/permissions'
import {
  createVendorAccountSchema,
  updateVendorAccountSchema,
  type VendorAccountCreate,
  type VendorAccountUpdate,
} from '@/lib/schemas/fi/accounts-payable/vendor-account'
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

const ensureScope = (ctx: FiContext, row: { agencyId: string; subAccountId: string | null }) => {
  if (row.agencyId !== ctx.agencyId) return false
  if (ctx.subAccountId) return row.subAccountId === ctx.subAccountId
  return row.subAccountId === null
}

const listFilterSchema = z.object({
  q: z.string().min(1).max(120).optional(),
  isActive: z.boolean().optional(),
}).optional()

export const listVendorAccounts = async (
  filter?: z.infer<typeof listFilterSchema>
): Promise<ActionResult<any[]>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, KEYS.fi.master_data.vendors.view)
    if (!ok) return { success: false, error: 'Missing permission' }

    const parsed = listFilterSchema?.parse(filter ?? undefined)

    const where: any = ctx.subAccountId
      ? { agencyId: ctx.agencyId, subAccountId: ctx.subAccountId }
      : { agencyId: ctx.agencyId, subAccountId: null }

    if (parsed?.isActive !== undefined) where.isActive = parsed.isActive
    if (parsed?.q) {
      where.OR = [
        { code: { contains: parsed.q, mode: 'insensitive' } },
        { name: { contains: parsed.q, mode: 'insensitive' } },
        { legalName: { contains: parsed.q, mode: 'insensitive' } },
        { email: { contains: parsed.q, mode: 'insensitive' } },
      ]
    }

    const rows = await db.vendor.findMany({
      where,
      orderBy: [{ isActive: 'desc' }, { code: 'asc' }],
    })

    return { success: true, data: rows }
  } catch (e) {
    console.error('listVendorAccounts error', e)
    return { success: false, error: 'Failed to list vendors' }
  }
}

export const getVendorAccount = async (id: string): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, KEYS.fi.master_data.vendors.view)
    if (!ok) return { success: false, error: 'Missing permission' }

    const row = await db.vendor.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Vendor not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    return { success: true, data: row }
  } catch (e) {
    console.error('getVendorAccount error', e)
    return { success: false, error: 'Failed to fetch vendor' }
  }
}

export const createVendorAccount = async (input: VendorAccountCreate): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, KEYS.fi.master_data.vendors.manage)
    if (!ok) return { success: false, error: 'Missing permission' }

    const data = createVendorAccountSchema.parse(input)

    const row = await db.vendor.create({
      data: {
        ...data,
        agencyId: ctx.agencyId,
        subAccountId: ctx.subAccountId ?? null,
        createdBy: ctx.userId,
      } as any,
    })

    revalidatePath('/fi')
    return { success: true, data: row }
  } catch (e: any) {
    console.error('createVendorAccount error', e)
    const msg = typeof e?.message === 'string' ? e.message : 'Failed to create vendor'
    return { success: false, error: msg }
  }
}

export const updateVendorAccount = async (
  id: string,
  input: VendorAccountUpdate
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, KEYS.fi.master_data.vendors.manage)
    if (!ok) return { success: false, error: 'Missing permission' }

    const row = await db.vendor.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Vendor not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    const data = updateVendorAccountSchema.parse(input)

    const updated = await db.vendor.update({
      where: { id },
      data: {
        ...data,
        updatedBy: ctx.userId,
      } as any,
    })

    revalidatePath('/fi')
    return { success: true, data: updated }
  } catch (e: any) {
    console.error('updateVendorAccount error', e)
    const msg = typeof e?.message === 'string' ? e.message : 'Failed to update vendor'
    return { success: false, error: msg }
  }
}

export const setVendorPaymentHold = async (
  id: string,
  hold: boolean,
  reason?: string
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, KEYS.fi.master_data.vendors.manage)
    if (!ok) return { success: false, error: 'Missing permission' }

    const row = await db.vendor.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Vendor not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    const updated = await db.vendor.update({
      where: { id },
      data: {
        paymentHold: hold,
        paymentHoldReason: hold ? (reason ?? null) : null,
        updatedBy: ctx.userId,
      },
    })

    revalidatePath('/fi')
    return { success: true, data: updated }
  } catch (e) {
    console.error('setVendorPaymentHold error', e)
    return { success: false, error: 'Failed to update payment hold' }
  }
}

export const setVendorActive = async (id: string, isActive: boolean): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, KEYS.fi.master_data.vendors.manage)
    if (!ok) return { success: false, error: 'Missing permission' }

    const row = await db.vendor.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Vendor not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    const updated = await db.vendor.update({
      where: { id },
      data: { isActive, updatedBy: ctx.userId },
    })

    revalidatePath('/fi')
    return { success: true, data: updated }
  } catch (e) {
    console.error('setVendorActive error', e)
    return { success: false, error: 'Failed to update vendor status' }
  }
}
