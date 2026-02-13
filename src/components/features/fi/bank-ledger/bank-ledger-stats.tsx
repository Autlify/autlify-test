'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  CircleDot,
  Clock,
  CreditCard,
  DollarSign,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

// ========== Types ==========

export interface BankLedgerStats {
  totalAccounts: number
  activeAccounts: number
  totalBalance: number
  totalBalanceCurrency: string
  availableBalance: number
  unclearedBalance: number
  unreconciledItems: number
  lastSyncAt?: Date
  balanceChange: number // percentage change
  balanceChangeDirection: 'up' | 'down' | 'neutral'
  accountsByType: { type: string; count: number; balance: number }[]
  recentTransactions?: number
  pendingPayments?: number
  upcomingReconciliations?: number
}

interface BankLedgerStatsProps {
  stats: BankLedgerStats
  isLoading?: boolean
  className?: string
}

// ========== Helper Functions ==========

const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatCompactCurrency = (amount: number, currency: string = 'USD') => {
  if (Math.abs(amount) >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`
  }
  if (Math.abs(amount) >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}K`
  }
  return formatCurrency(amount, currency)
}

// ========== Stat Card Component ==========

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string | number
  description?: string
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
    label?: string
  }
  color?: 'blue' | 'green' | 'purple' | 'amber' | 'rose' | 'slate'
  size?: 'default' | 'large'
  className?: string
}

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  trend,
  color = 'blue',
  size = 'default',
  className,
}: StatCardProps) {
  const colors = {
    blue: {
      gradient: 'from-blue-500/20 to-blue-600/10',
      border: 'border-blue-500/20',
      icon: 'text-blue-400',
      glow: 'bg-blue-500/20',
    },
    green: {
      gradient: 'from-emerald-500/20 to-emerald-600/10',
      border: 'border-emerald-500/20',
      icon: 'text-emerald-400',
      glow: 'bg-emerald-500/20',
    },
    purple: {
      gradient: 'from-purple-500/20 to-purple-600/10',
      border: 'border-purple-500/20',
      icon: 'text-purple-400',
      glow: 'bg-purple-500/20',
    },
    amber: {
      gradient: 'from-amber-500/20 to-amber-600/10',
      border: 'border-amber-500/20',
      icon: 'text-amber-400',
      glow: 'bg-amber-500/20',
    },
    rose: {
      gradient: 'from-rose-500/20 to-rose-600/10',
      border: 'border-rose-500/20',
      icon: 'text-rose-400',
      glow: 'bg-rose-500/20',
    },
    slate: {
      gradient: 'from-slate-500/20 to-slate-600/10',
      border: 'border-slate-500/20',
      icon: 'text-slate-400',
      glow: 'bg-slate-500/20',
    },
  }

  const c = colors[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6',
        c.gradient,
        c.border,
        className
      )}
    >
      {/* Glow Effect */}
      <div className={cn('absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl opacity-50', c.glow)} />

      <div className="relative flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className={cn(
            'font-bold tracking-tight tabular-nums',
            size === 'large' ? 'text-4xl' : 'text-3xl'
          )}>
            {value}
          </p>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1.5">
              {trend.direction === 'up' && <TrendingUp className="h-4 w-4 text-emerald-400" />}
              {trend.direction === 'down' && <TrendingDown className="h-4 w-4 text-rose-400" />}
              <span className={cn(
                'text-sm font-medium',
                trend.direction === 'up' && 'text-emerald-400',
                trend.direction === 'down' && 'text-rose-400',
                trend.direction === 'neutral' && 'text-muted-foreground'
              )}>
                {trend.value > 0 ? '+' : ''}{trend.value}%
                {trend.label && <span className="text-muted-foreground ml-1">{trend.label}</span>}
              </span>
            </div>
          )}
        </div>
        <div className={cn('rounded-xl bg-background/50 p-3', c.icon)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  )
}

// ========== Main Stats Component ==========

