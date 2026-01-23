/**
 * Example Implementation - Passkey API Routes
 * 
 * These are example implementations for the passkey API endpoints.
 * Adapt them to your specific needs and authentication setup.
 */

// ============================================================
// 1. POST /api/auth/passkey/register-options
// ============================================================

import { generateRegistrationOptions } from '@simplewebauthn/server';

export async function POST(request: Request) {
  const { userId, userName, userEmail } = await request.json();

  if (!userId || !userName || !userEmail) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Generate registration options
    const options = await generateRegistrationOptions({
      rpID: process.env.NEXT_PUBLIC_RP_ID || 'localhost', // e.g., 'autlify.com'
      rpName: process.env.NEXT_PUBLIC_RP_NAME || 'Autlify',
      userName: userEmail,
      userID: Buffer.from(userId).toString('base64'),
      userDisplayName: userName,
      timeout: 60000,
      attestationType: 'direct',
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
      supportedAlgorithmIDs: [-7, -257], // ES256, RS256
    });

    // Store challenge temporarily (in Redis or session for validation later)
    // await redis.set(`passkey:challenge:${userId}`, options.challenge, 'EX', 600);

    return Response.json(options);
  } catch (error) {
    console.error('Failed to generate registration options:', error);
    return Response.json(
      { error: 'Failed to generate registration options' },
      { status: 500 }
    );
  }
}

// ============================================================
// 2. POST /api/auth/passkey/register-verify
// ============================================================

import { verifyRegistrationResponse } from '@simplewebauthn/server';
import type { RegistrationResponseJSON } from '@simplewebauthn/types';
import { prisma } from '@/lib/db'; // Your Prisma client

export async function POST(request: Request) {
  const { userId, passkeyName, credential } = await request.json();

  if (!userId || !passkeyName || !credential) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Get stored challenge (from Redis/session)
    // const challenge = await redis.get(`passkey:challenge:${userId}`);
    const challenge = 'your-stored-challenge'; // TODO: retrieve from storage

    // Verify the registration response
    const verification = await verifyRegistrationResponse({
      response: credential as RegistrationResponseJSON,
      expectedChallenge: challenge,
      expectedRPID: process.env.NEXT_PUBLIC_RP_ID || 'localhost',
      expectedOrigin: process.env.NEXT_PUBLIC_RP_ORIGIN || 'http://localhost:3000',
    });

    if (!verification.verified) {
      return Response.json({ error: 'Verification failed' }, { status: 400 });
    }

    // Extract credential details
    const {
      id: credentialId,
      publicKey,
      counter,
      transports,
    } = verification.registrationInfo!;

    // Determine device type
    const userAgent = request.headers.get('user-agent') || '';
    let authenticatorType: 'platform' | 'cross-platform' = 'cross-platform';
    let deviceName = passkeyName;

    if (transports?.includes('internal')) {
      authenticatorType = 'platform';
      // Detect device name
      if (userAgent.includes('iPhone')) deviceName = 'iPhone';
      else if (userAgent.includes('iPad')) deviceName = 'iPad';
      else if (userAgent.includes('Mac')) deviceName = 'Mac';
      else if (userAgent.includes('Windows')) deviceName = 'Windows';
      else if (userAgent.includes('Android')) deviceName = 'Android';
    }

    // Save to database
    const passkey = await prisma.passkey.create({
      data: {
        userId,
        credentialId: Buffer.from(credentialId).toString('base64'),
        publicKey: Buffer.from(publicKey).toString('base64'),
        counter,
        name: passkeyName,
        deviceName,
        authenticatorType,
        backupEligible: verification.registrationInfo?.credentialBackedUp ?? false,
        backupState: verification.registrationInfo?.credentialBackedUp ?? false,
      },
    });

    // Clean up stored challenge
    // await redis.del(`passkey:challenge:${userId}`);

    return Response.json({
      success: true,
      passkey: {
        id: passkey.id,
        name: passkey.name,
        deviceName: passkey.deviceName,
        authenticatorType: passkey.authenticatorType,
        createdAt: passkey.createdAt,
        backupEligible: passkey.backupEligible,
      },
    });
  } catch (error) {
    console.error('Failed to verify registration:', error);
    return Response.json(
      { error: 'Failed to verify registration' },
      { status: 500 }
    );
  }
}

// ============================================================
// 3. GET /api/auth/passkey/authenticate-options
// ============================================================

