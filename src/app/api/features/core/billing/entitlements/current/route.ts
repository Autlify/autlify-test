import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { requireRequestAccess, ApiAuthzError } from '@/lib/features/iam/authz/require'
import { logger } from '@/lib/logger'
import type { MeteringScope } from '@/generated/prisma/client'
import { getAgencySubscriptionState } from '@/lib/features/iam/authz/resolver'
import { resolveEffectiveEntitlements } from '@/lib/features/core/billing/entitlements/resolve'

/**
 * GET /api/features/core/billing/entitlements/current
 * Get current effective entitlements for the context
 * 
 * Headers Required:
 * - x-autlify-agency: <agencyId>
 * - x-autlify-subaccount: <subAccountId> (optional)
 * 
 * Permissions: core.billing.entitlements.view
 */
export async function GET(req: NextRequest) {
  try {
    const { scope } = await requireRequestAccess({
      req,
      requiredKeys: ['core.billing.entitlements.view'],
      requireActiveSubscription: true,
    })

    const agencyId = scope.kind === 'agency' ? scope.agencyId : scope.agencyId
    const subAccountId = scope.kind === 'subaccount' ? scope.subAccountId : null
    const meteringScope: MeteringScope = scope.kind === 'subaccount' ? 'SUBACCOUNT' : 'AGENCY'

    const subscriptionState = await getAgencySubscriptionState(agencyId)
    const entitlements = await resolveEffectiveEntitlements({
      scope: meteringScope,
      agencyId,
      subAccountId,
    })

    return NextResponse.json({
      scope: meteringScope,
      agencyId,
      subAccountId,
      subscription: subscriptionState,
      entitlements,
    })
  } catch (error) {
    if (error instanceof ApiAuthzError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }
    logger.error('Error fetching entitlements', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
