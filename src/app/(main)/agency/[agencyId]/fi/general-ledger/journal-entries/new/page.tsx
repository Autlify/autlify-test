'use server'

import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { hasAgencyPermission } from '@/lib/features/iam/authz/permissions'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { JournalEntryForm } from '../_components/journal-entry-form'
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
  const hasPermission = await hasAgencyPermission(agencyId, 'core.agency.account.read') // TODO: replace with fi.general-ledger.journal.create
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
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">New Journal Entry</h1>
        <p className="text-muted-foreground">
          Create a new journal entry with double-entry accounting
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Journal Entry Details</CardTitle>
          <CardDescription>
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
