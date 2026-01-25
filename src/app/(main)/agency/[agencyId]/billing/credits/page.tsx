import React from 'react'

import { CreditsClient } from '@/components/billing/credits/credits-client'

type Props = { params: Promise<{ agencyId: string }> }

export default async function CreditsPage({ params }: Props) {
  const { agencyId } = await params
  return <CreditsClient agencyId={agencyId} />
}
