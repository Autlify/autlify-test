'use client'

import * as React from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { format, formatDistanceToNow, isBefore, addDays } from 'date-fns'
import {
  AlertCircle,
  ArrowUpDown,
  Ban,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  CreditCard,
  Download,
  Edit,
  Eye,
  FileText,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  X,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

// ========== Types ==========

export interface ArInvoiceTableData {
  id: string
  invoiceNumber: string
  customerId: string
  customerName: string
  customerCode?: string
  invoiceDate: Date
  dueDate: Date
  totalAmount: number
  paidAmount?: number
  currencyCode: string
  status: 'DRAFT' | 'SENT' | 'VIEWED' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'VOID' | 'DISPUTED'
  dunningLevel?: number
  description?: string
  soReference?: string
  href?: string
}

interface ArInvoiceTableProps {
  data: ArInvoiceTableData[]
  isLoading?: boolean
  basePath?: string
  onAdd?: () => void
  onEdit?: (invoice: ArInvoiceTableData) => void
  onView?: (invoice: ArInvoiceTableData) => void
  onSend?: (invoiceId: string) => Promise<void>
  onRecordPayment?: (invoiceId: string) => void
  onVoid?: (invoiceId: string) => Promise<void>
  onExport?: () => void
  className?: string
}

// ========== Helper Functions ==========

const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

const getStatusConfig = (status: ArInvoiceTableData['status']) => {
  const configs = {
    DRAFT: { label: 'Draft', color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30', icon: Edit },
    SENT: { label: 'Sent', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Send },
    VIEWED: { label: 'Viewed', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', icon: Eye },
    PARTIALLY_PAID: { label: 'Partial', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Clock },
    PAID: { label: 'Paid', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: Check },
    OVERDUE: { label: 'Overdue', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: AlertCircle },
    VOID: { label: 'Void', color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30', icon: XCircle },
    DISPUTED: { label: 'Disputed', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Ban },
  }
  return configs[status] || configs.DRAFT
}

const getDueDateStatus = (dueDate: Date, status: ArInvoiceTableData['status']) => {
  if (['PAID', 'VOID'].includes(status)) return null
  
  const now = new Date()
  const warningDate = addDays(now, 7)
  
  if (isBefore(dueDate, now)) {
    return { type: 'overdue', label: 'Overdue', color: 'text-red-400' }
  }
  if (isBefore(dueDate, warningDate)) {
    return { type: 'due-soon', label: 'Due Soon', color: 'text-amber-400' }
  }
  return null
}

// ========== Column Definitions ==========

const createColumns = (
  basePath?: string,
  onEdit?: (invoice: ArInvoiceTableData) => void,
  onView?: (invoice: ArInvoiceTableData) => void,
  onSend?: (invoiceId: string) => Promise<void>,
  onRecordPayment?: (invoiceId: string) => void,
  onVoid?: (invoiceId: string) => Promise<void>,
): ColumnDef<ArInvoiceTableData>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'invoiceNumber',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-8 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        Invoice #
        <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => {
      const invoice = row.original
      const href = invoice.href || (basePath ? `${basePath}/${invoice.id}` : undefined)

      return href ? (
        <Link href={href} className="font-mono text-sm font-semibold hover:underline cursor-pointer text-blue-400">
          {invoice.invoiceNumber}
        </Link>
      ) : (
        <span className="font-mono text-sm font-semibold">{invoice.invoiceNumber}</span>
      )
    },
  },
  {
    accessorKey: 'customerName',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-8 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        Customer
        <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => {
      const invoice = row.original
      return (
        <div>
          <span className="font-medium text-base">{invoice.customerName}</span>
          {invoice.customerCode && (
            <span className="text-sm text-muted-foreground ml-2 font-mono">({invoice.customerCode})</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'invoiceDate',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-8 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        Date
        <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue('invoiceDate') as Date
      return (
        <span className="text-sm text-muted-foreground">
          {format(new Date(date), 'MMM d, yyyy')}
        </span>
      )
    },
  },
  {
    accessorKey: 'dueDate',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-8 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        Due Date
        <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => {
      const invoice = row.original
      const dueDate = new Date(invoice.dueDate)
      const dueDateStatus = getDueDateStatus(dueDate, invoice.status)

      return (
        <div className="flex items-center gap-2">
          <span className={cn('text-sm', dueDateStatus?.color || 'text-muted-foreground')}>
            {format(dueDate, 'MMM d, yyyy')}
          </span>
          {dueDateStatus && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AlertCircle className={cn('h-4 w-4', dueDateStatus.color)} />
                </TooltipTrigger>
                <TooltipContent>
                  {dueDateStatus.type === 'overdue' 
                    ? `Overdue by ${formatDistanceToNow(dueDate)}`
                    : `Due in ${formatDistanceToNow(dueDate)}`
                  }
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'totalAmount',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-8 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        Amount
        <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => {
      const invoice = row.original
      const remaining = invoice.totalAmount - (invoice.paidAmount || 0)

      return (
        <div className="text-right">
          <span className="text-base font-bold tabular-nums">
            {formatCurrency(invoice.totalAmount, invoice.currencyCode)}
          </span>
          {invoice.paidAmount && invoice.paidAmount > 0 && invoice.paidAmount < invoice.totalAmount && (
            <p className="text-xs text-emerald-400 tabular-nums">
              {formatCurrency(invoice.paidAmount, invoice.currencyCode)} received
            </p>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const invoice = row.original
      const config = getStatusConfig(invoice.status)
      const StatusIcon = config.icon

      return (
        <div className="space-y-1">
          <Badge variant="outline" className={cn('gap-1', config.color)}>
            <StatusIcon className="h-3 w-3" />
            {config.label}
          </Badge>
          {invoice.dunningLevel && invoice.dunningLevel > 0 && (
            <p className="text-xs text-amber-400">Dunning L{invoice.dunningLevel}</p>
          )}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value === 'all' ? true : row.getValue(id) === value
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const invoice = row.original
      const [isActioning, setIsActioning] = React.useState(false)

      const handleAction = async (action: () => Promise<void>) => {
        setIsActioning(true)
        try {
          await action()
        } finally {
          setIsActioning(false)
        }
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" disabled={isActioning}>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {onView && (
              <DropdownMenuItem onClick={() => onView(invoice)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
            )}
            {onEdit && invoice.status === 'DRAFT' && (
              <DropdownMenuItem onClick={() => onEdit(invoice)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Invoice
              </DropdownMenuItem>
            )}
            
            {/* Workflow Actions */}
            {onSend && invoice.status === 'DRAFT' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleAction(() => onSend(invoice.id))}>
                  <Send className="mr-2 h-4 w-4 text-blue-400" />
                  Send to Customer
                </DropdownMenuItem>
              </>
            )}
            {onRecordPayment && !['PAID', 'VOID', 'DRAFT'].includes(invoice.status) && (
              <DropdownMenuItem onClick={() => onRecordPayment(invoice.id)}>
                <CreditCard className="mr-2 h-4 w-4 text-emerald-400" />
                Record Payment
              </DropdownMenuItem>
            )}
            {onVoid && !['VOID', 'PAID'].includes(invoice.status) && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => {
                    if (confirm('Are you sure you want to void this invoice?')) {
                      handleAction(() => onVoid(invoice.id))
                    }
                  }}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Void Invoice
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

// ========== Main Component ==========

export function ArInvoiceTable({
  data,
  isLoading = false,
  basePath,
  onAdd,
  onEdit,
  onView,
  onSend,
  onRecordPayment,
  onVoid,
  onExport,
  className,
}: ArInvoiceTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'dueDate', desc: false }])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState('')

  const columns = React.useMemo(
    () => createColumns(basePath, onEdit, onView, onSend, onRecordPayment, onVoid),
    [basePath, onEdit, onView, onSend, onRecordPayment, onVoid]
  )

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: { pageSize: 10 },
    },
  })

  // Get unique statuses for filter
  const statuses = React.useMemo(
    () => [...new Set(data.map((d) => d.status))],
    [data]
  )

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="h-10 pl-9 pr-9"
            />
            {globalFilter && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                onClick={() => setGlobalFilter('')}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {/* Status Filter */}
          <Select
            value={(table.getColumn('status')?.getFilterValue() as string) || 'all'}
            onValueChange={(value) => {
              table.getColumn('status')?.setFilterValue(value === 'all' ? undefined : value)
            }}
          >
            <SelectTrigger className="h-10 w-44">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {getStatusConfig(status).label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {/* Export */}
          {onExport && (
            <Button variant="outline" size="sm" className="h-10" onClick={onExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}

          {/* Create Invoice */}
          {onAdd && (
            <Button
              size="sm"
              className="h-10 gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={onAdd}
            >
              <Plus className="h-4 w-4" />
              Create Invoice
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 bg-card/50 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-white/10 hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-12 bg-white/5">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i} className="border-white/10">
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 w-full animate-pulse rounded bg-white/10" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="border-white/10 transition-colors hover:bg-white/5 data-[state=selected]:bg-white/10"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <FileText className="h-10 w-10 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">No invoices found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <span className="font-medium">
              {table.getFilteredSelectedRowModel().rows.length} of{' '}
            </span>
          )}
          {table.getFilteredRowModel().rows.length} invoice(s)
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-3 text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
