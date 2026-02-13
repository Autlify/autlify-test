'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  Calendar,
  CreditCard,
  DollarSign,
  FileText,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

// ========== Types ==========

interface ApStatCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: { value: number; label: string }
  icon: React.ElementType
  iconColor?: string
  className?: string
}

interface ApAgingBucket {
  label: string
  amount: number
  count: number
  color: string
}

interface ApDashboardStatsProps {
  totalPayables: number
  overduePayables: number
  averagePayableDays?: number
  paidThisMonth?: number
  invoicesDueThisWeek?: number
  vendorCount?: number
  currencyCode?: string
  className?: string
}

interface ApAgingChartProps {
  aging: ApAgingBucket[]
  currencyCode?: string
  className?: string
}

interface ApVendorStatsProps {
  topVendors: {
    name: string
    totalOwed: number
    invoiceCount: number
    daysOverdue?: number
  }[]
  currencyCode?: string
  className?: string
}

interface ApPaymentScheduleProps {
  schedule: {
    period: string
    amount: number
    invoiceCount: number
    isOverdue?: boolean
  }[]
  currencyCode?: string
  className?: string
}

// ========== Helper Functions ==========

const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: amount >= 1000000 ? 'compact' : 'standard',
    minimumFractionDigits: 0,
    maximumFractionDigits: amount >= 1000000 ? 1 : 0,
  }).format(amount)
}

const formatCompactNumber = (num: number) => {
  return new Intl.NumberFormat('en-US', { notation: 'compact' }).format(num)
}

// ========== Animated Stat Card ==========

function ApStatCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  iconColor = 'from-blue-500 to-purple-500',
  className,
}: ApStatCardProps) {
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

export function ApDashboardStats({
  totalPayables,
  overduePayables,
  averagePayableDays,
  paidThisMonth,
  invoicesDueThisWeek,
  vendorCount,
  currencyCode = 'USD',
  className,
}: ApDashboardStatsProps) {
  const overduePercentage = totalPayables > 0 ? (overduePayables / totalPayables) * 100 : 0

  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
      <ApStatCard
        title="Total Payables"
        value={formatCurrency(totalPayables, currencyCode)}
        icon={DollarSign}
        iconColor="from-blue-500 to-cyan-500"
      />
      <ApStatCard
        title="Overdue Payables"
        value={formatCurrency(overduePayables, currencyCode)}
        subtitle={`${overduePercentage.toFixed(1)}% of total`}
        icon={AlertTriangle}
        iconColor={overduePayables > 0 ? 'from-red-500 to-orange-500' : 'from-emerald-500 to-green-500'}
      />
      {averagePayableDays !== undefined && (
        <ApStatCard
          title="Avg. Days to Pay"
          value={`${averagePayableDays} days`}
          icon={Calendar}
          iconColor="from-purple-500 to-pink-500"
        />
      )}
      {paidThisMonth !== undefined && (
        <ApStatCard
          title="Paid This Month"
          value={formatCurrency(paidThisMonth, currencyCode)}
          icon={CreditCard}
          iconColor="from-emerald-500 to-teal-500"
        />
      )}
      {invoicesDueThisWeek !== undefined && (
        <ApStatCard
          title="Due This Week"
          value={invoicesDueThisWeek.toString()}
          subtitle="invoices"
          icon={FileText}
          iconColor="from-amber-500 to-orange-500"
        />
      )}
      {vendorCount !== undefined && (
        <ApStatCard
          title="Active Vendors"
          value={formatCompactNumber(vendorCount)}
          icon={Users}
          iconColor="from-indigo-500 to-purple-500"
        />
      )}
    </div>
  )
}

// ========== Aging Chart ==========

