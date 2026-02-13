/**
 * Tenant Settings helpers (AgencySettings/SubAccountSettings)
 *
 * Rationale:
 * - Avoid Prisma migrations for early-stage FI features (number ranges, matching rules, etc.)
 * - Stores JSON in public.AgencySettings/SubAccountSettings.settingsJson
 */

import { db } from '@/lib/db'
import type { Scope } from '@/types/core'


export async function readSettingsJson(scope: Scope): Promise<Record<string, any>> {
    if (scope.kind === 'subaccount') {
        const row = await db.subAccountSettings.findUnique({
            where: { subAccountId: scope.subAccountId },
            select: { settingsJson: true },
        })
        return (row?.settingsJson as Record<string, any>) ?? {}
    }

    const row = await db.agencySettings.findUnique({
        where: { agencyId: scope.agencyId },
        select: { settingsJson: true },
    })
    return (row?.settingsJson as Record<string, any>) ?? {}
}

export async function writeSettingsJson(scope: Scope, settingsJson: Record<string, unknown>): Promise<void> {
    const cleanSettings = settingsJson
        ? Object.fromEntries(
            Object.entries(settingsJson).filter(([_, v]) => v !== undefined)
        ) as Record<string, any>
        : undefined

    if (scope.kind === 'subaccount') {
        await db.subAccountSettings.upsert({
            where: { subAccountId: scope.subAccountId },
            create: { subAccountId: scope.subAccountId, settingsJson: cleanSettings },
            update: { settingsJson: cleanSettings },
        })
        return
    }

    await db.agencySettings.upsert({
        where: { agencyId: scope.agencyId },
        create: { agencyId: scope.agencyId, settingsJson: cleanSettings },
        update: { settingsJson: cleanSettings },
    })
}

/**
 * Convenience helper for namespaced settings.
 */
export function getNamespace(settingsJson: Record<string, unknown>, namespace: string) {
    return (settingsJson[namespace] as Record<string, any>) ?? {}
}

export function setNamespace(
    settingsJson: Record<string, any>,
    namespace: string,
    value: Record<string, any>
) {
    return { ...settingsJson, [namespace]: value }
}
