'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

type ScopeProps = { agencyId?: string; subAccountId?: string }

type Provider = {
  id: string
  name: string
  category?: string
  description?: string
  oauthSupported?: boolean
  webhookSupported?: boolean
}

export default function IntegrationsClient(props: ScopeProps) {
  const qs = useMemo(() => {
    const p = new URLSearchParams()
    if (props.agencyId) p.set('agencyId', props.agencyId)
    if (props.subAccountId) p.set('subAccountId', props.subAccountId)
    return p.toString()
  }, [props.agencyId, props.subAccountId])

  const [providers, setProviders] = useState<Provider[]>([])
  const [connections, setConnections] = useState<any[]>([])
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [keyName, setKeyName] = useState('')
  const [createdSecret, setCreatedSecret] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const reloadAll = async () => {
    const [p, c, k] = await Promise.all([
      fetch(`/api/features/core/webhooks/providers?${qs}`).then((r) => r.json()),
      fetch(`/api/features/core/webhooks/connections?${qs}`).then((r) => r.json()),
      fetch(`/api/features/core/webhooks/api-keys?${qs}`).then((r) => r.json()),
    ])
    setProviders(p.providers || [])
    setConnections(c.connections || [])
    setApiKeys(k.apiKeys || [])
  }

  useEffect(() => {
    void reloadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qs])

  const statusFor = (providerKey: string) => {
    const conn = connections.find((c) => c.provider === providerKey && !c.isInherited)
    const inherited = connections.find((c) => c.provider === providerKey && c.isInherited)
    return { conn, inherited }
  }

  const createKey = async () => {
    setBusy(true)
    try {
      const res = await fetch(`/api/features/core/webhooks/api-keys?${qs}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: keyName || 'Default' }),
      })
      const json = await res.json()
      if (res.ok) {
        setCreatedSecret(json.apiKey?.apiKey || null)
        setKeyName('')
        await reloadAll()
      } else {
        alert(json.error || 'Failed to create key')
      }
    } finally {
      setBusy(false)
    }
  }

  const revokeKey = async (id: string) => {
    if (!confirm('Revoke this key?')) return
    setBusy(true)
    try {
      const res = await fetch(`/api/features/core/webhooks/api-keys/${id}?${qs}`, { method: 'DELETE' })
      if (res.ok) await reloadAll()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Provider Connections</CardTitle>
          <CardDescription>Connect providers and manage their credentials per context.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {providers.map((p) => {
            const s = statusFor(p.id)
            const state = s.conn?.status || (s.inherited ? `INHERITED:${s.inherited.status}` : 'DISCONNECTED')
            return (
              <div
                key={p.id}
                className="border rounded-xl p-4 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{p.name}</div>
                    <div className="text-sm text-muted-foreground truncate">{p.description || p.id}</div>
                  </div>
                  <Badge variant={state.startsWith('CONNECTED') ? 'default' : 'secondary'}>{state}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`${props.agencyId ? `/agency/${props.agencyId}` : `/subaccount/${props.subAccountId}`}/apps/integrations/${p.id}`}>
                      Manage
                    </Link>
                  </Button>
                  {p.webhookSupported ? <Badge variant="outline">Webhooks</Badge> : null}
                  {p.oauthSupported ? <Badge variant="outline">OAuth</Badge> : <Badge variant="outline">Webhook</Badge>}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integration API Keys</CardTitle>
          <CardDescription>
            Use API keys for server-to-server calls (header-based guard). The secret is shown once.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {createdSecret ? (
            <div className="rounded-xl border p-3">
              <div className="text-sm font-medium">New API Key (copy now)</div>
              <div className="mt-2 flex flex-col gap-2">
                <code className="text-xs break-all">{createdSecret}</code>
                <Button variant="outline" size="sm" onClick={() => setCreatedSecret(null)}>
                  Dismiss
                </Button>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col md:flex-row gap-2">
            <Input
              placeholder="Key name"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              disabled={busy}
            />
            <Button onClick={createKey} disabled={busy}>
              Create Key
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            {apiKeys.length === 0 ? (
              <div className="text-sm text-muted-foreground">No API keys created yet.</div>
            ) : (
              apiKeys.map((k) => (
                <div key={k.id} className="flex items-center justify-between border rounded-xl p-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{k.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      Prefix: <code>{k.keyPrefix}</code> · Last used: {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : '—'}
                      {k.revokedAt ? ' · REVOKED' : ''}
                    </div>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => revokeKey(k.id)} disabled={busy || !!k.revokedAt}>
                    Revoke
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
