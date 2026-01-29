import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { hasAgencyPermission } from '@/lib/features/iam/authz/permissions';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Plus,
  Lock,
  Unlock,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { 
  listFinancialPeriods, 
  getCurrentOpenPeriod 
} from '@/lib/features/fi/general-ledger/actions/periods';

type Props = {
  params: Promise<{ agencyId: string }>;
};

const statusColors: Record<string, string> = {
  OPEN: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  CLOSED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
  LOCKED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  FUTURE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
};

export default async function PeriodsPage({ params }: Props) {
  const { agencyId } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const hasPermission = await hasAgencyPermission(agencyId, 'core.agency.account.read');
  if (!hasPermission) {
    notFound();
  }

  const [periodsResult, currentPeriodResult] = await Promise.all([
    listFinancialPeriods(),
    getCurrentOpenPeriod(),
  ]);

  const periods = periodsResult.success ? periodsResult.data || [] : [];
  const currentPeriod = currentPeriodResult.success ? currentPeriodResult.data : null;

  // Group periods by fiscal year
  const periodsByYear: Record<string, any[]> = periods.reduce((acc: Record<string, any[]>, period: any) => {
    const year = period.fiscalYear;
    if (!acc[year]) acc[year] = [];
    acc[year].push(period);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Periods</h1>
          <p className="text-muted-foreground">
            Manage accounting periods for your fiscal years
          </p>
        </div>
        <Button asChild>
          <Link href={`/agency/${agencyId}/fi/general-ledger/periods/new`}>
            <Plus className="mr-2 h-4 w-4" />
            New Period
          </Link>
        </Button>
      </div>

      {/* Current Period Card */}
      {currentPeriod && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Current Open Period
                </CardTitle>
                <CardDescription>
                  Active period for transaction posting
                </CardDescription>
              </div>
              <Badge className={statusColors['OPEN']}>OPEN</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Period</p>
                <p className="font-semibold">{currentPeriod.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fiscal Year</p>
                <p className="font-semibold">{currentPeriod.fiscalYear}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-semibold">
                  {new Date(currentPeriod.startDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="font-semibold">
                  {new Date(currentPeriod.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Periods by Fiscal Year */}
      <div className="space-y-6">
        {Object.entries(periodsByYear)
          .sort(([a], [b]) => parseInt(b) - parseInt(a))
          .map(([year, yearPeriods]) => (
            <Card key={year}>
              <CardHeader>
                <CardTitle>Fiscal Year {year}</CardTitle>
                <CardDescription>
                  {yearPeriods.length} period(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {yearPeriods
                    .sort((a: any, b: any) => a.periodNumber - b.periodNumber)
                    .map((period: any) => (
                      <div
                        key={period.id}
                        className="flex items-center justify-between py-3"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            {period.status === 'LOCKED' ? (
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Unlock className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{period.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(period.startDate).toLocaleDateString()} -{' '}
                              {new Date(period.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className={statusColors[period.status] || statusColors.FUTURE}>
                            {period.status}
                          </Badge>
                          <Button variant="ghost" size="icon" asChild>
                            <Link
                              href={`/agency/${agencyId}/fi/general-ledger/periods/${period.id}`}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Empty State */}
      {periods.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Periods Found</h3>
            <p className="text-muted-foreground">
              Create your first financial period to start recording transactions.
            </p>
            <Button className="mt-4" asChild>
              <Link href={`/agency/${agencyId}/fi/general-ledger/periods/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Create Period
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
