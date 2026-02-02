/**
 * @abstraction Navigation Registry
 * @description Navigation configuration derived from permission registry ModuleCode.
 * Single source of truth for sidebar modules, ensuring consistency with permissions.
 *
 * @namespace Autlify.Lib.Registry.Navigation
 * @module REGISTRY
 */

import { KEYS, type ModuleCode, type SubModuleOf } from '@/lib/registry/keys/permissions'
import type { NavModule, NavItem } from '@/components/sidebar-01/types'

// ============================================================================
// Module Metadata (extends ModuleCode with display info)
// ============================================================================

interface ModuleMeta {
  name: string
  icon: string
  description?: string
  order: number
  isPremium?: boolean
}

/** Metadata for each module code; REMARK: temporary config partially */
export const MODULE_META: Partial<Record<ModuleCode, ModuleMeta>> = {
  core: {
    name: 'Core',
    icon: 'home',
    description: 'Core platform features',
    order: 0,
  },
  crm: {
    name: 'CRM',
    icon: 'users',
    description: 'Customer relationship management',
    order: 10,
  },
  fi: {
    name: 'Finance',
    icon: 'wallet',
    description: 'Financial modules',
    order: 20,
    isPremium: true,
  },
} as const

// ============================================================================
// Sub-Module Metadata
// ============================================================================

interface SubModuleMeta {
  name: string
  icon: string
  href: string
  description?: string
  order: number
  isPremium?: boolean
  /** Only show for specific scope types */
  scopeFilter?: 'agency' | 'subaccount'
}

/** Core sub-modules navigation */
export const CORE_SUBMODULES: Record<SubModuleOf<'core'>, SubModuleMeta> = {
  agency: {
    name: 'Dashboard',
    icon: 'layout-dashboard',
    href: '/',
    description: 'Agency overview',
    order: 0,
    scopeFilter: 'agency',
  },
  billing: {
    name: 'Billing',
    icon: 'credit-card',
    href: '/billing',
    description: 'Subscription & payments',
    order: 10,
  },
  subaccount: {
    name: 'Sub Accounts',
    icon: 'building-2',
    href: '/all-subaccounts',
    description: 'Manage sub accounts',
    order: 20,
    scopeFilter: 'agency',
  },
  features: {
    name: 'Features',
    icon: 'sparkles',
    href: '/features',
    description: 'Experimental features',
    order: 30,
    isPremium: true,
  },
  apps: {
    name: 'Apps',
    icon: 'grid-3x3',
    href: '/apps',
    description: 'Integrations & webhooks',
    order: 40,
  },
}

/** CRM sub-modules navigation; REMARK: temporary config partially */ 
export const CRM_SUBMODULES: Partial<Record<SubModuleOf<'crm'>, SubModuleMeta>> = {
  customers: {
    name: 'Contacts',
    icon: 'contact',
    href: '/contacts',
    description: 'Manage contacts',
    order: 0,
  },
  funnels: {
    name: 'Funnels',
    icon: 'layers',
    href: '/funnels',
    description: 'Sales funnels',
    order: 10,
  },
  pipelines: {
    name: 'Pipelines',
    icon: 'git-branch',
    href: '/pipelines',
    description: 'Deal pipelines',
    order: 20,
  },
}

// Temporary: Config Partial type for FI sub-modules
export const FI_SUBMODULES: Partial<Record<SubModuleOf<'fi'>, SubModuleMeta>> = {
  general_ledger: {
    name: 'General Ledger',
    icon: 'list-tree',
    href: '/fi/general-ledger',
    description: 'Manage chart of accounts & entries',
    order: 0,
    isPremium: true,
  },
}

// ============================================================================
// Additional Navigation Items (not derived from permissions)
// ============================================================================

export const ADDITIONAL_NAV: NavItem[] = [
  {
    id: 'launchpad',
    name: 'Launchpad',
    icon: 'rocket',
    href: '/launchpad',
    description: 'Quick actions & setup',
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: 'settings',
    href: '/settings',
    description: 'Account settings',
  },
  {
    id: 'team',
    name: 'Team',
    icon: 'users',
    href: '/team',
    description: 'Team members',
  },
]

// ============================================================================
// Finance Module (FI) - Extends beyond permission registry
// ============================================================================

export const FI_MODULE: NavModule = {
  id: 'fi',
  name: 'Finance',
  icon: 'wallet',
  href: '/fi/general-ledger',
  isGroup: true,
  order: 50,
  isPremium: true,
  items: [
    {
      id: 'fi-gl-overview',
      name: 'Overview',
      icon: 'layout-dashboard',
      href: '/fi/general-ledger',
    },
    {
      id: 'fi-gl-coa',
      name: 'Chart of Accounts',
      icon: 'list-tree',
      href: '/fi/general-ledger/chart-of-accounts',
    },
    {
      id: 'fi-gl-entries',
      name: 'Journal Entries',
      icon: 'file-text',
      href: '/fi/general-ledger/journal-entries',
    },
    {
      id: 'fi-gl-periods',
      name: 'Periods',
      icon: 'calendar',
      href: '/fi/general-ledger/periods',
    },
    {
      id: 'fi-gl-reports',
      name: 'Reports',
      icon: 'bar-chart-3',
      href: '/fi/general-ledger/reports',
    },
    {
      id: 'fi-gl-settings',
      name: 'Settings',
      icon: 'settings',
      href: '/fi/general-ledger/settings',
    },
  ],
}

// ============================================================================
// Build Nav Modules from Permission Registry
// ============================================================================

type ScopeType = 'agency' | 'subaccount'

/**
 * Builds navigation modules from permission registry
 * @param scopeType - 'agency' or 'subaccount'
 * @returns Array of NavModule for sidebar-01
 */
