import { ReactNode } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PageTitle from '@/components/global/page-title'
import Unauthorized from '@/components/unauthorized'

import { auth } from '@/auth'
import { hasAgencyPermission } from '@/lib/features/iam/authz/permissions'

export default async function AccountsPayableLayout({
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
  const canViewVendors = true
  const canViewInvoices = true
  const canViewPurchaseOrders = true
  const canViewGoodsReceipts = true
  const canViewPayments = true
  const canViewAging = true
  const canViewGrirClearing = true
  const canApproveInvoices = true
  // ═══════════════════════════════════════════════════════════════════════════

  // Permission checks for AP module tabs
  // const [
  //   canViewVendors,
  //   canViewInvoices,
  //   canViewPurchaseOrders,
  //   canViewGoodsReceipts,
  //   canViewPayments,
  //   canViewAging,
  //   canViewGrirClearing,
  //   canApproveInvoices,
  // ] = await Promise.all([
  //   hasAgencyPermission(agencyId, 'fi.master_data.vendors.view'),
  //   hasAgencyPermission(agencyId, 'fi.accounts_payable.invoices.read'),
  //   hasAgencyPermission(agencyId, 'fi.accounts_payable.purchase_orders.read'),
  //   hasAgencyPermission(agencyId, 'fi.accounts_payable.goods_receipts.read'),
  //   hasAgencyPermission(agencyId, 'fi.accounts_payable.payments.read'),
  //   hasAgencyPermission(agencyId, 'fi.accounts_payable.aging.view'),
  //   hasAgencyPermission(agencyId, 'fi.accounts_payable.grir_clearing.view'),
  //   hasAgencyPermission(agencyId, 'fi.accounts_payable.invoices.approve'),
  // ])

  // Guard: prevent URL-jailbreak into AP when the user has no AP access
  // if (!canViewVendors && !canViewInvoices && !canViewPurchaseOrders && !canViewPayments) {
  //   return (
  //     <div className="h-full flex items-center justify-center">
  //       <Unauthorized />
  //     </div>
  //   )
  // }

  const basePath = `/agency/${agencyId}/fi/accounts-payable`

  return (
    <div className="flex flex-col">
      <PageTitle title="Accounts Payable" description="" />

      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="h-10">
              <TabsTrigger value="overview" asChild>
                <Link href={basePath}>Overview</Link>
              </TabsTrigger>

              {canViewVendors && (
                <TabsTrigger value="vendors" asChild>
                  <Link href={`${basePath}/vendors`}>Vendors</Link>
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

              {canViewPurchaseOrders && (
                <TabsTrigger value="purchase-orders" asChild>
                  <Link href={`${basePath}/purchase-orders`}>Purchase Orders</Link>
                </TabsTrigger>
              )}

              {canViewGoodsReceipts && (
                <TabsTrigger value="goods-receipts" asChild>
                  <Link href={`${basePath}/goods-receipts`}>Goods Receipts</Link>
                </TabsTrigger>
              )}

              {canViewPayments && (
                <TabsTrigger value="payments" asChild>
                  <Link href={`${basePath}/payments`}>Payments</Link>
                </TabsTrigger>
              )}

              {canViewAging && (
                <TabsTrigger value="aging" asChild>
                  <Link href={`${basePath}/aging`}>Aging</Link>
                </TabsTrigger>
              )}

              {canViewGrirClearing && (
                <TabsTrigger value="grir-clearing" asChild>
                  <Link href={`${basePath}/grir-clearing`}>GR/IR Clearing</Link>
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
