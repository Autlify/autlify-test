'use client'

import React from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card } from '../../../../../components/ui/card'

export function TablesSection() {
  const invoices = [
    { id: 'INV001', status: 'Paid', method: 'Credit Card', amount: '$250.00' },
    { id: 'INV002', status: 'Pending', method: 'PayPal', amount: '$150.00' },
    { id: 'INV003', status: 'Unpaid', method: 'Bank Transfer', amount: '$350.00' },
    { id: 'INV004', status: 'Paid', method: 'Credit Card', amount: '$450.00' },
  ]

  return (
    <div className="rounded-lg border border-border/50 p-6">
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-fg-primary">Tables</h2>
          <p className="text-fg-secondary">
            Table components using semantic design tokens for rows and cells.
          </p>
        </div>

        <Card>
          <Table>
            <TableHeader className="from-muted to-background/10 border-border/30 rounded-lg border bg-gradient-to-b p-2.5 transition-all duration-200 sm:p-3">
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium text-fg-primary">{invoice.id}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        invoice.status === 'Paid'
                          ? 'default'
                          : invoice.status === 'Pending'
                            ? 'secondary'
                            : 'destructive'
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-fg-secondary">{invoice.method}</TableCell>
                  <TableCell className="text-right font-medium text-fg-primary">{invoice.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
        </Card>
      </section>
    </div>
  )
}
