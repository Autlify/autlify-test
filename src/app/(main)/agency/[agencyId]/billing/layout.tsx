import React from 'react'

import Unauthorized from '@/components/unauthorized'
import { hasPermission } from '@/lib/features/iam/authz/permissions'
import { BillingNav } from './_components/billing-nav'
import { Separator } from '@/components/ui/separator'

type Props = {
  children: React.ReactNode
  params: Promise<{ agencyId: string }>
}

export default async function BillingLayout({ children, params }: Props) {
  const { agencyId } = await params

  // Guard: billing management access (supports legacy + newer keys)
  const canBilling =
    (await hasPermission('core.billing.account.read')) ||
    (await hasPermission('core.billing.account.manage')) ||
    (await hasPermission('core.billing.account.manage')) ||
    (await hasPermission('core.billing.account.update'))

  if (!canBilling) return <Unauthorized />

  const baseHref = `/agency/${agencyId}/billing`

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Billing</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Subscription, payment methods, invoices, usage, credits and cost allocation.
            </p>
          </div>
        </div>
        <Separator />
        <BillingNav baseHref={baseHref} />
      </div>

      {children}
    </div>
  )
}
