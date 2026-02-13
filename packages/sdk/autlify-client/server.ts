import 'server-only'

import { AutlifyContractError, AutlifySdkError } from './errors'
import type { AutlifyClientOptions, AutlifyScope, AutlifyErrorPayload } from './types'

import {
  AppsListResponseSchema,
  InstallAppResponseSchema,
} from '../../../src/lib/features/core/apps/contract'

import {
  ProvidersListResponseSchema,
  ConnectionsListResponseSchema,
  ApiKeysListResponseSchema,
  DeliveriesListResponseSchema,
  WebhooksListResponseSchema,
  ApiKeyCreateRequestSchema,
  ConnectionUpsertRequestSchema,
  WebhookCreateRequestSchema,
  WebhookPatchRequestSchema,
  WebhookRotateSecretResponseSchema,
  WebhookTestResponseSchema,
  DeliveryDetailResponseSchema,
  ApiKeyCreateEnvelopeSchema,
  ConnectionEnvelopeSchema,
  OkResponseSchema,
  WebhookCreateResponseSchema,
  ReplayResponseSchema,
} from '../../../src/lib/features/core/integrations/contract'

type ScopeHeaders = Record<string, string>

function requiredEnv(name: string) {
  const v = process.env[name]
  if (!v) throw new AutlifySdkError(`Missing required env: ${name}`, { code: 'ENV_MISSING' })
  return v
}

function normalizeBaseUrl(baseUrl?: string) {
  const raw = baseUrl || process.env.AUTLIFY_BASE_URL || 'http://localhost:3000'
  return raw.replace(/\/$/, '')
}

function scopeHeaders(scope: AutlifyScope): ScopeHeaders {
  if (!scope.agencyId) throw new AutlifySdkError('Missing agencyId for scope', { code: 'INVALID_SCOPE' })
  const h: ScopeHeaders = { 'x-autlify-agency-id': scope.agencyId }
  if (scope.kind === 'subaccount') {
    if (!scope.subAccountId) throw new AutlifySdkError('Missing subAccountId for subaccount scope', { code: 'INVALID_SCOPE' })
    h['x-autlify-subaccount-id'] = scope.subAccountId
  }
  return h
}

async function readJson(res: Response) {
  const txt = await res.text()
  if (!txt) return {}
  try {
    return JSON.parse(txt)
  } catch {
    return { raw: txt }
  }
}

export class AutlifyClient {
  private baseUrl: string
  private apiKey: string
  private userAgent: string
  private timeoutMs: number
  private validate: boolean

  constructor(opts?: AutlifyClientOptions) {
    this.baseUrl = normalizeBaseUrl(opts?.baseUrl)
    this.apiKey = opts?.apiKey || requiredEnv('AUTLIFY_API_KEY')
    this.userAgent = `@autlify/client (server)${opts?.userAgent ? `; ${opts.userAgent}` : ''}`
    this.timeoutMs = typeof opts?.timeoutMs === 'number' ? opts.timeoutMs : 15000
    this.validate = opts?.validate ?? true

    if (typeof window !== 'undefined') {
      throw new AutlifySdkError('AutlifyClient (server) cannot run in a browser bundle', { code: 'BROWSER_FORBIDDEN' })
    }
  }

  forAgency(agencyId: string) {
    return new AutlifyScopedClient(this, { kind: 'agency', agencyId })
  }

  forSubAccount(agencyId: string, subAccountId: string) {
    return new AutlifyScopedClient(this, { kind: 'subaccount', agencyId, subAccountId })
  }

