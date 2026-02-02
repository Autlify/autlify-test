import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { hasAgencyPermission } from '@/lib/features/iam/authz/permissions';
import type { ActionKey } from '@/lib/registry';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import Link from 'next/link';
import { listJournalEntries } from '@/lib/features/fi/general-ledger/actions/journal-entries';
import { listFinancialPeriods } from '@/lib/features/fi/general-ledger/actions/periods';
import { listChartOfAccounts } from '@/lib/features/fi/general-ledger/actions/chart-of-accounts';

type Props = {
  params: Promise<{ agencyId: string }>;
};

export default async function GeneralLedgerPage({ params }: Props) {
  const { agencyId } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const hasPermission = await hasAgencyPermission(agencyId, 'fi.master_data.accounts.view');
  if (!hasPermission) {
    notFound();
  }

  // Get summary data
  const [accountsResult, entriesResult, periodsResult] = await Promise.all([
    listChartOfAccounts(),
    listJournalEntries({ status: ['DRAFT', 'PENDING_APPROVAL'] }),
    listFinancialPeriods(),
  ]);

  const accountsCount = accountsResult.success ? accountsResult.data?.length || 0 : 0;
  const pendingEntries = entriesResult.success ? entriesResult.data?.length || 0 : 0;
  const openPeriods =
    periodsResult.success
      ? periodsResult.data?.filter((p: any) => p.status === 'OPEN').length || 0
      : 0;

  const quickLinks = [
    {
      title: 'Chart of Accounts',
      description: 'Manage your account hierarchy',
      href: `/agency/${agencyId}/fi/general-ledger/chart-of-accounts`,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      permission: 'fi.master_data.accounts.view',
    },
    {
      title: 'Journal Entries',
      description: 'Create and manage journal entries',
      href: `/agency/${agencyId}/fi/general-ledger/journal-entries`,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
      permission: 'fi.general_ledger.journal_entries.read',
    },
    {
      title: 'Financial Periods',
      description: 'Manage accounting periods',
      href: `/agency/${agencyId}/fi/general-ledger/periods`,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      permission: 'fi.configuration.fiscal_years.view',
    },
    {
      title: 'Reports',
      description: 'Financial statements and reports',
      href: `/agency/${agencyId}/fi/general-ledger/reports`,
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      permission: 'fi.general_ledger.reports.view',
    },
    {
      title: 'Settings',
      description: 'Configure GL settings',
      href: `/agency/${agencyId}/fi/general-ledger/settings`,
      icon: Settings,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-950',
      permission: 'fi.general_ledger.settings.view',
    },
  ];

  // Filter links based on permissions
  const accessibleLinks = await Promise.all(
    quickLinks.map(async (link) => ({
      ...link,
      hasAccess: await hasAgencyPermission(agencyId, link.permission as ActionKey),
    }))
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">General Ledger</h1>
          <p className="text-sm text-muted-foreground">
            Manage your financial accounting and reporting
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accountsCount}</div>
            <p className="text-xs text-muted-foreground">Active accounts in COA</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Entries</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingEntries}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting review or approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Periods</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openPeriods}</div>
            <p className="text-xs text-muted-foreground">
              Available for transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Quick Access</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {accessibleLinks
            .filter((link) => link.hasAccess)
            .map((link) => (
              <Link key={link.href} href={link.href}>
                <Card className="transition-all hover:shadow-md hover:border-primary/50">
                  <CardHeader className="p-4">
                    <div
                      className={`mb-2 flex h-10 w-10 items-center justify-center rounded-lg ${link.bgColor}`}
                    >
                      <link.icon className={`h-5 w-5 ${link.color}`} />
                    </div>
                    <CardTitle className="text-base">{link.title}</CardTitle>
                    <CardDescription className="text-xs">{link.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
        </div>
      </div>

      {/* Recent Activity / Helpful Resources */}
      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Getting Started</CardTitle>
            <CardDescription className="text-xs">Quick setup guide for FI-GL</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5 pt-0">
            <div className="flex items-start gap-2">
              <div className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
              <div>
                <p className="text-sm font-medium">
                  1. Configure GL Settings
                </p>
                <p className="text-xs text-muted-foreground">
                  Set your base currency and fiscal year
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
              <div>
                <p className="text-sm font-medium">
                  2. Set Up Chart of Accounts
                </p>
                <p className="text-xs text-muted-foreground">
                  Create or import your account structure
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
              <div>
                <p className="text-sm font-medium">
                  3. Create Financial Periods
                </p>
                <p className="text-xs text-muted-foreground">
                  Define your accounting periods
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1 h-2 w-2 rounded-full bg-gray-400" />
              <div>
                <p className="text-sm font-medium">
                  4. Start Recording Transactions
                </p>
                <p className="text-xs text-muted-foreground">
                  Create journal entries for financial events
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Key Features</CardTitle>
            <CardDescription className="text-xs">What you can do with FI-GL</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5 pt-0 text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span>Multi-currency transaction support</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span>Double-entry bookkeeping validation</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-green-600" />
              <span>Financial statements & reports</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-600" />
              <span>Period close & lock functionality</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
