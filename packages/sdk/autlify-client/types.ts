export type AutlifyScope =
  | { kind: 'agency'; agencyId: string }
  | { kind: 'subaccount'; agencyId: string; subAccountId: string }

export type AutlifyClientOptions = {
  /** Base URL of your Autlify deployment (e.g. https://app.naropo.com). Defaults to process.env.AUTLIFY_BASE_URL or http://localhost:3000 */
  baseUrl?: string
  /** API key (server-only). Defaults to process.env.AUTLIFY_API_KEY */
  apiKey?: string
  /** Optional user-agent suffix */
  userAgent?: string
  /** Request timeout in ms (default 15000) */
  timeoutMs?: number
  /** Validate responses against the built-in Zod contracts (default true) */
  validate?: boolean
}

export type AutlifyErrorPayload = { error?: string; code?: string }
