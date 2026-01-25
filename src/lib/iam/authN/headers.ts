import 'server-only'

/**
 * Canonical context headers for SDK / integrations.
 *
 * Rationale: header-based "act on behalf of" (Stripe Connect style) keeps the API surface stable,
 * while allowing callers to target a BizUnit (SubAccount) under an OrgUnit (Agency) safely.
 */

// Lower-case constants (Request/Headers are case-insensitive, but we normalize to lower-case).
export const AUTLIFY_HEADER_AGENCY_ID = 'x-autlify-agency'
export const AUTLIFY_HEADER_SUBACCOUNT_ID = 'x-autlify-subaccount'

// Human-readable equivalents (useful for docs / examples).
export const AUTLIFY_HEADER_AGENCY_ID_CANONICAL = 'Autlify-Agency'
export const AUTLIFY_HEADER_SUBACCOUNT_ID_CANONICAL = 'Autlify-SubAccount'

export const getHeaderValue = (headers: Headers, name: string): string | null => {
  // Headers.get is case-insensitive, but some runtimes normalize differently.
  // We keep a tiny fallback list for robustness.
  const direct = headers.get(name)
  if (direct) return direct
  const lower = name.toLowerCase()
  if (lower !== name) {
    const v = headers.get(lower)
    if (v) return v
  }
  return null
}

export const getAutlifyAgencyHeader = (headers: Headers): string | null =>
  getHeaderValue(headers, AUTLIFY_HEADER_AGENCY_ID)

export const getAutlifySubAccountHeader = (headers: Headers): string | null =>
  getHeaderValue(headers, AUTLIFY_HEADER_SUBACCOUNT_ID)
