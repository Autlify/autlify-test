import { ReactNode } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { auth } from '@/auth';
import { hasAgencyPermission } from '@/lib/features/iam/authz/permissions';
import { redirect } from 'next/navigation';

export default async function GeneralLedgerLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ agencyId: string }>;
}) {
  const { agencyId } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  // Check permissions for tabs
  const [canViewCOA, canViewJournal, canViewPeriods, canViewReports, canViewSettings] =
    await Promise.all([
        hasAgencyPermission(agencyId, 'core.agency.account.read'),
        hasAgencyPermission(agencyId, 'core.agency.account.read'), // to replace with fi.general-ledger.coa.view
        hasAgencyPermission(agencyId, 'core.agency.account.read'), // to replace with fi.general-ledger.journal.view
        hasAgencyPermission(agencyId, 'core.agency.account.read'), // to replace with fi.general-ledger.periods.view
        hasAgencyPermission(agencyId, 'core.agency.account.read'), // to replace with fi.general-ledger.reports.view
        hasAgencyPermission(agencyId, 'core.agency.account.read'), // to replace with fi.general-ledger.settings.view
    ]);

  return (
    <div className="flex flex-col">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="h-10">
              <TabsTrigger value="overview" asChild>
                <Link href={`/agency/${agencyId}/fi/general-ledger`}>Overview</Link>
              </TabsTrigger>
              {canViewCOA && (
                <TabsTrigger value="coa" asChild>
                  <Link href={`/agency/${agencyId}/fi/general-ledger/chart-of-accounts`}>
                    Chart of Accounts
                  </Link>
                </TabsTrigger>
              )}
              {canViewJournal && (
                <TabsTrigger value="journal" asChild>
                  <Link href={`/agency/${agencyId}/fi/general-ledger/journal-entries`}>
                    Journal Entries
                  </Link>
                </TabsTrigger>
              )}
              {canViewPeriods && (
                <TabsTrigger value="periods" asChild>
                  <Link href={`/agency/${agencyId}/fi/general-ledger/periods`}>
                    Periods
                  </Link>
                </TabsTrigger>
              )}
              {canViewReports && (
                <TabsTrigger value="reports" asChild>
                  <Link href={`/agency/${agencyId}/fi/general-ledger/reports`}>
                    Reports
                  </Link>
                </TabsTrigger>
              )}
              {canViewSettings && (
                <TabsTrigger value="settings" asChild>
                  <Link href={`/agency/${agencyId}/fi/general-ledger/settings`}>
                    Settings
                  </Link>
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>
        </div>
      </div>
      <main className="flex-1">{children}</main>
    </div>
  );
}
