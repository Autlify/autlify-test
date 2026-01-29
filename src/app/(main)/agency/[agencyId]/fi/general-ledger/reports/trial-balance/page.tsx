
import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { hasAgencyPermission } from '@/lib/features/iam/authz/permissions'
import { generateTrialBalance } from '@/lib/features/fi/general-ledger/actions/reports'
import { getFinancialPeriod } from '@/lib/features/fi/general-ledger/actions/periods'
import { TrialBalanceReport } from './_components/trial-balance-report'
import { ReportFilters } from './_components/report-filters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { db } from '@/lib/db'

type Props = {
  params: Promise<{ agencyId: string }>
  searchParams: Promise<{ periodId?: string; asOfDate?: string, currency?: string, includeZeroBalances?: boolean }>
}

export default async function TrialBalancePage({ params, searchParams }: Props) {
  const { agencyId } = await params
  const { periodId, asOfDate, currency, includeZeroBalances } = await searchParams

  const session = await auth()
  if (!session?.user?.id) {
    redirect('/sign-in')
  }

  const hasPermission = await hasAgencyPermission(agencyId, 'fi.general-ledger.reports.view')
  if (!hasPermission) {
    notFound()
  }

  // Get available periods
  const periodsResult = await getFinancialPeriod(periodId!)
  const periods = periodsResult.data ?? []

  // Get trial balance data
  const reportResult = periodId
    ? await generateTrialBalance(periodId) 
    : asOfDate
      ? await generateTrialBalance(asOfDate)
      : currency 
        ? await generateTrialBalance(periodId ? periodId : asOfDate!, { includeZeroBalances: includeZeroBalances ? true : false, currency })
        : null


  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/agency/${agencyId}/fi/general-ledger/reports`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Trial Balance</h1>
          <p className="text-muted-foreground">
            Account balances showing debits and credits
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Report Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportFilters
            reportType="trial-balance"
            periods={periods}
            selectedPeriodId={periodId}
            selectedAsOfDate={asOfDate}
            basePath={`/agency/${agencyId}/fi/general-ledger/reports/trial-balance`}
          />
        </CardContent>
      </Card>

      {/* Report */}
      <Suspense fallback={<ReportSkeleton />}>
        {reportResult?.success && reportResult.data ? (
          <TrialBalanceReport
            data={reportResult.data}
            agencyId={agencyId}
            periodId={periodId}
            asOfDate={asOfDate}
          />
        ) : reportResult && !reportResult.success ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                {reportResult.error ?? 'Failed to load report'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                Select a period or date to generate the report
              </p>
            </CardContent>
          </Card>
        )}
      </Suspense>
    </div>
  )
}

function ReportSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}