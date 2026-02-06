import 'server-only'

import crypto from 'crypto'

import { db } from '@/lib/db'

export type ApiKeyKind = 'USER' | 'AGENCY' | 'SUBACCOUNT'

export type VerifiedApiKey = {
  id: string
  kind: ApiKeyKind
  ownerUserId: string
  agencyId: string | null
  subAccountId: string | null
  allowedSubAccountIds: string[]
  permissionKeys: string[]
  expiresAt: Date | null
  revokedAt: Date | null
}

export const API_KEY_TOKEN_PREFIX = 'autl_'

const sha256Hex = (input: string): string => {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex')
}

const timingSafeEqualHex = (a: string, b: string): boolean => {
  const ab = Buffer.from(a, 'hex')
  const bb = Buffer.from(b, 'hex')
  if (ab.length !== bb.length) return false
  return crypto.timingSafeEqual(ab, bb)
}

export const parseApiKeyToken = (token: string): { prefix: string; secret: string } | null => {
  const t = token.trim()
  if (!t) return null

  // Preferred format: autl_<prefix>_<secret>
  if (t.startsWith(API_KEY_TOKEN_PREFIX)) {
    const rest = t.slice(API_KEY_TOKEN_PREFIX.length)
    const [prefix, secret] = rest.split('_', 2)
    if (!prefix || !secret) return null
    return { prefix, secret }
  }

  // Fallback format: <prefix>.<secret>
  if (t.includes('.')) {
    const [prefix, secret] = t.split('.', 2)
    if (!prefix || !secret) return null
    return { prefix, secret }
  }

  return null
}

export const verifyApiKeyToken = async (args: {
  token: string
  touchLastUsedAt?: boolean
}): Promise<VerifiedApiKey | null> => {
  const parsed = parseApiKeyToken(args.token)
  if (!parsed) return null

  const record = await db.apiKey.findUnique({
    where: { prefix: parsed.prefix },
    select: {
      id: true,
      kind: true,
      ownerUserId: true,
      agencyId: true,
      subAccountId: true,
      allowedSubAccountIds: true,
      permissionKeys: true,
      secretHash: true,
      expiresAt: true,
      revokedAt: true,
    },
  })

  if (!record) return null
  if (record.revokedAt) return null
  if (record.expiresAt && record.expiresAt.getTime() <= Date.now()) return null

  const computed = sha256Hex(parsed.secret)
  const ok = timingSafeEqualHex(computed, record.secretHash)
  if (!ok) return null

  if (args.touchLastUsedAt ?? true) {
    // best-effort: do not block auth on a write failure
    db.apiKey
      .update({ where: { id: record.id }, data: { lastUsedAt: new Date() } })
      .catch(() => null)
  }

  return {
    id: record.id,
    kind: record.kind as ApiKeyKind,
    ownerUserId: record.ownerUserId,
    agencyId: record.agencyId,
    subAccountId: record.subAccountId,
    allowedSubAccountIds: record.allowedSubAccountIds ?? [],
    permissionKeys: record.permissionKeys ?? [],
    expiresAt: record.expiresAt,
    revokedAt: record.revokedAt,
  }
}

/**
 * Helper for later (creation flow).
 *
 * Token format: autl_<prefix>_<secret>
 */
export const createApiKeyTokenParts = (): { prefix: string; secret: string; token: string } => {
  const prefix = crypto.randomBytes(4).toString('hex') // 8 chars
  const secret = crypto.randomBytes(24).toString('base64url')
  const token = `${API_KEY_TOKEN_PREFIX}${prefix}_${secret}`
  return { prefix, secret, token }
}

export const hashApiKeySecret = (secret: string): string => sha256Hex(secret)
