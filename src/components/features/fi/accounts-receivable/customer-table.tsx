'use client'

import * as React from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  ArrowUpDown,
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Edit,
  Eye,
  FileText,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import Link from 'next/link'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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

export interface CustomerTableData {
  id: string
  code: string
  name: string
  legalName?: string
  email?: string
  phone?: string
  taxId?: string
  totalReceivables: number
  overdueReceivables?: number
  creditLimit?: number
  creditUtilization?: number
  currency: string
  paymentTermDays: number
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'ON_HOLD'
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH'
  lastActivityDate?: Date
  href?: string
}

interface CustomerTableProps {
  data: CustomerTableData[]
  isLoading?: boolean
  basePath?: string
  onAdd?: () => void
  onEdit?: (customer: CustomerTableData) => void
  onView?: (customer: CustomerTableData) => void
  onDelete?: (customerId: string) => Promise<void>
  onCreateInvoice?: (customerId: string) => void
  onExport?: () => void
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

const getStatusConfig = (status: CustomerTableData['status']) => {
  const configs = {
    ACTIVE: { label: 'Active', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    INACTIVE: { label: 'Inactive', color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' },
    BLOCKED: { label: 'Blocked', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    ON_HOLD: { label: 'On Hold', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  }
  return configs[status] || configs.ACTIVE
}

const getRiskConfig = (risk?: CustomerTableData['riskLevel']) => {
  if (!risk) return null
  const configs = {
    LOW: { label: 'Low Risk', color: 'text-emerald-400' },
    MEDIUM: { label: 'Medium', color: 'text-amber-400' },
    HIGH: { label: 'High Risk', color: 'text-red-400' },
  }
  return configs[risk]
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join('')
}

// ========== Column Definitions ==========

const createColumns = (
  basePath?: string,
  onEdit?: (customer: CustomerTableData) => void,
  onView?: (customer: CustomerTableData) => void,
  onDelete?: (customerId: string) => Promise<void>,
  onCreateInvoice?: (customerId: string) => void,
): ColumnDef<CustomerTableData>[] => [
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
    accessorKey: 'name',
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
      const customer = row.original
      const href = customer.href || (basePath ? `${basePath}/${customer.id}` : undefined)

      const content = (
        <>
          <Avatar className="h-10 w-10 border border-white/10">
            <AvatarFallback className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-sm font-semibold">
              {getInitials(customer.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <span className={cn('text-base font-semibold', href && 'hover:underline')}>
              {customer.name}
            </span>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-mono">{customer.code}</span>
              {customer.taxId && <span>• {customer.taxId}</span>}
            </div>
          </div>
        </>
      )

      return href ? (
        <Link href={href} className="flex items-center gap-3 cursor-pointer">
          {content}
        </Link>
      ) : (
        <div className="flex items-center gap-3">{content}</div>
      )
    },
  },
  {
    accessorKey: 'contact',
    header: 'Contact',
    cell: ({ row }) => {
      const customer = row.original
      return (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            {customer.email && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={`mailto:${customer.email}`}
                    className="rounded-lg p-2 transition-colors hover:bg-white/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Mail className="h-4 w-4 text-muted-foreground hover:text-blue-400" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>{customer.email}</TooltipContent>
              </Tooltip>
            )}
            {customer.phone && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={`tel:${customer.phone}`}
                    className="rounded-lg p-2 transition-colors hover:bg-white/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Phone className="h-4 w-4 text-muted-foreground hover:text-emerald-400" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>{customer.phone}</TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
          {!customer.email && !customer.phone && (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'totalReceivables',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-8 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        Receivables
        <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => {
      const customer = row.original
      return (
        <div className="text-right">
          <span className="text-base font-bold tabular-nums">
            {formatCurrency(customer.totalReceivables, customer.currency)}
          </span>
          {customer.overdueReceivables && customer.overdueReceivables > 0 && (
            <p className="text-xs text-red-400 tabular-nums">
              {formatCurrency(customer.overdueReceivables, customer.currency)} overdue
            </p>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'creditLimit',
    header: 'Credit',
    cell: ({ row }) => {
      const customer = row.original
      
      if (!customer.creditLimit) {
        return <span className="text-sm text-muted-foreground">Unlimited</span>
      }

      const utilization = customer.creditUtilization || 
        (customer.creditLimit > 0 ? (customer.totalReceivables / customer.creditLimit) * 100 : 0)
      const isNearLimit = utilization > 80
      const isOverLimit = utilization > 100

      return (
        <div className="space-y-1">
          <span className="text-sm tabular-nums">
            {formatCurrency(customer.creditLimit, customer.currency)}
          </span>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  isOverLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-emerald-500'
                )}
                style={{ width: `${Math.min(utilization, 100)}%` }}
              />
            </div>
            <span className={cn(
              'text-xs tabular-nums',
              isOverLimit ? 'text-red-400' : isNearLimit ? 'text-amber-400' : 'text-muted-foreground'
            )}>
              {utilization.toFixed(0)}%
            </span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const customer = row.original
      const config = getStatusConfig(customer.status)
      const riskConfig = getRiskConfig(customer.riskLevel)

      return (
        <div className="space-y-1">
          <Badge variant="outline" className={config.color}>
            {config.label}
          </Badge>
          {riskConfig && (
            <p className={cn('text-xs', riskConfig.color)}>{riskConfig.label}</p>
          )}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value === 'all' ? true : row.getValue(id) === value
    },
  },
  {
    accessorKey: 'paymentTermDays',
    header: 'Terms',
    cell: ({ row }) => {
      const days = row.getValue('paymentTermDays') as number
      return <span className="text-sm text-muted-foreground">Net {days}</span>
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const customer = row.original
      const [isDeleting, setIsDeleting] = React.useState(false)

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" disabled={isDeleting}>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {onView && (
              <DropdownMenuItem onClick={() => onView(customer)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(customer)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Customer
              </DropdownMenuItem>
            )}
            {onCreateInvoice && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onCreateInvoice(customer.id)}>
                  <FileText className="mr-2 h-4 w-4" />
                  Create Invoice
                </DropdownMenuItem>
              </>
            )}
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={async () => {
                    if (confirm(`Delete customer "${customer.name}"?`)) {
                      setIsDeleting(true)
                      await onDelete(customer.id)
                      setIsDeleting(false)
                    }
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
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

export function CustomerTable({
  data,
  isLoading = false,
  basePath,
  onAdd,
  onEdit,
  onView,
  onDelete,
  onCreateInvoice,
  onExport,
  className,
}: CustomerTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState('')

  const columns = React.useMemo(
    () => createColumns(basePath, onEdit, onView, onDelete, onCreateInvoice),
    [basePath, onEdit, onView, onDelete, onCreateInvoice]
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
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      columnVisibility,
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
              placeholder="Search customers..."
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
            <SelectTrigger className="h-10 w-40">
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

          {/* Add Customer */}
          {onAdd && (
            <Button
              size="sm"
              className="h-10 gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={onAdd}
            >
              <Plus className="h-4 w-4" />
              Add Customer
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
                    <Users className="h-10 w-10 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">No customers found</p>
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
          {table.getFilteredRowModel().rows.length} customer(s)
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
