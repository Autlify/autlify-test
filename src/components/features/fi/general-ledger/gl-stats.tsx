'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  Calculator,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

// ========== Types ==========

interface GlStatCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: { value: number; label: string }
  icon: React.ElementType
  iconColor?: string
  className?: string
}

interface GlDashboardStatsProps {
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
  netIncome?: number
  pendingJournals?: number
  closedPeriods?: number
  totalPeriods?: number
  currencyCode?: string
  className?: string
}

interface GlPeriodStatusProps {
  periods: {
    year: number
    period: string
    status: 'OPEN' | 'SOFT_CLOSE' | 'HARD_CLOSE'
    balanceDate?: Date
  }[]
  className?: string
}

interface GlAccountBreakdownProps {
  breakdown: {
    type: string
    label: string
    amount: number
    count: number
    color: string
  }[]
  currencyCode?: string
  className?: string
}

interface GlJournalStatusProps {
  statuses: {
    status: string
    label: string
    count: number
    amount: number
    color: string
    icon: React.ElementType
  }[]
  currencyCode?: string
  className?: string
}

// ========== Helper Functions ==========

const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: Math.abs(amount) >= 1000000 ? 'compact' : 'standard',
    minimumFractionDigits: 0,
    maximumFractionDigits: Math.abs(amount) >= 1000000 ? 1 : 0,
  }).format(amount)
}

const formatCompactNumber = (num: number) => {
  return new Intl.NumberFormat('en-US', { notation: 'compact' }).format(num)
}

// ========== Animated Stat Card ==========

function GlStatCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  iconColor = 'from-indigo-500 to-purple-500',
  className,
}: GlStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn('relative overflow-hidden border-white/10 bg-card/50 backdrop-blur-sm', className)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold tracking-tight">{value}</p>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
              {trend && (
                <div className="flex items-center gap-1">
                  {trend.value >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-400" />
                  )}
                  <span className={cn('text-sm font-medium', trend.value >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                    {Math.abs(trend.value)}%
                  </span>
                  <span className="text-sm text-muted-foreground">{trend.label}</span>
                </div>
              )}
            </div>
            <div className={cn('rounded-xl bg-gradient-to-br p-3', iconColor)}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ========== Dashboard Stats ==========

export function GlDashboardStats({
  totalAssets,
  totalLiabilities,
  totalEquity,
  netIncome,
  pendingJournals,
  closedPeriods,
  totalPeriods,
  currencyCode = 'USD',
  className,
}: GlDashboardStatsProps) {
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity
  const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01

  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
      <GlStatCard
        title="Total Assets"
        value={formatCurrency(totalAssets, currencyCode)}
        icon={DollarSign}
        iconColor="from-blue-500 to-cyan-500"
      />
      <GlStatCard
        title="Total Liabilities"
        value={formatCurrency(totalLiabilities, currencyCode)}
        icon={Calculator}
        iconColor="from-amber-500 to-orange-500"
      />
      <GlStatCard
        title="Total Equity"
        value={formatCurrency(totalEquity, currencyCode)}
        subtitle={isBalanced ? 'Books balanced ✓' : 'Difference detected!'}
        icon={BookOpen}
        iconColor={isBalanced ? 'from-emerald-500 to-teal-500' : 'from-red-500 to-pink-500'}
      />
      {netIncome !== undefined && (
        <GlStatCard
          title="Net Income"
          value={formatCurrency(netIncome, currencyCode)}
          icon={TrendingUp}
          iconColor={netIncome >= 0 ? 'from-emerald-500 to-green-500' : 'from-red-500 to-orange-500'}
        />
      )}
      {pendingJournals !== undefined && (
        <GlStatCard
          title="Pending Journals"
          value={pendingJournals.toString()}
          subtitle="awaiting approval"
          icon={Clock}
          iconColor="from-purple-500 to-pink-500"
        />
      )}
      {closedPeriods !== undefined && totalPeriods !== undefined && (
        <GlStatCard
          title="Closed Periods"
          value={`${closedPeriods} / ${totalPeriods}`}
          icon={Calendar}
          iconColor="from-indigo-500 to-purple-500"
        />
      )}
    </div>
  )
}

// ========== Balance Sheet Summary ==========