export function BankLedgerDashboardStats({ stats, isLoading = false, className }: BankLedgerStatsProps) {
  if (isLoading) {
    return (
      <div className={cn('grid gap-6 md:grid-cols-2 lg:grid-cols-4', className)}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 rounded-2xl border border-white/10 bg-white/5 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Primary Stats Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label="Total Balance"
          value={formatCurrency(stats.totalBalance, stats.totalBalanceCurrency)}
          trend={{
            value: stats.balanceChange,
            direction: stats.balanceChangeDirection,
            label: 'vs last month',
          }}
          color="blue"
          size="large"
        />

        <StatCard
          icon={Wallet}
          label="Available Balance"
          value={formatCurrency(stats.availableBalance, stats.totalBalanceCurrency)}
          description="Ready to use"
          color="green"
        />

        <StatCard
          icon={Clock}
          label="Uncleared"
          value={formatCurrency(stats.unclearedBalance, stats.totalBalanceCurrency)}
          description="Pending transactions"
          color="amber"
        />

        <StatCard
          icon={stats.unreconciledItems === 0 ? CheckCircle2 : CircleDot}
          label="Unreconciled Items"
          value={stats.unreconciledItems}
          description={stats.unreconciledItems === 0 ? 'All reconciled!' : 'Items to review'}
          color={stats.unreconciledItems === 0 ? 'green' : 'rose'}
        />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          icon={Building2}
          label="Bank Accounts"
          value={`${stats.activeAccounts} / ${stats.totalAccounts}`}
          description="Active accounts"
          color="purple"
        />

        {stats.pendingPayments !== undefined && (
          <StatCard
            icon={CreditCard}
            label="Pending Payments"
            value={stats.pendingPayments}
            description="Awaiting processing"
            color="amber"
          />
        )}

        {stats.lastSyncAt && (
          <StatCard
            icon={RefreshCw}
            label="Last Sync"
            value={new Date(stats.lastSyncAt).toLocaleTimeString()}
            description={new Date(stats.lastSyncAt).toLocaleDateString()}
            color="slate"
          />
        )}
      </div>
    </div>
  )
}

// ========== Balance Distribution Card ==========

interface BalanceDistributionProps {
  balancesByType: { type: string; label: string; balance: number; currency: string }[]
  totalBalance: number
  currency: string
  className?: string
}

export function BalanceDistributionCard({
  balancesByType,
  totalBalance,
  currency,
  className,
}: BalanceDistributionProps) {
  const colors = [
    'bg-blue-500',
    'bg-emerald-500',
    'bg-purple-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-cyan-500',
  ]

  return (
    <Card className={cn('border-white/10 bg-card/50 backdrop-blur-sm', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wallet className="h-5 w-5 text-blue-400" />
          Balance Distribution
        </CardTitle>
        <CardDescription>Breakdown by account type</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Distribution Bar */}
        <div className="h-4 w-full overflow-hidden rounded-full bg-white/10 flex">
          {balancesByType.map((item, index) => {
            const percentage = totalBalance > 0 ? (item.balance / totalBalance) * 100 : 0
            if (percentage <= 0) return null
            return (
              <motion.div
                key={item.type}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={cn('h-full', colors[index % colors.length])}
                title={`${item.label}: ${formatCurrency(item.balance, item.currency)}`}
              />
            )
          })}
        </div>

        {/* Legend */}
        <div className="space-y-3">
          {balancesByType.map((item, index) => {
            const percentage = totalBalance > 0 ? (item.balance / totalBalance) * 100 : 0
            return (
              <div key={item.type} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn('h-3 w-3 rounded-full', colors[index % colors.length])} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</span>
                  <span className="text-sm font-semibold tabular-nums">
                    {formatCurrency(item.balance, item.currency)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// ========== Quick Actions Card ==========

interface QuickAction {
  id: string
  icon: React.ElementType
  label: string
  description: string
  onClick: () => void
  color?: 'blue' | 'green' | 'purple' | 'amber'
}

interface QuickActionsCardProps {
  actions: QuickAction[]
  className?: string
}

export function QuickActionsCard({ actions, className }: QuickActionsCardProps) {
  const colors = {
    blue: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
    green: 'from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800',
    purple: 'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800',
    amber: 'from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800',
  }

  return (
    <Card className={cn('border-white/10 bg-card/50 backdrop-blur-sm', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5 text-amber-400" />
          Quick Actions
        </CardTitle>
        <CardDescription>Common banking operations</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <motion.button
              key={action.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.onClick}
              className={cn(
                'flex items-center gap-4 rounded-xl bg-gradient-to-r p-4 text-left text-white transition-all',
                colors[action.color || 'blue']
              )}
            >
              <div className="rounded-lg bg-white/20 p-2">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">{action.label}</p>
                <p className="text-sm text-white/80">{action.description}</p>
              </div>
            </motion.button>
          )
        })}
      </CardContent>
    </Card>
  )
}

// ========== Reconciliation Progress Card ==========

interface ReconciliationProgressProps {
  accounts: {
    id: string
    name: string
    total: number
    reconciled: number
    lastReconciled?: Date
  }[]
  className?: string
}

export function ReconciliationProgressCard({ accounts, className }: ReconciliationProgressProps) {
  return (
    <Card className={cn('border-white/10 bg-card/50 backdrop-blur-sm', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          Reconciliation Status
        </CardTitle>
        <CardDescription>Progress by account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {accounts.map((account) => {
          const progress = account.total > 0 ? (account.reconciled / account.total) * 100 : 100

          return (
            <div key={account.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{account.name}</span>
                <span className={cn(
                  'font-semibold',
                  progress === 100 ? 'text-emerald-400' : 'text-amber-400'
                )}>
                  {account.reconciled}/{account.total}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                  className={cn(
                    'h-full rounded-full',
                    progress === 100 ? 'bg-emerald-500' : 'bg-amber-500'
                  )}
                />
              </div>
              {account.lastReconciled && (
                <p className="text-xs text-muted-foreground">
                  Last reconciled: {new Date(account.lastReconciled).toLocaleDateString()}
                </p>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
