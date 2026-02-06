import 'server-only'

import { KEYS as PERMISSION_KEYS } from '@/lib/registry/keys/permissions'
import type { ActionKey } from '@/lib/registry/keys/actions'

export type PermissionSeed = {
  key: ActionKey
  name: string
  description: string | null
  category: string
  isSystem: boolean
}

function titleCase(s: string): string {
  return s
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function inferCategory(permissionKey: ActionKey): string {
  const parts = permissionKey.split('.')
  return parts.slice(0, 2).join('.') // e.g., core.billing, crm.pipelines
}

function inferName(permissionKey: ActionKey): string {
  const parts = permissionKey.split('.')
  const action = parts[parts.length - 1] ?? permissionKey
  const resource = parts[parts.length - 2] ?? ''
  return titleCase(`${resource} ${action}`.trim())
}

function flatten(obj: unknown, out: ActionKey[]) {
  if (!obj || typeof obj !== 'object') return
  for (const v of Object.values(obj as Record<string, unknown>)) {
    if (typeof v === 'string') {
      out.push(v as ActionKey)
    } else if (v && typeof v === 'object') {
      flatten(v, out)
    }
  }
}

/**
 * Flatten registry permission keys into a seed list usable for ensuring DB contains all keys.
 * Note: registry does not store rich metadata, so we infer reasonable defaults.
 */
export function getPermissionCatalogSeeds(): PermissionSeed[] {
  const keys: ActionKey[] = []
  flatten(PERMISSION_KEYS, keys)

  const uniq = Array.from(new Set(keys)).sort((a, b) => a.localeCompare(b))
  return uniq.map((key) => ({
    key,
    name: inferName(key),
    description: null,
    category: inferCategory(key),
    isSystem: true,
  }))
}
