import React from 'react'

import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

type Props = { params: Promise<{ agencyId: string }> }

export default async function DunningPage({ params }: Props) {
  const { agencyId } = await params

  const agency = await db.agency.findUnique({ where: { id: agencyId }, select: { customerId: true } })
  const customerId = agency?.customerId ?? null

  const openInvoices = customerId
    ? await stripe.invoices.list({ customer: customerId, status: 'open', limit: 25 })
    : { data: [] }
  const uncollectibleInvoices = customerId
    ? await stripe.invoices.list({ customer: customerId, status: 'uncollectible', limit: 25 })
    : { data: [] }

  const invoices = [...openInvoices.data, ...uncollectibleInvoices.data].sort((a, b) => (b.created ?? 0) - (a.created ?? 0))

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Dunning</h2>
              {customerId ? (
                <Badge variant="secondary" className="font-mono text-xs">{customerId}</Badge>
              ) : (
                <Badge variant="outline" className="text-xs">No customer</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Monitor payment failures, overdue invoices, and recovery actions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" asChild>
              <a href="/site/pricing">Update payment method</a>
            </Button>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-lg border bg-card/50 p-3">
            <div className="text-xs text-muted-foreground">Open invoices</div>
            <div className="mt-1 text-2xl font-semibold">{openInvoices.data.length}</div>
          </div>
          <div className="rounded-lg border bg-card/50 p-3">
            <div className="text-xs text-muted-foreground">Uncollectible</div>
            <div className="mt-1 text-2xl font-semibold">{uncollectibleInvoices.data.length}</div>
          </div>
          <div className="rounded-lg border bg-card/50 p-3">
            <div className="text-xs text-muted-foreground">Total flagged</div>
            <div className="mt-1 text-2xl font-semibold">{invoices.length}</div>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Invoice</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Due</th>
                <th className="py-2 pr-4 text-right">Amount</th>
                <th className="py-2">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-muted-foreground">No overdue invoices found.</td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {inv.created ? new Date(inv.created * 1000).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs">{inv.number ?? inv.id}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={inv.status === 'open' ? 'secondary' : 'outline'}>{inv.status ?? '—'}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {inv.due_date ? new Date(inv.due_date * 1000).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 pr-4 text-right font-medium">
                      {(inv.amount_due ?? 0) / 100} {inv.currency?.toUpperCase()}
                    </td>
                    <td className="py-3">
                      {inv.hosted_invoice_url ? (
                        <Button asChild variant="outline" size="sm">
                          <a href={inv.hosted_invoice_url} target="_blank" rel="noreferrer">Open</a>
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
