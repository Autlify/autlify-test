/**
 * FI-AP Aging Report Server Action
 *
 * Computes AP aging buckets from `finance.OpenItem`.
 */

'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { hasAgencyPermission, hasSubAccountPermission } from '@/lib/features/iam/authz/permissions'
import { KEYS } from '@/lib/registry/keys/permissions'
import { apAgingFilterSchema, type ApAgingFilter } from '@/lib/schemas/fi/accounts-payable/ap-aging'

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

export type ApAgingRow = {
  vendorId: string
  vendorCode?: string | null
  vendorName?: string | null
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

export type ApAgingResult = {
  asOfDate: Date
  buckets: Bucket[]
  rows: ApAgingRow[]
  totals: Record<string, number>
  grandTotal: number
}

export const getApAging = async (filter?: ApAgingFilter): Promise<ActionResult<ApAgingResult>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(
      ctx,
      KEYS.fi.accounts_payable.aging.view
    )
    if (!ok) return { success: false, error: 'Missing permission' }

    const f = apAgingFilterSchema.parse(filter ?? {})
    const asOf = f.asOfDate ?? new Date()
    const buckets = (f.buckets?.length ? f.buckets : defaultBuckets) as Bucket[]

    const where: any = {
      ...scopeWhere(ctx),
      partnerType: 'VENDOR',
      status: { in: ['OPEN', 'PARTIALLY_CLEARED'] },
    }
    if (f.vendorId) where.vendorId = f.vendorId

    const items = await db.openItem.findMany({
      where,
      include: { Vendor: { select: { id: true, code: true, name: true } } },
      orderBy: [{ dueDate: 'asc' }, { documentDate: 'asc' }, { createdAt: 'asc' }],
    })

    const byVendor = new Map<string, ApAgingRow>()

    for (const it of items) {
      if (!it.vendorId) continue

      const due = it.dueDate ?? it.documentDate ?? it.itemDate
      const days = calcDaysPastDue(asOf, due)

      // AP convention: payable invoices usually carry a credit balance.
      // Convert to a positive outstanding payable amount.
      const raw = Number((it as any).localRemainingAmount ?? 0)
      const amount = -raw
      if (!Number.isFinite(amount) || Math.abs(amount) < 0.000001) continue

      const bucket = pickBucket(days, buckets)

      if (!byVendor.has(it.vendorId)) {
        byVendor.set(it.vendorId, {
          vendorId: it.vendorId,
          vendorCode: it.Vendor?.code ?? null,
          vendorName: it.Vendor?.name ?? null,
          totals: Object.fromEntries(buckets.map((b) => [b.label, 0])),
          grandTotal: 0,
          items: [],
        })
      }

      const row = byVendor.get(it.vendorId)!
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

    const rows = Array.from(byVendor.values())
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
    console.error('getApAging error', e)
    return { success: false, error: 'Failed to generate AP aging' }
  }
}