export function buildNavModules(scopeType: ScopeType): NavModule[] {
  const modules: NavModule[] = []

  // Process each ModuleCode
  for (const [moduleCode, moduleKeys] of Object.entries(KEYS)) {
    // Skip 'fi' - we add FI_MODULE manually with detailed sub-items
    if (moduleCode === 'fi') continue
    
    const meta = MODULE_META[moduleCode as ModuleCode]
    if (!meta) continue

    // Build items from sub-modules
    const items: NavItem[] = []
    const subModuleMetas = moduleCode === 'core' ? CORE_SUBMODULES : CRM_SUBMODULES

    for (const [subModuleCode, subMeta] of Object.entries(subModuleMetas)) {
      const typedSubMeta = subMeta as SubModuleMeta

      // Filter by scope if specified
      if (typedSubMeta.scopeFilter && typedSubMeta.scopeFilter !== scopeType) {
        continue
      }

      // Get the permission key for reading this sub-module
      const permKeys = (moduleKeys as Record<string, Record<string, Record<string, string>>>)[subModuleCode]
      const readPermKey = permKeys?.account?.read || permKeys?.contact?.read || permKeys?.content?.read || permKeys?.lane?.read

      items.push({
        id: `${moduleCode}-${subModuleCode}`,
        name: typedSubMeta.name,
        icon: typedSubMeta.icon,
        href: typedSubMeta.href,
        description: typedSubMeta.description,
        permission: readPermKey,
        isPremium: typedSubMeta.isPremium,
      })
    }

    // Sort items by order
    items.sort((a, b) => {
      const orderA = Object.values(subModuleMetas).find(s => s.name === a.name)?.order ?? 0
      const orderB = Object.values(subModuleMetas).find(s => s.name === b.name)?.order ?? 0
      return orderA - orderB
    })

    // Only add module if it has items
    if (items.length > 0) {
      modules.push({
        id: moduleCode,
        name: meta.name,
        icon: meta.icon,
        isGroup: true,
        order: meta.order,
        isPremium: meta.isPremium,
        items,
      })
    }
  }

  // Add Finance module
  modules.push(FI_MODULE)

  // Sort modules by order
  modules.sort((a, b) => a.order - b.order)

  return modules
}

// ============================================================================
// Pre-built Configurations
// ============================================================================

/** Agency navigation modules */
export const AGENCY_MODULES = buildNavModules('agency')

/** Subaccount navigation modules */
export const SUBACCOUNT_MODULES = buildNavModules('subaccount')

// ============================================================================
// Flat Navigation (for simple sidebar)
// ============================================================================

/**
 * Get flat navigation items for a scope type
 * @param scopeType - 'agency' or 'subaccount'
 * @returns Array of NavItem (flat, no grouping)
 */
export function getFlatNavItems(scopeType: ScopeType): NavItem[] {
  const items: NavItem[] = []

  // Dashboard
  items.push({
    id: 'dashboard',
    name: 'Dashboard',
    icon: 'layout-dashboard',
    href: '/',
  })

  // Launchpad
  items.push({
    id: 'launchpad',
    name: 'Launchpad',
    icon: 'rocket',
    href: '/launchpad',
  })

  // Billing
  items.push({
    id: 'billing',
    name: 'Billing',
    icon: 'credit-card',
    href: '/billing',
    permission: KEYS.core.billing.account.view,
  })

  // Settings
  items.push({
    id: 'settings',
    name: 'Settings',
    icon: 'settings',
    href: '/settings',
    permission: scopeType === 'agency' 
      ? KEYS.core.agency.settings.view 
      : KEYS.core.subaccount.account.read,
  })

  // Sub Accounts (agency only)
  if (scopeType === 'agency') {
    items.push({
      id: 'subaccounts',
      name: 'Sub Accounts',
      icon: 'building-2',
      href: '/all-subaccounts',
      permission: KEYS.core.agency.subaccounts.read,
    })
  }

  // Team
  items.push({
    id: 'team',
    name: 'Team',
    icon: 'users',
    href: '/team',
    permission: scopeType === 'agency'
      ? KEYS.core.agency.team_member.manage
      : KEYS.core.subaccount.team_member.invite,
  })

  // CRM items (subaccount context)
  if (scopeType === 'subaccount') {
    items.push(
      {
        id: 'contacts',
        name: 'Contacts',
        icon: 'contact',
        href: '/contacts',
        permission: KEYS.crm.customers.contact.read,
      },
      {
        id: 'funnels',
        name: 'Funnels',
        icon: 'layers',
        href: '/funnels',
        permission: KEYS.crm.funnels.content.read,
      },
      {
        id: 'pipelines',
        name: 'Pipelines',
        icon: 'git-branch',
        href: '/pipelines',
        permission: KEYS.crm.pipelines.lane.read,
      },
      {
        id: 'media',
        name: 'Media',
        icon: 'image',
        href: '/media',
      }
    )
  }

  // Apps
  items.push({
    id: 'apps',
    name: 'Apps',
    icon: 'grid-3x3',
    href: '/apps',
    permission: KEYS.core.apps.app.view,
  })

  return items
}

/** Agency flat navigation */
export const AGENCY_NAV_ITEMS = getFlatNavItems('agency')

/** Subaccount flat navigation */  
export const SUBACCOUNT_NAV_ITEMS = getFlatNavItems('subaccount')

// ============================================================================
// Export Permission Keys for convenience
// ============================================================================

export { KEYS as PERMISSION_KEYS } from '@/lib/registry/keys/permissions'
export type { ModuleCode, SubModuleOf } from '@/lib/registry/keys/permissions'