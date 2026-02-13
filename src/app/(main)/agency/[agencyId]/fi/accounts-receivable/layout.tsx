import { ReactNode } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PageTitle from '@/components/global/page-title'
import Unauthorized from '@/components/unauthorized'

import { auth } from '@/auth'
import { hasAgencyPermission } from '@/lib/features/iam/authz/permissions'

export default async function AccountsReceivableLayout({
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
  const canViewCustomers = true
  const canViewInvoices = true
  const canViewSalesOrders = true
  const canViewReceipts = true
  const canViewAging = true
  const canViewDunning = true
  const canViewCashApplication = true
  const canApproveInvoices = true
  // ═══════════════════════════════════════════════════════════════════════════

  // Permission checks for AR module tabs
  // const [
  //   canViewCustomers,
  //   canViewInvoices,
  //   canViewSalesOrders,
  //   canViewReceipts,
  //   canViewAging,
  //   canViewDunning,
  //   canViewCashApplication,
  //   canApproveInvoices,
  // ] = await Promise.all([
  //   hasAgencyPermission(agencyId, 'fi.master_data.customers.view'),
  //   hasAgencyPermission(agencyId, 'fi.accounts_receivable.invoices.read'),
  //   hasAgencyPermission(agencyId, 'fi.accounts_receivable.sales_orders.read'),
  //   hasAgencyPermission(agencyId, 'fi.accounts_receivable.receipts.read'),
  //   hasAgencyPermission(agencyId, 'fi.accounts_receivable.aging.view'),
  //   hasAgencyPermission(agencyId, 'fi.accounts_receivable.dunning.view'),
  //   hasAgencyPermission(agencyId, 'fi.accounts_receivable.cash_application.view'),
  //   hasAgencyPermission(agencyId, 'fi.accounts_receivable.invoices.approve'),
  // ])

  // Guard: prevent URL-jailbreak into AR when the user has no AR access
  // if (!canViewCustomers && !canViewInvoices && !canViewSalesOrders && !canViewReceipts) {
  //   return (
  //     <div className="h-full flex items-center justify-center">
  //       <Unauthorized />
  //     </div>
  //   )
  // }

  const basePath = `/agency/${agencyId}/fi/accounts-receivable`

  return (
    <div className="flex flex-col">
      <PageTitle title="Accounts Receivable" description="" />

      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="h-10">
              <TabsTrigger value="overview" asChild>
                <Link href={basePath}>Overview</Link>
              </TabsTrigger>

              {canViewCustomers && (
                <TabsTrigger value="customers" asChild>
                  <Link href={`${basePath}/customers`}>Customers</Link>
                </TabsTrigger>
              )}

              {canViewInvoices && (
                <TabsTrigger value="invoices" asChild>
                  <Link href={`${basePath}/invoices`}>Invoices</Link>
                </TabsTrigger>
              )}

              {canApproveInvoices && (
                <TabsTrigger value="approvals" asChild>
                  <Link href={`${basePath}/approvals`}>Approvals</Link>
                </TabsTrigger>
              )}

              {canViewSalesOrders && (
                <TabsTrigger value="sales-orders" asChild>
                  <Link href={`${basePath}/sales-orders`}>Sales Orders</Link>
                </TabsTrigger>
              )}

              {canViewReceipts && (
                <TabsTrigger value="receipts" asChild>
                  <Link href={`${basePath}/receipts`}>Receipts</Link>
                </TabsTrigger>
              )}

              {canViewCashApplication && (
                <TabsTrigger value="cash-application" asChild>
                  <Link href={`${basePath}/cash-application`}>Cash Application</Link>
                </TabsTrigger>
              )}

              {canViewAging && (
                <TabsTrigger value="aging" asChild>
                  <Link href={`${basePath}/aging`}>Aging</Link>
                </TabsTrigger>
              )}

              {canViewDunning && (
                <TabsTrigger value="dunning" asChild>
                  <Link href={`${basePath}/dunning`}>Dunning</Link>
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