export function ApAgingChart({ aging, currencyCode = 'USD', className }: ApAgingChartProps) {
  const totalAmount = aging.reduce((sum, bucket) => sum + bucket.amount, 0)
  const maxAmount = Math.max(...aging.map((b) => b.amount))

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className={cn('border-white/10 bg-card/50 backdrop-blur-sm', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Payables Aging</CardTitle>
          <CardDescription>Breakdown by aging period</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            {aging.map((bucket, index) => {
              const percentage = totalAmount > 0 ? (bucket.amount / totalAmount) * 100 : 0
              const barWidth = maxAmount > 0 ? (bucket.amount / maxAmount) * 100 : 0

              return (
                <motion.div
                  key={bucket.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{bucket.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{bucket.count} invoices</span>
                      <span className="text-base font-bold tabular-nums">
                        {formatCurrency(bucket.amount, currencyCode)}
                      </span>
                    </div>
                  </div>
                  <div className="relative h-3 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className={cn('absolute inset-y-0 left-0 rounded-full', bucket.color)}
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}% of total</p>
                </motion.div>
              )
            })}
          </div>

          {/* Summary */}
          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
            <span className="text-sm font-medium text-muted-foreground">Total Outstanding</span>
            <span className="text-xl font-bold">{formatCurrency(totalAmount, currencyCode)}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ========== Top Vendors ==========

export function ApVendorStats({ topVendors, currencyCode = 'USD', className }: ApVendorStatsProps) {
  const maxOwed = Math.max(...topVendors.map((v) => v.totalOwed))

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
      <Card className={cn('border-white/10 bg-card/50 backdrop-blur-sm', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Top Vendors by Payables</CardTitle>
          <CardDescription>Vendors with highest outstanding balances</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            {topVendors.map((vendor, index) => {
              const barWidth = maxOwed > 0 ? (vendor.totalOwed / maxOwed) * 100 : 0

              return (
                <motion.div
                  key={vendor.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{vendor.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {vendor.invoiceCount} invoice{vendor.invoiceCount !== 1 ? 's' : ''}
                          {vendor.daysOverdue && vendor.daysOverdue > 0 && (
                            <span className="text-amber-400 ml-2">• {vendor.daysOverdue}d avg overdue</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <span className="text-base font-bold tabular-nums">
                      {formatCurrency(vendor.totalOwed, currencyCode)}
                    </span>
                  </div>
                  <div className="relative h-1.5 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
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

// ========== Payment Schedule ==========

export function ApPaymentSchedule({ schedule, currencyCode = 'USD', className }: ApPaymentScheduleProps) {
  const totalScheduled = schedule.reduce((sum, s) => sum + s.amount, 0)

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
      <Card className={cn('border-white/10 bg-card/50 backdrop-blur-sm', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Payment Schedule</CardTitle>
          <CardDescription>Upcoming payment obligations</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            {schedule.map((item, index) => (
              <motion.div
                key={item.period}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'flex items-center justify-between rounded-lg p-3 transition-colors',
                  item.isOverdue 
                    ? 'bg-red-500/10 border border-red-500/20' 
                    : 'bg-white/5 hover:bg-white/10'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg',
                      item.isOverdue ? 'bg-red-500/20' : 'bg-blue-500/20'
                    )}
                  >
                    <Calendar
                      className={cn('h-5 w-5', item.isOverdue ? 'text-red-400' : 'text-blue-400')}
                    />
                  </div>
                  <div>
                    <p className={cn('text-sm font-medium', item.isOverdue && 'text-red-400')}>
                      {item.period}
                      {item.isOverdue && <span className="ml-2 text-xs">(Overdue)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.invoiceCount} invoice{item.invoiceCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <span className={cn('text-base font-bold tabular-nums', item.isOverdue && 'text-red-400')}>
                  {formatCurrency(item.amount, currencyCode)}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
            <span className="text-sm font-medium text-muted-foreground">Total Scheduled</span>
            <span className="text-xl font-bold">{formatCurrency(totalScheduled, currencyCode)}</span>
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

export function ApQuickMetrics({
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
