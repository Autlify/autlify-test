/**
 * FI Bank Ledger - Bank Statement Import (settingsJson-backed)
 *
 * Persisted under namespace: `fi.bankLedger.statements`
 *
 * Notes:
 * - MVP parser focuses on CSV.
 * - `bankAccountId` is treated as the GL bank account (ChartOfAccount) id.
 */

'use server'

import { randomUUID } from 'crypto'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { hasAgencyPermission, hasSubAccountPermission } from '@/lib/features/iam/authz/permissions'
import { getNamespace, readSettingsJson, setNamespace, type TenantScope, writeSettingsJson } from '@/lib/features/fi/core/tenant-settings'
import { KEYS } from '@/lib/registry/keys/permissions'
import { bankStatementSchema, type BankStatement } from '@/lib/schemas/fi/bank-ledger/bank-statement'
import { bankStatementLineSchema, bankStatementLinesSchema, type BankStatementLine } from '@/lib/schemas/fi/bank-ledger/bank-statement-line'

type ActionResult<T> = { success: true; data: T } | { success: false; error: string }

const NAMESPACE = 'fi.bankLedger.statements'

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

const getStore = (ns: Record<string, unknown>) => {
  const statements = (ns.statements as Record<string, StoredStatement> | undefined) ?? {}
  return { statements }
}

const setStore = (ns: Record<string, unknown>, store: { statements: Record<string, StoredStatement> }) => {
  return { ...ns, statements: store.statements }
}

// --------------------
// CSV Parsing (MVP)
// --------------------

function parseCsvRow(line: string, delimiter: string) {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      const next = line[i + 1]
      if (inQuotes && next === '"') {
        cur += '"'
        i++
        continue
      }
      inQuotes = !inQuotes
      continue
    }
    if (!inQuotes && ch === delimiter) {
      out.push(cur)
      cur = ''
      continue
    }
    cur += ch
  }
  out.push(cur)
  return out.map((s) => s.trim())
}

const normalizeHeader = (h: string) => h.trim().toLowerCase().replace(/\s+/g, '')

const detectDelimiter = (text: string) => {
  const firstLine = text.split(/\r?\n/).find((l) => l.trim().length > 0) ?? ''
  const commas = (firstLine.match(/,/g) ?? []).length
  const semis = (firstLine.match(/;/g) ?? []).length
  const tabs = (firstLine.match(/\t/g) ?? []).length
  if (tabs > commas && tabs > semis) return '\t'
  if (semis > commas) return ';'
  return ','
}

export type BankStatementPreview = {
  headers: string[]
  lines: BankStatementLine[]
  totals: {
    transactionCount: number
    totalCredits: number
    totalDebits: number
    creditCount: number
    debitCount: number
  }
  errors: string[]
}