  async request(path: string, init: RequestInit & { scope?: AutlifyScope } = {}) {
    const url = `${this.baseUrl}${path}`
    const headers: Record<string, string> = {
      ...(init.headers as any),
      'x-autlify-api-key': this.apiKey,
      'user-agent': this.userAgent,
    }
    if (init.scope) Object.assign(headers, scopeHeaders(init.scope))

    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), this.timeoutMs)
    try {
      const res = await fetch(url, { ...init, headers, signal: controller.signal })
      const json = await readJson(res)

      if (!res.ok) {
        const err = json as AutlifyErrorPayload
        throw new AutlifySdkError(err?.error || `Request failed (${res.status})`, { status: res.status, code: err?.code, details: json })
      }
      return json
    } catch (e: any) {
      if (e?.name === 'AbortError') throw new AutlifySdkError('Request timed out', { code: 'TIMEOUT' })
      throw e
    } finally {
      clearTimeout(t)
    }
  }

  parse<T>(schema: { safeParse: (v: unknown) => any }, value: unknown): T {
    if (!this.validate) return value as T
    const parsed = schema.safeParse(value)
    if (!parsed.success) {
      throw new AutlifyContractError('Response did not match contract', { details: parsed.error })
    }
    return parsed.data as T
  }
}

export class AutlifyScopedClient {
  constructor(private root: AutlifyClient, private scope: AutlifyScope) {}

  apps = {
    list: async () => this.root.parse(AppsListResponseSchema, await this.root.request('/api/features/core/apps', { method: 'GET', scope: this.scope })),
    install: async (appKey: string) =>
      this.root.parse(InstallAppResponseSchema, await this.root.request(`/api/features/core/apps/${encodeURIComponent(appKey)}/install`, { method: 'POST', scope: this.scope, headers: { 'content-type': 'application/json' }, body: '{}' })),
    uninstall: async (appKey: string) =>
      this.root.parse(InstallAppResponseSchema, await this.root.request(`/api/features/core/apps/${encodeURIComponent(appKey)}/uninstall`, { method: 'POST', scope: this.scope, headers: { 'content-type': 'application/json' }, body: '{}' })),
  }

