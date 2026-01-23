import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { deleteVerificationToken } from '@/lib/queries'

/**
 * @file src/app/api/auth/passkey/verify/route.ts
 * @description Verify token from action (like email link)
 * @method GET
 * @query { token: string, email: string }
 * @response { valid: boolean, email?: string }
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Token and email are required' },
        { status: 400 }
      )
    }

    // Verify token exists and is not expired
    const tokenRecord = await db.verificationToken.findFirst({
      where: { identifier: email, token },
    })

    if (!tokenRecord || tokenRecord.expires < new Date()) {
      return NextResponse.json(
        { valid: false, error: 'Invalid or expired token' },
        { status: 400 }
      )
    }

    // Token is valid
    return NextResponse.json({
      valid: true,
      email: tokenRecord.identifier,
    })
  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify token' },
      { status: 500 }
    )
  }
}

/**
 * @file src/app/api/auth/passkey/verify/route.ts
 * @description Verify and save new passkey registration
 * @method POST
 * @body { email: string, token: string, credential: RegistrationResponseJSON, deviceName?: string }
 * @response { success: boolean, passkey: Passkey }
 * @deprecated Use GET for token verification, POST /confirm for credential verification
 */
/*
export async function POST(req: Request) {
  try {
    const { email, token, credential, deviceName } = await req.json()

    if (!email || !token || !credential) {
      return NextResponse.json(
        { error: 'Email, token, and credential are required' },
        { status: 400 }
      )
    }

    // Verify token exists and is not expired
    const tokenRecord = await db.verificationToken.findFirst({
      where: { identifier: email, token },
    })

    if (!tokenRecord || tokenRecord.expires < new Date()) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify the registration response
    const verification = await verifyRegistrationResponse({
      response: credential as RegistrationResponseJSON,
      expectedChallenge: tokenRecord.token,
      expectedOrigin: origin,
      expectedRPID: rpID,
    })

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json(
        { error: 'Passkey verification failed' },
        { status: 400 }
      )
    }

    // Save passkey to database
    const passkey = await db.passkey.create({
      data: {
        userId: user.id,
        credentialId: verification.registrationInfo.credentialID.toString(),
        publicKey: Buffer.from(verification.registrationInfo.credentialPublicKey).toString('base64'),
        counter: verification.registrationInfo.counter,
        deviceName: deviceName || 'Unnamed Device',
        name: deviceName || 'Unnamed Device',
        authenticatorType: verification.registrationInfo.credentialDeviceType || 'platform',
        backupEligible: false,
        backupState: false,
      },
    })

    // Delete used token
    await deleteVerificationToken(token)

    return NextResponse.json(
      {
        success: true,
        passkey: {
          id: passkey.id,
          deviceName: passkey.deviceName,
          createdAt: passkey.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Passkey verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify passkey' },
      { status: 500 }
    )
  }
}
*/
