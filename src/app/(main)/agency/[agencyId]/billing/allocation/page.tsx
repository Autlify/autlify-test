import React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function AllocationPage() {
  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Cost Allocation</h2>
              <Badge variant="secondary" className="text-xs">Add‑On (Future Accounting)</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Define how usage, credits, and invoices are split across departments / cost centers.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" disabled>Export rules</Button>
            <Button disabled>Create rule</Button>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="rounded-lg border bg-muted/30 p-4 text-sm">
          This module is scaffolded for the 9th billing item (Split Bill / Recharges / Cost allocation).
          Once the accounting module is available, wire this page to: (1) dimensions/cost centers, (2) allocation rules,
          (3) downstream postings.
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Basis</th>
                <th className="py-2 pr-4">Target</th>
                <th className="py-2 pr-4">Split</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="py-3 pr-4">Example: Support recharges</td>
                <td className="py-3 pr-4 text-muted-foreground">Usage events</td>
                <td className="py-3 pr-4 text-muted-foreground">Cost Center</td>
                <td className="py-3 pr-4 text-muted-foreground">60/40</td>
                <td className="py-3"><Badge variant="outline">Draft</Badge></td>
              </tr>
              <tr>
                <td colSpan={5} className="py-6 text-center text-muted-foreground">
                  No allocation rules configured yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
