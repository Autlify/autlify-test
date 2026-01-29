'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, RefreshCw, X, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DunningStrike } from './types'

interface DunningAlertsProps {
  strikes: DunningStrike[]
  onRetryPayment?: (invoiceId: string) => void | Promise<void>
  className?: string
}

export function DunningAlerts({
  strikes,
  onRetryPayment,
  className,
}: DunningAlertsProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleRetry = async (invoiceId: string) => {
    if (!onRetryPayment) return
    setLoading(invoiceId)
    try {
      await onRetryPayment(invoiceId)
    } finally {
      setLoading(null)
    }
  }

  const activeStrikes = strikes.filter((strike) => !strike.resolvedAt)

  if (activeStrikes.length === 0) {
    return null
  }

  const getStrikeColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700'
      case 2:
        return 'bg-orange-500/10 border-orange-500/30 text-orange-700'
      case 3:
        return 'bg-red-500/10 border-red-500/30 text-red-700'
      default:
        return 'bg-gray-500/10 border-gray-500/30 text-gray-700'
    }
  }

  const getStrikeTitle = (level: number) => {
    switch (level) {
      case 1:
        return 'Payment Reminder'
      case 2:
        return 'Urgent: Payment Required'
      case 3:
        return 'Critical: Service Suspension Warning'
      default:
        return 'Payment Issue'
    }
  }

  return (
    <div className="rounded-lg border border-border/50 bg-surface-secondary p-6">
      <div className={cn('space-y-4', className)}>
      {activeStrikes.map((strike) => (
        <Alert key={strike.id} className={getStrikeColor(strike.level)}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{getStrikeTitle(strike.level)}</span>
                    <Badge variant="outline" className="text-xs backdrop-blur-sm">
                      Strike {strike.level}/3
                    </Badge>
                  </div>
                  <p className="text-sm">
                    {strike.level === 1 && 'Your payment failed. Please update your payment method or retry.'}
                    {strike.level === 2 && 'Multiple payment failures detected. Please resolve immediately to avoid service interruption.'}
                    {strike.level === 3 && 'Final notice: Your service will be suspended if payment is not resolved within 24 hours.'}
                  </p>
                </div>

                {strike.failedPayments.length > 0 && (
                  <Card className="bg-background/50 p-3 shadow-lg">
                    <div className="space-y-2">
                      {strike.failedPayments.map((payment) => (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex-1">
                            <div className="font-medium">
                              {payment.currency} {payment.amount.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {payment.failureReason}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {payment.nextRetryAt && (
                              <div className= "flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>
                                  Retry {new Date(payment.nextRetryAt).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            {onRetryPayment && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRetry(payment.invoiceId)}
                                disabled={loading === payment.invoiceId}
                                className="shadow-lg transition-all duration-200 hover:shadow-xl"
                              >
                                <RefreshCw className={cn(
                                  'mr-1.5 h-3 w-3',
                                  loading === payment.invoiceId && 'animate-spin'
                                )} />
                                Retry Now
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                <div className="text-xs text-muted-foreground">
                  Strike issued {new Date(strike.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      ))}
      </div>
    </div>
  )
}
