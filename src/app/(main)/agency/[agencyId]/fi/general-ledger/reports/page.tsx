import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { hasAgencyPermission } from '@/lib/features/iam/authz/permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  FileText,
  PieChart,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  Layers,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

type Props = {
  params: Promise<{ agencyId: string }>;
};

export default async function ReportsPage({ params }: Props) {
  const { agencyId } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const hasPermission = await hasAgencyPermission(agencyId, 'core.agency.account.read');
  if (!hasPermission) {
    notFound();
  }

  const financialReports = [
    {
      id: 'trial-balance',
      title: 'Trial Balance',
      description: 'Summary of all account balances for a period',
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      href: `/agency/${agencyId}/fi/general-ledger/reports/trial-balance`,
    },
    {
      id: 'balance-sheet',
      title: 'Balance Sheet',
      description: 'Statement of financial position at a point in time',
      icon: PieChart,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
      href: `/agency/${agencyId}/fi/general-ledger/reports/balance-sheet`,
    },
    {
      id: 'income-statement',
      title: 'Income Statement',
      description: 'Profit & Loss statement for a period',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      href: `/agency/${agencyId}/fi/general-ledger/reports/income-statement`,
    },
    {
      id: 'general-ledger',
      title: 'General Ledger',
      description: 'Detailed transaction listing by account',
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      href: `/agency/${agencyId}/fi/general-ledger/reports/general-ledger`,
    },
  ];

  const additionalReports = [
    {
      id: 'cash-flow',
      title: 'Cash Flow Statement',
      description: 'Analysis of cash inflows and outflows',
      icon: DollarSign,
      href: `/agency/${agencyId}/fi/general-ledger/reports/cash-flow`,
    },
    {
      id: 'aging',
      title: 'Aging Analysis',
      description: 'AR/AP aging by period buckets',
      icon: Calendar,
      href: `/agency/${agencyId}/fi/general-ledger/reports/aging`,
    },
    {
      id: 'consolidated',
      title: 'Consolidated Reports',
      description: 'Multi-entity consolidated financials',
      icon: Layers,
      href: `/agency/${agencyId}/fi/general-ledger/reports/consolidated`,
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Reports</h1>
          <p className="text-muted-foreground">
            Generate and view financial statements and analysis reports
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/agency/${agencyId}/fi/general-ledger/reports/custom`}>
            <FileText className="mr-2 h-4 w-4" />
            Custom Report Builder
          </Link>
        </Button>
      </div>

      {/* Primary Financial Reports */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Financial Statements</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {financialReports.map((report) => (
            <Card key={report.id} className="transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg ${report.bgColor}`}
                  >
                    <report.icon className={`h-6 w-6 ${report.color}`} />
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={report.href}>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <CardTitle className="mt-4">{report.title}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button size="sm" asChild>
                    <Link href={report.href}>Generate</Link>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Additional Reports */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Additional Reports</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {additionalReports.map((report) => (
            <Card key={report.id} className="transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <report.icon className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">{report.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {report.description}
                </CardDescription>
                <Button variant="outline" size="sm" asChild>
                  <Link href={report.href}>View Report</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Report Scheduling */}
      <Card>
        <CardHeader>
          <CardTitle>Report Scheduling</CardTitle>
          <CardDescription>
            Configure automated report generation and distribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <h3 className="font-medium">Daily Reports</h3>
              <p className="text-sm text-muted-foreground">
                Cash position, transaction summaries
              </p>
              <Button variant="link" className="mt-2 h-auto p-0">
                Configure →
              </Button>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-medium">Weekly Reports</h3>
              <p className="text-sm text-muted-foreground">
                AR/AP aging, expense analysis
              </p>
              <Button variant="link" className="mt-2 h-auto p-0">
                Configure →
              </Button>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-medium">Monthly Reports</h3>
              <p className="text-sm text-muted-foreground">
                Full financial statements, variance analysis
              </p>
              <Button variant="link" className="mt-2 h-auto p-0">
                Configure →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Period Comparison</CardTitle>
            <CardDescription>
              Compare financials across periods
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href={`/agency/${agencyId}/fi/general-ledger/reports/compare?type=mom`}>
                Month-over-Month Comparison
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href={`/agency/${agencyId}/fi/general-ledger/reports/compare?type=yoy`}>
                Year-over-Year Comparison
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href={`/agency/${agencyId}/fi/general-ledger/reports/compare?type=budget`}>
                Budget vs Actual
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export Options</CardTitle>
            <CardDescription>
              Download reports in various formats
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                PDF
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Excel
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                CSV
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Export any report to your preferred format for sharing or analysis
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
