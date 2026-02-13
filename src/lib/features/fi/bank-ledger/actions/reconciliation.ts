/**
 * FI Bank Ledger - Statement Matching & Reconciliation (MVP)
 *
 * Links imported bank statement lines to book-side bank postings
 * (journal entry lines) and clears associated open items.
 *
 * Storage:
 * - Statements are settingsJson-backed (namespace: fi.bankLedger.statements).
 * - Matching rules are settingsJson-backed (namespace: fi.bankLedger.matchingRules).
 */

'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { hasAgencyPermission, hasSubAccountPermission } from '@/lib/features/iam/authz/permissions'
import {
  getNamespace,
  readSettingsJson,
  setNamespace,
  type TenantScope,
  writeSettingsJson,
} from '@/lib/features/fi/core/tenant-settings'
import { KEYS } from '@/lib/registry/keys/permissions'
import { bankMatchingRulesSchema, type BankMatchingRule } from '@/lib/schemas/fi/bank-ledger/matching-rule'
import { bankStatementSchema, type BankStatement } from '@/lib/schemas/fi/bank-ledger/bank-statement'
import { bankStatementLineSchema, type BankStatementLine } from '@/lib/schemas/fi/bank-ledger/bank-statement-line'

type ActionResult<T> = { success: true; data: T } | { success: false; error: string }

const STATEMENTS_NS = 'fi.bankLedger.statements'
const RULES_NS = 'fi.bankLedger.matchingRules'

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

const getScope = (ctx: FiContext): TenantScope =>
  ctx.subAccountId
    ? { kind: 'subaccount', subAccountId: ctx.subAccountId }
    : { kind: 'agency', agencyId: ctx.agencyId }

const checkPermission = async (ctx: FiContext, key: string) => {
  if (ctx.subAccountId) return hasSubAccountPermission(ctx.subAccountId, key as any)
  return hasAgencyPermission(ctx.agencyId, key as any)
}

type StoredStatement = {
  statement: unknown
  lines: unknown
  raw?: unknown
}

const getStatementStore = (ns: Record<string, unknown>) => {
  const statements = (ns.statements as Record<string, StoredStatement> | undefined) ?? {}
  return { statements }
}

const setStatementStore = (ns: Record<string, unknown>, store: { statements: Record<string, StoredStatement> }) => {
  return { ...ns, statements: store.statements }
}

const norm = (s?: string | null) => (s ?? '').toLowerCase()

const containsAny = (haystack: string, needles: string[]) => {
  const h = norm(haystack)
  return needles.some((n) => h.includes(norm(n)))
}

const ruleMatchesLine = (line: BankStatementLine, rule: BankMatchingRule) => {
  if (!rule.enabled) return false
  if (rule.criteria.currency && rule.criteria.currency !== line.currency) return false

  const desc = line.description ?? ''
  if (rule.criteria.descriptionContainsAny?.length) {
    if (!containsAny(desc, rule.criteria.descriptionContainsAny)) return false
  }
  if (rule.criteria.counterpartyContainsAny?.length) {
    // Line schema doesn't carry counterparty fields yet; best-effort against description.
    if (!containsAny(desc, rule.criteria.counterpartyContainsAny)) return false
  }
  return true
}

type BookTx = {
  journalEntryId: string
  journalEntryLineId: string
  entryNumber: string
  entryDate: Date
  description: string
  amount: number // debit - credit
}

export type StatementMatchSuggestion = {
  lineId: string
  line: BankStatementLine
  ruleMatches: Array<{
    ruleId: string
    ruleName: string
    label?: string
    suggestedGlAccountId?: string
    postingRuleTemplateId?: string
  }>
  bookMatches: Array<{
    journalEntryId: string
    journalEntryLineId: string
    entryNumber: string
    entryDate: Date
    description: string
    amount: number
    confidence: number
  }>
}

