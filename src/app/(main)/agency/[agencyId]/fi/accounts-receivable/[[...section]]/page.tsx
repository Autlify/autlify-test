/**
 * FI-AR Catch-All Route
 *
 * Consolidates all AR sections into one dynamic route.
 * Renders existing components directly without intermediate wrappers.
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import Unauthorized from '@/components/unauthorized'
import { OverviewSkeleton, ListPageSkeleton, AgingSkeleton } from '@/components/features/fi/skeletons'

// Existing AR Components
import { CustomerTable, ArInvoiceTable, ArDashboardStats } from '@/components/features/fi/accounts-receivable'
import type { ArInvoiceTableData } from '@/components/features/fi/accounts-receivable/ar-invoice-table'
import type { CustomerTableData } from '@/components/features/fi/accounts-receivable/customer-table'

// Actions for data fetching
import { listCustomerAccounts } from '@/lib/features/fi/accounts-receivable/actions/customer-accounts'
import { listArInvoices } from '@/lib/features/fi/accounts-receivable/actions/ar-invoices'
import { listArReceipts } from '@/lib/features/fi/accounts-receivable/actions/ar-receipts'
import { listSalesOrders } from '@/lib/features/fi/accounts-receivable/actions/sales-orders'
import { getArAging } from '@/lib/features/fi/accounts-receivable/actions/ar-aging'
import { hasAgencyPermission } from '@/lib/features/iam/authz/permissions'

// Transform raw DB data to ArInvoiceTableData format
function transformInvoiceToTableData(invoice: any): ArInvoiceTableData {
  // Map status from DB to table status
  const statusMap: Record<string, ArInvoiceTableData['status']> = {
    DRAFT: 'DRAFT',
    SUBMITTED: 'SENT',
    PENDING_APPROVAL: 'SENT',
    APPROVED: 'SENT',
    POSTED: 'SENT',
    PARTIALLY_PAID: 'PARTIALLY_PAID',
    PAID: 'PAID',
    VOID: 'VOID',
    WRITE_OFF: 'VOID',
  }

  return {
    id: invoice.id,
    invoiceNumber: invoice.documentNumber ?? '',
    customerId: invoice.customerId ?? '',
    customerName: invoice.Customer?.name ?? 'Unknown',
    customerCode: invoice.Customer?.code,
    invoiceDate: invoice.issueDate ?? new Date(),
    dueDate: invoice.dueDate ?? new Date(),
    totalAmount: Number(invoice.totalAmount ?? 0),
    paidAmount: Number(invoice.paidAmount ?? 0),
    currencyCode: invoice.currency ?? 'USD',
    status: statusMap[invoice.status] ?? 'DRAFT',
    description: invoice.description,
  }
}

// Transform raw DB data to CustomerTableData format
function transformCustomerToTableData(customer: any): CustomerTableData {
  // Map isActive to status
  const status: CustomerTableData['status'] = customer.isActive === false 
    ? 'INACTIVE' 
    : customer.creditHold 
      ? 'ON_HOLD' 
      : 'ACTIVE'

  return {
    id: customer.id,
    code: customer.code ?? '',
    name: customer.name ?? '',
    legalName: customer.legalName,
    email: customer.email,
    phone: customer.phone,
    taxId: customer.taxId,
    currency: customer.currency ?? 'USD',
    paymentTermDays: customer.paymentTermDays ?? 30,
    creditLimit: customer.creditLimit ? Number(customer.creditLimit) : undefined,
    totalReceivables: Number(customer.currentBalance ?? 0),
    status,
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
  const [customersResult, invoicesResult] = await Promise.all([
    listCustomerAccounts({ page: 1, pageSize: 10, sortBy: 'createdAt', sortOrder: 'desc' }),
    listArInvoices({ page: 1, pageSize: 10, sortBy: 'createdAt', sortOrder: 'desc' }),
  ])

  const customers = customersResult.success ? (customersResult.data ?? []) : []
  const invoices = invoicesResult.success ? (invoicesResult.data ?? []) : []

  const pendingInvoices = invoices.filter((inv: any) => inv.status === 'PENDING_APPROVAL').length
  const overdueInvoices = invoices.filter((inv: any) => {
    if (!inv.dueDate) return false
    return new Date(inv.dueDate) < new Date() && !['PAID', 'VOID', 'WRITE_OFF'].includes(inv.status)
  }).length

  // Calculate totals for dashboard stats
  const totalReceivables = invoices
    .filter((i: any) => !['PAID', 'VOID', 'WRITE_OFF'].includes(i.status))
    .reduce((sum: number, i: any) => sum + Number(i.remainingAmount ?? i.totalAmount ?? 0), 0)

  const overdueReceivables = invoices
    .filter((i: any) => {
      if (!i.dueDate) return false
      return new Date(i.dueDate) < new Date() && !['PAID', 'VOID', 'WRITE_OFF'].includes(i.status)
    })
    .reduce((sum: number, i: any) => sum + Number(i.remainingAmount ?? i.totalAmount ?? 0), 0)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Accounts Receivable</h1>
        <p className="text-sm text-muted-foreground">Customer invoices, collections, and receipts</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Customers</p>
          <p className="text-2xl font-semibold">{customers.length}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Open Invoices</p>
          <p className="text-2xl font-semibold">{invoices.filter((i: any) => !['PAID', 'VOID', 'WRITE_OFF'].includes(i.status)).length}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Pending Approval</p>
          <p className="text-2xl font-semibold">{pendingInvoices}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Overdue</p>
          <p className="text-2xl font-semibold text-destructive">{overdueInvoices}</p>
        </div>
      </div>

      <ArDashboardStats 
        totalReceivables={totalReceivables}
        overdueReceivables={overdueReceivables}
        customerCount={customers.length}
      />

      <div className="rounded-lg border">
        <div className="border-b p-4">
          <h2 className="font-semibold">Recent Invoices</h2>
        </div>
        <div className="p-4">
          <ArInvoiceTable data={invoices.slice(0, 5).map(transformInvoiceToTableData)} />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Section: Customers
// ============================================================================
async function CustomersSection({ agencyId }: { agencyId: string }) {
  const customersResult = await listCustomerAccounts({ page: 1, pageSize: 20, sortBy: 'createdAt', sortOrder: 'desc' })
  const customers = customersResult.success ? (customersResult.data ?? []) : []

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground">Manage customer master data</p>
        </div>
        <Link
          href={`/agency/${agencyId}/fi/accounts-receivable/customers/new`}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          New Customer
        </Link>
      </div>
      <CustomerTable data={customers.map(transformCustomerToTableData)} />
    </div>
  )
}

// ============================================================================
// Section: Invoices
// ============================================================================
async function InvoicesSection({ agencyId }: { agencyId: string }) {
  const invoicesResult = await listArInvoices({ page: 1, pageSize: 20, sortBy: 'createdAt', sortOrder: 'desc' })
  const invoices = invoicesResult.success ? (invoicesResult.data ?? []) : []

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AR Invoices</h1>
          <p className="text-sm text-muted-foreground">Customer invoices and credit notes</p>
        </div>
        <Link
          href={`/agency/${agencyId}/fi/accounts-receivable/invoices/new`}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          New Invoice
        </Link>
      </div>
      <ArInvoiceTable data={invoices.map(transformInvoiceToTableData)} />
    </div>
  )
}

// ============================================================================
// Section: Approvals
// ============================================================================
async function ApprovalsSection({ agencyId }: { agencyId: string }) {
  const invoicesResult = await listArInvoices({ page: 1, pageSize: 20, sortBy: 'createdAt', sortOrder: 'desc', status: 'PENDING_APPROVAL' })
  const invoices = invoicesResult.success ? (invoicesResult.data ?? []) : []

  return (
    <div className="flex flex-col gap-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pending Approvals</h1>
        <p className="text-sm text-muted-foreground">Review and approve customer invoices</p>
      </div>
      {invoices.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">No invoices pending approval</p>
        </div>
      ) : (
        <ArInvoiceTable data={invoices.map(transformInvoiceToTableData)} />
      )}
    </div>
  )
}

// ============================================================================
// Section: Sales Orders
// ============================================================================
async function SalesOrdersSection({ agencyId }: { agencyId: string }) {
  const sosResult = await listSalesOrders({ page: 1, pageSize: 20 })
  const salesOrders = sosResult.success ? (sosResult.data ?? []) : []

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sales Orders</h1>
          <p className="text-sm text-muted-foreground">Sales orders for billing and delivery</p>
        </div>
        <Link
          href={`/agency/${agencyId}/fi/accounts-receivable/sales-orders/new`}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          New Order
        </Link>
      </div>
      <div className="rounded-lg border">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="p-3 text-left text-sm font-medium">Order No</th>
              <th className="p-3 text-left text-sm font-medium">Customer</th>
              <th className="p-3 text-left text-sm font-medium">Date</th>
              <th className="p-3 text-left text-sm font-medium">Amount</th>
              <th className="p-3 text-left text-sm font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {salesOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">No sales orders found</td>
              </tr>
            ) : (
              salesOrders.map((so: any) => (
                <tr key={so.id} className="border-b">
                  <td className="p-3 text-sm">{so.orderNumber}</td>
                  <td className="p-3 text-sm">{so.Customer?.name ?? '-'}</td>
                  <td className="p-3 text-sm">{so.orderDate ? new Date(so.orderDate).toLocaleDateString() : '-'}</td>
                  <td className="p-3 text-sm font-mono">{Number(so.totalAmount ?? 0).toLocaleString()}</td>
                  <td className="p-3 text-sm">{so.status}</td>
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
// Section: Receipts
// ============================================================================
async function ReceiptsSection({ agencyId }: { agencyId: string }) {
  const receiptsResult = await listArReceipts({ page: 1, pageSize: 20, sortBy: 'createdAt', sortOrder: 'desc' })
  const receipts = receiptsResult.success ? (receiptsResult.data ?? []) : []

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Receipts</h1>
          <p className="text-sm text-muted-foreground">Incoming customer payments</p>
        </div>
        <Link
          href={`/agency/${agencyId}/fi/accounts-receivable/receipts/new`}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          New Receipt
        </Link>
      </div>
      <div className="rounded-lg border">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="p-3 text-left text-sm font-medium">Receipt No</th>
              <th className="p-3 text-left text-sm font-medium">Customer</th>
              <th className="p-3 text-left text-sm font-medium">Date</th>
              <th className="p-3 text-left text-sm font-medium">Amount</th>
              <th className="p-3 text-left text-sm font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {receipts.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">No receipts found</td>
              </tr>
            ) : (
              receipts.map((rcpt: any) => (
                <tr key={rcpt.id} className="border-b">
                  <td className="p-3 text-sm">{rcpt.receiptNumber}</td>
                  <td className="p-3 text-sm">{rcpt.Customer?.name ?? '-'}</td>
                  <td className="p-3 text-sm">{rcpt.receiptDate ? new Date(rcpt.receiptDate).toLocaleDateString() : '-'}</td>
                  <td className="p-3 text-sm font-mono">{Number(rcpt.amount ?? 0).toLocaleString()}</td>
                  <td className="p-3 text-sm">{rcpt.status}</td>
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
// Section: Cash Application
// ============================================================================
async function CashApplicationSection({ agencyId }: { agencyId: string }) {
  // Get unapplied receipts for cash application
  const receiptsResult = await listArReceipts({ page: 1, pageSize: 20, sortBy: 'createdAt', sortOrder: 'desc' })
  const receipts = receiptsResult.success ? (receiptsResult.data ?? []) : []
  const unappliedReceipts = receipts.filter((r: any) => r.status === 'DEPOSITED' || r.status === 'CLEARING')

  return (
    <div className="flex flex-col gap-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Cash Application</h1>
        <p className="text-sm text-muted-foreground">Match receipts to open invoices</p>
      </div>
      <div className="rounded-lg border">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="p-3 text-left text-sm font-medium">Receipt</th>
              <th className="p-3 text-left text-sm font-medium">Customer</th>
              <th className="p-3 text-left text-sm font-medium">Amount</th>
              <th className="p-3 text-left text-sm font-medium">Status</th>
              <th className="p-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {unappliedReceipts.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">No receipts available for application</td>
              </tr>
            ) : (
              unappliedReceipts.map((rcpt: any) => (
                <tr key={rcpt.id} className="border-b">
                  <td className="p-3 text-sm">{rcpt.receiptNumber}</td>
                  <td className="p-3 text-sm">{rcpt.Customer?.name ?? '-'}</td>
                  <td className="p-3 text-sm font-mono">{Number(rcpt.amount ?? 0).toLocaleString()}</td>
                  <td className="p-3 text-sm">{rcpt.status}</td>
                  <td className="p-3 text-sm">
                    <Link 
                      href={`/agency/${agencyId}/fi/accounts-receivable/receipts/${rcpt.id}/apply`}
                      className="text-primary hover:underline"
                    >
                      Apply
                    </Link>
                  </td>
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
  const agingResult = await getArAging()
  const aging = agingResult.success ? agingResult.data : null

  // Extract bucket totals from the aging result
  const bucketTotals = aging?.totals ?? {}

  return (
    <div className="flex flex-col gap-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AR Aging</h1>
        <p className="text-sm text-muted-foreground">Receivables aging analysis as of {aging?.asOfDate ? new Date(aging.asOfDate).toLocaleDateString() : 'today'}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-5">
        {aging?.buckets?.map((bucket, idx) => (
          <div 
            key={bucket.label} 
            className={`rounded-lg border p-4 ${idx === (aging?.buckets?.length ?? 0) - 1 ? 'border-destructive/50' : ''}`}
          >
            <p className="text-sm text-muted-foreground">{bucket.label}</p>
            <p className={`text-xl font-semibold ${idx === (aging?.buckets?.length ?? 0) - 1 ? 'text-destructive' : ''}`}>
              {Number(bucketTotals[bucket.label] ?? 0).toLocaleString()}
            </p>
          </div>
        )) ?? (
          <>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Current</p>
              <p className="text-xl font-semibold">0</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">1-30 Days</p>
              <p className="text-xl font-semibold">0</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">31-60 Days</p>
              <p className="text-xl font-semibold">0</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">61-90 Days</p>
              <p className="text-xl font-semibold">0</p>
            </div>
            <div className="rounded-lg border p-4 border-destructive/50">
              <p className="text-sm text-muted-foreground">90+ Days</p>
              <p className="text-xl font-semibold text-destructive">0</p>
            </div>
          </>
        )}
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">Grand Total</p>
        <p className="text-2xl font-semibold">{Number(aging?.grandTotal ?? 0).toLocaleString()}</p>
      </div>
    </div>
  )
}

// ============================================================================
// Section: Dunning
// ============================================================================
async function DunningSection({ agencyId }: { agencyId: string }) {
  // Get overdue invoices to identify dunning candidates
  const invoicesResult = await listArInvoices({ page: 1, pageSize: 50, sortBy: 'dueDate', sortOrder: 'asc' })
  const invoices = invoicesResult.success ? (invoicesResult.data ?? []) : []
  
  // Filter to overdue invoices only
  const overdueInvoices = invoices.filter((inv: any) => {
    if (!inv.dueDate) return false
    return new Date(inv.dueDate) < new Date() && !['PAID', 'VOID', 'WRITE_OFF'].includes(inv.status)
  })

  // Group by customer for dunning candidates
  const customerMap = new Map<string, { customerId: string; customerName: string; invoices: any[]; totalOverdue: number; maxDaysOverdue: number }>()
  
  for (const inv of overdueInvoices) {
    const custId = inv.customerId
    const daysOverdue = Math.floor((Date.now() - new Date(inv.dueDate).getTime()) / 86_400_000)
    
    if (!customerMap.has(custId)) {
      customerMap.set(custId, {
        customerId: custId,
        customerName: inv.Customer?.name ?? custId,
        invoices: [],
        totalOverdue: 0,
        maxDaysOverdue: 0,
      })
    }
    
    const cust = customerMap.get(custId)!
    cust.invoices.push(inv)
    cust.totalOverdue += Number(inv.remainingAmount ?? inv.totalAmount ?? 0)
    cust.maxDaysOverdue = Math.max(cust.maxDaysOverdue, daysOverdue)
  }
  
  const candidates = Array.from(customerMap.values())

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dunning</h1>
          <p className="text-sm text-muted-foreground">Customers with overdue invoices requiring collection</p>
        </div>
      </div>
      <div className="rounded-lg border">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="p-3 text-left text-sm font-medium">Customer</th>
              <th className="p-3 text-left text-sm font-medium">Overdue Invoices</th>
              <th className="p-3 text-left text-sm font-medium">Total Overdue</th>
              <th className="p-3 text-left text-sm font-medium">Max Days Overdue</th>
            </tr>
          </thead>
          <tbody>
            {candidates.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">No overdue invoices found</td>
              </tr>
            ) : (
              candidates.map((cand) => (
                <tr key={cand.customerId} className="border-b">
                  <td className="p-3 text-sm">{cand.customerName}</td>
                  <td className="p-3 text-sm">{cand.invoices.length}</td>
                  <td className="p-3 text-sm font-mono">{cand.totalOverdue.toLocaleString()}</td>
                  <td className="p-3 text-sm">{cand.maxDaysOverdue}</td>
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
export default async function ARSectionPage({ params }: Props) {
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
    case 'dunning':
    case 'cash-application':
      return <AgingSkeleton />
    default:
      return <ListPageSkeleton />
  }
}

const OVERVIEW_ACCESS_KEYS = [
  'fi.master_data.customers.view',
  'fi.accounts_receivable.invoices.read',
  'fi.accounts_receivable.receipts.read',
  'fi.accounts_receivable.sales_orders.read',
  'fi.accounts_receivable.aging.view',
] as const

async function canAccessSection(agencyId: string, sectionPath: string): Promise<boolean> {
  // DEV JAILBREAK - Remove this line to restore permission checks
  return true

  const p = (sectionPath || '').replace(/^\/+/, '').toLowerCase()

  const required: string[] = (() => {
    if (!p || p === 'overview') return [...OVERVIEW_ACCESS_KEYS]
    if (p === 'customers' || p.startsWith('customers/')) return ['fi.master_data.customers.view']
    if (p === 'invoices' || p.startsWith('invoices/')) return ['fi.accounts_receivable.invoices.read']
    if (p === 'approvals') return ['fi.accounts_receivable.invoices.approve']
    if (p === 'sales-orders' || p.startsWith('sales-orders/')) return ['fi.accounts_receivable.sales_orders.read']
    if (p === 'receipts' || p.startsWith('receipts/')) return ['fi.accounts_receivable.receipts.read']
    if (p === 'cash-application') return ['fi.accounts_receivable.cash_application.view']
    if (p === 'aging') return ['fi.accounts_receivable.aging.view']
    if (p === 'dunning' || p.startsWith('dunning/')) return ['fi.accounts_receivable.dunning.view']
    return ['fi.accounts_receivable.invoices.read']
  })()

  const results = await Promise.all(required.map((k) => hasAgencyPermission(agencyId, k as any)))
  return results.some(Boolean)
}

function renderSection(agencyId: string, sectionPath: string) {
  switch (sectionPath) {
    case '':
      return <OverviewSection agencyId={agencyId} />
    case 'customers':
      return <CustomersSection agencyId={agencyId} />
    case 'invoices':
      return <InvoicesSection agencyId={agencyId} />
    case 'approvals':
      return <ApprovalsSection agencyId={agencyId} />
    case 'sales-orders':
      return <SalesOrdersSection agencyId={agencyId} />
    case 'receipts':
      return <ReceiptsSection agencyId={agencyId} />
    case 'cash-application':
      return <CashApplicationSection agencyId={agencyId} />
    case 'aging':
      return <AgingSection agencyId={agencyId} />
    case 'dunning':
      return <DunningSection agencyId={agencyId} />
    default:
      notFound()
  }
}
