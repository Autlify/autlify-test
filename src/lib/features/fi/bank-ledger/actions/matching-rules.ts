/**
 * FI Bank Ledger - Statement Matching Rules (settingsJson-backed)
 *
 * Persisted under namespace: `fi.bankLedger.matchingRules`
 */

'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { hasAgencyPermission, hasSubAccountPermission } from '@/lib/features/iam/authz/permissions'
import { KEYS } from '@/lib/registry/keys/permissions'
import { bankMatchingRulesSchema, type BankMatchingRules } from '@/lib/schemas/fi/bank-ledger/matching-rule'
import { getNamespace, setNamespace, type TenantScope, readSettingsJson, writeSettingsJson } from '@/lib/features/fi/core/tenant-settings'

type ActionResult<T> = { success: true; data: T } | { success: false; error: string }

const NAMESPACE = 'fi.bankLedger.matchingRules'

type FiContext = {
  userId: string
  agencyId: string
  subAccountId?: string
}

const getContext = async (): Promise<FiContext | null> => {
  const session = await auth()
  if (!session?.user?.id) return null

  const dbSession = await db.session.findFirst({
    where: { userId: session.user.id },
    select: { activeAgencyId: true, activeSubAccountId: true },
  })

  if (!dbSession?.activeAgencyId) return null

  return {
    userId: session.user.id,
    agencyId: dbSession.activeAgencyId,
    subAccountId: dbSession.activeSubAccountId ?? undefined,
  }
}

const checkPermission = async (ctx: FiContext, key: string) => {
  if (ctx.subAccountId) return hasSubAccountPermission(ctx.subAccountId, key as any)
  return hasAgencyPermission(ctx.agencyId, key as any)
}

const getScope = (ctx: FiContext): TenantScope =>
  ctx.subAccountId
    ? { kind: 'subaccount', subAccountId: ctx.subAccountId }
    : { kind: 'agency', agencyId: ctx.agencyId }

const parseRules = (ns: Record<string, unknown>): BankMatchingRules => {
  const raw = (ns.rules as unknown) ?? []
  // Dates may be serialized; schema doesn't require them.
  return bankMatchingRulesSchema.parse(raw)
}

export const getBankMatchingRules = async (): Promise<ActionResult<BankMatchingRules>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, KEYS.fi.bank_ledger.matching_criteria.view)
    if (!ok) return { success: false, error: 'Missing permission' }

    const settings = await readSettingsJson(getScope(ctx))
    const ns = getNamespace(settings, NAMESPACE)
    const rules = parseRules(ns)
      .slice()
      .sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100))
    return { success: true, data: rules }
  } catch (e) {
    console.error('getBankMatchingRules error', e)
    return { success: false, error: 'Failed to load matching rules' }
  }
}

export const saveBankMatchingRules = async (rules: BankMatchingRules): Promise<ActionResult<BankMatchingRules>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, KEYS.fi.bank_ledger.matching_criteria.manage)
    if (!ok) return { success: false, error: 'Missing permission' }

    const parsed = bankMatchingRulesSchema.parse(rules)

    const scope = getScope(ctx)
    const settings = await readSettingsJson(scope)
    const newSettings = setNamespace(settings, NAMESPACE, { rules: parsed })
    await writeSettingsJson(scope, newSettings)

    return { success: true, data: parsed }
  } catch (e) {
    console.error('saveBankMatchingRules error', e)
    return { success: false, error: 'Failed to save matching rules' }
  }
}

export const deleteBankMatchingRule = async (ruleId: string): Promise<ActionResult<BankMatchingRules>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(ctx, KEYS.fi.bank_ledger.matching_criteria.manage)
    if (!ok) return { success: false, error: 'Missing permission' }

    const scope = getScope(ctx)
    const settings = await readSettingsJson(scope)
    const ns = getNamespace(settings, NAMESPACE)
    const rules = parseRules(ns).filter((r) => r.id !== ruleId)
    const newSettings = setNamespace(settings, NAMESPACE, { rules })
    await writeSettingsJson(scope, newSettings)

    return { success: true, data: rules }
  } catch (e) {
    console.error('deleteBankMatchingRule error', e)
    return { success: false, error: 'Failed to delete matching rule' }
  }
}
