import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRequestAccess, ApiAuthzError } from '@/lib/iam/authz/require'

/**
 * @module ADM
 * @method GET 
 * @description List all features with admin controls
 * 
 * Requires: x-autlify-agency or x-autlify-subaccount header
 * Supports: User sessions and API keys
 */

export async function GET(request: Request) {
  try {
    // Secure authorization with header-based context resolution
    await requireRequestAccess({
      req: request,
      requiredKeys: ['core.agency.features.manage'],
      requireActiveSubscription: true,
    })
    
    const features = await db.entitlementFeature.findMany({
      orderBy: [
        { category: 'asc' },
        { displayOrder: 'asc' },
      ],
    })
    
    return NextResponse.json({ features })
  } catch (error) {
    if (error instanceof ApiAuthzError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error fetching features:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
