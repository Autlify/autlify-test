import 'server-only'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import type { Permission } from '@/generated/prisma/client'

type PermissionKey = string

const normalizeKey = (k: string) => k.trim()

export const getAuthUserMemberships = async () => {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return null

  return db.user.findUnique({
    where: { id: userId },
    include: {
      AgencyMemberships: {
        where: { isActive: true },
        include: {
          Agency: true,
          Role: {
            include: {
              Permissions: {
                where: { granted: true },
                include: { Permission: true },
              },
            },
          },
        },
      },
      SubAccountMemberships: {
        where: { isActive: true },
        include: {
          SubAccount: true,
          Role: {
            include: {
              Permissions: {
                where: { granted: true },
                include: { Permission: true },
              },
            },
          },
        },
      },
    },
  })
}

export const getUserPermissions = async (): Promise<Permission[]> => {
  const user = await getAuthUserMemberships()
  if (!user) return []

  const agencyPerms = user.AgencyMemberships.flatMap((m) =>
    m.Role.Permissions.map((rp) => rp.Permission)
  )
  const subPerms = user.SubAccountMemberships.flatMap((m) =>
    m.Role.Permissions.map((rp) => rp.Permission)
  )

  const unique: Record<string, Permission> = {}
  for (const p of [...agencyPerms, ...subPerms]) {
    unique[p.key] = p
  }

  return Object.keys(unique).map((k) => unique[k])
}

export const getUserPermissionKeys = async (): Promise<PermissionKey[]> => {
  const perms = await getUserPermissions()
  return perms.map((p) => p.key)
}

export const hasPermission = async (permissionKey: string): Promise<boolean> => {
  const key = normalizeKey(permissionKey)
  const keys = await getUserPermissionKeys()
  return keys.includes(key)
}

/**
 * Scoped helpers (recommended for authz decisions).
 */
export const getAgencyPermissionKeys = async (
  agencyId: string
): Promise<PermissionKey[]> => {
  const user = await getAuthUserMemberships()
  if (!user) return []

  const membership = user.AgencyMemberships.find((m) => m.agencyId === agencyId)
  if (!membership) return []

  return membership.Role.Permissions.map((rp) => rp.Permission.key)
}

export const getSubAccountPermissionKeys = async (
  subAccountId: string
): Promise<PermissionKey[]> => {
  const user = await getAuthUserMemberships()
  if (!user) return []

  const membership = user.SubAccountMemberships.find(
    (m) => m.subAccountId === subAccountId
  )
  if (!membership) return []

  return membership.Role.Permissions.map((rp) => rp.Permission.key)
}

export const hasAgencyPermission = async (
  agencyId: string,
  permissionKey: string
): Promise<boolean> => {
  const key = normalizeKey(permissionKey)
  const keys = await getAgencyPermissionKeys(agencyId)
  return keys.includes(key)
}

export const hasSubAccountPermission = async (
  subAccountId: string,
  permissionKey: string
): Promise<boolean> => {
  const key = normalizeKey(permissionKey)
  const keys = await getSubAccountPermissionKeys(subAccountId)
  return keys.includes(key)
}

/**
 * Get user's accessible teams structured for TeamSwitcher
 * Returns agencies with their nested subaccounts that user has permission to access
 */
export const getUserAccessibleTeams = async () => {
  const user = await getAuthUserMemberships()
  if (!user) return []

  type TeamItem = {
    id: string
    name: string
    logo?: string
    type: 'agency' | 'subaccount'
    subaccounts?: TeamItem[]
  }

  const teams: TeamItem[] = []

  // Group subaccounts by agency
  const subAccountsByAgency = new Map<string, TeamItem[]>()
  
  for (const membership of user.SubAccountMemberships) {
    const subAccount = membership.SubAccount
    const agencyId = subAccount.agencyId
    
    const subAccountItem: TeamItem = {
      id: subAccount.id,
      name: subAccount.name,
      logo: subAccount.subAccountLogo || undefined,
      type: 'subaccount',
    }

    if (!subAccountsByAgency.has(agencyId)) {
      subAccountsByAgency.set(agencyId, [])
    }
    subAccountsByAgency.get(agencyId)!.push(subAccountItem)
  }

  // Build agency items with their subaccounts
  for (const membership of user.AgencyMemberships) {
    const agency = membership.Agency
    const agencySubaccounts = subAccountsByAgency.get(agency.id) || []

    teams.push({
      id: agency.id,
      name: agency.name,
      logo: agency.agencyLogo || undefined,
      type: 'agency',
      subaccounts: agencySubaccounts.length > 0 ? agencySubaccounts : undefined,
    })
  }

  return teams
}