export async function GET(request: Request) {
  try {
    // Get all registered passkeys for the authenticator to choose from
    const passkeys = await prisma.passkey.findMany({
      select: {
        credentialId: true,
      },
    });

    const options = await generateAuthenticationOptions({
      rpID: process.env.NEXT_PUBLIC_RP_ID || 'localhost',
      timeout: 60000,
      userVerification: 'preferred',
      // If you have specific passkeys to authenticate with, add them:
      // allowCredentials: passkeys.map(p => ({
      //   id: Buffer.from(p.credentialId, 'base64'),
      //   type: 'public-key',
      //   transports: ['usb', 'nfc', 'ble', 'internal'],
      // })),
    });

    // Store challenge temporarily
    // await redis.set(`passkey:challenge:auth`, options.challenge, 'EX', 600);

    return Response.json(options);
  } catch (error) {
    console.error('Failed to generate authentication options:', error);
    return Response.json(
      { error: 'Failed to generate authentication options' },
      { status: 500 }
    );
  }
}

// ============================================================
// 4. POST /api/auth/passkey/authenticate-verify
// ============================================================

export async function POST(request: Request) {
  const { credential } = await request.json();

  if (!credential) {
    return Response.json({ error: 'Missing credential' }, { status: 400 });
  }

  try {
    // Get stored challenge
    // const challenge = await redis.get('passkey:challenge:auth');
    const challenge = 'your-stored-challenge';

    // Find the passkey by credential ID
    const passkey = await prisma.passkey.findUnique({
      where: {
        credentialId: Buffer.from(credential.id, 'utf-8').toString('base64'),
      },
      include: { user: true },
    });

    if (!passkey) {
      return Response.json({ error: 'Passkey not found' }, { status: 400 });
    }

    // Verify the authentication response
    const verification = await verifyAuthenticationResponse({
      response: credential as AuthenticationResponseJSON,
      expectedChallenge: challenge,
      expectedRPID: process.env.NEXT_PUBLIC_RP_ID || 'localhost',
      expectedOrigin: process.env.NEXT_PUBLIC_RP_ORIGIN || 'http://localhost:3000',
      authenticator: {
        credentialID: Buffer.from(passkey.credentialId, 'base64'),
        credentialPublicKey: Buffer.from(passkey.publicKey, 'base64'),
        counter: passkey.counter,
        transports: undefined,
      },
    });

    if (!verification.verified) {
      return Response.json({ error: 'Verification failed' }, { status: 400 });
    }

    // Update counter and lastUsedAt
    await prisma.passkey.update({
      where: { id: passkey.id },
      data: {
        counter: verification.authenticationInfo?.newCounter || passkey.counter,
        lastUsedAt: new Date(),
      },
    });

    // Create session/sign user in
    // This depends on your auth setup (NextAuth, Clerk, etc.)
    // Example with NextAuth:
    // await signIn('passkey', { userId: passkey.userId })

    // Clean up challenge
    // await redis.del('passkey:challenge:auth');

    return Response.json({
      success: true,
      userId: passkey.userId,
    });
  } catch (error) {
    console.error('Failed to verify authentication:', error);
    return Response.json(
      { error: 'Failed to verify authentication' },
      { status: 500 }
    );
  }
}

// ============================================================
// 5. DELETE /api/auth/passkey/[id]
// ============================================================

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const passkeyId = params.id;
  const session = await getSession(request); // Your session handler

  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify ownership before deletion
    const passkey = await prisma.passkey.findUnique({
      where: { id: passkeyId },
    });

    if (!passkey || passkey.userId !== session.user.id) {
      return Response.json({ error: 'Passkey not found' }, { status: 404 });
    }

    // Delete passkey
    await prisma.passkey.delete({
      where: { id: passkeyId },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Failed to delete passkey:', error);
    return Response.json(
      { error: 'Failed to delete passkey' },
      { status: 500 }
    );
  }
}

// ============================================================
// 6. GET /api/auth/passkeys
// ============================================================

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  const session = await getSession(request);

  // Verify authorization
  if (!session?.user?.id || session.user.id !== userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const passkeys = await prisma.passkey.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        deviceName: true,
        authenticatorType: true,
        createdAt: true,
        lastUsedAt: true,
        backupEligible: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return Response.json({ passkeys });
  } catch (error) {
    console.error('Failed to fetch passkeys:', error);
    return Response.json(
      { error: 'Failed to fetch passkeys' },
      { status: 500 }
    );
  }
}
