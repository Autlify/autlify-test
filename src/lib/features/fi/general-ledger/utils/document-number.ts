/**
 * Document Number Formatting Utilities
 *
 * Provides lightweight document number generation without database persistence.
 * For persistent number ranges with tracking, use number-ranges.ts instead.
 */

export interface BuildDocNumberOptions {
  /** Format pattern (e.g., 'WO-{YYYY}-{######}') */
  format: string | null
  /** Fallback prefix if format is null */
  prefixFallback: string
  /** Reference date for year/month extraction */
  date: Date
  /** Sequence number to use */
  sequence: number
}

/**
 * Build a document number from a format pattern and sequence.
 * This is a pure function - no database interaction.
 */
export function buildNextDocNumber(options: BuildDocNumberOptions): string {
  const { format, prefixFallback, date, sequence } = options

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
 * Parse a document number to extract year and sequence.
 * Returns null if the format doesn't match.
 */
export function parseDocNumber(
  docNumber: string,
  expectedPrefix: string
): { year: number; sequence: number } | null {
  // Try to match pattern: PREFIX-YYYY-NNNNNN
  const regex = new RegExp(`^${expectedPrefix}-(\\d{4})-(\\d+)$`)
  const match = docNumber.match(regex)

  if (!match) return null

  return {
    year: parseInt(match[1], 10),
    sequence: parseInt(match[2], 10),
  }
}

/**
 * Validate a document number format pattern.
 */
export function validateFormatPattern(format: string): { valid: boolean; error?: string } {
  // Must contain at least one sequence placeholder
  if (!/{#+}/.test(format)) {
    return { valid: false, error: 'Format must contain a sequence placeholder like {######}' }
  }

  // Check for valid tokens only
  const validTokens = ['{YYYY}', '{YY}', '{MM}', '{DD}']
  const tokenRegex = /{[^}]+}/g
  const tokens = format.match(tokenRegex) ?? []

  for (const token of tokens) {
    if (token.match(/^{#+}$/)) continue // Sequence placeholder is valid
    if (!validTokens.includes(token)) {
      return { valid: false, error: `Unknown token: ${token}` }
    }
  }

  return { valid: true }
}

/**
 * Get the period key for document number grouping.
 */
export function getDocumentPeriodKey(
  date: Date,
  reset: 'YEARLY' | 'MONTHLY' | 'NEVER'
): string {
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
