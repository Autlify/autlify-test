'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  ChevronRight,
  CreditCard,
  MoreHorizontal,
  RefreshCw,
  Shield,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

// ========== Types ==========

export interface BankAccountCardData {
  id: string
  accountCode: string
  accountName: string
  accountNumber: string
  accountNumberMasked?: string
  bankName: string
  bankLogo?: string
  currencyCode: string
  accountType: string
  status: 'ACTIVE' | 'INACTIVE' | 'FROZEN' | 'CLOSED' | 'PENDING_ACTIVATION' | 'PENDING_CLOSURE'
  currentBalance: number
  availableBalance: number
  unclearedBalance: number
  isDefault?: boolean
  isPrimaryOperating?: boolean
  connectionType?: string
  connectionStatus?: 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'PENDING'
  lastSyncAt?: Date
  unreconciledCount?: number
  href?: string
}

interface BankAccountCardProps {
  account: BankAccountCardData
  variant?: 'default' | 'compact' | 'minimal'
  showActions?: boolean
  onSync?: (accountId: string) => void
  onEdit?: (accountId: string) => void
  onViewDetails?: (accountId: string) => void
  className?: string
}

// ========== Helper Functions ==========

const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

const getStatusColor = (status: BankAccountCardData['status']) => {
  const colors = {
    ACTIVE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    INACTIVE: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
    FROZEN: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    CLOSED: 'bg-red-500/20 text-red-400 border-red-500/30',
    PENDING_ACTIVATION: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    PENDING_CLOSURE: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  }
  return colors[status] || colors.INACTIVE
}

const getConnectionIcon = (type?: string) => {
  switch (type) {
    case 'OPEN_BANKING':
    case 'PLAID':
    case 'YODLEE':
      return <Zap className="h-3.5 w-3.5" />
    case 'MANUAL':
    default:
      return <CreditCard className="h-3.5 w-3.5" />
  }
}

const getAccountTypeIcon = (type: string) => {
  switch (type) {
    case 'OPERATING':
    case 'CHECKING':
      return <Wallet className="h-5 w-5" />
    case 'SAVINGS':
      return <Shield className="h-5 w-5" />
    case 'INVESTMENT':
      return <TrendingUp className="h-5 w-5" />
    default:
      return <Building2 className="h-5 w-5" />
  }
}

// ========== Gradient Background Patterns ==========

const gradientPatterns = [
  'from-blue-600/90 via-blue-700/80 to-indigo-800/90',
  'from-emerald-600/90 via-teal-700/80 to-cyan-800/90',
  'from-violet-600/90 via-purple-700/80 to-indigo-800/90',
  'from-amber-600/90 via-orange-700/80 to-red-800/90',
  'from-slate-700/90 via-slate-800/80 to-zinc-900/90',
]

const getGradientByIndex = (index: number) => {
  return gradientPatterns[index % gradientPatterns.length]
}

// ========== Component ==========

