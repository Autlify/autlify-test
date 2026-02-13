/**
 * Document Number Range Utilities
 *
 * Provides document number generation with configurable formats and reset rules.
 * Supports both agency-level and subaccount-level scoping.
 */

import { db } from '@/lib/db'
import { readSettingsJson, writeSettingsJson, getNamespace, setNamespace, type TenantScope } from '@/lib/features/fi/core/tenant-settings'

const NAMESPACE = 'fi.numberRanges'

type DocumentNumberReset = 'YEARLY' | 'MONTHLY' | 'NEVER'

/**
 * State structure stored in settingsJson for number range counters.
 */
export interface NumberRangeCounterState {
  counters: Record<string, number>
}

export type NumberRangeScope =
  | { kind: 'agency'; agencyId: string }
  | { kind: 'subaccount'; subAccountId: string }

export interface ReserveDocumentNumberOptions {
  /** Unique key for the number range (e.g., 'ap.payment', 'ar.receipt', 'je.manual') */
  rangeKey: string
  /** Format pattern (e.g., 'PAY-{YYYY}-{######}') */
  format: string | null
  /** Fallback prefix if format is null */
  prefixFallback: string
  /** Reset rule for the sequence */
  reset: DocumentNumberReset
  /** Reference date for year/month extraction */
  date: Date
}

export interface ReserveDocumentNumberResult {
  docNumber: string
  sequence: number
  year: number
  month: number
}

/**
 * Build the reset period key based on the reset rule.
 */
function buildPeriodKey(reset: DocumentNumberReset, date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')

  switch (reset) {
    case 'YEARLY':
      return `${year}`
    case 'MONTHLY':
      return `${year}-${month}`
    case 'NEVER':
      return 'ALL'
    default:
      return `${year}`
  }
}

/**
 * Format a document number using the provided pattern.
 */
function formatDocNumber(
  format: string | null,
  prefixFallback: string,
  sequence: number,
  date: Date
): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const shortYear = String(year).slice(-2)

  if (!format) {
    // Default format: PREFIX-YYYY-NNNNNN
    const paddedSeq = String(sequence).padStart(6, '0')
    return `${prefixFallback}-${year}-${paddedSeq}`
  }

  // Replace tokens in format
  let result = format
  result = result.replace(/{YYYY}/g, String(year))
  result = result.replace(/{YY}/g, shortYear)
  result = result.replace(/{MM}/g, month)

  // Handle sequence padding: {######} → 000001, {####} → 0001
  const seqMatch = result.match(/{(#+)}/)
  if (seqMatch) {
    const padLength = seqMatch[1].length
    const paddedSeq = String(sequence).padStart(padLength, '0')
    result = result.replace(/{#+}/, paddedSeq)
  }

  return result
}

/**
 * Reserve the next document number for a given range key.
 * Uses settingsJson storage for lightweight persistence.
 */
export async function reserveDocumentNumber(
  scope: NumberRangeScope,
  options: ReserveDocumentNumberOptions
): Promise<ReserveDocumentNumberResult> {
  const tenantScope: TenantScope =
    scope.kind === 'subaccount'
      ? { kind: 'subaccount', subAccountId: scope.subAccountId }
      : { kind: 'agency', agencyId: scope.agencyId }

  const settings = await readSettingsJson(tenantScope)
  const ns = getNamespace(settings, NAMESPACE)

  const { rangeKey, format, prefixFallback, reset, date } = options
  const periodKey = buildPeriodKey(reset, date)
  const storageKey = `${rangeKey}:${periodKey}`

  // Get or initialize the sequence
  const sequences = (ns.sequences as Record<string, number>) ?? {}
  const currentSeq = sequences[storageKey] ?? 0
  const nextSeq = currentSeq + 1

  // Update the sequence
  sequences[storageKey] = nextSeq
  const updatedNs = { ...ns, sequences }

  // Write back to settings
  const nextSettings = setNamespace(settings, NAMESPACE, updatedNs)
  await writeSettingsJson(tenantScope, nextSettings)

  // Format the document number
  const docNumber = formatDocNumber(format, prefixFallback, nextSeq, date)

  return {
    docNumber,
    sequence: nextSeq,
    year: date.getFullYear(),
    month: date.getMonth() + 1,
  }
}

/**
 * Get the current sequence value without incrementing.
 */
export async function getCurrentSequence(
  scope: NumberRangeScope,
  rangeKey: string,
  reset: DocumentNumberReset,
  date: Date
): Promise<number> {
  const tenantScope: TenantScope =
    scope.kind === 'subaccount'
      ? { kind: 'subaccount', subAccountId: scope.subAccountId }
      : { kind: 'agency', agencyId: scope.agencyId }

  const settings = await readSettingsJson(tenantScope)
  const ns = getNamespace(settings, NAMESPACE)

  const periodKey = buildPeriodKey(reset, date)
  const storageKey = `${rangeKey}:${periodKey}`

  const sequences = (ns.sequences as Record<string, number>) ?? {}
  return sequences[storageKey] ?? 0
}

/**
 * Reset a number range sequence (admin function).
 */
export async function resetNumberRange(
  scope: NumberRangeScope,
  rangeKey: string,
  reset: DocumentNumberReset,
  date: Date,
  newValue: number = 0
): Promise<void> {
  const tenantScope: TenantScope =
    scope.kind === 'subaccount'
      ? { kind: 'subaccount', subAccountId: scope.subAccountId }
      : { kind: 'agency', agencyId: scope.agencyId }

  const settings = await readSettingsJson(tenantScope)
  const ns = getNamespace(settings, NAMESPACE)

  const periodKey = buildPeriodKey(reset, date)
  const storageKey = `${rangeKey}:${periodKey}`

  const sequences = (ns.sequences as Record<string, number>) ?? {}
  sequences[storageKey] = newValue

  const updatedNs = { ...ns, sequences }
  const nextSettings = setNamespace(settings, NAMESPACE, updatedNs)
  await writeSettingsJson(tenantScope, nextSettings)
}
