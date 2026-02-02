import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { hasAgencyPermission } from '@/lib/features/iam/authz/permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FileX,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  FileCheck,
} from 'lucide-react';
import Link from 'next/link';
import { getOpenItems, getOpenItemsAging } from '@/lib/features/fi/general-ledger/actions/open-items';
import { formatCurrency } from '@/lib/features/fi/general-ledger/utils/helpers';

type Props = {
  params: Promise<{ agencyId: string }>;
  searchParams: Promise<{ status?: string; account?: string; partner?: string }>;
};

const statusColors: Record<string, string> = {
  OPEN: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  CLEARED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  PARTIALLY_CLEARED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
};

export default async function OpenItemsPage({ params, searchParams }: Props) {
  const { agencyId } = await params;
  const { status, account, partner } = await searchParams;

  const session = await auth();
  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const hasPermission = await hasAgencyPermission(agencyId, 'fi.general_ledger.reconciliation.view');
  if (!hasPermission) {
    notFound();
  }

  // Fetch open items with optional filters
  const openItemsResult = await getOpenItems({
    status: status as 'OPEN' | 'CLEARED' | 'PARTIALLY_CLEARED' | undefined,
    pageSize: 50,
    page: 1,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    includeZeroBalance: false,
  });

  const agingResult = await getOpenItemsAging({});

  const openItems = openItemsResult.success ? openItemsResult.data?.items || [] : [];
  const total = openItemsResult.success ? openItemsResult.data?.total || 0 : 0;

  const aging = agingResult.success ? agingResult.data : null;

  const openCount = openItems.filter((item: any) => item.status === 'OPEN').length;
  const partialCount = openItems.filter((item: any) => item.status === 'PARTIALLY_CLEARED').length;
  const clearedCount = openItems.filter((item: any) => item.status === 'CLEARED').length;

  // Calculate total open amounts
  const totalOpenAmount = openItems
    .filter((item: any) => item.status === 'OPEN')
    .reduce((sum: number, item: any) => sum + (Number(item.localRemainingAmount) || 0), 0);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Open Items</h1>
          <p className="text-muted-foreground">
            Manage and clear open item entries for control accounts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/agency/${agencyId}/fi/general-ledger/open-items/aging`}>
              <Clock className="mr-2 h-4 w-4" />
              Aging Analysis
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/agency/${agencyId}/fi/general-ledger/open-items/clear`}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Clear Items
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Items</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openCount}</div>
            <p className="text-xs text-muted-foreground">
              Pending clearing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partially Cleared</CardTitle>
            <FileCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{partialCount}</div>
            <p className="text-xs text-muted-foreground">Have remaining balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cleared</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clearedCount}</div>
            <p className="text-xs text-muted-foreground">Fully settled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Balance</CardTitle>
            <FileX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalOpenAmount)}</div>
            <p className="text-xs text-muted-foreground">Total open amount</p>
          </CardContent>
        </Card>
      </div>

      {/* Aging Summary */}
      {aging && (
        <Card>
          <CardHeader>
            <CardTitle>Aging Summary</CardTitle>
            <CardDescription>
              Open items by age bucket
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">Current</p>
                <p className="text-xl font-bold">{formatCurrency(aging.current || 0)}</p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">1-30 Days</p>
                <p className="text-xl font-bold">{formatCurrency(aging.days1to30 || 0)}</p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">31-60 Days</p>
                <p className="text-xl font-bold">{formatCurrency(aging.days31to60 || 0)}</p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">61-90 Days</p>
                <p className="text-xl font-bold text-orange-500">{formatCurrency(aging.days61to90 || 0)}</p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">90+ Days</p>
                <p className="text-xl font-bold text-red-500">{formatCurrency(aging.over90 || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Open Items List */}
      <Card>
        <CardHeader>
          <CardTitle>Open Items List</CardTitle>
          <CardDescription>
            {total} items total • Showing most recent 50
          </CardDescription>
        </CardHeader>
        <CardContent>
          {openItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Item Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {openItems.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.sourceReference || item.reference || '-'}
                    </TableCell>
                    <TableCell>
                      {item.Account?.accountCode || item.accountId.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      {new Date(item.itemDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {item.dueDate
                        ? new Date(item.dueDate).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.sourceModule}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(Number(item.localAmount) || 0)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(Number(item.localRemainingAmount) || 0)}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[item.status] || statusColors.OPEN}>
                        {item.status?.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          href={`/agency/${agencyId}/fi/general-ledger/open-items/${item.id}`}
                        >
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Open Items</h3>
              <p className="text-muted-foreground">
                Open items are automatically created when posting to control accounts.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Manual Clearing</CardTitle>
            <CardDescription>
              Select and clear matching items manually
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/agency/${agencyId}/fi/general-ledger/open-items/clear`}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Manual Clear
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Auto Clearing</CardTitle>
            <CardDescription>
              Match and clear items automatically by criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href={`/agency/${agencyId}/fi/general-ledger/open-items/auto-clear`}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Run Auto-Clear
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reverse Clearing</CardTitle>
            <CardDescription>
              Undo previous clearing operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href={`/agency/${agencyId}/fi/general-ledger/open-items/reverse`}>
                <FileX className="mr-2 h-4 w-4" />
                Reverse Clearing
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
