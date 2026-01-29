'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowDownCircle, ArrowUpCircle, RefreshCw, Gift, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CreditTransaction } from './types'

interface CreditHistoryProps {
  transactions: CreditTransaction[]
  className?: string
}

export function CreditHistory({ transactions, className }: CreditHistoryProps) {
  const getIcon = (type: CreditTransaction['type']) => {
    switch (type) {
      case 'PURCHASE':
        return <ArrowUpCircle className="h-4 w-4 text-green-500" />
      case 'DEDUCTION':
        return <ArrowDownCircle className="h-4 w-4 text-red-500" />
      case 'REFUND':
        return <RefreshCw className="h-4 w-4 text-blue-500" />
      case 'BONUS':
        return <Gift className="h-4 w-4 text-purple-500" />
    }
  }

  const getTypeColor = (type: CreditTransaction['type']) => {
    switch (type) {
      case 'PURCHASE':
        return 'bg-green-500/10 text-green-600 border-green-500/20'
      case 'DEDUCTION':
        return 'bg-red-500/10 text-red-600 border-red-500/20'
      case 'REFUND':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
      case 'BONUS':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20'
    }
  }

  return (
    <div className="rounded-lg border border-border/50 bg-surface-secondary p-6">
      <Card className={cn('p-6 shadow-lg', className)}>
      <h3 className="mb-4 text-lg font-semibold">Credit History</h3>
      
      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between rounded-lg border p-4 transition-all duration-200 hover:bg-muted/50 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  {getIcon(transaction.type)}
                </div>
                <div>
                  <div className="font-medium">{transaction.description}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
                    {transaction.expiresAt && (
                      <>
                        <span>•</span>
                        <span>Expires {new Date(transaction.expiresAt).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={cn(
                  'text-lg font-semibold tabular-nums',
                  transaction.type === 'DEDUCTION' ? 'text-red-600' : 'text-green-600'
                )}>
                  {transaction.type === 'DEDUCTION' ? '-' : '+'}
                  {transaction.amount.toLocaleString()}
                </div>
                <Badge variant="outline" className={cn(getTypeColor(transaction.type), 'backdrop-blur-sm')}>
                  {transaction.type}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
    </div>
  )
}
