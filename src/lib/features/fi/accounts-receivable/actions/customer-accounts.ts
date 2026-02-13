
/**
 * FI-AR Customer (Master Data) Server Actions
 *
 * Backed by Prisma `finance.Customer`.
 */

'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { hasAgencyPermission, hasSubAccountPermission } from '@/lib/features/iam/authz/permissions'
import { KEYS } from '@/lib/registry/keys/permissions'
import {
  CustomerAccountCreateSchema,
  CustomerAccountUpdateSchema,
  getCustomersFilterSchema,
  type CustomerAccountCreate,
  type CustomerAccountUpdate,
  type GetCustomersFilter,
} from '@/lib/schemas/fi/accounts-receivable/customer-account'

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

const scopeWhere = (ctx: FiContext) =>
  ctx.subAccountId
    ? { agencyId: ctx.agencyId, subAccountId: ctx.subAccountId }
    : { agencyId: ctx.agencyId, subAccountId: null }

export const listCustomerAccounts = async (
  filter?: GetCustomersFilter
): Promise<ActionResult<any[]>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, KEYS.fi.master_data.customers.view)
    if (!ok) return { success: false, error: 'Missing permission' }

    const f = getCustomersFilterSchema.parse(filter ?? {})
    const s = f.sortBy ? f.sortBy.trim() : ''

    const where: any = { ...scopeWhere(ctx) }
    if (f.isActive !== undefined) where.isActive = f.isActive
    if (f.sortBy) {
      where.OR = [
        { code: { contains: s, mode: 'insensitive' } },
        { name: { contains: s, mode: 'insensitive' } },
        { legalName: { contains: s, mode: 'insensitive' } },
        { email: { contains: s, mode: 'insensitive' } },
      ]
    }
    
    const rows = await db.customer.findMany({
      where,
      orderBy: [{ isActive: 'desc' }, { code: 'asc' }],
      take: f.pageSize ?? 25,
      skip: ((f.page ?? 1) - 1) * (f.pageSize ?? 25),
    })

    return { success: true, data: rows }
  } catch (e) {
    console.error('listCustomerAccounts error', e)
    return { success: false, error: 'Failed to list customers' }
  }
}

export const getCustomerAccount = async (id: string): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, KEYS.fi.master_data.customers.view)
    if (!ok) return { success: false, error: 'Missing permission' }

    const row = await db.customer.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Customer not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    return { success: true, data: row }
  } catch (e) {
    console.error('getCustomerAccount error', e)
    return { success: false, error: 'Failed to fetch customer' }
  }
}

export const createCustomerAccount = async (
  input: CustomerAccountCreate
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, KEYS.fi.master_data.customers.manage)
    if (!ok) return { success: false, error: 'Missing permission' }

    const data = CustomerAccountCreateSchema.parse(input)

    const row = await db.customer.create({
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
    console.error('createCustomerAccount error', e)
    const msg = typeof e?.message === 'string' ? e.message : 'Failed to create customer'
    return { success: false, error: msg }
  }
}

export const updateCustomerAccount = async (
  id: string,
  input: CustomerAccountUpdate
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, KEYS.fi.master_data.customers.manage)
    if (!ok) return { success: false, error: 'Missing permission' }

    const row = await db.customer.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Customer not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    const data = CustomerAccountUpdateSchema.parse(input)

    const updated = await db.customer.update({
      where: { id },
      data: {
        ...data,
        updatedBy: ctx.userId,
      } as any,
    })

    revalidatePath('/fi')
    return { success: true, data: updated }
  } catch (e: any) {
    console.error('updateCustomerAccount error', e)
    const msg = typeof e?.message === 'string' ? e.message : 'Failed to update customer'
    return { success: false, error: msg }
  }
}

export const setCustomerActive = async (
  id: string,
  isActive: boolean
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, KEYS.fi.master_data.customers.manage)
    if (!ok) return { success: false, error: 'Missing permission' }

    const row = await db.customer.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Customer not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    const updated = await db.customer.update({
      where: { id },
      data: { isActive, updatedBy: ctx.userId },
    })

    revalidatePath('/fi')
    return { success: true, data: updated }
  } catch (e) {
    console.error('setCustomerActive error', e)
    return { success: false, error: 'Failed to update customer status' }
  }
}
