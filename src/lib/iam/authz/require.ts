import 'server-only'

import { redirect, notFound } from 'next/navigation'
import {
  getAgencySubscriptionState,
  resolveCurrentAgencyContext,
  resolveCurrentSubAccountContext,
} from '@/lib/iam/authz/resolver'
import { getPrincipalFromRequest } from '@/lib/iam/authN/principal'
import { resolveScopeFromHeaders, type ResolvedScope, AutlifyContextError } from '@/lib/iam/authN/context'
import { resolveAgencyContextForUser, resolveSubAccountContextForUser } from '@/lib/iam/authz/resolver'


type FailMode = 'redirect' | 'notFound' | 'throw'

export type RequestAccessContext = {
  scope: ResolvedScope
  principal: { kind: 'user'; userId: string; permissionKeys: string[] } |
  {
    kind: 'apiKey'
    apiKeyId: string
    apiKeyKind: 'USER' | 'AGENCY' | 'SUBACCOUNT'
    ownerUserId: string
    permissionKeys: string[]
  }
}

class AuthzError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthzError'
  }
}

export class ApiAuthzError extends Error {
  status: number
  code: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'INVALID_REQUEST'

  constructor(args: { status: number; code: ApiAuthzError['code']; message: string }) {
    super(args.message)
    this.name = 'ApiAuthzError'
    this.status = args.status
    this.code = args.code
  }
}


const normalize = (k: string) => k.trim()

const fail = (mode: FailMode, redirectTo: string, message: string): never => {
  if (mode === 'notFound') notFound()
  if (mode === 'throw') throw new AuthzError(message)
  redirect(redirectTo)
}

export const requirePermission = async (args: {
  permissionKeys: string[]
  requiredKeys: string[] // all required
  failMode?: FailMode
  redirectTo?: string
}) => {
  const failMode = args.failMode ?? 'redirect'
  const redirectTo = args.redirectTo ?? '/'

  const keys = args.permissionKeys.map(normalize)
  const required = args.requiredKeys.map(normalize).filter(Boolean)

  const ok = required.every((k) => keys.includes(k))
  if (!ok) fail(failMode, redirectTo, `Missing permissions: ${required.join(', ')}`)
}

export const requireAgencyAccess = async (args: {
  agencyId: string
  permissionKey?: string
  permissionKeys?: string[]
  requireActiveSubscription?: boolean
  billingPermissionKey?: string
  failMode?: FailMode
  redirectTo?: string
  subscriptionRedirectTo?: (p: { agencyId: string; canManageBilling: boolean }) => string
}) => {
  const failMode = args.failMode ?? 'redirect'
  const redirectTo = args.redirectTo ?? '/agency/sign-in'
  const billingPermissionKey = args.billingPermissionKey ?? 'agency.billing.update'

  const ctx = await resolveCurrentAgencyContext({ agencyId: args.agencyId })
  if (!ctx) return fail(failMode, redirectTo, 'No agency membership')

  const requiredKeys =
    args.permissionKeys?.length
      ? args.permissionKeys
      : args.permissionKey
        ? [args.permissionKey]
        : ['agency.account.read']

  await requirePermission({
    permissionKeys: ctx?.permissionKeys || [],
    requiredKeys,
    failMode,
    redirectTo,
  })

  const mustHaveActiveSub = args.requireActiveSubscription ?? true
  if (mustHaveActiveSub && ctx.subscriptionState !== 'ACTIVE') {
    const canManageBilling = ctx.permissionKeys.includes(billingPermissionKey)
    const target =
      args.subscriptionRedirectTo?.({ agencyId: ctx.agencyId, canManageBilling }) ??
      (canManageBilling
        ? `/agency/${ctx.agencyId}/billing?action=renew`
        : `/agency/${ctx.agencyId}/subscription`)

    fail('redirect', target, 'Inactive or missing subscription')
  }
  return ctx
}

export const requireSubAccountAccess = async (args: {
  subAccountId: string
  permissionKey?: string
  permissionKeys?: string[]
  requireActiveAgencySubscription?: boolean
  billingPermissionKey?: string
  failMode?: FailMode
  redirectTo?: string
  subscriptionRedirectTo?: (p: { agencyId: string; canManageBilling: boolean }) => string
}) => {
  const failMode = args.failMode ?? 'redirect'
  const redirectTo = args.redirectTo ?? '/agency/sign-in'
  const billingPermissionKey = args.billingPermissionKey ?? 'agency.billing.update'

  const ctx = await resolveCurrentSubAccountContext({ subAccountId: args.subAccountId })
  if (!ctx) return fail(failMode, redirectTo, 'No subaccount membership')

  const requiredKeys =
    args.permissionKeys?.length
      ? args.permissionKeys
      : args.permissionKey
        ? [args.permissionKey]
        : ['subaccount.account.read']

  await requirePermission({
    permissionKeys: ctx.permissionKeys,
    requiredKeys,
    failMode,
    redirectTo,
  })

  const mustHaveActiveAgencySub = args.requireActiveAgencySubscription ?? true
  if (mustHaveActiveAgencySub) {
    const state = await getAgencySubscriptionState(ctx.agencyId)
    if (state !== 'ACTIVE') {
      // Determine billing capability (from agency context, if any).
      const agencyCtx = await resolveCurrentAgencyContext({ agencyId: ctx.agencyId })
      const canManageBilling = !!agencyCtx?.permissionKeys.includes(billingPermissionKey)

      const target =
        args.subscriptionRedirectTo?.({ agencyId: ctx.agencyId, canManageBilling }) ??
        (canManageBilling
          ? `/agency/${ctx.agencyId}/billing?action=renew`
          : `/agency/${ctx.agencyId}/subscription`)

      fail('redirect', target, 'Inactive or missing agency subscription')
    }
  }

  return ctx
}


