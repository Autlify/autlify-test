import React from 'react'

import Unauthorized from '@/components/unauthorized'
import PageTitle from '@/components/global/page-title'
import { hasAgencyPermission } from '@/lib/features/iam/authz/permissions'
import { BillingNav } from './_components/billing-nav'

type Props = {
  children: React.ReactNode
  params: Promise<{ agencyId: string }>
}

export default async function BillingLayout({ children, params }: Props) {
  const { agencyId } = await params

  // Guard: billing management access
  const canBilling =
    (await hasAgencyPermission(agencyId, 'core.billing.account.view')) ||
    (await hasAgencyPermission(agencyId, 'core.billing.account.manage'))

  if (!canBilling) return <Unauthorized />

  const baseHref = `/agency/${agencyId}/billing`

  return (
    <div className="space-y-4">
      <PageTitle title="Billing" description="Subscription, payment methods, invoices, usage, credits and cost allocation." />
      <BillingNav baseHref={baseHref} />
      {children}
    </div>
  )
}
