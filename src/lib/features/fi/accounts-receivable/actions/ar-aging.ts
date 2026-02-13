/**
 * FI-AR Aging Report Server Action
 *
 * Computes AR aging buckets from `finance.OpenItem`.
 */

'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { hasAgencyPermission, hasSubAccountPermission } from '@/lib/features/iam/authz/permissions'
import { KEYS } from '@/lib/registry/keys/permissions'
import { arAgingFilterSchema, type ArAgingFilter } from '@/lib/schemas/fi/accounts-receivable/ar-aging'

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

type Bucket = { label: string; fromDays: number; toDays?: number | null }

const defaultBuckets: Bucket[] = [
  { label: 'Current', fromDays: 0, toDays: 0 },
  { label: '1-30', fromDays: 1, toDays: 30 },
  { label: '31-60', fromDays: 31, toDays: 60 },
  { label: '61-90', fromDays: 61, toDays: 90 },
  { label: '91-120', fromDays: 91, toDays: 120 },
  { label: '120+', fromDays: 121, toDays: null },
]

const calcDaysPastDue = (asOf: Date, due: Date) => {
  const ms = asOf.getTime() - due.getTime()
  return Math.floor(ms / 86_400_000)
}

const pickBucket = (daysPastDue: number, buckets: Bucket[]): Bucket => {
  const d = Math.max(0, daysPastDue)
  return (
    buckets.find((b) => d >= b.fromDays && (b.toDays == null || d <= b.toDays)) ??
    buckets[buckets.length - 1]
  )
}

export type ArAgingRow = {
  customerId: string
  customerCode?: string | null
  customerName?: string | null
  totals: Record<string, number>
  grandTotal: number
  items: Array<{
    openItemId: string
    documentNumber?: string | null
    dueDate?: Date | null
    daysPastDue: number
    amount: number
  }>
}

export type ArAgingResult = {
  asOfDate: Date
  buckets: Bucket[]
  rows: ArAgingRow[]
  totals: Record<string, number>
  grandTotal: number
}

export const getArAging = async (filter?: ArAgingFilter): Promise<ActionResult<ArAgingResult>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, KEYS.fi.reporting.ar_ageing.view)
    if (!ok) return { success: false, error: 'Missing permission' }

    const f = arAgingFilterSchema.parse(filter ?? {})
    const asOf = f.asOfDate ?? new Date()
    const buckets = (f.buckets?.length ? f.buckets : defaultBuckets) as Bucket[]

    const where: any = {
      ...scopeWhere(ctx),
      partnerType: 'CUSTOMER',
      status: { in: ['OPEN', 'PARTIALLY_CLEARED'] },
    }
    if (f.customerId) where.customerId = f.customerId

    const items = await db.openItem.findMany({
      where,
      include: { Customer: { select: { id: true, code: true, name: true } } },
      orderBy: [{ dueDate: 'asc' }, { documentDate: 'asc' }, { createdAt: 'asc' }],
    })

    const byCustomer = new Map<string, ArAgingRow>()

    for (const it of items) {
      if (!it.customerId) continue

      const due = it.dueDate ?? it.documentDate ?? it.itemDate
      const days = calcDaysPastDue(asOf, due)

      // AR convention: positive remaining amount is outstanding receivable
      const amount = Number((it as any).localRemainingAmount ?? 0)
      if (!Number.isFinite(amount) || Math.abs(amount) < 0.000001) continue

      const bucket = pickBucket(days, buckets)

      if (!byCustomer.has(it.customerId)) {
        byCustomer.set(it.customerId, {
          customerId: it.customerId,
          customerCode: it.Customer?.code ?? null,
          customerName: it.Customer?.name ?? null,
          totals: Object.fromEntries(buckets.map((b) => [b.label, 0])),
          grandTotal: 0,
          items: [],
        })
      }

      const row = byCustomer.get(it.customerId)!
      row.totals[bucket.label] = (row.totals[bucket.label] ?? 0) + amount
      row.grandTotal += amount
      row.items.push({
        openItemId: it.id,
        documentNumber: it.documentNumber ?? it.sourceReference ?? null,
        dueDate: it.dueDate ?? null,
        daysPastDue: Math.max(0, days),
        amount,
      })
    }

    const totals: Record<string, number> = Object.fromEntries(buckets.map((b) => [b.label, 0]))
    let grandTotal = 0

    const rows = Array.from(byCustomer.values())
      .filter((r) => Math.abs(r.grandTotal) > 0.000001)
      .sort((a, b) => (b.grandTotal ?? 0) - (a.grandTotal ?? 0))

    for (const r of rows) {
      for (const b of buckets) totals[b.label] = (totals[b.label] ?? 0) + (r.totals[b.label] ?? 0)
      grandTotal += r.grandTotal
    }

    return {
      success: true,
      data: { asOfDate: asOf, buckets, rows, totals, grandTotal },
    }
  } catch (e) {
    console.error('getArAging error', e)
    return { success: false, error: 'Failed to generate AR aging' }
  }
}
