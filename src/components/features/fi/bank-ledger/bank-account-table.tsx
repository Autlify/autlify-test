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
  Filter,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Trash2,
  Wallet,
  X,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'

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
import { cn } from '@/lib/utils'

// ========== Types ==========

export interface BankAccountTableData {
  id: string
  accountCode: string
  accountName: string
  accountNumber: string
  accountNumberMasked?: string
  bankName: string
  currencyCode: string
  accountType: string
  status: 'ACTIVE' | 'INACTIVE' | 'FROZEN' | 'CLOSED' | 'PENDING_ACTIVATION' | 'PENDING_CLOSURE'
  currentBalance: number
  availableBalance: number
  unclearedBalance: number
  connectionType: string
  connectionStatus?: 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'PENDING'
  lastSyncAt?: Date | null
  unreconciledCount?: number
  isDefault?: boolean
  isPrimaryOperating?: boolean
}

interface BankAccountTableProps {
  data: BankAccountTableData[]
  isLoading?: boolean
  onAdd?: () => void
  onEdit?: (account: BankAccountTableData) => void
  onView?: (account: BankAccountTableData) => void
  onDelete?: (accountId: string) => void
  onSync?: (accountId: string) => Promise<void>
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

const getStatusVariant = (status: BankAccountTableData['status']) => {
  const variants = {
    ACTIVE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    INACTIVE: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
    FROZEN: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    CLOSED: 'bg-red-500/20 text-red-400 border-red-500/30',
    PENDING_ACTIVATION: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    PENDING_CLOSURE: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  }
  return variants[status] || variants.INACTIVE
}

const getConnectionVariant = (status?: BankAccountTableData['connectionStatus']) => {
  const variants = {
    CONNECTED: 'bg-emerald-500/20 text-emerald-400',
    DISCONNECTED: 'bg-zinc-500/20 text-zinc-400',
    ERROR: 'bg-red-500/20 text-red-400',
    PENDING: 'bg-amber-500/20 text-amber-400',
  }
  return status ? variants[status] || '' : ''
}

// ========== Column Definitions ==========

const createColumns = (
  onEdit?: (account: BankAccountTableData) => void,
  onView?: (account: BankAccountTableData) => void,
  onDelete?: (accountId: string) => void,
  onSync?: (accountId: string) => Promise<void>
): ColumnDef<BankAccountTableData>[] => [
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
    accessorKey: 'accountCode',
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
      <span className="font-mono text-sm font-medium">{row.getValue('accountCode')}</span>
    ),
  },
  {
    accessorKey: 'accountName',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-8 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        Account Name
        <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => {
      const account = row.original
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600/20 to-purple-600/20">
            <Building2 className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base">{account.accountName}</span>
              {account.isPrimaryOperating && (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] px-1.5">
                  Primary
                </Badge>
              )}
            </div>
            <span className="text-sm text-muted-foreground">{account.bankName}</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'accountNumber',
    header: 'Account No.',
    cell: ({ row }) => {
      const account = row.original
      return (
        <span className="font-mono text-sm text-muted-foreground">
          {account.accountNumberMasked || `****${account.accountNumber.slice(-4)}`}
        </span>
      )
    },
  },
  {
    accessorKey: 'accountType',
    header: 'Type',
    cell: ({ row }) => (
      <Badge variant="outline" className="font-normal capitalize">
        {(row.getValue('accountType') as string).toLowerCase().replace(/_/g, ' ')}
      </Badge>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
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
      const account = row.original
      const balance = account.currentBalance
      const isNegative = balance < 0

      return (
        <div className="text-right">
          <span
            className={cn(
              'text-base font-bold tabular-nums',
              isNegative ? 'text-red-400' : 'text-foreground'
            )}
          >
            {formatCurrency(balance, account.currencyCode)}
          </span>
          {account.unclearedBalance !== 0 && (
            <p className="text-xs text-amber-500 tabular-nums">
              {formatCurrency(account.unclearedBalance, account.currencyCode)} uncleared
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
      const status = row.getValue('status') as BankAccountTableData['status']
      return (
        <Badge variant="outline" className={cn('capitalize', getStatusVariant(status))}>
          {status.toLowerCase().replace(/_/g, ' ')}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'connectionStatus',
    header: 'Connection',
    cell: ({ row }) => {
      const account = row.original
      if (account.connectionType === 'MANUAL') {
        return <span className="text-sm text-muted-foreground">Manual</span>
      }
      return (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={cn('text-xs', getConnectionVariant(account.connectionStatus))}>
            <Zap className="mr-1 h-3 w-3" />
            {account.connectionStatus}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: 'unreconciledCount',
    header: 'Unreconciled',
    cell: ({ row }) => {
      const count = row.getValue('unreconciledCount') as number | undefined
      if (!count || count === 0) {
        return <span className="text-sm text-emerald-400">✓ All clear</span>
      }
      return (
        <Badge variant="secondary" className="bg-amber-500/20 text-amber-400">
          {count} items
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const account = row.original
      const [isSyncing, setIsSyncing] = React.useState(false)

      const handleSync = async () => {
        if (!onSync) return
        setIsSyncing(true)
        try {
          await onSync(account.id)
          toast.success('Account synced successfully')
        } catch {
          toast.error('Failed to sync account')
        } finally {
          setIsSyncing(false)
        }
      }

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
              <DropdownMenuItem onClick={() => onView(account)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(account)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Account
              </DropdownMenuItem>
            )}
            {onSync && account.connectionType !== 'MANUAL' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSync} disabled={isSyncing}>
                  <RefreshCw className={cn('mr-2 h-4 w-4', isSyncing && 'animate-spin')} />
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </DropdownMenuItem>
              </>
            )}
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this account?')) {
                      onDelete(account.id)
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

export function BankAccountTable({
  data,
  isLoading = false,
  onAdd,
  onEdit,
  onView,
  onDelete,
  onSync,
  onExport,
  className,
}: BankAccountTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState('')

  const columns = React.useMemo(
    () => createColumns(onEdit, onView, onDelete, onSync),
    [onEdit, onView, onDelete, onSync]
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

  // Get unique account types for filter
  const accountTypes = React.useMemo(
    () => [...new Set(data.map((d) => d.accountType))],
    [data]
  )

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
              placeholder="Search accounts..."
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

          {/* Type Filter */}
          <Select
            value={(table.getColumn('accountType')?.getFilterValue() as string[])?.join(',') || 'all'}
            onValueChange={(value) => {
              if (value === 'all') {
                table.getColumn('accountType')?.setFilterValue(undefined)
              } else {
                table.getColumn('accountType')?.setFilterValue(value.split(','))
              }
            }}
          >
            <SelectTrigger className="h-10 w-40">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {accountTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.toLowerCase().replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={(table.getColumn('status')?.getFilterValue() as string[])?.join(',') || 'all'}
            onValueChange={(value) => {
              if (value === 'all') {
                table.getColumn('status')?.setFilterValue(undefined)
              } else {
                table.getColumn('status')?.setFilterValue(value.split(','))
              }
            }}
          >
            <SelectTrigger className="h-10 w-36">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.toLowerCase().replace(/_/g, ' ')}
                </SelectItem>
              ))}
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

          {/* Add Account */}
          {onAdd && (
            <Button
              size="sm"
              className="h-10 gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={onAdd}
            >
              <Plus className="h-4 w-4" />
              Add Account
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
              // Loading skeleton
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
                    <Wallet className="h-10 w-10 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">No accounts found</p>
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
          {table.getFilteredRowModel().rows.length} account(s)
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