/**
 * Route-handler helper that enforces:
 * - authentication (user session or API key)
 * - header-based scope resolution
 * - permission checks
 * - (optional) active subscription checks
 */



export const requireRequestAccess = async (args: {
  req: Request
  requiredKeys: string[]
  requireActiveSubscription?: boolean
}): Promise<RequestAccessContext> => {
  const principal = await getPrincipalFromRequest(args.req)
  if (!principal) {
    throw new ApiAuthzError({ status: 401, code: 'UNAUTHENTICATED', message: 'Unauthenticated' })
  }

  let scope: ResolvedScope
  try {
    scope = await resolveScopeFromHeaders({ principal, headers: args.req.headers })
  } catch (e) {
    if (e instanceof AutlifyContextError) {
      throw new ApiAuthzError({
        status: e.status,
        code: e.status === 400 ? 'INVALID_REQUEST' : 'FORBIDDEN',
        message: e.message,
      })
    }
    throw e
  }

  // Permission evaluation
  if (principal.kind === 'user') {
    // Use membership permissions at the resolved scope.
    const membership = scope.kind === 'agency'
      ? await resolveAgencyContextForUser({ userId: principal.userId, agencyId: scope.agencyId })
      : await resolveSubAccountContextForUser({
        userId: principal.userId,
        subAccountId: scope.subAccountId,
      })
    if (!membership) {
      throw new ApiAuthzError({ status: 403, code: 'FORBIDDEN', message: 'No membership' })
    }

    await requirePermission({
      permissionKeys: membership.permissionKeys,
      requiredKeys: args.requiredKeys,
      failMode: 'throw',
      redirectTo: '/',
    })

    if ((args.requireActiveSubscription ?? true) && scope.kind === 'agency') {
      const state = await getAgencySubscriptionState(membership.agencyId)
      if (state !== 'ACTIVE') {
        throw new ApiAuthzError({ status: 402, code: 'FORBIDDEN', message: 'Inactive subscription' })
      }
    }

    if ((args.requireActiveSubscription ?? true) && scope.kind === 'subaccount') {
      const state = await getAgencySubscriptionState(scope.agencyId)
      if (state !== 'ACTIVE') {
        throw new ApiAuthzError({ status: 402, code: 'FORBIDDEN', message: 'Inactive subscription' })
      }
    }

    return {
      scope,
      principal: { kind: 'user', userId: principal.userId, permissionKeys: membership.permissionKeys },
    }
  }

  // API keys: use key permissionKeys, optionally layer in user membership for USER keys.
  if (principal.apiKeyKind === 'USER') {
    const membership = scope.kind === 'agency'
      ? await resolveAgencyContextForUser({ userId: principal.ownerUserId, agencyId: scope.agencyId })
      : await resolveSubAccountContextForUser({
        userId: principal.ownerUserId,
        subAccountId: scope.subAccountId,
      })

    if (!membership) {
      throw new ApiAuthzError({ status: 403, code: 'FORBIDDEN', message: 'No membership' })
    }

    // Defense-in-depth: required keys must be allowed by BOTH the key and the user role.
    await requirePermission({
      permissionKeys: principal.permissionKeys,
      requiredKeys: args.requiredKeys,
      failMode: 'throw',
      redirectTo: '/',
    })
    await requirePermission({
      permissionKeys: membership.permissionKeys,
      requiredKeys: args.requiredKeys,
      failMode: 'throw',
      redirectTo: '/',
    })
  } else {
    await requirePermission({
      permissionKeys: principal.permissionKeys,
      requiredKeys: args.requiredKeys,
      failMode: 'throw',
      redirectTo: '/',
    })
  }

  if ((args.requireActiveSubscription ?? true) && scope.kind === 'agency') {
    const state = await getAgencySubscriptionState(scope.agencyId)
    if (state !== 'ACTIVE') {
      throw new ApiAuthzError({ status: 402, code: 'FORBIDDEN', message: 'Inactive subscription' })
    }
  }
  if ((args.requireActiveSubscription ?? true) && scope.kind === 'subaccount') {
    const state = await getAgencySubscriptionState(scope.agencyId)
    if (state !== 'ACTIVE') {
      throw new ApiAuthzError({ status: 402, code: 'FORBIDDEN', message: 'Inactive subscription' })
    }
  }

  return {
    scope,
    principal: {
      kind: 'apiKey',
      apiKeyId: principal.apiKeyId,
      apiKeyKind: principal.apiKeyKind,
      ownerUserId: principal.ownerUserId,
      permissionKeys: principal.permissionKeys,
    },
  }
}

