import { ReactNode } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PageTitle from '@/components/global/page-title'
import Unauthorized from '@/components/unauthorized'

import { auth } from '@/auth'
import { hasAgencyPermission } from '@/lib/features/iam/authz/permissions'

export default async function BankLedgerLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ agencyId: string }>
}) {
  const { agencyId } = await params

  const session = await auth()
  if (!session?.user?.id) {
    redirect('/sign-in')
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DEV JAILBREAK - Remove this block and uncomment permission checks below
  // ═══════════════════════════════════════════════════════════════════════════
  const canViewAccounts = true
  const canViewStatements = true
  const canViewReconciliation = true
  const canViewTransfers = true
  const canViewPaymentBatches = true
  const canViewMatchingRules = true
  // ═══════════════════════════════════════════════════════════════════════════

  // Permission checks for Bank Ledger module tabs
  // const [
  //   canViewAccounts,
  //   canViewStatements,
  //   canViewReconciliation,
  //   canViewTransfers,
  //   canViewPaymentBatches,
  //   canViewMatchingRules,
  // ] = await Promise.all([
  //   hasAgencyPermission(agencyId, 'fi.bank_ledger.bank_accounts.view'),
  //   hasAgencyPermission(agencyId, 'fi.bank_ledger.statements.view'),
  //   hasAgencyPermission(agencyId, 'fi.bank_ledger.reconciliation.view'),
  //   hasAgencyPermission(agencyId, 'fi.bank_ledger.transfers.read'),
  //   hasAgencyPermission(agencyId, 'fi.bank_ledger.payment_batches.read'),
  //   hasAgencyPermission(agencyId, 'fi.bank_ledger.matching_criteria.view'),
  // ])

  // Guard: prevent URL-jailbreak into Bank Ledger when user has no access
  // if (!canViewAccounts && !canViewStatements && !canViewReconciliation && !canViewTransfers) {
  //   return (
  //     <div className="h-full flex items-center justify-center">
  //       <Unauthorized />
  //     </div>
  //   )
  // }

  const basePath = `/agency/${agencyId}/fi/bank-ledger`

  return (
    <div className="flex flex-col">
      <PageTitle title="Bank Ledger" description="" />

      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="h-10">
              <TabsTrigger value="overview" asChild>
                <Link href={basePath}>Overview</Link>
              </TabsTrigger>

              {canViewAccounts && (
                <TabsTrigger value="accounts" asChild>
                  <Link href={`${basePath}/accounts`}>Accounts</Link>
                </TabsTrigger>
              )}

              {canViewStatements && (
                <TabsTrigger value="statements" asChild>
                  <Link href={`${basePath}/statements`}>Statements</Link>
                </TabsTrigger>
              )}

              {canViewReconciliation && (
                <TabsTrigger value="reconciliation" asChild>
                  <Link href={`${basePath}/reconciliation`}>Reconciliation</Link>
                </TabsTrigger>
              )}

              {canViewTransfers && (
                <TabsTrigger value="transfers" asChild>
                  <Link href={`${basePath}/transfers`}>Transfers</Link>
                </TabsTrigger>
              )}

              {canViewPaymentBatches && (
                <TabsTrigger value="payment-batches" asChild>
                  <Link href={`${basePath}/payment-batches`}>Payment Batches</Link>
                </TabsTrigger>
              )}

              {canViewMatchingRules && (
                <TabsTrigger value="matching-rules" asChild>
                  <Link href={`${basePath}/matching-rules`}>Matching Rules</Link>
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <main className="flex-1">{children}</main>
    </div>
  )
}
