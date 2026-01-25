import { NextResponse } from 'next/server'
import { toggleUserFeature } from '@/lib/core/features/flags'

/**
 * POST /api/features/toggle
 * Toggle a feature for the current user
 */
export async function POST(request: Request) {
  try {
    const { featureKey, enabled } = await request.json()
    
    if (!featureKey || typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }
    
    const result = await toggleUserFeature(featureKey, enabled)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error toggling feature:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
