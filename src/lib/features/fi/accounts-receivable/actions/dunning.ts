/**
 * FI-AR Dunning (Collections) Server Action
 *
 * Produces dunning candidates based on current AR open items.
 * This is a stateless generator: no persistence of letters/notices yet.
 */

'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { hasAgencyPermission, hasSubAccountPermission } from '@/lib/features/iam/authz/permissions'
import { KEYS } from '@/lib/registry/keys/permissions'
import { dunningPolicySchema, type DunningPolicy } from '@/lib/schemas/fi/accounts-receivable/dunning'
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

const inputSchema = z.object({
  policy: dunningPolicySchema,
  asOfDate: z.coerce.date().optional(),
  customerId: z.string().uuid().optional(),
})

export type DunningCandidate = {
  customerId: string
  customerCode?: string | null
  customerName?: string | null
  level: number
  daysPastDue: number
  totalPastDue: number
  openItemIds: string[]
}

export type DunningCandidatesResult = {
  asOfDate: Date
  policyName: string
  candidates: DunningCandidate[]
}

const calcDaysPastDue = (asOf: Date, due: Date) => {
  const ms = asOf.getTime() - due.getTime()
  return Math.floor(ms / 86_400_000)
}

const resolveLevel = (policy: DunningPolicy, daysPastDue: number) => {
  const sorted = [...policy.levels].sort((a, b) => a.daysPastDue - b.daysPastDue)
  let picked = sorted[0]
  for (const lv of sorted) {
    if (daysPastDue >= lv.daysPastDue) picked = lv
  }
  return picked.level
}

export const getDunningCandidates = async (
  input: z.infer<typeof inputSchema>
): Promise<ActionResult<DunningCandidatesResult>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(
      ctx,
      KEYS.fi.accounts_receivable.dunning.run
    )
    if (!ok) return { success: false, error: 'Missing permission' }

    const parsed = inputSchema.parse(input)
    const policy = parsed.policy
    const asOf = parsed.asOfDate ?? new Date()

    const where: any = {
      ...scopeWhere(ctx),
      partnerType: 'CUSTOMER',
      status: { in: ['OPEN', 'PARTIALLY_CLEARED'] },
      dueDate: { lte: asOf },
    }
    if (parsed.customerId) where.customerId = parsed.customerId

    const items = await db.openItem.findMany({
      where,
      include: { Customer: { select: { id: true, code: true, name: true } } },
      orderBy: [{ customerId: 'asc' }, { dueDate: 'asc' }, { createdAt: 'asc' }],
    })

    const grouped = new Map<
      string,
      {
        customerId: string
        code?: string | null
        name?: string | null
        maxDays: number
        total: number
        openItemIds: string[]
      }
    >()

    for (const it of items) {
      if (!it.customerId) continue
      const due = it.dueDate ?? it.documentDate ?? it.itemDate
      const days = calcDaysPastDue(asOf, due)
      if (days <= 0) continue

      const amount = Number((it as any).localRemainingAmount ?? 0)
      if (!Number.isFinite(amount) || Math.abs(amount) < 0.000001) continue
      if (amount <= 0) continue // only past-due receivables

      if (!grouped.has(it.customerId)) {
        grouped.set(it.customerId, {
          customerId: it.customerId,
          code: it.Customer?.code ?? null,
          name: it.Customer?.name ?? null,
          maxDays: days,
          total: amount,
          openItemIds: [it.id],
        })
      } else {
        const g = grouped.get(it.customerId)!
        g.maxDays = Math.max(g.maxDays, days)
        g.total += amount
        g.openItemIds.push(it.id)
      }
    }

    const candidates: DunningCandidate[] = Array.from(grouped.values())
      .map((g) => ({
        customerId: g.customerId,
        customerCode: g.code ?? null,
        customerName: g.name ?? null,
        daysPastDue: g.maxDays,
        level: resolveLevel(policy, g.maxDays),
        totalPastDue: g.total,
        openItemIds: g.openItemIds,
      }))
      .sort((a, b) => (b.totalPastDue ?? 0) - (a.totalPastDue ?? 0))

    return {
      success: true,
      data: { asOfDate: asOf, policyName: policy.name, candidates },
    }
  } catch (e) {
    console.error('getDunningCandidates error', e)
    return { success: false, error: 'Failed to generate dunning candidates' }
  }
}
