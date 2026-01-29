import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { hasAgencyPermission } from '@/lib/features/iam/authz/permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  RefreshCw,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock,
  FileCheck,
} from 'lucide-react';
import Link from 'next/link';
import { listReconciliations } from '@/lib/features/fi/general-ledger/actions/reconciliation';

type Props = {
  params: Promise<{ agencyId: string }>;
};

const statusColors: Record<string, string> = {
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  PENDING_REVIEW: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
};

const typeLabels: Record<string, string> = {
  BANK: 'Bank Reconciliation',
  INTERCOMPANY: 'Intercompany Reconciliation',
  BALANCE: 'Balance Reconciliation',
  SUBLEDGER: 'Subledger Reconciliation',
};

export default async function ReconciliationPage({ params }: Props) {
  const { agencyId } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const hasPermission = await hasAgencyPermission(agencyId, 'core.agency.account.read');
  if (!hasPermission) {
    notFound();
  }

  const reconciliationsResult = await listReconciliations();
  const reconciliationsData = reconciliationsResult.success
    ? (reconciliationsResult.data as { reconciliations?: any[]; total?: number } | any[])
    : [];
  const reconciliations: any[] = Array.isArray(reconciliationsData)
    ? reconciliationsData
    : (reconciliationsData?.reconciliations || []);

  const inProgressCount = reconciliations.filter(
    (r: any) => r.status === 'IN_PROGRESS'
  ).length;
  const completedCount = reconciliations.filter(
    (r: any) => r.status === 'COMPLETED'
  ).length;
  const pendingReviewCount = reconciliations.filter(
    (r: any) => r.status === 'PENDING_REVIEW'
  ).length;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reconciliation</h1>
          <p className="text-muted-foreground">
            Account and bank reconciliation management
          </p>
        </div>
        <Button asChild>
          <Link href={`/agency/${agencyId}/fi/general-ledger/reconciliation/new`}>
            <Plus className="mr-2 h-4 w-4" />
            New Reconciliation
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressCount}</div>
            <p className="text-xs text-muted-foreground">
              Currently being worked on
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <FileCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReviewCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting reviewer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>
      </div>

      {/* Reconciliation List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reconciliations</CardTitle>
          <CardDescription>
            View and manage your reconciliation sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reconciliations.length > 0 ? (
            <div className="divide-y">
              {reconciliations.slice(0, 10).map((recon: any) => (
                <div
                  key={recon.id}
                  className="flex items-center justify-between py-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {typeLabels[recon.type] || recon.type}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Account: {recon.accountCode || recon.accountId} •{' '}
                        {new Date(recon.periodEndDate || recon.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={statusColors[recon.status] || statusColors.IN_PROGRESS}>
                      {recon.status?.replace('_', ' ')}
                    </Badge>
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={`/agency/${agencyId}/fi/general-ledger/reconciliation/${recon.id}`}
                      >
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Reconciliations</h3>
              <p className="text-muted-foreground">
                Start your first reconciliation to ensure account accuracy.
              </p>
              <Button className="mt-4" asChild>
                <Link href={`/agency/${agencyId}/fi/general-ledger/reconciliation/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Start Reconciliation
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bank Reconciliation</CardTitle>
            <CardDescription>
              Match bank statement transactions with GL entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/agency/${agencyId}/fi/general-ledger/reconciliation/new?type=BANK`}>
                Start Bank Reconciliation
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Intercompany Reconciliation</CardTitle>
            <CardDescription>
              Reconcile balances between entities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/agency/${agencyId}/fi/general-ledger/reconciliation/new?type=INTERCOMPANY`}>
                Start Intercompany Reconciliation
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
