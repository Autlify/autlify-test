import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { db } from '@/lib/db'
import { grantRecurringCreditsForAgency } from '@/lib/core/billing/credits/grant'

function assertJobSecret(req: NextRequest) {
  const configured = process.env.JOBS_SECRET
  if (!configured) return

  const provided = req.headers.get('x-job-secret') || new URL(req.url).searchParams.get('secret')
  if (provided !== configured) {
    throw new Error('UNAUTHORIZED')
  }
}

export async function POST(req: NextRequest) {
  try {
    assertJobSecret(req)
  } catch {
    return NextResponse.json({ ok: false, reason: 'UNAUTHORIZED' }, { status: 401 })
  }

  const now = new Date()

  const subs = await db.subscription.findMany({
    where: {
      status: { in: ['ACTIVE', 'TRIALING'] },
      currentPeriodEndDate: { gt: now },
    },
    select: { agencyId: true, priceId: true },
  })

  let processed = 0
  for (const s of subs) {
    await grantRecurringCreditsForAgency({ agencyId: s.agencyId || '', planId: s.priceId, now })
    processed += 1
  }

  return NextResponse.json({ ok: true, processed })
}

// Allow GET for quick manual runs.
export async function GET(req: NextRequest) {
  return POST(req)
}