export const suggestStatementMatches = async (
  statementId: string,
  options?: { amountTolerance?: number; dateWindowDays?: number }
): Promise<ActionResult<{ statement: BankStatement; suggestions: StatementMatchSuggestion[] }>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, KEYS.fi.bank_ledger.reconciliation.view)
    if (!ok) return { success: false, error: 'Missing permission' }

    const scope = getScope(ctx)
    const settings = await readSettingsJson(scope)

    // Load statement
    const stNs = getNamespace(settings, STATEMENTS_NS)
    const store = getStatementStore(stNs)
    const found = store.statements[statementId]
    if (!found) return { success: false, error: 'Statement not found' }

    const statement = bankStatementSchema.parse((found as any).statement)
    const lines = (Array.isArray((found as any).lines) ? (found as any).lines : []).map((l: any) =>
      bankStatementLineSchema.parse(l)
    )

    // Load rules
    const rulesNs = getNamespace(settings, RULES_NS)
    const rulesRaw = (rulesNs.rules as unknown) ?? []
    const rules = bankMatchingRulesSchema
      .parse(rulesRaw)
      .slice()
      .sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100))

    // Pull book postings once for date range window
    const dateWindowDays = Math.max(0, options?.dateWindowDays ?? 3)
    const amountTolBase = Math.max(0, options?.amountTolerance ?? 0.01)

    const start = new Date(statement.periodStart)
    start.setDate(start.getDate() - dateWindowDays)
    const end = new Date(statement.periodEnd)
    end.setDate(end.getDate() + dateWindowDays)

    const bookLines = await db.journalEntryLine.findMany({
      where: {
        accountId: statement.bankAccountId,
        JournalEntry: {
          status: 'POSTED',
          entryDate: { gte: start, lte: end },
        },
      },
      include: {
        JournalEntry: { select: { id: true, entryNumber: true, entryDate: true, description: true } },
      },
      orderBy: { JournalEntry: { entryDate: 'desc' } },
      take: 2000,
    })

    const bookTxs: BookTx[] = bookLines.map((l) => {
      const debit = (l.debitAmount as any)?.toNumber?.() ?? Number(l.debitAmount)
      const credit = (l.creditAmount as any)?.toNumber?.() ?? Number(l.creditAmount)
      return {
        journalEntryId: l.journalEntryId,
        journalEntryLineId: l.id,
        entryNumber: l.JournalEntry?.entryNumber ?? '',
        entryDate: l.JournalEntry?.entryDate ?? new Date(),
        description: (l.description ?? l.JournalEntry?.description ?? '').toString(),
        amount: debit - credit,
      }
    })

    const suggestions: StatementMatchSuggestion[] = lines.map((line: BankStatementLine) => {
      const lineId = (line as BankStatementLine).id ?? ''
      const lineDate = new Date(line.entryDate)
      const lineAmount = Number(line.amount)

      const matchedRules = rules
        .filter((r) => ruleMatchesLine(line, r))
        .map((r) => ({
          ruleId: r.id,
          ruleName: r.name,
          label: r.action.label,
          suggestedGlAccountId: r.action.suggestedGlAccountId,
          postingRuleTemplateId: r.action.postingRuleTemplateId,
        }))

      const amountTol = amountTolBase
      const candidates = bookTxs
        .map((tx) => {
          const diff = Math.abs(tx.amount - lineAmount)
          const dayDiff = Math.abs((tx.entryDate.getTime() - lineDate.getTime()) / (1000 * 60 * 60 * 24))
          if (diff > amountTol) return null
          if (dayDiff > dateWindowDays) return null

          let score = 50
          if (diff < 1e-9) score += 40
          else score += 25

          if (dayDiff < 1e-9) score += 10
          else score += 5

          const ref = (line.reference ?? '').toString()
          if (ref && (tx.description.toLowerCase().includes(ref.toLowerCase()) || tx.entryNumber.toLowerCase().includes(ref.toLowerCase()))) {
            score += 5
          }

          score = Math.min(100, Math.max(0, score))
          return { ...tx, confidence: score }
        })
        .filter(Boolean)
        .sort((a, b) => (b as any).confidence - (a as any).confidence)
        .slice(0, 5) as any

      return {
        lineId,
        line,
        ruleMatches: matchedRules,
        bookMatches: candidates.map((c: any) => ({
          journalEntryId: c.journalEntryId,
          journalEntryLineId: c.journalEntryLineId,
          entryNumber: c.entryNumber,
          entryDate: c.entryDate,
          description: c.description,
          amount: c.amount,
          confidence: c.confidence,
        })),
      }
    })

    return { success: true, data: { statement, suggestions } }
  } catch (e) {
    console.error('suggestStatementMatches error', e)
    return { success: false, error: 'Failed to generate match suggestions' }
  }
}

export const applyStatementMatches = async (
  statementId: string,
  matches: Array<{ lineId: string; journalEntryId: string }>,
  reconciliationDate: Date
): Promise<ActionResult<{ clearedCount: number }>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, KEYS.fi.bank_ledger.reconciliation.match)
    if (!ok) return { success: false, error: 'Missing permission' }

    const scope = getScope(ctx)
    const settings = await readSettingsJson(scope)

    const stNs = getNamespace(settings, STATEMENTS_NS)
    const store = getStatementStore(stNs)
    const found = store.statements[statementId]
    if (!found) return { success: false, error: 'Statement not found' }

    const statement = bankStatementSchema.parse((found as any).statement)
    const lines = (Array.isArray((found as any).lines) ? (found as any).lines : []).map((l: any) =>
      bankStatementLineSchema.parse(l)
    )

    const entryIds = Array.from(new Set(matches.map((m) => m.journalEntryId).filter(Boolean)))
    let clearedCount = 0

    for (const journalEntryId of entryIds) {
      const res = await db.openItem.updateMany({
        where: {
          journalEntryId,
          accountId: statement.bankAccountId,
          status: 'OPEN',
        },
        data: {
          status: 'CLEARED',
          clearingDate: reconciliationDate,
          clearedAt: reconciliationDate,
          clearedBy: ctx.userId,
        },
      })
      clearedCount += res.count
    }

    const matchedLineIds = new Set(matches.map((m) => m.lineId))
    const matchedTransactionCount = matchedLineIds.size
    const unmatchedTransactionCount = Math.max(0, lines.length - matchedTransactionCount)

    const matchedAmount = lines
      .filter((l: any) => matchedLineIds.has(l.id))
      .reduce((a: number, l: any) => a + Math.abs(Number(l.amount)), 0)

    const unmatchedAmount = lines
      .filter((l: any) => !matchedLineIds.has(l.id))
      .reduce((a: number, l: any) => a + Math.abs(Number(l.amount)), 0)

    const fully = unmatchedTransactionCount === 0
    const updated = bankStatementSchema.parse({
      ...statement,
      matchedTransactionCount,
      unmatchedTransactionCount,
      matchedAmount,
      unmatchedAmount,
      status: fully ? 'RECONCILED' : 'PARTIALLY_MATCHED',
      isReconciled: fully,
      reconciledAt: fully ? new Date() : statement.reconciledAt,
      reconciledBy: fully ? ctx.userId : statement.reconciledBy,
      updatedAt: new Date(),
      updatedBy: ctx.userId,
    })

    store.statements[statementId] = { ...(found as any), statement: updated }

    const nextSettings = setNamespace(settings, STATEMENTS_NS, setStatementStore(stNs, store))
    await writeSettingsJson(scope, nextSettings)

    return { success: true, data: { clearedCount } }
  } catch (e) {
    console.error('applyStatementMatches error', e)
    return { success: false, error: 'Failed to apply matches' }
  }
}
