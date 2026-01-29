'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

type Props = { agencyId?: string; subAccountId?: string; deliveryId: string }

export default function DeliveryDetailClient(props: Props) {
  const qs = useMemo(() => {
    const p = new URLSearchParams()
    if (props.agencyId) p.set('agencyId', props.agencyId)
    if (props.subAccountId) p.set('subAccountId', props.subAccountId)
    return p.toString()
  }, [props.agencyId, props.subAccountId])

  const basePath = props.agencyId ? `/agency/${props.agencyId}` : `/subaccount/${props.subAccountId}`

  const [detail, setDetail] = useState<any | null>(null)
  const [busy, setBusy] = useState(false)

  const reload = async () => {
    const res = await fetch(`/api/features/core/webhooks/deliveries/${props.deliveryId}?${qs}`).then((r) => r.json())
    setDetail(res)
  }

  useEffect(() => {
    void reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qs, props.deliveryId])

  const replay = async () => {
    setBusy(true)
    try {
      await fetch(`/api/features/core/webhooks/deliveries/${props.deliveryId}/replay?${qs}`, { method: 'POST' })
      await reload()
    } finally {
      setBusy(false)
    }
  }

  if (!detail?.delivery) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Delivery</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Delivery {props.deliveryId}</CardTitle>
          <CardDescription>
            <Link className="hover:underline" href={`${basePath}/apps/webhooks/deliveries`}>Back to deliveries</Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-2">
          <div className="text-sm">
            Status: <Badge>{detail.delivery.status}</Badge> · Attempts: {detail.delivery.attemptCount}
          </div>
          <Button variant="outline" onClick={replay} disabled={busy}>
            Replay
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attempts</CardTitle>
          <CardDescription>Most recent first.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {(detail.attempts || []).length === 0 ? (
            <div className="text-sm text-muted-foreground">No attempts.</div>
          ) : (
            detail.attempts.map((a: any) => (
              <div key={a.id} className="border rounded-xl p-3">
                <div className="text-sm font-medium">
                  {new Date(a.attemptedAt).toLocaleString()} · {a.statusCode ?? 'ERR'} · {a.durationMs ?? 0}ms
                </div>
                {a.error ? <div className="text-xs text-destructive mt-1">{a.error}</div> : null}
                {a.responseBody ? (
                  <pre className="text-xs mt-2 whitespace-pre-wrap break-words">{a.responseBody}</pre>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