export const parseStatementPreview = async (
  csvText: string,
  options?: { hasHeader?: boolean; delimiter?: string; defaultCurrency?: string }
): Promise<ActionResult<BankStatementPreview>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, KEYS.fi.bank_ledger.statements.import)
    if (!ok) return { success: false, error: 'Missing permission' }

    const delimiter = options?.delimiter ?? detectDelimiter(csvText)
    const rawLines = csvText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)

    if (rawLines.length === 0) {
      return {
        success: true,
        data: {
          headers: [],
          lines: [],
          totals: { transactionCount: 0, totalCredits: 0, totalDebits: 0, creditCount: 0, debitCount: 0 },
          errors: [],
        },
      }
    }

    const hasHeader = options?.hasHeader ?? true
    const headerCells = parseCsvRow(rawLines[0], delimiter)
    const headers = hasHeader ? headerCells : ['date', 'amount', 'description', 'reference', 'currency']

    const idx = {
      date: headers.findIndex((h) => ['date', 'entrydate', 'transactiondate', 'valuedate'].includes(normalizeHeader(h))),
      amount: headers.findIndex((h) => ['amount', 'amt', 'value', 'transactionamount'].includes(normalizeHeader(h))),
      description: headers.findIndex((h) => ['description', 'details', 'narration', 'memo'].includes(normalizeHeader(h))),
      reference: headers.findIndex((h) => ['reference', 'ref', 'document', 'doc', 'transactionid'].includes(normalizeHeader(h))),
      currency: headers.findIndex((h) => ['currency', 'ccy', 'curr'].includes(normalizeHeader(h))),
    }

    const errors: string[] = []
    const out: BankStatementLine[] = []

    const startRow = hasHeader ? 1 : 0
    for (let i = startRow; i < rawLines.length; i++) {
      const cells = parseCsvRow(rawLines[i], delimiter)
      const dateVal = cells[idx.date] ?? cells[0]
      const amtVal = cells[idx.amount] ?? cells[1]
      const descVal = idx.description >= 0 ? cells[idx.description] : cells[2]
      const refVal = idx.reference >= 0 ? cells[idx.reference] : cells[3]
      const curVal = idx.currency >= 0 ? cells[idx.currency] : cells[4]

      const date = new Date(dateVal)
      if (Number.isNaN(date.getTime())) {
        errors.push(`Row ${i + 1}: invalid date '${dateVal}'`)
        continue
      }

      const amount = Number(String(amtVal).replace(/,/g, ''))
      if (!Number.isFinite(amount)) {
        errors.push(`Row ${i + 1}: invalid amount '${amtVal}'`)
        continue
      }

      const currency = (curVal || options?.defaultCurrency || 'MYR').toString().trim().toUpperCase()

      const line = bankStatementLineSchema.parse({
        entryDate: date,
        amount,
        currency,
        description: descVal?.toString() ?? null,
        reference: refVal?.toString() ?? null,
      })
      out.push(line)
    }

    let totalCredits = 0
    let totalDebits = 0
    let creditCount = 0
    let debitCount = 0
    for (const l of out) {
      if (l.amount >= 0) {
        totalCredits += l.amount
        creditCount += 1
      } else {
        totalDebits += Math.abs(l.amount)
        debitCount += 1
      }
    }

    return {
      success: true,
      data: {
        headers,
        lines: out,
        totals: { transactionCount: out.length, totalCredits, totalDebits, creditCount, debitCount },
        errors,
      },
    }
  } catch (e) {
    console.error('parseStatementPreview error', e)
    return { success: false, error: 'Failed to parse statement preview' }
  }
}

export type ImportBankStatementInput = {
  bankAccountId: string
  statementNumber: string
  periodStart?: Date
  periodEnd?: Date
  statementDate?: Date
  currencyCode?: string
  openingBalance?: number
  closingBalance?: number
  originalFileName?: string
  importFormat?: string
  lines: BankStatementLine[]
  raw?: unknown
}

export const importStatement = async (input: ImportBankStatementInput): Promise<ActionResult<{ id: string }>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, KEYS.fi.bank_ledger.statements.import)
    if (!ok) return { success: false, error: 'Missing permission' }

    const scope = getScope(ctx)
    const settings = await readSettingsJson(scope)
    const ns = getNamespace(settings, NAMESPACE)
    const store = getStore(ns)

    const parsedLines = bankStatementLinesSchema.parse(
      input.lines.map((l) => ({
        ...l,
        id: l.id ?? randomUUID(),
      }))
    )

    const dates = parsedLines.map((l) => new Date(l.entryDate))
    const minDate = dates.length ? new Date(Math.min(...dates.map((d) => d.getTime()))) : new Date()
    const maxDate = dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : new Date()

    const currencyCode = (input.currencyCode ?? parsedLines[0]?.currency ?? 'MYR').toString().toUpperCase()

    let totalCredits = 0
    let totalDebits = 0
    let creditCount = 0
    let debitCount = 0
    for (const l of parsedLines) {
      if (l.amount >= 0) {
        totalCredits += l.amount
        creditCount += 1
      } else {
        totalDebits += Math.abs(l.amount)
        debitCount += 1
      }
    }

    const id = randomUUID()

    const statement = bankStatementSchema.parse({
      id,
      agencyId: ctx.agencyId,
      subAccountId: ctx.subAccountId,
      bankAccountId: input.bankAccountId,
      statementNumber: input.statementNumber,
      periodStart: input.periodStart ?? minDate,
      periodEnd: input.periodEnd ?? maxDate,
      statementDate: input.statementDate ?? new Date(),
      currencyCode,
      openingBalance: input.openingBalance ?? 0,
      closingBalance: input.closingBalance ?? 0,
      totalCredits,
      totalDebits,
      creditCount,
      debitCount,
      totalTransactions: parsedLines.length,
      status: 'IMPORTED',
      importType: 'FILE_UPLOAD',
      importFormat: (input.importFormat as any) ?? 'CSV',
      importedAt: new Date(),
      importedBy: ctx.userId,
      originalFileName: input.originalFileName,
      createdAt: new Date(),
      createdBy: ctx.userId,
      updatedAt: new Date(),
      updatedBy: ctx.userId,
      matchedTransactionCount: 0,
      unmatchedTransactionCount: parsedLines.length,
      matchedAmount: 0,
      unmatchedAmount: parsedLines.reduce((a, l) => a + Math.abs(l.amount), 0),
      isReconciled: false,
    } satisfies Partial<BankStatement>)

    store.statements[id] = { statement, lines: parsedLines, raw: input.raw }

    const nextSettings = setNamespace(settings, NAMESPACE, setStore(ns, store))
    await writeSettingsJson(scope, nextSettings)

    return { success: true, data: { id } }
  } catch (e) {
    console.error('importStatement error', e)
    return { success: false, error: 'Failed to import statement' }
  }
}

