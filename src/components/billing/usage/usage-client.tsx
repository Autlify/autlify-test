'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DetailedUsageTable } from '@/components/billingsdk/detailed-usage-table'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Download, RefreshCw } from 'lucide-react'

type UsageRow = {
  featureKey: string
  currentUsage: string
  maxAllowed: string | null
  isUnlimited: boolean
  period: string
}

type UsageEventRow = {
  id: string
  createdAt: string
  featureKey: string
  quantity: string
  actionKey: string | null
  idempotencyKey: string
}

type SummaryResponse = {
  ok: true
  scope: 'AGENCY' | 'SUBACCOUNT'
  agencyId: string
  subAccountId: string | null
  period: string
  periodsBack: number
  window: { periodStart: string; periodEnd: string }
  rows: UsageRow[]
}

type EventsResponse = {
  ok: true
  window: { periodStart: string; periodEnd: string }
  events: UsageEventRow[]
}

function toCsv(rows: Record<string, any>[]) {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const esc = (v: any) => {
    const s = String(v ?? '')
    const needs = /[\n\r,\"]/g.test(s)
    const out = s.replace(/\"/g, '""')
    return needs ? `"${out}"` : out
  }
  return [headers.join(','), ...rows.map((r) => headers.map((h) => esc(r[h])).join(','))].join('\n')
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function UsageClient(props: { agencyId: string; subAccountId?: string | null }) {
  const agencyId = props.agencyId
  const subAccountId = props.subAccountId ?? null
  const scope = subAccountId ? 'SUBACCOUNT' : 'AGENCY'

  const [period, setPeriod] = useState<'MONTHLY' | 'WEEKLY' | 'DAILY' | 'YEARLY'>('MONTHLY')
  const [periodsBack, setPeriodsBack] = useState<'0' | '1' | '2'>('0')
  const [query, setQuery] = useState('')
  const [featureFilter, setFeatureFilter] = useState<string>('__ALL__')
  const [debouncedQuery] = useDebounce(query, 250)

  const [loading, setLoading] = useState(true)
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [summary, setSummary] = useState<SummaryResponse | null>(null)
  const [events, setEvents] = useState<UsageEventRow[]>([])
  const [error, setError] = useState<string | null>(null)

  const features = useMemo(() => {
    const keys = (summary?.rows ?? []).map((r) => r.featureKey)
    return Array.from(new Set(keys)).sort()
  }, [summary?.rows])

  const filteredRows = useMemo(() => {
    const rows = summary?.rows ?? []
    const q = debouncedQuery.trim().toLowerCase()
    return rows
      .filter((r) => (featureFilter === '__ALL__' ? true : r.featureKey === featureFilter))
      .filter((r) => (q ? r.featureKey.toLowerCase().includes(q) : true))
  }, [summary?.rows, debouncedQuery, featureFilter])

  const filteredEvents = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase()
    return events
      .filter((e) => (featureFilter === '__ALL__' ? true : e.featureKey === featureFilter))
      .filter((e) => (q ? (e.actionKey ?? '').toLowerCase().includes(q) || e.featureKey.toLowerCase().includes(q) : true))
  }, [events, debouncedQuery, featureFilter])

  const refresh = async () => {
    setError(null)
    setLoading(true)
    setLoadingEvents(true)
    try {
      const url = new URL('/api/features/core/billing/usage/summary', window.location.origin)
      url.searchParams.set('agencyId', agencyId)
      if (subAccountId) url.searchParams.set('subAccountId', subAccountId)
      url.searchParams.set('scope', scope)
      url.searchParams.set('period', period)
      url.searchParams.set('periodsBack', periodsBack)

      const res = await fetch(url.toString(), { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Failed to load usage summary')
      setSummary(data)
      setLoading(false)

      const evUrl = new URL('/api/features/core/billing/usage/events', window.location.origin)
      evUrl.searchParams.set('agencyId', agencyId)
      if (subAccountId) evUrl.searchParams.set('subAccountId', subAccountId)
      evUrl.searchParams.set('scope', scope)
      evUrl.searchParams.set('period', period)
      evUrl.searchParams.set('periodsBack', periodsBack)

      const evRes = await fetch(evUrl.toString(), { cache: 'no-store' })
      const evData: EventsResponse = await evRes.json()
      if (!evRes.ok || !evData?.ok) throw new Error((evData as any)?.error || 'Failed to load usage events')
      setEvents(evData.events)
      setLoadingEvents(false)
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong')
      setLoading(false)
      setLoadingEvents(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agencyId, subAccountId, period, periodsBack])

  const windowLabel = useMemo(() => {
    if (!summary?.window) return ''
    const s = new Date(summary.window.periodStart).toLocaleDateString()
    const e = new Date(summary.window.periodEnd).toLocaleDateString()
    return `${s} → ${e}`
  }, [summary?.window])

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Usage</h2>
              <Badge variant="secondary" className="font-mono text-xs">{scope}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Track feature consumption, overages, and events for the selected billing window.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex gap-2">
              <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                </SelectContent>
              </Select>

              <Select value={periodsBack} onValueChange={(v: any) => setPeriodsBack(v)}>
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="Window" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Current window</SelectItem>
                  <SelectItem value="1">Previous window</SelectItem>
                  <SelectItem value="2">2 windows back</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" onClick={refresh} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-lg border bg-card/50 p-3">
            <div className="text-xs text-muted-foreground">Billing window</div>
            <div className="mt-1 font-medium">{loading ? <Skeleton className="h-5 w-[180px]" /> : windowLabel}</div>
          </div>
          <div className="rounded-lg border bg-card/50 p-3">
            <div className="text-xs text-muted-foreground">Tracked features</div>
            <div className="mt-1 font-medium">{loading ? <Skeleton className="h-5 w-[90px]" /> : String(features.length)}</div>
          </div>
          <div className="rounded-lg border bg-card/50 p-3">
            <div className="text-xs text-muted-foreground">Events</div>
            <div className="mt-1 font-medium">{loadingEvents ? <Skeleton className="h-5 w-[90px]" /> : String(events.length)}</div>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search feature or action…"
            className="md:col-span-2"
          />
          <Select value={featureFilter} onValueChange={setFeatureFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by feature" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__ALL__">All features</SelectItem>
              {features.map((k) => (
                <SelectItem key={k} value={k}>{k}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            className="gap-2"
            disabled={loading || filteredRows.length === 0}
            onClick={() => {
              const csv = toCsv(
                filteredRows.map((r) => ({
                  featureKey: r.featureKey,
                  currentUsage: r.currentUsage,
                  maxAllowed: r.isUnlimited ? 'UNLIMITED' : r.maxAllowed ?? '',
                  period: r.period,
                }))
              )
              downloadText(`usage-summary-${period}-${periodsBack}.csv`, csv)
            }}
          >
            <Download className="h-4 w-4" />
            Export summary
          </Button>
          <Button
            variant="secondary"
            className="gap-2"
            disabled={loadingEvents || filteredEvents.length === 0}
            onClick={() => {
              const csv = toCsv(
                filteredEvents.map((e) => ({
                  createdAt: e.createdAt,
                  featureKey: e.featureKey,
                  quantity: e.quantity,
                  actionKey: e.actionKey ?? '',
                  idempotencyKey: e.idempotencyKey,
                }))
              )
              downloadText(`usage-events-${period}-${periodsBack}.csv`, csv)
            }}
          >
            <Download className="h-4 w-4" />
            Export events
          </Button>
        </div>
      </Card>

      {/** DON'T DELETE: Original Table ver 1.0.0 (Not Yet Previewed) */}
      {/* <Card className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Feature usage summary</h3>
          <Badge variant="outline" className={cn('font-mono text-xs', loading && 'opacity-60')}>
            {loading ? 'Loading…' : `${filteredRows.length} rows`}
          </Badge>
        </div>

        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead className="text-right">Usage</TableHead>
                <TableHead className="text-right">Limit</TableHead>
                <TableHead>Period</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-[220px]" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-[90px] ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-[110px] ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[90px]" /></TableCell>
                    </TableRow>
                  ))
                : filteredRows.map((r) => (
                    <TableRow key={r.featureKey}>
                      <TableCell className="font-mono text-xs">{r.featureKey}</TableCell>
                      <TableCell className="text-right font-medium">{r.currentUsage}</TableCell>
                      <TableCell className="text-right">
                        {r.isUnlimited ? (
                          <Badge variant="secondary">Unlimited</Badge>
                        ) : r.maxAllowed ? (
                          r.maxAllowed
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{r.period}</TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      </Card> */}

      <DetailedUsageTable 
        title='Feature usage summary'
        description= 'Detailed breakdown of feature usage'
        resources= {
          filteredRows.map((r) => ({
            name: r.featureKey || 'Unnamed feature', 
            used:r.currentUsage ? Number(r.currentUsage) : 0,
            limit: r.isUnlimited ? 0 : r.maxAllowed ? Number(r.maxAllowed) : 0,
            // percentage will be automatically calculated
            unit: 'units',
          }))
        }
        
      />

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Usage events</h3>
          <Badge variant="outline" className={cn('font-mono text-xs', loadingEvents && 'opacity-60')}>
            {loadingEvents ? 'Loading…' : `${filteredEvents.length} rows`}
          </Badge>
        </div>

        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Feature</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Idempotency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingEvents
                ? Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-[140px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[220px]" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-[80px] ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[160px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[260px]" /></TableCell>
                    </TableRow>
                  ))
                : filteredEvents.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="text-muted-foreground">
                        {new Date(e.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{e.featureKey}</TableCell>
                      <TableCell className="text-right font-medium">{e.quantity}</TableCell>
                      <TableCell>{e.actionKey ?? <span className="text-muted-foreground">—</span>}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{e.idempotencyKey}</TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}


// export function DetailedUsageTableDemo() {
//   return (
//     <DetailedUsageTable
//       title="Resource Usage"
//       description="Detailed breakdown of your resource consumption"
//       resources={[
//         {
//           name: "API Calls",
//           used: 12300,
//           limit: 20000,
//           // percentage will be automatically calculated as 61.5%
//           unit: "calls",
//         },
//         { name: "Storage", used: 850, limit: 1000, percentage: 85, unit: "GB" },
//         {
//           name: "Team Members",
//           used: 4,
//           limit: 5,
//           // percentage will be automatically calculated as 80%
//           unit: "users",
//         },
//         {
//           name: "Bandwidth",
//           used: 1500,
//           limit: 2000,
//           percentage: 75,
//           unit: "GB",
//         },
//         {
//           name: "Emails",
//           used: 8500,
//           limit: 10000,
//           // percentage will be automatically calculated as 85%
//           unit: "emails",
//         },
//       ]}
//     />
//   );
// }