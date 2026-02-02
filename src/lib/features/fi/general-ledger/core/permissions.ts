/**
 * GL Permissions Helper
 * Uses registry as Single Source of Truth for permissions
 * 
 * @namespace Autlify.Lib.Features.FI.GL.Core.Permissions
 */

'use server'

import {
    hasAgencyPermission,
    hasSubAccountPermission
} from '@/lib/features/iam/authz/permissions'
import { KEYS } from '@/lib/registry/keys/permissions'
import type { ActionKey } from '@/lib/registry'
import type { GLContext } from './context'

/** Re-export permission keys for easy access - Single Source of Truth */
export const GL_PERMISSION_KEYS = KEYS.fi.general_ledger
export const FI_CONFIG_KEYS = KEYS.fi.configuration
export const FI_MASTER_DATA_KEYS = KEYS.fi.master_data

/** Permission check result */
export interface PermissionCheckResult {
    allowed: boolean
    reason?: string
}

/**
 * Check if context has a specific GL permission
 * Automatically routes to agency or subaccount check based on context
 * 
 * @param context - The GL context
 * @param permissionKey - The permission key to check
 * @returns Promise<boolean>
 */
export const checkGLPermission = async (
    context: GLContext,
    permissionKey: ActionKey
): Promise<boolean> => {
    if (context.contextType === 'SUBACCOUNT' && context.subAccountId) {
        return hasSubAccountPermission(context.subAccountId, permissionKey)
    }

    if (context.agencyId) {
        return hasAgencyPermission(context.agencyId, permissionKey)
    }

    return false
}

/**
 * Check permission and return detailed result
 * 
 * @param context - The GL context
 * @param permissionKey - The permission key to check
 * @returns Promise<PermissionCheckResult>
 */
export const checkGLPermissionWithReason = async (
    context: GLContext,
    permissionKey: ActionKey
): Promise<PermissionCheckResult> => {
    const allowed = await checkGLPermission(context, permissionKey)

    if (!allowed) {
        return {
            allowed: false,
            reason: `Missing permission: ${permissionKey}`,
        }
    }

    return { allowed: true }
}

/**
 * Require permission or throw error
 * 
 * @param context - The GL context
 * @param permissionKey - The permission key to check
 * @throws Error if permission denied
 */
export const requireGLPermission = async (
    context: GLContext,
    permissionKey: ActionKey
): Promise<void> => {
    const allowed = await checkGLPermission(context, permissionKey)

    if (!allowed) {
        throw new Error(`Unauthorized: Missing permission ${permissionKey}`)
    }
}

/**
 * Check multiple permissions (all required)
 * 
 * @param context - The GL context
 * @param permissionKeys - Array of permission keys
 * @returns Promise<boolean>
 */
export const checkGLPermissions = async (
    context: GLContext,
    permissionKeys: ActionKey[]
): Promise<boolean> => {
    const results = await Promise.all(
        permissionKeys.map(key => checkGLPermission(context, key))
    )
    return results.every(Boolean)
}

/**
 * Check if context is for agency-only feature
 * Uses entitlement scope from registry to determine access
 * 
 * @param context - The GL context
 * @param feature - Feature name for error message
 * @returns boolean
 */
export const isAgencyOnlyFeature = (
    context: GLContext,
    feature: string
): boolean => {
    // If in subaccount context, agency-only features are not available
    if (context.contextType === 'SUBACCOUNT') {
        return true
    }
    return false
}

/**
 * Require agency-only feature access
 * 
 * @param context - The GL context
 * @param feature - Feature name for error message
 * @throws Error if in subaccount context
 */
export const requireAgencyOnlyFeature = (
    context: GLContext,
    feature: string
): void => {
    if (context.contextType === 'SUBACCOUNT') {
        throw new Error(`${feature} is only available at Agency level`)
    }
    if (!context.agencyId) {
        throw new Error(`Agency context required for ${feature}`)
    }
}

// ============================================================
// Convenience permission check functions using registry keys
// Single Source of Truth: KEYS.fi.{configuration, master_data, general_ledger}
// ============================================================

// ─────────────────────────────────────────────────────────────────────────
// FI Master Data Permissions (fi.master_data.*)
// ─────────────────────────────────────────────────────────────────────────

// Accounts (Chart of Accounts) - now under master_data
export const canViewAccounts = (ctx: GLContext) =>
    checkGLPermission(ctx, FI_MASTER_DATA_KEYS.accounts.view)

export const canManageAccounts = (ctx: GLContext) =>
    checkGLPermission(ctx, FI_MASTER_DATA_KEYS.accounts.manage)

// Customer Master Data
export const canViewCustomers = (ctx: GLContext) =>
    checkGLPermission(ctx, FI_MASTER_DATA_KEYS.customers.view)

export const canManageCustomers = (ctx: GLContext) =>
    checkGLPermission(ctx, FI_MASTER_DATA_KEYS.customers.manage)

// Vendor Master Data
export const canViewVendors = (ctx: GLContext) =>
    checkGLPermission(ctx, FI_MASTER_DATA_KEYS.vendors.view)

export const canManageVendors = (ctx: GLContext) =>
    checkGLPermission(ctx, FI_MASTER_DATA_KEYS.vendors.manage)

// Bank Master Data
export const canViewBanks = (ctx: GLContext) =>
    checkGLPermission(ctx, FI_MASTER_DATA_KEYS.banks.view)

