/**
 * FX Revaluation Server Actions
 *
 * Foreign currency revaluation for GL accounts and open items.
 */

'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { hasAgencyPermission, hasSubAccountPermission } from '@/lib/features/iam/authz/permissions'
import { KEYS } from '@/lib/registry/keys/permissions'
import { reserveDocumentNumber } from '@/lib/features/fi/general-ledger/utils/number-ranges'
import { z } from 'zod'
import Decimal from 'decimal.js'

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

const PERM_VIEW = KEYS.fi.general_ledger.fx_revaluation.view
const PERM_RUN = KEYS.fi.general_ledger.fx_revaluation.run
const PERM_REVERSE = KEYS.fi.general_ledger.fx_revaluation.reverse

const runSchema = z.object({
  revaluationDate: z.coerce.date(),
  postingDate: z.coerce.date().optional(),
  baseCurrency: z.string().length(3),
  accountFilter: z.array(z.string().uuid()).optional(),
  includeAP: z.boolean().default(true),
  includeAR: z.boolean().default(true),
  includeGL: z.boolean().default(true),
  description: z.string().optional(),
})

const listFilterSchema = z.object({
  status: z.enum(['DRAFT', 'POSTED', 'REVERSED']).optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(25),
}).optional()

const generateRunNumber = async (ctx: FiContext) => {
  const cfg = await db.gLConfiguration.findFirst({
    where: { agencyId: ctx.agencyId },
    orderBy: { updatedAt: 'desc' },
    select: { documentNumberResetRule: true },
  })
  const scope = ctx.subAccountId
    ? { kind: 'subaccount' as const, subAccountId: ctx.subAccountId }
    : { kind: 'agency' as const, agencyId: ctx.agencyId }
  const { docNumber } = await reserveDocumentNumber(scope, {
    rangeKey: 'gl.fx_revaluation',
    format: 'FXR-{YYYY}-{######}',
    prefixFallback: 'FXR',
    reset: (cfg?.documentNumberResetRule as any) ?? 'YEARLY',
    date: new Date(),
  })
  return docNumber
}

export const listFXRevaluations = async (
  filter?: z.infer<typeof listFilterSchema>
): Promise<ActionResult<any[]>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_VIEW)
    if (!ok) return { success: false, error: 'Missing permission' }

    const f = listFilterSchema.parse(filter ?? {})
    const where: any = { ...scopeWhere(ctx) }
    if (f?.status) where.status = f.status
    if (f?.fromDate || f?.toDate) {
      where.revaluationDate = {}
      if (f.fromDate) where.revaluationDate.gte = f.fromDate
      if (f.toDate) where.revaluationDate.lte = f.toDate
    }
    if (f?.search) {
      where.OR = [
        { runNumber: { contains: f.search, mode: 'insensitive' } },
        { description: { contains: f.search, mode: 'insensitive' } },
      ]
    }

    const rows = await db.fXRevaluation.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      take: f?.pageSize ?? 25,
      skip: ((f?.page ?? 1) - 1) * (f?.pageSize ?? 25),
    })
    return { success: true, data: rows }
  } catch (e) {
    console.error('listFXRevaluations error', e)
    return { success: false, error: 'Failed to list FX revaluations' }
  }
}

export const getFXRevaluation = async (id: string): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_VIEW)
    if (!ok) return { success: false, error: 'Missing permission' }

    const row = await db.fXRevaluation.findUnique({
      where: { id },
      include: {
        items: true,
        
      },
    })
    if (!row) return { success: false, error: 'FX revaluation not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }
    return { success: true, data: row }
  } catch (e) {
    console.error('getFXRevaluation error', e)
    return { success: false, error: 'Failed to fetch FX revaluation' }
  }
}

