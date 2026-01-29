'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type ScopeProps = { agencyId?: string; subAccountId?: string }

export default function DeliveriesClient(props: ScopeProps) {
  const qs = useMemo(() => {
    const p = new URLSearchParams()
    if (props.agencyId) p.set('agencyId', props.agencyId)
    if (props.subAccountId) p.set('subAccountId', props.subAccountId)
    return p.toString()
  }, [props.agencyId, props.subAccountId])

  const basePath = props.agencyId ? `/agency/${props.agencyId}` : `/subaccount/${props.subAccountId}`

  const [rows, setRows] = useState<any[]>([])
  const [busy, setBusy] = useState(false)

  const reload = async () => {
    const res = await fetch(`/api/features/core/webhooks/deliveries?${qs}&limit=100`).then((r) => r.json())
    setRows(res.deliveries || [])
  }

  useEffect(() => {
    void reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qs])

  const replay = async (id: string) => {
    if (!confirm('Replay this delivery now?')) return
    setBusy(true)
    try {
      await fetch(`/api/features/core/webhooks/deliveries/${id}/replay?${qs}`, { method: 'POST' })
      await reload()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Webhook Deliveries</CardTitle>
        <CardDescription>Recent outbound deliveries and replay controls.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.length === 0 ? (
          <div className="text-sm text-muted-foreground">No deliveries yet.</div>
        ) : (
          rows.map((r) => (
            <div key={r.id} className="border rounded-xl p-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="font-medium truncate">
                  <Link className="hover:underline" href={`${basePath}/apps/webhooks/deliveries/${r.id}`}>
                    {r.provider} → {r.url}
                  </Link>
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  Status: {r.status} · Attempts: {r.attemptCount} · {new Date(r.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={r.status === 'SUCCESS' ? 'default' : 'secondary'}>{r.status}</Badge>
                <Button size="sm" variant="outline" onClick={() => replay(r.id)} disabled={busy}>
                  Replay
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
