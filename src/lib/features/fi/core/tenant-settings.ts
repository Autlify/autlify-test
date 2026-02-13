/**
 * Tenant Settings helpers (AgencySettings/SubAccountSettings)
 *
 * Rationale:
 * - Avoid Prisma migrations for early-stage FI features (number ranges, matching rules, etc.)
 * - Stores JSON in public.AgencySettings/SubAccountSettings.settingsJson
 */

import { db } from '@/lib/db'
import type { Prisma } from '@/generated/prisma/client'

export type TenantScope =
  | { kind: 'subaccount'; subAccountId: string }
  | { kind: 'agency'; agencyId: string }

export async function readSettingsJson(scope: TenantScope): Promise<Record<string, unknown>> {
  if (scope.kind === 'subaccount') {
    const row = await db.subAccountSettings.findUnique({
      where: { subAccountId: scope.subAccountId },
      select: { settingsJson: true },
    })
    return (row?.settingsJson as Record<string, unknown>) ?? {}
  }

  const row = await db.agencySettings.findUnique({
    where: { agencyId: scope.agencyId },
    select: { settingsJson: true },
  })
  return (row?.settingsJson as Record<string, unknown>) ?? {}
}

export async function writeSettingsJson(scope: TenantScope, settingsJson: Record<string, unknown>) {
  // Cast to Prisma.InputJsonValue for type compatibility
  const jsonValue = settingsJson as Prisma.InputJsonValue

  if (scope.kind === 'subaccount') {
    await db.subAccountSettings.upsert({
      where: { subAccountId: scope.subAccountId },
      create: { subAccountId: scope.subAccountId, settingsJson: jsonValue },
      update: { settingsJson: jsonValue },
    })
    return
  }

  await db.agencySettings.upsert({
    where: { agencyId: scope.agencyId },
    create: { agencyId: scope.agencyId, settingsJson: jsonValue },
    update: { settingsJson: jsonValue },
  })
}

/**
 * Convenience helper for namespaced settings.
 */
export function getNamespace(settingsJson: Record<string, unknown>, namespace: string) {
  return (settingsJson[namespace] as Record<string, unknown>) ?? {}
}

export function setNamespace(
  settingsJson: Record<string, unknown>,
  namespace: string,
  value: Record<string, unknown>
) {
  return { ...settingsJson, [namespace]: value }
}