export const runFXRevaluation = async (
  input: z.infer<typeof runSchema>
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_RUN)
    if (!ok) return { success: false, error: 'Missing permission' }

    const data = runSchema.parse(input)
    const runNumber = await generateRunNumber(ctx)

    // Get exchange rates for the revaluation date
    const rates = await db.exchangeRate.findMany({
      where: {
        agencyId: ctx.agencyId,
        effectiveDate: { lte: data.revaluationDate },
        fromCurrencyCode: data.baseCurrency,
      },
      orderBy: { effectiveDate: 'desc' },
      distinct: ['toCurrencyCode'],
    })

    const rateMap = new Map<string, number>()
    for (const rate of rates) {
      rateMap.set(rate.toCurrencyCode, rate.rate?.toNumber() ?? 1)
    }

    // Collect items to revalue
    const revalItems: Array<{
      entityType: string
      entityId: string
      originalCurrency: string
      originalAmount: number
      previousRate: number
      currentRate: number
      previousLocal: number
      currentLocal: number
      difference: number
    }> = []

    // Revalue AP open items
    if (data.includeAP) {
      const apInvoices = await db.aPInvoice.findMany({
        where: {
          ...scopeWhere(ctx),
          status: { in: ['POSTED', 'PARTIALLY_PAID'] },
          currency: { not: data.baseCurrency },
        },
      })
      for (const inv of apInvoices) {
        if (!inv.currency || !inv.totalAmount) continue
        const currentRate = rateMap.get(inv.currency) ?? 1
        const previousRate = inv.exchangeRate?.toNumber() ?? 1
        const amount = new Decimal(inv.totalAmount).sub(inv.paidAmount ?? 0).toNumber()
        const previousLocal = amount * previousRate
        const currentLocal = amount * currentRate
        const diff = currentLocal - previousLocal
        if (Math.abs(diff) > 0.01) {
          revalItems.push({
            entityType: 'AP_INVOICE',
            entityId: inv.id,
            originalCurrency: inv.currency,
            originalAmount: amount,
            previousRate,
            currentRate,
            previousLocal,
            currentLocal,
            difference: diff,
          })
        }
      }
    }

    // Revalue AR open items
    if (data.includeAR) {
      const arInvoices = await db.aRInvoice.findMany({
        where: {
          ...scopeWhere(ctx),
          status: { in: ['POSTED', 'PARTIALLY_PAID'] },
          currency: { not: data.baseCurrency },
        },
      })
      for (const inv of arInvoices) {
        if (!inv.currency || !inv.totalAmount) continue
        const currentRate = rateMap.get(inv.currency) ?? 1
        const previousRate = inv.exchangeRate?.toNumber() ?? 1
        const amount = new Decimal(inv.totalAmount).sub(inv.paidAmount ?? 0).toNumber()
        const previousLocal = amount * previousRate
        const currentLocal = amount * currentRate
        const diff = currentLocal - previousLocal
        if (Math.abs(diff) > 0.01) {
          revalItems.push({
            entityType: 'AR_INVOICE',
            entityId: inv.id,
            originalCurrency: inv.currency,
            originalAmount: amount,
            previousRate,
            currentRate,
            previousLocal,
            currentLocal,
            difference: diff,
          })
        }
      }
    }

    // Calculate totals
    const totalGain = revalItems.filter(i => i.difference > 0).reduce((s, i) => s + i.difference, 0)
    const totalLoss = revalItems.filter(i => i.difference < 0).reduce((s, i) => s + Math.abs(i.difference), 0)
    const netAdjustment = totalGain - totalLoss

    // Create revaluation record
    const row = await db.fXRevaluation.create({
      data: {
        runNumber,
        revaluationDate: data.revaluationDate,
        postingDate: data.postingDate ?? data.revaluationDate,
        baseCurrency: data.baseCurrency,
        description: data.description ?? `FX Revaluation as of ${data.revaluationDate.toISOString().slice(0, 10)}`,
        status: 'DRAFT',
        totalGain,
        totalLoss,
        netAdjustment,
        itemCount: revalItems.length,
        agencyId: ctx.agencyId,
        subAccountId: ctx.subAccountId ?? null,
        createdBy: ctx.userId,
        items: {
          create: revalItems.map(item => ({
            entityType: item.entityType,
            entityId: item.entityId,
            originalCurrency: item.originalCurrency,
            originalAmount: item.originalAmount,
            previousRate: item.previousRate,
            currentRate: item.currentRate,
            previousLocalAmount: item.previousLocal,
            currentLocalAmount: item.currentLocal,
            adjustmentAmount: item.difference,
          })),
        },
      } as any,
      include: { items: true },
    })

    revalidatePath('/fi/gl')
    return { success: true, data: row }
  } catch (e: any) {
    console.error('runFXRevaluation error', e)
    return { success: false, error: e?.message ?? 'Failed to run FX revaluation' }
  }
}

const idSchema = z.object({ id: z.string().uuid() })

export const postFXRevaluation = async (input: z.infer<typeof idSchema>): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_RUN)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id } = idSchema.parse(input)
    const row = await db.fXRevaluation.findUnique({
      where: { id },
      include: { items: true },
    })
    if (!row) return { success: false, error: 'FX revaluation not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }
    if (row.status !== 'DRAFT') return { success: false, error: 'Already posted' }

    // TODO: Create journal entry for the FX gain/loss
    // Typically: DR FX Gain/Loss Expense, CR FX Gain/Loss Income

    const updated = await db.fXRevaluation.update({
      where: { id },
      data: { status: 'POSTED', postedAt: new Date(), postedBy: ctx.userId, updatedBy: ctx.userId },
    })
    revalidatePath('/fi/gl')
    return { success: true, data: updated }
  } catch (e) {
    console.error('postFXRevaluation error', e)
    return { success: false, error: 'Failed to post FX revaluation' }
  }
}

export const reverseFXRevaluation = async (input: z.infer<typeof idSchema>): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_REVERSE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id } = idSchema.parse(input)
    const row = await db.fXRevaluation.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'FX revaluation not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }
    if (row.status !== 'POSTED') return { success: false, error: 'Can only reverse posted revaluations' }

    // TODO: Create reversing journal entry

    const updated = await db.fXRevaluation.update({
      where: { id },
      data: { status: 'REVERSED', reversedAt: new Date(), reversedBy: ctx.userId, updatedBy: ctx.userId },
    })
    revalidatePath('/fi/gl')
    return { success: true, data: updated }
  } catch (e) {
    console.error('reverseFXRevaluation error', e)
    return { success: false, error: 'Failed to reverse FX revaluation' }
  }
}
