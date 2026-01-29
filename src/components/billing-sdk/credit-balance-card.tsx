'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Coins, Plus, TrendingDown, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CreditBalance } from './types'

interface CreditBalanceCardProps {
  balance: CreditBalance
  onPurchaseCredits?: () => void
  className?: string
}

export function CreditBalanceCard({
  balance,
  onPurchaseCredits,
  className,
}: CreditBalanceCardProps) {
  const usagePercentage = (balance.used / balance.total) * 100
  const remainingPercentage = 100 - usagePercentage

  return (
    <div className={cn("rounded-lg border border-border/50 bg-surface-secondary p-6", className)}>
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="px-4 pb-4 sm:px-6 sm:pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg sm:gap-3 sm:text-xl">
              <div className="bg-primary/10 ring-primary/20 rounded-lg p-1.5 ring-1 sm:p-2">
                <Coins className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              Credit Balance
            </CardTitle>
            {onPurchaseCredits && (
              <Button
                size="sm"
                onClick={onPurchaseCredits}
                className="shadow-lg transition-all duration-200 hover:shadow-xl"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Add Credits
              </Button>
            )}
          </div>
          <CardDescription className="text-sm sm:text-base">
            Track your credit usage and balance
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-4 sm:px-6">
          {/* Progress Bar Section */}
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tabular-nums sm:text-4xl">
                {balance.remaining.toLocaleString()}
              </span>
              <span className="text-muted-foreground text-base sm:text-lg">
                / {balance.total.toLocaleString()}
              </span>
              <span className="text-muted-foreground ml-auto text-sm">
                {balance.currency}
              </span>
            </div>

            <Progress value={remainingPercentage} className="h-2" />

            <div className="flex items-center justify-between text-sm">
              <div className="text-muted-foreground flex items-center gap-1.5">
                <TrendingDown className="h-4 w-4" />
                <span>{balance.used.toLocaleString()} used</span>
              </div>
              {balance.expiresAt && (
                <div className="text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Expires {new Date(balance.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="bg-muted/30 grid grid-cols-3 divide-x rounded-lg border">
            <div className="p-4 text-center">
              <div className="text-primary text-xl font-bold sm:text-2xl">
                {balance.total.toLocaleString()}
              </div>
              <div className="text-muted-foreground mt-1 text-xs">Total</div>
            </div>
            <div className="p-4 text-center">
              <div className="text-xl font-bold text-orange-600 sm:text-2xl">
                {balance.used.toLocaleString()}
              </div>
              <div className="text-muted-foreground mt-1 text-xs">Used</div>
            </div>
            <div className="p-4 text-center">
              <div className="text-xl font-bold text-green-600 sm:text-2xl">
                {balance.remaining.toLocaleString()}
              </div>
              <div className="text-muted-foreground mt-1 text-xs">Remaining</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
