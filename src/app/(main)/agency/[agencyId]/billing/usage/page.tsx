import React from 'react'

// import { UsageClient } from '@/components/billing/usage/usage-client'
import { UsageClient  } from '@autlify/billing-sdk/components'

type Props = { params: Promise<{ agencyId: string }> }

export default async function UsagePage({ params }: Props) {
  const { agencyId } = await params
  return <UsageClient agencyId={agencyId} />
}
