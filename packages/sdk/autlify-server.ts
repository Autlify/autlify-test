import 'server-only'

/**
 * Minimal server-side SDK wrapper for calling Naropo APIs with header-based auth.
 *
 * This is intentionally lightweight (no proprietary package name yet), but enforces:
 * - API key presence in env
 * - Explicit scope headers when needed
 *
 * Headers supported by our core guards:
 * - x-naropo-api-key
 * - x-naropo-agency-id / x-naropo-subaccount-id
 */
export type AutlifySdkScope = { agencyId: string } | { subAccountId: string; agencyId?: string }

export type AutlifySdkConfig = {
  baseUrl: string
  apiKey: string
  scope?: AutlifySdkScope
}

export class AutlifySdk {
  private baseUrl: string
  private apiKey: string
  private scope?: AutlifySdkScope

  constructor(cfg: AutlifySdkConfig) {
    this.baseUrl = cfg.baseUrl.replace(/\/$/, '')
    this.apiKey = cfg.apiKey
    this.scope = cfg.scope
  }

  static fromEnv(scope?: AutlifySdkScope) {
    const baseUrl = process.env.AUTLIFY_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || ''
    const apiKey = process.env.AUTLIFY_API_KEY || ''
    if (!baseUrl) throw new Error('AUTLIFY_BASE_URL (or NEXT_PUBLIC_APP_URL) is required')
    if (!apiKey) throw new Error('AUTLIFY_API_KEY is required (Developer plan / integration key)')
    return new AutlifySdk({ baseUrl, apiKey, scope })
  }

  private headers(extra?: Record<string, string>) {
    const h: Record<string, string> = {
      'content-type': 'application/json',
      'x-naropo-api-key': this.apiKey,
      ...extra,
    }

    if (this.scope && 'agencyId' in this.scope) {
      h['x-naropo-agency-id'] = this.scope.agencyId!
    }
    if (this.scope && 'subAccountId' in this.scope) {
      h['x-naropo-subaccount-id'] = this.scope.subAccountId
      if (this.scope.agencyId) h['x-naropo-agency-id'] = this.scope.agencyId
    }

    return h
  }

  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, { headers: this.headers() })
    if (!res.ok) throw new Error(`AutlifySdk GET ${path} failed: ${res.status}`)
    return (await res.json()) as T
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, { method: 'POST', headers: this.headers(), body: JSON.stringify(body) })
    if (!res.ok) throw new Error(`AutlifySdk POST ${path} failed: ${res.status}`)
    return (await res.json()) as T
  }
}
