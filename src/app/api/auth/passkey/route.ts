/**
 * @file src/app/api/auth/passkey/route.ts
 * @description Initiate passkey flow (signin OR register)
 * @method POST
 * @body { mode: 'signin' | 'register', email: string, userName?: string }
 * @response { token?: string, options: PublicKeyCredentialCreationOptions | PublicKeyCredentialRequestOptions }
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateRegistrationOptions, generateAuthenticationOptions } from '@simplewebauthn/server'
import { createVerificationToken } from '@/lib/queries'
import type { 
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON 
} from '@simplewebauthn/types'

const rpID = process.env.NEXT_PUBLIC_DOMAIN || 'localhost'

export async function POST(req: Request) {
  try {
    const { mode, email, userName } = await req.json()

    if (!mode || !email) {
      return NextResponse.json(
        { error: 'Mode and email are required' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { Passkeys: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please sign up first.' },
        { status: 404 }
      )
    }

    // REGISTER MODE: Generate registration options
    if (mode === 'register') {
      if (!userName) {
        return NextResponse.json(
          { error: 'userName is required for registration' },
          { status: 400 }
        )
      }

      const options: PublicKeyCredentialCreationOptionsJSON = await generateRegistrationOptions({
        rpID,
        rpName: 'Autlify',
        userName: email,
        userID: user.id,
        userDisplayName: userName,
        attestationType: 'direct',
        authenticatorSelection: {
          authenticatorAttachment: undefined,
          residentKey: 'preferred',
          userVerification: 'preferred',
        },
        supportedAlgorithmIDs: [-7, -257],
        excludeCredentials: user.Passkeys.map((pk) => ({
          id: Buffer.from(pk.credentialId, 'base64'),
          type: 'public-key' as const,
        })),
      })

      // Store challenge for verification (15 minutes)
      const token = await createVerificationToken(
        email,
        'passkey',
        15 * 60 * 1000
      )

      return NextResponse.json(
        {
          mode: 'register',
          token: token.token,
          options,
          expiresAt: token.expires,
        },
        { status: 201 }
      )
    }

    // SIGNIN MODE: Generate authentication options
    if (mode === 'signin') {
      if (user.Passkeys.length === 0) {
        return NextResponse.json(
          { error: 'No passkeys found for this user' },
          { status: 404 }
        )
      }

      const options: PublicKeyCredentialRequestOptionsJSON = await generateAuthenticationOptions({
        rpID,
        allowCredentials: user.Passkeys.map((pk) => ({
          id: Buffer.from(pk.credentialId, 'base64'),
          type: 'public-key' as const,
        })),
        userVerification: 'preferred',
      })

      // Store challenge for verification (5 minutes)
      await db.verificationToken.create({
        data: {
          identifier: email,
          token: options.challenge,
          expires: new Date(Date.now() + 5 * 60 * 1000),
        },
      })

      return NextResponse.json(
        {
          mode: 'signin',
          options,
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { error: 'Invalid mode. Use "signin" or "register"' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Passkey flow initiation error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate passkey flow' },
      { status: 500 }
    )
  }
}
