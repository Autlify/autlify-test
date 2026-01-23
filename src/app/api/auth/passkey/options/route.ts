import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * @file src/app/api/auth/passkey/options/route.ts
 * @description Check passkey compatibility and availability for user
 * @method GET
 * @query { email: string }
 * @response { canRegister: boolean, canSignIn: boolean, passkeyCount: number }
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { Passkeys: true },
    })

    // User doesn't exist - can't register passkey (user must sign up first)
    if (!user) {
      return NextResponse.json({
        canRegister: false,
        canSignIn: false,
        passkeyCount: 0,
        message: 'User not found',
      })
    }

    // User exists - check passkey status
    const passkeyCount = user.Passkeys.length

    return NextResponse.json({
      canRegister: true, // Can add passkey after signup
      canSignIn: passkeyCount > 0, // Can signin only if has passkeys
      passkeyCount,
      userExists: true,
    })
  } catch (error) {
    console.error('Error checking passkey options:', error)
    return NextResponse.json(
      { error: 'Failed to check passkey options' },
      { status: 500 }
    )
  }
}
