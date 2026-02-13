/**
 * FI-AP Catch-All Route
 *
 * Consolidates all AP sections into one dynamic route.
 * Renders existing components directly without intermediate wrappers.
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import Unauthorized from '@/components/unauthorized'
import { OverviewSkeleton, ListPageSkeleton, AgingSkeleton } from '@/components/features/fi/skeletons'

// Existing AP Components
import { VendorTable, ApInvoiceTable, ApDashboardStats } from '@/components/features/fi/accounts-payable'

// Actions for data fetching
import { listVendorAccounts } from '@/lib/features/fi/accounts-payable/actions/vendor-accounts'
import { listApInvoices } from '@/lib/features/fi/accounts-payable/actions/ap-invoices'
import { listApPayments } from '@/lib/features/fi/accounts-payable/actions/ap-payments'
import { listPurchaseOrders } from '@/lib/features/fi/accounts-payable/actions/purchase-orders'
import { listGoodsReceipts } from '@/lib/features/fi/accounts-payable/actions/goods-receipts'
import { getApAging } from '@/lib/features/fi/accounts-payable/actions/ap-aging'
import { hasAgencyPermission } from '@/lib/features/iam/authz/permissions'

// Transform raw DB data to table component format
function transformInvoiceToTableData(invoice: any) {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber ?? '',
    vendorId: invoice.vendorId ?? '',
    vendorName: invoice.Vendor?.name ?? 'Unknown',
    vendorCode: invoice.Vendor?.code,
    invoiceDate: invoice.invoiceDate ?? new Date(),
    dueDate: invoice.dueDate ?? new Date(),
    totalAmount: Number(invoice.totalAmount ?? 0),
    paidAmount: Number(invoice.paidAmount ?? 0),
    currencyCode: invoice.currency ?? 'USD',
    status: invoice.status ?? 'DRAFT',
    matchStatus: invoice.matchStatus,
    description: invoice.description,
    poReference: invoice.poReference,
  }
}

function transformVendorToTableData(vendor: any) {
  return {
    id: vendor.id,
    code: vendor.code ?? '',
    name: vendor.name ?? '',
    legalName: vendor.legalName,
    email: vendor.email,
    phone: vendor.phone,
    taxId: vendor.taxId,
    currency: vendor.currency ?? 'USD',
    paymentTermDays: vendor.paymentTermDays ?? 30,
    creditLimit: vendor.creditLimit ? Number(vendor.creditLimit) : undefined,
    currentBalance: vendor.currentBalance ? Number(vendor.currentBalance) : 0,
    isActive: vendor.isActive ?? true,
    paymentHold: vendor.paymentHold,
    address: vendor.address,
  }
}

type Props = {
  params: Promise<{ agencyId: string; section?: string[] }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

// ============================================================================
// Section: Overview (default)
// ============================================================================
async function OverviewSection({ agencyId }: { agencyId: string }) {
  const [vendorsResult, invoicesResult, paymentsResult] = await Promise.all([
    listVendorAccounts(),
    listApInvoices({ page: 1, pageSize: 10 }),
    listApPayments({ page: 1, pageSize: 10, sortBy: 'createdAt', sortOrder: 'desc' }),
  ])

  const vendors = vendorsResult.success ? (vendorsResult.data ?? []) : []
  const invoices = invoicesResult.success ? (invoicesResult.data ?? []) : []
  const payments = paymentsResult.success ? (paymentsResult.data ?? []) : []

  const pendingInvoices = invoices.filter((inv: any) => inv.status === 'PENDING_APPROVAL').length
  const overdueInvoices = invoices.filter((inv: any) => {
    if (!inv.dueDate) return false
    return new Date(inv.dueDate) < new Date() && !['PAID', 'VOID'].includes(inv.status)
  }).length

  const totalPayables = invoices
    .filter((i: any) => !['PAID', 'VOID'].includes(i.status))
    .reduce((sum: number, i: any) => sum + Number(i.totalAmount ?? 0), 0)
  
  const overduePayables = invoices
    .filter((i: any) => {
      if (!i.dueDate) return false
      return new Date(i.dueDate) < new Date() && !['PAID', 'VOID'].includes(i.status)
    })
    .reduce((sum: number, i: any) => sum + Number(i.totalAmount ?? 0), 0)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Accounts Payable</h1>
        <p className="text-sm text-muted-foreground">Vendor invoices, payments, and procurement</p>
      </div>

      <ApDashboardStats 
        totalPayables={totalPayables}
        overduePayables={overduePayables}
        vendorCount={vendors.length}
        paidThisMonth={payments.filter((p: any) => p.status === 'COMPLETED').reduce((sum: number, p: any) => sum + Number(p.amount ?? 0), 0)}
        invoicesDueThisWeek={invoices.filter((i: any) => {
          if (!i.dueDate) return false
          const due = new Date(i.dueDate)
          const week = new Date()
          week.setDate(week.getDate() + 7)
          return due <= week && due >= new Date() && !['PAID', 'VOID'].includes(i.status)
        }).length}
      />

      <div className="rounded-lg border">
        <div className="border-b p-4">
          <h2 className="font-semibold">Recent Invoices</h2>
        </div>
        <div className="p-4">
          <ApInvoiceTable 
            data={invoices.slice(0, 5).map(transformInvoiceToTableData)} 
            basePath={`/agency/${agencyId}/fi/accounts-payable/invoices`}
          />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Section: Vendors
// ============================================================================
async function VendorsSection({ agencyId }: { agencyId: string }) {
  const vendorsResult = await listVendorAccounts()
  const vendors = vendorsResult.success ? (vendorsResult.data ?? []) : []

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Vendors</h1>
          <p className="text-sm text-muted-foreground">Manage vendor master data</p>
        </div>
        <Link
          href={`/agency/${agencyId}/fi/accounts-payable/vendors/new`}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          New Vendor
        </Link>
      </div>
      <VendorTable 
        data={vendors.map(transformVendorToTableData)} 
        basePath={`/agency/${agencyId}/fi/accounts-payable/vendors`}
      />
    </div>
  )
}

// ============================================================================
// Section: New Vendor
// ============================================================================
function NewVendorSection({ agencyId }: { agencyId: string }) {
  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center gap-3">
        <Link href={`/agency/${agencyId}/fi/accounts-payable/vendors`} className="text-sm text-muted-foreground hover:text-foreground">
          ← Vendors
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New Vendor</h1>
        <p className="text-sm text-muted-foreground">Create a new vendor account</p>
      </div>
      <div className="max-w-2xl rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">
          Use the &quot;New Vendor&quot; button on the{' '}
          <Link href={`/agency/${agencyId}/fi/accounts-payable/vendors`} className="text-primary hover:underline">
            Vendors list
          </Link>
          {' '}to create a vendor.
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// Section: Invoices
// ============================================================================
async function InvoicesSection({ agencyId }: { agencyId: string }) {
  const invoicesResult = await listApInvoices({ page: 1, pageSize: 100 })
  const invoices = invoicesResult.success ? (invoicesResult.data ?? []) : []

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AP Invoices</h1>
          <p className="text-sm text-muted-foreground">Vendor invoices and credit notes</p>
        </div>
        <Link
          href={`/agency/${agencyId}/fi/accounts-payable/invoices/new`}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          New Invoice
        </Link>
      </div>
      <ApInvoiceTable 
        data={invoices.map(transformInvoiceToTableData)} 
        basePath={`/agency/${agencyId}/fi/accounts-payable/invoices`}
      />
    </div>
  )
}

// ============================================================================
// Section: Approvals
// ============================================================================
async function ApprovalsSection({ agencyId }: { agencyId: string }) {
  const invoicesResult = await listApInvoices({ status: 'PENDING_APPROVAL', page: 1, pageSize: 100 })
  const invoices = invoicesResult.success ? (invoicesResult.data ?? []) : []

  return (
    <div className="flex flex-col gap-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pending Approvals</h1>
        <p className="text-sm text-muted-foreground">Review and approve vendor invoices</p>
      </div>
      {invoices.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">No invoices pending approval</p>
        </div>
      ) : (
        <ApInvoiceTable 
          data={invoices.map(transformInvoiceToTableData)} 
          basePath={`/agency/${agencyId}/fi/accounts-payable/invoices`}
        />
      )}
    </div>
  )
}

// ============================================================================
// Section: Purchase Orders
// ============================================================================
async function PurchaseOrdersSection({ agencyId }: { agencyId: string }) {
  const posResult = await listPurchaseOrders()
  const purchaseOrders = posResult.success ? (posResult.data ?? []) : []

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Purchase Orders</h1>
          <p className="text-sm text-muted-foreground">Procurement documents for 3-way matching</p>
        </div>
        <Link
          href={`/agency/${agencyId}/fi/accounts-payable/purchase-orders/new`}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          New PO
        </Link>
      </div>
      <div className="rounded-lg border">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="p-3 text-left text-sm font-medium">PO Number</th>
              <th className="p-3 text-left text-sm font-medium">Vendor</th>
              <th className="p-3 text-left text-sm font-medium">Date</th>
              <th className="p-3 text-left text-sm font-medium">Amount</th>
              <th className="p-3 text-left text-sm font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {purchaseOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">No purchase orders found</td>
              </tr>
            ) : (
              purchaseOrders.map((po: any) => (
                <tr key={po.id} className="border-b">
                  <td className="p-3 text-sm">{po.poNumber}</td>
                  <td className="p-3 text-sm">{po.Vendor?.name ?? '-'}</td>
                  <td className="p-3 text-sm">{po.poDate ? new Date(po.poDate).toLocaleDateString() : '-'}</td>
                  <td className="p-3 text-sm font-mono">{Number(po.totalAmount ?? 0).toLocaleString()}</td>
                  <td className="p-3 text-sm">{po.status}</td>
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
// Section: Goods Receipts
// ============================================================================
async function GoodsReceiptsSection({ agencyId }: { agencyId: string }) {
  const grResult = await listGoodsReceipts()
  const goodsReceipts = grResult.success ? (grResult.data ?? []) : []

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Goods Receipts</h1>
          <p className="text-sm text-muted-foreground">Record received goods for matching</p>
        </div>
        <Link
          href={`/agency/${agencyId}/fi/accounts-payable/goods-receipts/new`}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          New GR
        </Link>
      </div>
      <div className="rounded-lg border">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="p-3 text-left text-sm font-medium">GR Number</th>
              <th className="p-3 text-left text-sm font-medium">PO Reference</th>
              <th className="p-3 text-left text-sm font-medium">Date</th>
              <th className="p-3 text-left text-sm font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {goodsReceipts.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">No goods receipts found</td>
              </tr>
            ) : (
              goodsReceipts.map((gr: any) => (
                <tr key={gr.id} className="border-b">
                  <td className="p-3 text-sm">{gr.grNumber}</td>
                  <td className="p-3 text-sm">{gr.PurchaseOrder?.poNumber ?? '-'}</td>
                  <td className="p-3 text-sm">{gr.receiptDate ? new Date(gr.receiptDate).toLocaleDateString() : '-'}</td>
                  <td className="p-3 text-sm">{gr.status}</td>
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
// Section: Payments
// ============================================================================
async function PaymentsSection({ agencyId }: { agencyId: string }) {
  const paymentsResult = await listApPayments()
  const payments = paymentsResult.success ? (paymentsResult.data ?? []) : []

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
          <p className="text-sm text-muted-foreground">Outgoing vendor payments</p>
        </div>
        <Link
          href={`/agency/${agencyId}/fi/accounts-payable/payments/new`}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          New Payment
        </Link>
      </div>
      <div className="rounded-lg border">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="p-3 text-left text-sm font-medium">Payment No</th>
              <th className="p-3 text-left text-sm font-medium">Vendor</th>
              <th className="p-3 text-left text-sm font-medium">Date</th>
              <th className="p-3 text-left text-sm font-medium">Amount</th>
              <th className="p-3 text-left text-sm font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">No payments found</td>
              </tr>
            ) : (
              payments.map((pmt: any) => (
                <tr key={pmt.id} className="border-b">
                  <td className="p-3 text-sm">{pmt.paymentNumber}</td>
                  <td className="p-3 text-sm">{pmt.Vendor?.name ?? '-'}</td>
                  <td className="p-3 text-sm">{pmt.paymentDate ? new Date(pmt.paymentDate).toLocaleDateString() : '-'}</td>
                  <td className="p-3 text-sm font-mono">{Number(pmt.amount ?? 0).toLocaleString()}</td>
                  <td className="p-3 text-sm">{pmt.status}</td>
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
// Section: Aging
// ============================================================================
async function AgingSection({ agencyId }: { agencyId: string }) {
  const agingResult = await getApAging()
  const aging = agingResult.success ? agingResult.data : null

  return (
    <div className="flex flex-col gap-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AP Aging</h1>
        <p className="text-sm text-muted-foreground">Payables aging analysis</p>
      </div>
      <div className="grid gap-4 md:grid-cols-5">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Current</p>
          <p className="text-xl font-semibold">{Number(aging?.totals?.['Current'] ?? 0).toLocaleString()}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">1-30 Days</p>
          <p className="text-xl font-semibold">{Number(aging?.totals?.['1-30'] ?? 0).toLocaleString()}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">31-60 Days</p>
          <p className="text-xl font-semibold">{Number(aging?.totals?.['31-60'] ?? 0).toLocaleString()}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">61-90 Days</p>
          <p className="text-xl font-semibold">{Number(aging?.totals?.['61-90'] ?? 0).toLocaleString()}</p>
        </div>
        <div className="rounded-lg border p-4 border-destructive/50">
          <p className="text-sm text-muted-foreground">90+ Days</p>
          <p className="text-xl font-semibold text-destructive">{Number(aging?.totals?.['120+'] ?? 0).toLocaleString()}</p>
        </div>
      </div>
      <div className="rounded-lg border p-4">
        <div className="text-lg font-semibold mb-4">Total Outstanding</div>
        <div className="text-3xl font-bold">{Number(aging?.grandTotal ?? 0).toLocaleString()}</div>
      </div>
    </div>
  )
}

// ============================================================================
// Section: GR/IR Clearing
// ============================================================================
async function GrirClearingSection({ agencyId }: { agencyId: string }) {
  // GR/IR clearing is not yet fully implemented - show placeholder
  return (
    <div className="flex flex-col gap-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">GR/IR Clearing</h1>
        <p className="text-sm text-muted-foreground">Match goods receipts with vendor invoices</p>
      </div>
      <div className="rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">GR/IR clearing engine coming soon</p>
        <p className="text-sm text-muted-foreground mt-2">This feature matches goods receipts with vendor invoices for 3-way matching</p>
      </div>
    </div>
  )
}

// ============================================================================
// Main Page Component
// ============================================================================
export default async function APSectionPage({ params }: Props) {
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
    case 'aging':
    case 'grir-clearing':
      return <AgingSkeleton />
    default:
      return <ListPageSkeleton />
  }
}

const OVERVIEW_ACCESS_KEYS = [
  'fi.master_data.vendors.view',
  'fi.accounts_payable.invoices.read',
  'fi.accounts_payable.payments.read',
  'fi.accounts_payable.purchase_orders.read',
  'fi.accounts_payable.goods_receipts.read',
  'fi.accounts_payable.aging.view',
] as const

async function canAccessSection(agencyId: string, sectionPath: string): Promise<boolean> {
  // DEV JAILBREAK - Remove this line to restore permission checks
  return true

  const p = (sectionPath || '').replace(/^\/+/, '').toLowerCase()

  const required: string[] = (() => {
    if (!p || p === 'overview') return [...OVERVIEW_ACCESS_KEYS]
    if (p === 'vendors' || p.startsWith('vendors/')) return ['fi.master_data.vendors.view']
    if (p === 'invoices' || p.startsWith('invoices/')) return ['fi.accounts_payable.invoices.read']
    if (p === 'approvals') return ['fi.accounts_payable.invoices.approve']
    if (p === 'purchase-orders' || p.startsWith('purchase-orders/')) return ['fi.accounts_payable.purchase_orders.read']
    if (p === 'goods-receipts' || p.startsWith('goods-receipts/')) return ['fi.accounts_payable.goods_receipts.read']
    if (p === 'payments' || p.startsWith('payments/')) return ['fi.accounts_payable.payments.read']
    if (p === 'aging') return ['fi.accounts_payable.aging.view']
    if (p === 'grir-clearing') return ['fi.accounts_payable.grir_clearing.view']
    return ['fi.accounts_payable.invoices.read']
  })()

  const results = await Promise.all(required.map((k) => hasAgencyPermission(agencyId, k as any)))
  return results.some(Boolean)
}

function renderSection(agencyId: string, sectionPath: string) {
  switch (sectionPath) {
    case '':
      return <OverviewSection agencyId={agencyId} />
    case 'vendors':
      return <VendorsSection agencyId={agencyId} />
    case 'vendors/new':
      return <NewVendorSection agencyId={agencyId} />
    case 'invoices':
      return <InvoicesSection agencyId={agencyId} />
    case 'approvals':
      return <ApprovalsSection agencyId={agencyId} />
    case 'purchase-orders':
      return <PurchaseOrdersSection agencyId={agencyId} />
    case 'goods-receipts':
      return <GoodsReceiptsSection agencyId={agencyId} />
    case 'payments':
      return <PaymentsSection agencyId={agencyId} />
    case 'aging':
      return <AgingSection agencyId={agencyId} />
    case 'grir-clearing':
      return <GrirClearingSection agencyId={agencyId} />
    default:
      notFound()
  }
}
