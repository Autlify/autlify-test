import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { hasAgencyPermission } from '@/lib/features/iam/authz/permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Layers,
  Plus,
  Building2,
  GitMerge,
  Calendar,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import { listConsolidationSnapshots } from '@/lib/features/fi/general-ledger/actions/consolidation';

type Props = {
  params: Promise<{ agencyId: string }>;
};

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  APPROVED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  VOIDED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
};

export default async function ConsolidationPage({ params }: Props) {
  const { agencyId } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const hasPermission = await hasAgencyPermission(agencyId, 'fi.general_ledger.consolidation.view');
  if (!hasPermission) {
    notFound();
  }

  const snapshotsResult = await listConsolidationSnapshots();
  const snapshotsData = snapshotsResult.success
    ? (snapshotsResult.data as { snapshots?: any[]; total?: number } | any[])
    : [];
  const snapshots: any[] = Array.isArray(snapshotsData)
    ? snapshotsData
    : (snapshotsData?.snapshots || []);

  const draftCount = snapshots.filter((s: any) => s.status === 'DRAFT').length;
  const completedCount = snapshots.filter((s: any) => s.status === 'COMPLETED' || s.status === 'APPROVED').length;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Consolidation</h1>
          <p className="text-muted-foreground">
            Consolidate financial data across entities and subsidiaries
          </p>
        </div>
        <Button asChild>
          <Link href={`/agency/${agencyId}/fi/general-ledger/consolidation/new`}>
            <Plus className="mr-2 h-4 w-4" />
            New Consolidation
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Consolidations</CardTitle>
            <Layers className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftCount}</div>
            <p className="text-xs text-muted-foreground">
              In preparation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground">
              Successfully consolidated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entities</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              SubAccounts in scope
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Consolidation Snapshots */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Consolidation Snapshots</CardTitle>
              <CardDescription>
                Point-in-time snapshots of consolidated financial data
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {snapshots.length > 0 ? (
            <div className="divide-y">
              {snapshots.map((snapshot: any) => (
                <div
                  key={snapshot.id}
                  className="flex items-center justify-between py-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <GitMerge className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{snapshot.name || `Consolidation ${snapshot.id.slice(0, 8)}`}</p>
                      <p className="text-sm text-muted-foreground">
                        Period: {snapshot.periodId || 'N/A'} •{' '}
                        {new Date(snapshot.snapshotDate || snapshot.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={statusColors[snapshot.status] || statusColors.DRAFT}>
                      {snapshot.status}
                    </Badge>
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={`/agency/${agencyId}/fi/general-ledger/consolidation/${snapshot.id}`}
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
              <h3 className="mt-4 text-lg font-semibold">No Consolidations</h3>
              <p className="text-muted-foreground">
                Create your first consolidation snapshot to combine entity financials.
              </p>
              <Button className="mt-4" asChild>
                <Link href={`/agency/${agencyId}/fi/general-ledger/consolidation/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Consolidation
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Consolidation Process Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Consolidation Process</CardTitle>
            <CardDescription>
              Steps to consolidate entity financials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                1
              </div>
              <div>
                <p className="font-medium">Create Snapshot</p>
                <p className="text-sm text-muted-foreground">
                  Select period and entities to consolidate
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                2
              </div>
              <div>
                <p className="font-medium">Review Adjustments</p>
                <p className="text-sm text-muted-foreground">
                  Add elimination entries and adjustments
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                3
              </div>
              <div>
                <p className="font-medium">Eliminate Intercompany</p>
                <p className="text-sm text-muted-foreground">
                  Remove intercompany transactions
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                4
              </div>
              <div>
                <p className="font-medium">Finalize & Approve</p>
                <p className="text-sm text-muted-foreground">
                  Complete consolidation and generate reports
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Consolidation Methods</CardTitle>
            <CardDescription>
              Available consolidation approaches
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border p-3">
              <p className="font-medium">Full Consolidation</p>
              <p className="text-sm text-muted-foreground">
                100% of subsidiary financials with minority interest adjustment
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="font-medium">Proportional Consolidation</p>
              <p className="text-sm text-muted-foreground">
                Proportional share based on ownership percentage
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="font-medium">Equity Method</p>
              <p className="text-sm text-muted-foreground">
                Investment value adjusted for share of profits/losses
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