export function GlBalanceSheetSummary({
  assets,
  liabilities,
  equity,
  currencyCode = 'USD',
  className,
}: {
  assets: number
  liabilities: number
  equity: number
  currencyCode?: string
  className?: string
}) {
  const liabilitiesAndEquity = liabilities + equity
  const difference = assets - liabilitiesAndEquity
  const isBalanced = Math.abs(difference) < 0.01

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className={cn('border-white/10 bg-card/50 backdrop-blur-sm', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Balance Sheet Summary</CardTitle>
          <CardDescription>Assets = Liabilities + Equity</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Assets */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Assets</h4>
              <div className="rounded-lg bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Assets</span>
                  <span className="text-2xl font-bold tabular-nums text-blue-400">
                    {formatCurrency(assets, currencyCode)}
                  </span>
                </div>
              </div>
            </div>

            {/* Liabilities + Equity */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Liabilities & Equity
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-white/5 p-3">
                  <span className="text-sm text-muted-foreground">Liabilities</span>
                  <span className="text-base font-semibold tabular-nums text-amber-400">
                    {formatCurrency(liabilities, currencyCode)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/5 p-3">
                  <span className="text-sm text-muted-foreground">Equity</span>
                  <span className="text-base font-semibold tabular-nums text-emerald-400">
                    {formatCurrency(equity, currencyCode)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/10 p-3 border border-white/10">
                  <span className="text-sm font-medium">Total</span>
                  <span className="text-xl font-bold tabular-nums">
                    {formatCurrency(liabilitiesAndEquity, currencyCode)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Balance Status */}
          <div className={cn(
            'mt-6 flex items-center justify-between rounded-lg p-4 border',
            isBalanced 
              ? 'bg-emerald-500/10 border-emerald-500/30' 
              : 'bg-red-500/10 border-red-500/30'
          )}>
            <div className="flex items-center gap-3">
              {isBalanced ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-400" />
              )}
              <span className={cn('text-sm font-medium', isBalanced ? 'text-emerald-400' : 'text-red-400')}>
                {isBalanced ? 'Books are balanced' : 'Balance discrepancy detected'}
              </span>
            </div>
            {!isBalanced && (
              <span className="text-sm font-bold text-red-400 tabular-nums">
                Difference: {formatCurrency(difference, currencyCode)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ========== Period Status ==========

export function GlPeriodStatus({ periods, className }: GlPeriodStatusProps) {
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; bg: string; label: string }> = {
      OPEN: { color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'Open' },
      SOFT_CLOSE: { color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Soft Close' },
      HARD_CLOSE: { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Closed' },
    }
    return configs[status] || configs.OPEN
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
      <Card className={cn('border-white/10 bg-card/50 backdrop-blur-sm', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Fiscal Period Status</CardTitle>
          <CardDescription>Current period closing status</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {periods.map((period, index) => {
              const config = getStatusConfig(period.status)
              return (
                <motion.div
                  key={`${period.year}-${period.period}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
                >
                  <div>
                    <p className="text-sm font-semibold">{period.period} {period.year}</p>
                    <p className="text-xs text-muted-foreground">Fiscal Period</p>
                  </div>
                  <div className={cn('rounded-full px-3 py-1 text-xs font-medium', config.bg, config.color)}>
                    {config.label}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ========== Account Type Breakdown ==========

export function GlAccountBreakdown({ breakdown, currencyCode = 'USD', className }: GlAccountBreakdownProps) {
  const totalAmount = breakdown.reduce((sum, b) => sum + Math.abs(b.amount), 0)
  const maxAmount = Math.max(...breakdown.map((b) => Math.abs(b.amount)))

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
      <Card className={cn('border-white/10 bg-card/50 backdrop-blur-sm', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Account Type Breakdown</CardTitle>
          <CardDescription>Distribution by account type</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            {breakdown.map((item, index) => {
              const percentage = totalAmount > 0 ? (Math.abs(item.amount) / totalAmount) * 100 : 0
              const barWidth = maxAmount > 0 ? (Math.abs(item.amount) / maxAmount) * 100 : 0

              return (
                <motion.div
                  key={item.type}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn('h-3 w-3 rounded-full', item.color)} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{item.count} accounts</span>
                      <span className="text-base font-bold tabular-nums">
                        {formatCurrency(item.amount, currencyCode)}
                      </span>
                    </div>
                  </div>
                  <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className={cn('absolute inset-y-0 left-0 rounded-full', item.color)}
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ duration: 0.5, delay: index * 0.08 }}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ========== Journal Status Summary ==========

export function GlJournalStatusSummary({ statuses, currencyCode = 'USD', className }: GlJournalStatusProps) {
  const totalCount = statuses.reduce((sum, s) => sum + s.count, 0)

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
      <Card className={cn('border-white/10 bg-card/50 backdrop-blur-sm', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Journal Entry Status</CardTitle>
          <CardDescription>Overview of journal entries by status</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {statuses.map((status, index) => {
              const StatusIcon = status.icon
              return (
                <motion.div
                  key={status.status}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'flex items-center justify-between rounded-lg p-4 transition-colors',
                    'border border-white/10 bg-white/5 hover:bg-white/10'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn('rounded-lg p-2', status.color.replace('text-', 'bg-').replace('-400', '-500/20'))}>
                      <StatusIcon className={cn('h-4 w-4', status.color)} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{status.label}</p>
                      <p className="text-xs text-muted-foreground">{status.count} journals</p>
                    </div>
                  </div>
                  <span className="text-base font-bold tabular-nums">
                    {formatCurrency(status.amount, currencyCode)}
                  </span>
                </motion.div>
              )
            })}
          </div>

          {/* Summary */}
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
            <span className="text-sm font-medium text-muted-foreground">Total Journals</span>
            <span className="text-xl font-bold">{totalCount}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ========== Quick Metrics ==========

interface QuickMetricProps {
  label: string
  value: string | number
  description?: string
  trend?: 'up' | 'down' | 'neutral'
}

export function GlQuickMetrics({
  metrics,
  className,
}: {
  metrics: QuickMetricProps[]
  className?: string
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Card className={cn('border-white/10 bg-card/50 backdrop-blur-sm', className)}>
        <CardContent className="p-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="space-y-1"
              >
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {metric.label}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{metric.value}</span>
                  {metric.trend && metric.trend !== 'neutral' && (
                    <span
                      className={cn(
                        'flex items-center text-xs',
                        metric.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
                      )}
                    >
                      {metric.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                    </span>
                  )}
                </div>
                {metric.description && (
                  <p className="text-xs text-muted-foreground">{metric.description}</p>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