export function BankAccountCard({
  account,
  variant = 'default',
  showActions = true,
  onSync,
  onEdit,
  onViewDetails,
  className,
}: BankAccountCardProps) {
  // Generate consistent gradient based on account ID
  const gradientIndex = account.id.charCodeAt(0) % gradientPatterns.length
  const gradient = getGradientByIndex(gradientIndex)

  const CardWrapper = account.href ? Link : 'div'
  const wrapperProps = account.href ? { href: account.href } : {}

  if (variant === 'minimal') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-white/20 hover:bg-white/10',
          className
        )}
      >
        <div className="flex items-center gap-4">
          <div className={cn('rounded-lg bg-gradient-to-br p-2.5', gradient)}>
            {getAccountTypeIcon(account.accountType)}
          </div>
          <div>
            <p className="font-semibold text-base">{account.accountName}</p>
            <p className="text-sm text-muted-foreground">
              {account.bankName} • {account.accountNumberMasked || '****'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold tabular-nums">
            {formatCurrency(account.currentBalance, account.currencyCode)}
          </p>
          <p className="text-xs text-muted-foreground">{account.currencyCode}</p>
        </div>
      </motion.div>
    )
  }

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-800/50 to-slate-900/80 p-5 backdrop-blur-xl transition-all hover:border-white/20',
          className
        )}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
        <div className={cn('absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl opacity-30', gradient.replace('from-', 'bg-').split(' ')[0])} />

        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn('rounded-xl bg-gradient-to-br p-2.5', gradient)}>
                {getAccountTypeIcon(account.accountType)}
              </div>
              <div>
                <p className="font-semibold text-base">{account.accountName}</p>
                <p className="text-sm text-muted-foreground">{account.bankName}</p>
              </div>
            </div>
            <Badge variant="outline" className={cn('text-xs', getStatusColor(account.status))}>
              {account.status.replace(/_/g, ' ')}
            </Badge>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Current Balance</p>
            <p className="text-2xl font-bold tabular-nums tracking-tight">
              {formatCurrency(account.currentBalance, account.currencyCode)}
            </p>
          </div>

          {account.unreconciledCount !== undefined && account.unreconciledCount > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                {account.unreconciledCount} unreconciled
              </Badge>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  // Default - Full Premium Card
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        'group relative overflow-hidden rounded-3xl border border-white/10 backdrop-blur-xl transition-all duration-300',
        className
      )}
    >
      {/* Card Background */}
      <div className={cn('absolute inset-0 bg-gradient-to-br', gradient)} />
      <div className="absolute inset-0 bg-grid-white/[0.05]" />
      
      {/* Shine Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute -inset-full top-0 h-[200%] w-[200%] rotate-45 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
      </div>

      {/* Card Content */}
      <div className="relative p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            {account.bankLogo ? (
              <img
                src={account.bankLogo}
                alt={account.bankName}
                className="h-10 w-10 rounded-lg bg-white/10 p-1.5"
              />
            ) : (
              <div className="rounded-xl bg-white/10 p-3">
                <Building2 className="h-6 w-6 text-white" />
              </div>
            )}
            <div>
              <h3 className="font-bold text-lg text-white">{account.accountName}</h3>
              <p className="text-sm text-white/70">{account.bankName}</p>
            </div>
          </div>

          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {onViewDetails && (
                  <DropdownMenuItem onClick={() => onViewDetails(account.id)}>
                    <ChevronRight className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(account.id)}>
                    Edit Account
                  </DropdownMenuItem>
                )}
                {onSync && account.connectionType !== 'MANUAL' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onSync(account.id)}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Sync Now
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Account Number */}
        <div className="mb-8">
          <p className="text-sm text-white/60 mb-1">Account Number</p>
          <p className="font-mono text-xl tracking-widest text-white">
            {account.accountNumberMasked || `**** **** **** ${account.accountNumber.slice(-4)}`}
          </p>
        </div>

        {/* Balance */}
        <div className="space-y-4 mb-6">
          <div>
            <p className="text-sm text-white/60 mb-1">Current Balance</p>
            <p className="text-4xl font-bold tabular-nums text-white tracking-tight">
              {formatCurrency(account.currentBalance, account.currencyCode)}
            </p>
          </div>

          <div className="flex gap-6">
            <div>
              <p className="text-xs text-white/50 mb-1">Available</p>
              <p className="text-sm font-semibold text-white/90 tabular-nums">
                {formatCurrency(account.availableBalance, account.currencyCode)}
              </p>
            </div>
            {account.unclearedBalance !== 0 && (
              <div>
                <p className="text-xs text-white/50 mb-1">Uncleared</p>
                <p className="text-sm font-semibold text-amber-300 tabular-nums">
                  {formatCurrency(account.unclearedBalance, account.currencyCode)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <Badge 
              variant="outline" 
              className={cn(
                'bg-white/10 border-white/20 text-white',
                account.isPrimaryOperating && 'bg-amber-500/20 border-amber-400/30 text-amber-200'
              )}
            >
              {account.isPrimaryOperating ? 'Primary' : account.accountType.replace(/_/g, ' ')}
            </Badge>
            
            {account.connectionStatus && (
              <Badge 
                variant="outline" 
                className={cn(
                  'text-xs',
                  account.connectionStatus === 'CONNECTED' && 'bg-emerald-500/20 border-emerald-400/30 text-emerald-200',
                  account.connectionStatus === 'ERROR' && 'bg-red-500/20 border-red-400/30 text-red-200',
                  account.connectionStatus === 'PENDING' && 'bg-amber-500/20 border-amber-400/30 text-amber-200',
                  account.connectionStatus === 'DISCONNECTED' && 'bg-zinc-500/20 border-zinc-400/30 text-zinc-200'
                )}
              >
                {getConnectionIcon(account.connectionType)}
                <span className="ml-1">{account.connectionStatus}</span>
              </Badge>
            )}
          </div>

          {account.unreconciledCount !== undefined && account.unreconciledCount > 0 && (
            <div className="flex items-center gap-1.5 text-amber-300">
              <span className="text-xs">{account.unreconciledCount} to reconcile</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ========== Bank Account Grid ==========

interface BankAccountGridProps {
  accounts: BankAccountCardData[]
  variant?: 'default' | 'compact' | 'minimal'
  columns?: 1 | 2 | 3
  onSync?: (accountId: string) => void
  onEdit?: (accountId: string) => void
  onViewDetails?: (accountId: string) => void
  className?: string
}

export function BankAccountGrid({
  accounts,
  variant = 'default',
  columns = 2,
  onSync,
  onEdit,
  onViewDetails,
  className,
}: BankAccountGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 lg:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  }

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5 py-16">
        <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-1">No Bank Accounts</h3>
        <p className="text-sm text-muted-foreground">
          Add your first bank account to get started
        </p>
      </div>
    )
  }

  return (
    <div className={cn('grid gap-6', gridCols[columns], className)}>
      {accounts.map((account, index) => (
        <motion.div
          key={account.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <BankAccountCard
            account={account}
            variant={variant}
            onSync={onSync}
            onEdit={onEdit}
            onViewDetails={onViewDetails}
          />
        </motion.div>
      ))}
    </div>
  )
}