export const listBankStatements = async (): Promise<ActionResult<BankStatement[]>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, KEYS.fi.bank_ledger.statements.view)
    if (!ok) return { success: false, error: 'Missing permission' }

    const settings = await readSettingsJson(getScope(ctx))
    const ns = getNamespace(settings, NAMESPACE)
    const store = getStore(ns)

    const statements = Object.values(store.statements)
      .map((s) => bankStatementSchema.parse((s as any).statement))
      .sort((a, b) => new Date(b.statementDate).getTime() - new Date(a.statementDate).getTime())

    return { success: true, data: statements }
  } catch (e) {
    console.error('listBankStatements error', e)
    return { success: false, error: 'Failed to list statements' }
  }
}

export const getBankStatement = async (
  statementId: string
): Promise<ActionResult<{ statement: BankStatement; lines: BankStatementLine[] }>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, KEYS.fi.bank_ledger.statements.view)
    if (!ok) return { success: false, error: 'Missing permission' }

    const settings = await readSettingsJson(getScope(ctx))
    const ns = getNamespace(settings, NAMESPACE)
    const store = getStore(ns)
    const found = store.statements[statementId]
    if (!found) return { success: false, error: 'Statement not found' }

    const statement = bankStatementSchema.parse((found as any).statement)
    const lines = bankStatementLinesSchema.parse((found as any).lines)
    return { success: true, data: { statement, lines } }
  } catch (e) {
    console.error('getBankStatement error', e)
    return { success: false, error: 'Failed to load statement' }
  }
}

export const archiveBankStatement = async (statementId: string): Promise<ActionResult<{ id: string }>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, KEYS.fi.bank_ledger.statements.manage)
    if (!ok) return { success: false, error: 'Missing permission' }

    const scope = getScope(ctx)
    const settings = await readSettingsJson(scope)
    const ns = getNamespace(settings, NAMESPACE)
    const store = getStore(ns)
    const found = store.statements[statementId]
    if (!found) return { success: false, error: 'Statement not found' }

    const statement = bankStatementSchema.parse((found as any).statement)
    const updated = bankStatementSchema.parse({
      ...statement,
      status: 'ARCHIVED',
      archivedAt: new Date(),
      archivedBy: ctx.userId,
      updatedAt: new Date(),
      updatedBy: ctx.userId,
    })

    store.statements[statementId] = { ...(found as any), statement: updated }
    const nextSettings = setNamespace(settings, NAMESPACE, setStore(ns, store))
    await writeSettingsJson(scope, nextSettings)

    return { success: true, data: { id: statementId } }
  } catch (e) {
    console.error('archiveBankStatement error', e)
    return { success: false, error: 'Failed to archive statement' }
  }
}
