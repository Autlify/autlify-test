import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { 
  verifyAuthenticationResponse,
  verifyRegistrationResponse 
} from '@simplewebauthn/server'
import type { 
  AuthenticationResponseJSON,
  RegistrationResponseJSON 
} from '@simplewebauthn/types'
import { signIn } from '@/auth'
import { deleteVerificationToken } from '@/lib/queries'

const rpID = process.env.NEXT_PUBLIC_DOMAIN || 'localhost'
const origin = process.env.NEXTAUTH_URL || 'http://localhost:3000'

/**
 * @file src/app/api/auth/passkey/confirm/route.ts
 * @description Confirm action (signin authentication OR registration completion)
 * @method POST
 * @body { mode: 'signin' | 'register', credential: AuthenticationResponseJSON | RegistrationResponseJSON, email?: string, token?: string, deviceName?: string }
 * @response { success: boolean, message: string }
 */
export async function POST(req: Request) {
  try {
    const { mode, credential, email, token, deviceName } = await req.json()

    if (!mode || !credential) {
      return NextResponse.json(
        { error: 'Mode and credential are required' },
        { status: 400 }
      )
    }

    // SIGNIN MODE: Verify signin authentication
    if (mode === 'signin') {
      return await handleSigninConfirmation(credential)
    }

    // REGISTER MODE: Complete passkey registration
    if (mode === 'register') {
      if (!email || !token) {
        return NextResponse.json(
          { error: 'Email and token are required for registration' },
          { status: 400 }
        )
      }
      return await handleRegistrationConfirmation(email, token, credential, deviceName)
    }

    return NextResponse.json(
      { error: 'Invalid mode. Use \"signin\" or \"register\"' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Passkey confirmation error:', error)
    return NextResponse.json(
      { error: 'Failed to confirm action' },
      { status: 500 }
    )
  }
}

/**
 * Handle signin authentication confirmation
 */
async function handleSigninConfirmation(credential: AuthenticationResponseJSON) {
  // Find passkey by credential ID (convert base64url to base64)
  const credentialIdBase64 = Buffer.from(credential.id, 'base64url').toString('base64')
    
    const passkey = await db.passkey.findUnique({
      where: { credentialId: credentialIdBase64 },
      include: { user: true },
    })

    if (!passkey) {
      return NextResponse.json(
        { error: 'Passkey not found' },
        { status: 404 }
      )
    }

    // Get stored challenge
    const challengeRecord = await db.verificationToken.findFirst({
      where: { identifier: passkey.user.email },
      orderBy: { expires: 'desc' },
    })

    if (!challengeRecord || challengeRecord.expires < new Date()) {
      return NextResponse.json(
        { error: 'Challenge not found or expired' },
        { status: 400 }
      )
    }

    // Verify the authentication
    const verification = await verifyAuthenticationResponse({
      response: credential as AuthenticationResponseJSON,
      expectedChallenge: challengeRecord.token,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: Buffer.from(passkey.credentialId, 'base64'),
        credentialPublicKey: Buffer.from(passkey.publicKey, 'base64'),
        counter: passkey.counter,
      },
    })

    if (!verification.verified) {
      return NextResponse.json(
        { error: 'Authentication verification failed' },
        { status: 400 }
      )
    }

    // Check for possible cloning (counter should increase)
    if (verification.authenticationInfo.newCounter <= passkey.counter) {
      console.warn(`⚠️  Possible clone detected for passkey ${passkey.id}`)
      return NextResponse.json(
        { error: 'Security check failed: possible cloning detected' },
        { status: 400 }
      )
    }

    // Update passkey counter and lastUsedAt
    await db.passkey.update({
      where: { id: passkey.id },
      data: {
        counter: verification.authenticationInfo.newCounter,
        lastUsedAt: new Date(),
      },
    })

    // Delete used challenge
    await deleteVerificationToken(challengeRecord.token)

    // Create auto-login token
    const autoLoginToken = Buffer.from(
      Array.from({ length: 32 }, () => Math.floor(Math.random() * 256))
    ).toString('hex')

    await db.verificationToken.create({
      data: {
        identifier: passkey.user.email,
        token: autoLoginToken,
        expires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      },
    })

    // Sign in the user with credentials provider
    await signIn('credentials', {
      email: passkey.user.email,
      password: autoLoginToken,
      redirect: false,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Authentication successful',
      },
      { status: 200 }
    )
}

/**
 * Handle registration completion
 */
async function handleRegistrationConfirmation(
  email: string,
  token: string,
  credential: RegistrationResponseJSON,
  deviceName?: string
) {
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
}