export const canManageBanks = (ctx: GLContext) =>
    checkGLPermission(ctx, FI_MASTER_DATA_KEYS.banks.manage)

// ─────────────────────────────────────────────────────────────────────────
// FI Configuration Permissions (fi.configuration.*)
// ─────────────────────────────────────────────────────────────────────────

// Chart of Accounts Configuration
export const canViewCOAConfig = (ctx: GLContext) =>
    checkGLPermission(ctx, FI_MASTER_DATA_KEYS.accounts.view)

export const canManageCOAConfig = (ctx: GLContext) =>
    checkGLPermission(ctx, FI_MASTER_DATA_KEYS.accounts.manage)

// Fiscal Years (replaces periods)
export const canViewFiscalYears = (ctx: GLContext) => 
    checkGLPermission(ctx, FI_CONFIG_KEYS.fiscal_years.view)

export const canManageFiscalYears = (ctx: GLContext) => 
    checkGLPermission(ctx, FI_CONFIG_KEYS.fiscal_years.manage)

// Currencies (replaces currency)
export const canViewCurrencies = (ctx: GLContext) => 
    checkGLPermission(ctx, FI_CONFIG_KEYS.currencies.view)

export const canManageCurrencies = (ctx: GLContext) => 
    checkGLPermission(ctx, FI_CONFIG_KEYS.currencies.manage)

// Tax Settings (replaces tax)
export const canViewTaxSettings = (ctx: GLContext) =>
    checkGLPermission(ctx, FI_CONFIG_KEYS.tax_settings.view)

export const canManageTaxSettings = (ctx: GLContext) =>
    checkGLPermission(ctx, FI_CONFIG_KEYS.tax_settings.manage)

// Tolerances
export const canViewTolerances = (ctx: GLContext) =>
    checkGLPermission(ctx, FI_CONFIG_KEYS.tolerances.view)

export const canManageTolerances = (ctx: GLContext) =>
    checkGLPermission(ctx, FI_CONFIG_KEYS.tolerances.manage)

// Number Ranges
export const canViewNumberRanges = (ctx: GLContext) =>
    checkGLPermission(ctx, FI_CONFIG_KEYS.number_ranges.view)

export const canManageNumberRanges = (ctx: GLContext) =>
    checkGLPermission(ctx, FI_CONFIG_KEYS.number_ranges.manage)

// Posting Rules
export const canViewPostingRules = (ctx: GLContext) => 
    checkGLPermission(ctx, FI_CONFIG_KEYS.posting_rules.view)

export const canManagePostingRules = (ctx: GLContext) => 
    checkGLPermission(ctx, FI_CONFIG_KEYS.posting_rules.manage)

// ─────────────────────────────────────────────────────────────────────────
// GL Transaction Permissions (fi.general_ledger.*)
// ─────────────────────────────────────────────────────────────────────────

// Settings
export const canViewSettings = (ctx: GLContext) =>
    checkGLPermission(ctx, GL_PERMISSION_KEYS.settings.view)

export const canManageSettings = (ctx: GLContext) =>
    checkGLPermission(ctx, GL_PERMISSION_KEYS.settings.manage)

// Journal Entries
export const canViewJournals = (ctx: GLContext) =>
    checkGLPermission(ctx, GL_PERMISSION_KEYS.journal_entries.read)

export const canCreateJournals = (ctx: GLContext) =>
    checkGLPermission(ctx, GL_PERMISSION_KEYS.journal_entries.create)

export const canApproveJournals = (ctx: GLContext) =>
    checkGLPermission(ctx, GL_PERMISSION_KEYS.journal_entries.approve)

// Reports
export const canViewReports = (ctx: GLContext) => 
    checkGLPermission(ctx, GL_PERMISSION_KEYS.reports.view)

export const canGenerateReports = (ctx: GLContext) => 
    checkGLPermission(ctx, GL_PERMISSION_KEYS.reports.generate)

export const canApproveReports = (ctx: GLContext) => 
    checkGLPermission(ctx, GL_PERMISSION_KEYS.reports.approve)

// Consolidation (agency-only)
export const canViewConsolidation = (ctx: GLContext) =>
    checkGLPermission(ctx, GL_PERMISSION_KEYS.consolidation.view)

export const canManageConsolidation = (ctx: GLContext) =>
    checkGLPermission(ctx, GL_PERMISSION_KEYS.consolidation.manage)

// Year-End Closing
export const canViewYearEnd = (ctx: GLContext) =>
    checkGLPermission(ctx, GL_PERMISSION_KEYS.year_end.view)

export const canManageYearEnd = (ctx: GLContext) =>
    checkGLPermission(ctx, GL_PERMISSION_KEYS.year_end.manage)

export const canCloseYearEnd = (ctx: GLContext) =>
    checkGLPermission(ctx, GL_PERMISSION_KEYS.year_end.close)

// Reconciliation
export const canViewReconciliation = (ctx: GLContext) => 
    checkGLPermission(ctx, GL_PERMISSION_KEYS.reconciliation.view)

export const canManageReconciliation = (ctx: GLContext) => 
    checkGLPermission(ctx, GL_PERMISSION_KEYS.reconciliation.manage)

export const canClearReconciliation = (ctx: GLContext) => 
    checkGLPermission(ctx, GL_PERMISSION_KEYS.reconciliation.clear)