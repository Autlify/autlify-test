/**
 * FI Number Range Service (settingsJson-backed)
 *
 * Early-stage implementation: store counters into AgencySettings/SubAccountSettings.settingsJson.
 * Namespace: fi.numberRanges
 */

'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { hasAgencyPermission, hasSubAccountPermission } from '@/lib/features/iam/authz/permissions'
import { ActionKey } from '@/lib/registry'
import {
  reserveDocumentNumber,
  type NumberRangeCounterState,
} from '@/lib/features/fi/general-ledger/utils/number-ranges'
import {
  TenantScope,
  getNamespace,
  readSettingsJson,
} from '@/lib/features/fi/core/tenant-settings'

type ActionResult<T> = { success: boolean; data?: T; error?: string }

type Context = {
  agencyId?: string
  subAccountId?: string
  userId: string
}

const NAMESPACE = 'fi.numberRanges'

const getContext = async (): Promise<Context | null> => {
  const session = await auth()
  if (!session?.user?.id) return null

  const dbSession = await db.session.findFirst({
    where: { userId: session.user.id },
    select: { activeAgencyId: true, activeSubAccountId: true },
  })

  return {
    userId: session.user.id,
    agencyId: dbSession?.activeAgencyId ?? undefined,
    subAccountId: dbSession?.activeSubAccountId ?? undefined,
  }
}

const checkPermission = async (context: Context, permissionKey: ActionKey) => {
  if (context.subAccountId) return hasSubAccountPermission(context.subAccountId, permissionKey)
  if (context.agencyId) return hasAgencyPermission(context.agencyId, permissionKey)
  return false
}

const getScope = (context: Context): TenantScope | null => {
  if (context.subAccountId) return { kind: 'subaccount', subAccountId: context.subAccountId }
  if (context.agencyId) return { kind: 'agency', agencyId: context.agencyId }
  return null
}

const parseState = (value: Record<string, unknown>): NumberRangeCounterState => {
  const counters = (value?.counters as Record<string, number>) ?? {}
  return { counters }
}

/**
 * Read number-range counters.
 */
export const getNumberRangeCounters = async (): Promise<ActionResult<NumberRangeCounterState>> => {
  try {
    const context = await getContext()
    if (!context) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(context, 'fi.configuration.number_ranges.view')
    if (!ok) return { success: false, error: 'Unauthorized: Missing permission' }

    const scope = getScope(context)
    if (!scope) return { success: false, error: 'Tenant context required' }

    const settings = await readSettingsJson(scope)
    const ns = getNamespace(settings, NAMESPACE)
    return { success: true, data: parseState(ns) }
  } catch (e) {
    console.error('getNumberRangeCounters error', e)
    return { success: false, error: 'Failed to read number ranges' }
  }
}

export type NextNumberArgs = Parameters<typeof reserveDocumentNumber>[1]

/**
 * Atomically increments a counter and returns the next document number.
 */
export const nextDocumentNumber = async (
  args: NextNumberArgs
): Promise<ActionResult<{ docNumber: string; sequence: number }>> => {
  try {
    const context = await getContext()
    if (!context) return { success: false, error: 'Unauthorized' }

    const ok = await checkPermission(context, 'fi.configuration.number_ranges.manage')
    if (!ok) return { success: false, error: 'Unauthorized: Missing permission' }

    const scope = getScope(context)
    if (!scope) return { success: false, error: 'Tenant context required' }

    const result = await reserveDocumentNumber(scope, args)

    return { success: true, data: result }
  } catch (e) {
    console.error('nextDocumentNumber error', e)
    return { success: false, error: 'Failed to get next document number' }
  }
}
