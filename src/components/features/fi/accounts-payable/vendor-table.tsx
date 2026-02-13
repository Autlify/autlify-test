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
  CreditCard,
  Download,
  Edit,
  Eye,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Settings2,
  Trash2,
  X,
} from 'lucide-react'
import Link from 'next/link'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
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

export interface VendorTableData {
  id: string
  code: string
  name: string
  legalName?: string
  email?: string
  phone?: string
  taxId?: string
  currency: string
  paymentTermDays: number
  creditLimit?: number
  currentBalance?: number
  openInvoices?: number
  overdueAmount?: number
  isActive: boolean
  paymentHold?: boolean
  preferredPaymentMethod?: string
  address?: {
    city?: string
    state?: string
    country?: string
  }
  href?: string
}

interface VendorTableProps {
  data: VendorTableData[]
  isLoading?: boolean
  basePath?: string
  onAdd?: () => void
  onEdit?: (vendor: VendorTableData) => void
  onView?: (vendor: VendorTableData) => void
  onDelete?: (vendorId: string) => void
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

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// ========== Column Definitions ==========

const createColumns = (
  basePath?: string,
  onEdit?: (vendor: VendorTableData) => void,
  onView?: (vendor: VendorTableData) => void,
  onDelete?: (vendorId: string) => void,
): ColumnDef<VendorTableData>[] => [
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
    accessorKey: 'code',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-8 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        Code
        <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium">{row.getValue('code')}</span>
    ),
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-8 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        Vendor
        <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => {
      const vendor = row.original
      const href = vendor.href || (basePath ? `${basePath}/${vendor.id}` : undefined)
      
      const content = (
        <>
          <Avatar className="h-11 w-11 border border-white/10">
            <AvatarFallback className="bg-gradient-to-br from-blue-600/30 to-purple-600/30 text-sm font-semibold">
              {getInitials(vendor.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base">{vendor.name}</span>
              {vendor.paymentHold && (
                <Badge variant="destructive" className="text-[10px] px-1.5">
                  Hold
                </Badge>
              )}
            </div>
            {vendor.legalName && vendor.legalName !== vendor.name && (
              <span className="text-sm text-muted-foreground">{vendor.legalName}</span>
            )}
            {vendor.address?.city && (
              <span className="text-sm text-muted-foreground">
                {[vendor.address.city, vendor.address.country].filter(Boolean).join(', ')}
              </span>
            )}
          </div>
        </>
      )

      return href ? (
        <Link href={href} className="flex items-center gap-4 hover:underline cursor-pointer">
          {content}
        </Link>
      ) : (
        <div className="flex items-center gap-4">{content}</div>
      )
    },
  },
  {
    id: 'contact',
    header: 'Contact',
    cell: ({ row }) => {
      const vendor = row.original
      return (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            {vendor.email && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <a href={`mailto:${vendor.email}`}>
                      <Mail className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{vendor.email}</TooltipContent>
              </Tooltip>
            )}
            {vendor.phone && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <a href={`tel:${vendor.phone}`}>
                      <Phone className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{vendor.phone}</TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>
      )
    },
  },
  {
    accessorKey: 'currency',
    header: 'Currency',
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        {row.getValue('currency')}
      </Badge>
    ),
  },
  {
    accessorKey: 'paymentTermDays',
    header: 'Terms',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        Net {row.getValue('paymentTermDays')}
      </span>
    ),
  },
  {
    accessorKey: 'currentBalance',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-8 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        Balance
        <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => {
      const vendor = row.original
      const balance = vendor.currentBalance ?? 0
      const hasOverdue = (vendor.overdueAmount ?? 0) > 0

      return (
        <div className="text-right">
          <span className={cn(
            'text-base font-bold tabular-nums',
            balance > 0 && 'text-rose-400'
          )}>
            {formatCurrency(balance, vendor.currency)}
          </span>
          {hasOverdue && (
            <p className="text-xs text-rose-500 tabular-nums">
              {formatCurrency(vendor.overdueAmount!, vendor.currency)} overdue
            </p>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'openInvoices',
    header: 'Open Invoices',
    cell: ({ row }) => {
      const count = row.getValue('openInvoices') as number | undefined
      if (!count || count === 0) {
        return <span className="text-sm text-muted-foreground">—</span>
      }
      return (
        <Badge variant="secondary" className="tabular-nums">
          {count}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.getValue('isActive') as boolean
      return (
        <Badge variant={isActive ? 'default' : 'secondary'} className={cn(
          isActive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : ''
        )}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value === 'all' ? true : row.getValue(id) === (value === 'active')
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const vendor = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {onView && (
              <DropdownMenuItem onClick={() => onView(vendor)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(vendor)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Vendor
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <CreditCard className="mr-2 h-4 w-4" />
              Create Invoice
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Mail className="mr-2 h-4 w-4" />
              Send Statement
            </DropdownMenuItem>
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this vendor?')) {
                      onDelete(vendor.id)
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

export function VendorTable({
  data,
  isLoading = false,
  basePath,
  onAdd,
  onEdit,
  onView,
  onDelete,
  onExport,
  className,
}: VendorTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState('')

  const columns = React.useMemo(
    () => createColumns(basePath, onEdit, onView, onDelete),
    [basePath, onEdit, onView, onDelete]
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

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search vendors..."
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
            value={(table.getColumn('isActive')?.getFilterValue() as string) || 'all'}
            onValueChange={(value) => {
              table.getColumn('isActive')?.setFilterValue(value === 'all' ? undefined : value)
            }}
          >
            <SelectTrigger className="h-10 w-32">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10">
                <Settings2 className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id.replace(/([A-Z])/g, ' $1').trim()}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export */}
          {onExport && (
            <Button variant="outline" size="sm" className="h-10" onClick={onExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}

          {/* Add Vendor */}
          {onAdd && (
            <Button
              size="sm"
              className="h-10 gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={onAdd}
            >
              <Plus className="h-4 w-4" />
              Add Vendor
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
                    <Building2 className="h-10 w-10 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">No vendors found</p>
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
          {table.getFilteredRowModel().rows.length} vendor(s)
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="h-8 w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 50, 100].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
    </div>
  )
}
