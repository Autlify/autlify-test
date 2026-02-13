/**
 * FI-BL Catch-All Route
 *
 * Consolidates all Bank Ledger sections into one dynamic route.
 * Renders existing components directly without intermediate wrappers.
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import Unauthorized from '@/components/unauthorized'
import { OverviewSkeleton, ListPageSkeleton } from '@/components/features/fi/skeletons'

// Existing Bank Ledger Components
import { BankReconciliation, BankLedgerDashboardStats } from '@/components/features/fi/bank-ledger'

// Actions for data fetching
import { listBankAccounts, type BankAccountSummary } from '@/lib/features/fi/general-ledger/actions/bank-ledger'
import { listBankStatements } from '@/lib/features/fi/bank-ledger/actions/statements'
import { listBankTransfers } from '@/lib/features/fi/bank-ledger/actions/bank-transfers'
import { listPaymentBatches } from '@/lib/features/fi/bank-ledger/actions/payment-batches'
import { getBankMatchingRules } from '@/lib/features/fi/bank-ledger/actions/matching-rules'
import { hasAgencyPermission } from '@/lib/features/iam/authz/permissions'

type Props = {
  params: Promise<{ agencyId: string; section?: string[] }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

// ============================================================================
// Section: Overview (default)
// ============================================================================
async function OverviewSection({ agencyId }: { agencyId: string }) {
  const [accountsResult, statementsResult] = await Promise.all([
    listBankAccounts(),
    listBankStatements(),
  ])

  const accounts = accountsResult.success ? (accountsResult.data ?? []) : []
  const statements = statementsResult.success ? (statementsResult.data ?? []) : []

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0)
  const totalReconciled = accounts.reduce((sum, acc) => sum + acc.reconciledBalance, 0)
  const totalUnreconciled = accounts.reduce((sum, acc) => sum + acc.unreconciledCount, 0)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bank Ledger</h1>
        <p className="text-sm text-muted-foreground">Bank accounts, reconciliation, and cash management</p>
      </div>

      <BankLedgerDashboardStats
        stats={{
          totalAccounts: accounts.length,
          activeAccounts: accounts.length,
          totalBalance,
          totalBalanceCurrency: 'USD',
          availableBalance: totalBalance,
          unclearedBalance: totalBalance - totalReconciled,
          unreconciledItems: totalUnreconciled,
          balanceChange: 0,
          balanceChangeDirection: 'neutral',
          accountsByType: [],
        }}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border">
          <div className="border-b p-4">
            <h2 className="font-semibold">Bank Accounts</h2>
          </div>
          <div className="p-4">
            {accounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bank accounts configured</p>
            ) : (
              <div className="space-y-2">
                {accounts.slice(0, 5).map((account) => (
                  <div key={account.id} className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-sm text-muted-foreground">{account.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono">{account.currentBalance.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{account.currency}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border">
          <div className="border-b p-4">
            <h2 className="font-semibold">Recent Statements</h2>
          </div>
          <div className="p-4">
            {statements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No statements imported</p>
            ) : (
              <div className="space-y-2">
                {statements.slice(0, 5).map((stmt: any) => (
                  <div key={stmt.id} className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <p className="font-medium">{stmt.reference || 'Statement'}</p>
                      <p className="text-sm text-muted-foreground">
                        {stmt.periodStart ? new Date(stmt.periodStart).toLocaleDateString() : '-'} - {stmt.periodEnd ? new Date(stmt.periodEnd).toLocaleDateString() : '-'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono">{Number(stmt.closingBalance ?? 0).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{stmt.lineCount ?? 0} lines</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Section: Bank Accounts
// ============================================================================
async function AccountsSection({ agencyId }: { agencyId: string }) {
  const accountsResult = await listBankAccounts()
  const accounts = accountsResult.success ? (accountsResult.data ?? []) : []

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bank Accounts</h1>
          <p className="text-sm text-muted-foreground">GL accounts configured as bank accounts</p>
        </div>
      </div>
      <div className="rounded-lg border">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="p-3 text-left text-sm font-medium">Code</th>
              <th className="p-3 text-left text-sm font-medium">Name</th>
              <th className="p-3 text-left text-sm font-medium">Currency</th>
              <th className="p-3 text-left text-sm font-medium">Current Balance</th>
              <th className="p-3 text-left text-sm font-medium">Reconciled</th>
              <th className="p-3 text-left text-sm font-medium">Unreconciled</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">No bank accounts configured</td>
              </tr>
            ) : (
              accounts.map((account) => (
                <tr key={account.id} className="border-b">
                  <td className="p-3 text-sm font-mono">{account.code}</td>
                  <td className="p-3 text-sm">{account.name}</td>
                  <td className="p-3 text-sm">{account.currency}</td>
                  <td className="p-3 text-sm font-mono">{account.currentBalance.toLocaleString()}</td>
                  <td className="p-3 text-sm font-mono">{account.reconciledBalance.toLocaleString()}</td>
                  <td className="p-3 text-sm">{account.unreconciledCount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============================================================================
// Section: Statements
// ============================================================================
async function StatementsSection({ agencyId }: { agencyId: string }) {
  const statementsResult = await listBankStatements()
  const statements = statementsResult.success ? (statementsResult.data ?? []) : []

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bank Statements</h1>
          <p className="text-sm text-muted-foreground">Imported bank statements for reconciliation</p>
        </div>
        <Link
          href={`/agency/${agencyId}/fi/bank-ledger/statements/import`}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Import Statement
        </Link>
      </div>
      <div className="rounded-lg border">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="p-3 text-left text-sm font-medium">Reference</th>
              <th className="p-3 text-left text-sm font-medium">Account</th>
              <th className="p-3 text-left text-sm font-medium">Period</th>
              <th className="p-3 text-left text-sm font-medium">Lines</th>
              <th className="p-3 text-left text-sm font-medium">Closing Balance</th>
              <th className="p-3 text-left text-sm font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {statements.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">No statements imported</td>
              </tr>
            ) : (
              statements.map((stmt: any) => (
                <tr key={stmt.id} className="border-b">
                  <td className="p-3 text-sm">{stmt.reference || '-'}</td>
                  <td className="p-3 text-sm">{stmt.bankAccountId ?? '-'}</td>
                  <td className="p-3 text-sm">
                    {stmt.periodStart ? new Date(stmt.periodStart).toLocaleDateString() : '-'} - {stmt.periodEnd ? new Date(stmt.periodEnd).toLocaleDateString() : '-'}
                  </td>
                  <td className="p-3 text-sm">{stmt.lineCount ?? 0}</td>
                  <td className="p-3 text-sm font-mono">{Number(stmt.closingBalance ?? 0).toLocaleString()}</td>
                  <td className="p-3 text-sm">{stmt.status ?? 'IMPORTED'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============================================================================
// Section: Reconciliation
// ============================================================================
function ReconciliationSection({ agencyId }: { agencyId: string }) {
  return (
    <div className="flex flex-col gap-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bank Reconciliation</h1>
        <p className="text-sm text-muted-foreground">Match bank statements with GL transactions</p>
      </div>
      <BankReconciliation />
    </div>
  )
}

// ============================================================================
// Section: Transfers
// ============================================================================
async function TransfersSection({ agencyId }: { agencyId: string }) {
  const transfersResult = await listBankTransfers({ page: 1, pageSize: 50 })
  const transfers = transfersResult.success ? (transfersResult.data ?? []) : []

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bank Transfers</h1>
          <p className="text-sm text-muted-foreground">Inter-account transfers and external payments</p>
        </div>
        <Link
          href={`/agency/${agencyId}/fi/bank-ledger/transfers/new`}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          New Transfer
        </Link>
      </div>
      <div className="rounded-lg border">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="p-3 text-left text-sm font-medium">Transfer No</th>
              <th className="p-3 text-left text-sm font-medium">From</th>
              <th className="p-3 text-left text-sm font-medium">To</th>
              <th className="p-3 text-left text-sm font-medium">Date</th>
              <th className="p-3 text-left text-sm font-medium">Amount</th>
              <th className="p-3 text-left text-sm font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {transfers.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">No transfers found</td>
              </tr>
            ) : (
              transfers.map((transfer: any) => (
                <tr key={transfer.id} className="border-b">
                  <td className="p-3 text-sm">{transfer.transferNumber ?? '-'}</td>
                  <td className="p-3 text-sm">{transfer.FromAccount?.name ?? transfer.fromAccountId ?? '-'}</td>
                  <td className="p-3 text-sm">{transfer.ToAccount?.name ?? transfer.toAccountId ?? '-'}</td>
                  <td className="p-3 text-sm">{transfer.transferDate ? new Date(transfer.transferDate).toLocaleDateString() : '-'}</td>
                  <td className="p-3 text-sm font-mono">{Number(transfer.amount ?? 0).toLocaleString()}</td>
                  <td className="p-3 text-sm">{transfer.status ?? '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============================================================================
// Section: Payment Batches
// ============================================================================
async function PaymentBatchesSection({ agencyId }: { agencyId: string }) {
  const batchesResult = await listPaymentBatches({ page: 1, pageSize: 50 })
  const batches = batchesResult.success ? (batchesResult.data ?? []) : []

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Payment Batches</h1>
          <p className="text-sm text-muted-foreground">Batch payments for vendors and suppliers</p>
        </div>
        <Link
          href={`/agency/${agencyId}/fi/bank-ledger/payment-batches/new`}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          New Batch
        </Link>
      </div>
      <div className="rounded-lg border">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="p-3 text-left text-sm font-medium">Batch No</th>
              <th className="p-3 text-left text-sm font-medium">Description</th>
              <th className="p-3 text-left text-sm font-medium">Date</th>
              <th className="p-3 text-left text-sm font-medium">Items</th>
              <th className="p-3 text-left text-sm font-medium">Total</th>
              <th className="p-3 text-left text-sm font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {batches.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">No payment batches found</td>
              </tr>
            ) : (
              batches.map((batch: any) => (
                <tr key={batch.id} className="border-b">
                  <td className="p-3 text-sm">{batch.batchNumber ?? '-'}</td>
                  <td className="p-3 text-sm">{batch.description ?? '-'}</td>
                  <td className="p-3 text-sm">{batch.batchDate ? new Date(batch.batchDate).toLocaleDateString() : '-'}</td>
                  <td className="p-3 text-sm">{batch.itemCount ?? 0}</td>
                  <td className="p-3 text-sm font-mono">{Number(batch.totalAmount ?? 0).toLocaleString()}</td>
                  <td className="p-3 text-sm">{batch.status ?? '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============================================================================
// Section: Matching Rules
// ============================================================================
async function MatchingRulesSection({ agencyId }: { agencyId: string }) {
  const rulesResult = await getBankMatchingRules()
  const rules = rulesResult.success ? (rulesResult.data ?? []) : []

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Matching Rules</h1>
          <p className="text-sm text-muted-foreground">Auto-matching rules for bank reconciliation</p>
        </div>
        <Link
          href={`/agency/${agencyId}/fi/bank-ledger/matching-rules/new`}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          New Rule
        </Link>
      </div>
      <div className="rounded-lg border">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="p-3 text-left text-sm font-medium">Name</th>
              <th className="p-3 text-left text-sm font-medium">Priority</th>
              <th className="p-3 text-left text-sm font-medium">Description Match</th>
              <th className="p-3 text-left text-sm font-medium">Amount Tolerance</th>
              <th className="p-3 text-left text-sm font-medium">Enabled</th>
            </tr>
          </thead>
          <tbody>
            {rules.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">No matching rules configured</td>
              </tr>
            ) : (
              rules.map((rule) => (
                <tr key={rule.id} className="border-b">
                  <td className="p-3 text-sm">{rule.name}</td>
                  <td className="p-3 text-sm">{rule.priority}</td>
                  <td className="p-3 text-sm font-mono text-xs">{rule.criteria.descriptionContainsAny.join(', ') || '-'}</td>
                  <td className="p-3 text-sm">{rule.criteria.amountTolerance}</td>
                  <td className="p-3 text-sm">{rule.enabled ? 'Yes' : 'No'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============================================================================
// Main Page Component
// ============================================================================
export default async function BankLedgerSectionPage({ params }: Props) {
  const { agencyId, section } = await params
  const sectionPath = section?.join('/') ?? ''

  const accessOk = await canAccessSection(agencyId, sectionPath)
  if (!accessOk) {
    return (
      <div className="h-full flex items-center justify-center">
        <Unauthorized />
      </div>
    )
  }

  return (
    <Suspense fallback={getSectionSkeleton(sectionPath)}>
      {renderSection(agencyId, sectionPath)}
    </Suspense>
  )
}

function getSectionSkeleton(sectionPath: string) {
  switch (sectionPath) {
    case '':
      return <OverviewSkeleton />
    default:
      return <ListPageSkeleton />
  }
}

const OVERVIEW_ACCESS_KEYS = [
  'fi.bank_ledger.bank_accounts.view',
  'fi.bank_ledger.statements.view',
  'fi.bank_ledger.reconciliation.view',
  'fi.bank_ledger.transfers.read',
  'fi.bank_ledger.payment_batches.read',
] as const

async function canAccessSection(agencyId: string, sectionPath: string): Promise<boolean> {
  // DEV JAILBREAK - Remove this line to restore permission checks
  return true

  const p = (sectionPath || '').replace(/^\/+/, '').toLowerCase()

  const required: string[] = (() => {
    if (!p || p === 'overview') return [...OVERVIEW_ACCESS_KEYS]
    if (p === 'accounts' || p.startsWith('accounts/')) return ['fi.bank_ledger.bank_accounts.view']
    if (p === 'statements' || p.startsWith('statements/')) return ['fi.bank_ledger.statements.view']
    if (p === 'reconciliation') return ['fi.bank_ledger.reconciliation.view']
    if (p === 'transfers' || p.startsWith('transfers/')) return ['fi.bank_ledger.transfers.read']
    if (p === 'payment-batches' || p.startsWith('payment-batches/')) return ['fi.bank_ledger.payment_batches.read']
    if (p === 'matching-rules' || p.startsWith('matching-rules/')) return ['fi.bank_ledger.matching_criteria.view']
    return ['fi.bank_ledger.bank_accounts.view']
  })()

  const results = await Promise.all(required.map((k) => hasAgencyPermission(agencyId, k as any)))
  return results.some(Boolean)
}

function renderSection(agencyId: string, sectionPath: string) {
  switch (sectionPath) {
    case '':
      return <OverviewSection agencyId={agencyId} />
    case 'accounts':
      return <AccountsSection agencyId={agencyId} />
    case 'statements':
      return <StatementsSection agencyId={agencyId} />
    case 'reconciliation':
      return <ReconciliationSection agencyId={agencyId} />
    case 'transfers':
      return <TransfersSection agencyId={agencyId} />
    case 'payment-batches':
      return <PaymentBatchesSection agencyId={agencyId} />
    case 'matching-rules':
      return <MatchingRulesSection agencyId={agencyId} />
    default:
      notFound()
  }
}
