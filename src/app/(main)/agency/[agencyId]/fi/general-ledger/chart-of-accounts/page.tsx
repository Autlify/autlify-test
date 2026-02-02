import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { hasAgencyPermission } from '@/lib/features/iam/authz/permissions';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { ChartOfAccountsTable } from '@/components/fi/general-ledger/chart-of-accounts';
import { listChartOfAccounts } from '@/lib/features/fi/general-ledger/actions/chart-of-accounts';

type Props = {
  params: Promise<{ agencyId: string }>;
};

export default async function ChartOfAccountsPage({ params }: Props) {
  const { agencyId } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const hasPermission = await hasAgencyPermission(agencyId, 'fi.master_data.accounts.view');
  if (!hasPermission) {
    notFound();
  }

  // Get accounts
  const accountsResult = await listChartOfAccounts();
  const accounts = accountsResult.success ? accountsResult.data : [];

  // Check create permission
  const canCreate = await hasAgencyPermission(agencyId, 'fi.master_data.accounts.manage');

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chart of Accounts</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account hierarchy and classifications
          </p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href={`/agency/${agencyId}/fi/general-ledger/chart-of-accounts/new`}>
              <Plus className="mr-2 h-4 w-4" />
              New Account
            </Link>
          </Button>
        )}
      </div>

      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <ChartOfAccountsTable accounts={accounts} agencyId={agencyId} />
      </Suspense>
    </div>
  );
}