  integrations = {
    providers: {
      list: async () =>
        this.root.parse(ProvidersListResponseSchema, await this.root.request('/api/features/core/integrations/providers', { method: 'GET', scope: this.scope })),
    },
    connections: {
      list: async () =>
        this.root.parse(ConnectionsListResponseSchema, await this.root.request('/api/features/core/integrations/connections', { method: 'GET', scope: this.scope })),
      upsert: async (payload: unknown) => {
        const parsed = ConnectionUpsertRequestSchema.safeParse(payload)
        if (!parsed.success) throw new AutlifySdkError('Invalid payload for connection upsert', { code: 'INVALID_PAYLOAD', details: parsed.error })
        const json = await this.root.request('/api/features/core/integrations/connections', {
          method: 'POST',
          scope: this.scope,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(parsed.data),
        })
        return this.root.parse(ConnectionEnvelopeSchema, json)
      },
      get: async (connectionId: string) => {
        const json = await this.root.request(`/api/features/core/integrations/connections/${encodeURIComponent(connectionId)}`, { method: 'GET', scope: this.scope })
        return this.root.parse(ConnectionEnvelopeSchema, json)
      },
      patch: async (connectionId: string, payload: unknown) => {
        const json = await this.root.request(`/api/features/core/integrations/connections/${encodeURIComponent(connectionId)}`, {
          method: 'PATCH',
          scope: this.scope,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload ?? {}),
        })
        return this.root.parse(OkResponseSchema, json)
      },
      delete: async (connectionId: string) => {
        const json = await this.root.request(`/api/features/core/integrations/connections/${encodeURIComponent(connectionId)}`, { method: 'DELETE', scope: this.scope })
        return this.root.parse(OkResponseSchema, json)
      },
      test: async (connectionId: string) => {
        const json = await this.root.request(`/api/features/core/integrations/connections/${encodeURIComponent(connectionId)}/test`, { method: 'POST', scope: this.scope })
        return this.root.parse(WebhookTestResponseSchema, json)
      },
    },
    apiKeys: {
      list: async () =>
        this.root.parse(ApiKeysListResponseSchema, await this.root.request('/api/features/core/integrations/api-keys', { method: 'GET', scope: this.scope })),
      create: async (payload: unknown) => {
        const parsed = ApiKeyCreateRequestSchema.safeParse(payload)
        if (!parsed.success) throw new AutlifySdkError('Invalid payload for api key create', { code: 'INVALID_PAYLOAD', details: parsed.error })
        const json = await this.root.request('/api/features/core/integrations/api-keys', {
          method: 'POST',
          scope: this.scope,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(parsed.data),
        })
        return this.root.parse(ApiKeyCreateEnvelopeSchema, json)
      },
      revoke: async (apiKeyId: string) => {
        const json = await this.root.request(`/api/features/core/integrations/api-keys/${encodeURIComponent(apiKeyId)}`, { method: 'DELETE', scope: this.scope })
        return this.root.parse(OkResponseSchema, json)
      },
    },
    webhooks: {
      subscriptions: {
        list: async (connectionId: string) =>
          this.root.parse(
            WebhooksListResponseSchema,
            await this.root.request(`/api/features/core/integrations/webhooks/subscriptions?connectionId=${encodeURIComponent(connectionId)}`, { method: 'GET', scope: this.scope })
          ),
        create: async (payload: unknown) => {
          const parsed = WebhookCreateRequestSchema.safeParse(payload)
          if (!parsed.success) throw new AutlifySdkError('Invalid payload for webhook create', { code: 'INVALID_PAYLOAD', details: parsed.error })
          const json = await this.root.request('/api/features/core/integrations/webhooks/subscriptions', {
            method: 'POST',
            scope: this.scope,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(parsed.data),
          })
          return this.root.parse(WebhookCreateResponseSchema, json)
        },
        patch: async (subscriptionId: string, payload: unknown) => {
          const parsed = WebhookPatchRequestSchema.safeParse(payload)
          if (!parsed.success) throw new AutlifySdkError('Invalid payload for webhook patch', { code: 'INVALID_PAYLOAD', details: parsed.error })
          const json = await this.root.request(`/api/features/core/integrations/webhooks/subscriptions/${encodeURIComponent(subscriptionId)}`, {
            method: 'PATCH',
            scope: this.scope,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(parsed.data),
          })
          return this.root.parse(OkResponseSchema, json)
        },
        delete: async (subscriptionId: string) => {
          const json = await this.root.request(`/api/features/core/integrations/webhooks/subscriptions/${encodeURIComponent(subscriptionId)}`, { method: 'DELETE', scope: this.scope })
          return this.root.parse(OkResponseSchema, json)
        },
        rotateSecret: async (subscriptionId: string) => {
          const json = await this.root.request(`/api/features/core/integrations/webhooks/${encodeURIComponent(subscriptionId)}/rotate-secret`, { method: 'POST', scope: this.scope })
          return this.root.parse(WebhookRotateSecretResponseSchema, json)
        },
        test: async (subscriptionId: string) => {
          const json = await this.root.request(`/api/features/core/integrations/webhooks/${encodeURIComponent(subscriptionId)}/test`, { method: 'POST', scope: this.scope })
          return this.root.parse(WebhookTestResponseSchema, json)
        },
      },
      deliveries: {
        list: async (limit = 50) =>
          this.root.parse(
            DeliveriesListResponseSchema,
            await this.root.request(`/api/features/core/integrations/webhooks/deliveries?limit=${encodeURIComponent(String(limit))}`, { method: 'GET', scope: this.scope })
          ),
        get: async (deliveryId: string) => {
          const json = await this.root.request(`/api/features/core/integrations/webhooks/deliveries/${encodeURIComponent(deliveryId)}`, { method: 'GET', scope: this.scope })
          return this.root.parse(DeliveryDetailResponseSchema, json)
        },
        replay: async (deliveryId: string) => {
          const json = await this.root.request(`/api/features/core/integrations/webhooks/deliveries/${encodeURIComponent(deliveryId)}/replay`, { method: 'POST', scope: this.scope })
          return this.root.parse(ReplayResponseSchema, json)
        },
      },
    },
  }
}

export function createAutlifyClient(opts?: AutlifyClientOptions) {
  return new AutlifyClient(opts)
}
