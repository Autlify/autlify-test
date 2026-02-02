'use server'

import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { hasAgencyPermission } from '@/lib/features/iam/authz/permissions'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { JournalEntryForm } from '@/components/fi/general-ledger/journal-entries'
import { listChartOfAccounts } from '@/lib/features/fi/general-ledger/actions/chart-of-accounts'
import { listFinancialPeriods } from '@/lib/features/fi/general-ledger/actions/periods'

type Props = {
  params: Promise<{ agencyId: string }>
}

export default async function NewJournalEntryPage({ params }: Props) {
  const { agencyId } = await params

  const session = await auth()
  if (!session?.user?.id) {
    redirect('/sign-in')
  }

  // Check create permission
  const hasPermission = await hasAgencyPermission(agencyId, 'fi.general_ledger.journal_entries.create')
  if (!hasPermission) {
    notFound()
  }

  // Fetch accounts and periods for form dropdowns
  const [accountsResult, periodsResult] = await Promise.all([
    listChartOfAccounts(),
    listFinancialPeriods(),
  ])

  const accounts = accountsResult.success ? accountsResult.data ?? [] : []
  const periods = periodsResult.success ? periodsResult.data ?? [] : []

  // Filter to only open periods
  const openPeriods = periods.filter((p: any) => p.status === 'OPEN')

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="text-2xl font-bold">New Journal Entry</h1>
        <p className="text-sm text-muted-foreground">
          Create a new journal entry with double-entry accounting
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Journal Entry Details</CardTitle>
          <CardDescription className="text-xs">
            Enter the entry details and add debit/credit lines. Total debits must equal total credits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <JournalEntryForm
              agencyId={agencyId}
              accounts={accounts}
              periods={openPeriods}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
