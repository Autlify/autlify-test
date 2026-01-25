import React from 'react'

import { UsageClient } from '@/components/billing/usage/usage-client'

type Props = { params: Promise<{ agencyId: string }> }

export default async function UsagePage({ params }: Props) {
  const { agencyId } = await params
  return <UsageClient agencyId={agencyId} />
}
