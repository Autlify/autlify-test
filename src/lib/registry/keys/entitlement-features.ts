/**
 * @abstraction Entitlement Features Registry
 * @description Static catalog of all entitlement features. These get seeded to EntitlementFeature table.
 * 
 * Categories:
 * - CORE: Core platform features (agency, billing, etc.)
 * - CRM: Customer relationship features
 * - FI: Financial modules (GL, AR, AP, etc.)
 * - APPS: Platform apps and integrations
 * 
 * @namespace Autlify.Lib.Registry.Keys.EntitlementFeatures
 * @module REGISTRY
 * @author Autlify Team
 * @created 2026-01-29
 */

import type { 
  FeatureValueType, 
  MeteringType, 
  MeterAggregation, 
  MeteringScope,
  UsagePeriod 
} from '@/generated/prisma/client'
import type { FeatureKey } from '@/lib/registry'

/** 
 * Entitlement feature definition for seeding/catalog.
 * Uses EntitlementFeatureKey which is a union of FeatureKey + EntitlementOnlyKey.
 */
export interface EntitlementFeatureSeed {
  key: FeatureKey
  name: string
  description?: string
  category: string
  valueType: FeatureValueType
  unit?: string

  // Metering configuration
  // MeteringType: NONE | COUNT | SUM
  metering: MeteringType
  aggregation: MeterAggregation
  scope: MeteringScope
  period?: UsagePeriod

  // UI/UX
  displayName?: string
  icon?: string
  helpText?: string
  displayOrder?: number
  isToggleable?: boolean
  defaultEnabled?: boolean
  requiresRestart?: boolean

  // Credits configuration
  creditEnabled?: boolean
  creditUnit?: string
  creditExpires?: boolean
  creditPriority?: number
}

/** 
 * Master catalog of all entitlement features.
 * Use this to seed the EntitlementFeature table.
 */
export const ENTITLEMENT_FEATURES: EntitlementFeatureSeed[] = [
  // ─────────────────────────────────────────────────────────
  // CORE: Agency & Platform Features
  // ─────────────────────────────────────────────────────────
  {
    key: 'core.agency.subaccounts',
    name: 'Sub-Accounts',
    description: 'Maximum number of sub-accounts (clients) per agency',
    category: 'CORE',
    valueType: 'INTEGER',
    unit: 'subaccounts',
    metering: 'COUNT',
    aggregation: 'COUNT',
    scope: 'AGENCY',
    displayName: 'Sub-Accounts',
    icon: 'users',
    displayOrder: 10,
  },
  {
    key: 'core.agency.team_member',
    name: 'Team Members',
    description: 'Maximum team members allowed in the agency',
    category: 'CORE',
    valueType: 'INTEGER',
    unit: 'members',
    metering: 'COUNT',
    aggregation: 'COUNT',
    scope: 'AGENCY',
    displayName: 'Team Members',
    icon: 'user-group',
    displayOrder: 20,
  },
  {
    key: 'core.agency.storage',
    name: 'Storage',
    description: 'Total file storage allocation in GB',
    category: 'CORE',
    valueType: 'DECIMAL',
    unit: 'GB',
    metering: 'SUM',
    aggregation: 'SUM',
    scope: 'AGENCY',
    displayName: 'Storage Space',
    icon: 'database',
    displayOrder: 30,
  },

  // ─────────────────────────────────────────────────────────
  // CRM: Funnels, Pipelines, Contacts, Media
  // ─────────────────────────────────────────────────────────
  {
    key: 'crm.funnels.content',
    name: 'Funnels',
    description: 'Maximum funnels per sub-account',
    category: 'CRM',
    valueType: 'INTEGER',
    unit: 'funnels',
    metering: 'COUNT',
    aggregation: 'COUNT',
    scope: 'SUBACCOUNT',
    displayName: 'Funnels',
    icon: 'filter',
    displayOrder: 100,
  },
  {
    key: 'crm.pipelines.lane',
    name: 'Pipelines',
    description: 'Maximum pipelines per sub-account',
    category: 'CRM',
    valueType: 'INTEGER',
    unit: 'pipelines',
    metering: 'COUNT',
    aggregation: 'COUNT',
    scope: 'SUBACCOUNT',
    displayName: 'Pipelines',
    icon: 'git-branch',
    displayOrder: 110,
  },
  {
    key: 'crm.customers.contact',
    name: 'Contacts',
    description: 'Maximum contacts per sub-account',
    category: 'CRM',
    valueType: 'INTEGER',
    unit: 'contacts',
    metering: 'COUNT',
    aggregation: 'COUNT',
    scope: 'SUBACCOUNT',
    displayName: 'Contacts',
    icon: 'address-book',
    displayOrder: 120,
  },
  {
    key: 'crm.media.file',
    name: 'Media Files',
    description: 'Maximum media files per sub-account',
    category: 'CRM',
    valueType: 'INTEGER',
    unit: 'files',
    metering: 'COUNT',
    aggregation: 'COUNT',
    scope: 'SUBACCOUNT',
    displayName: 'Media Files',
    icon: 'image',
    displayOrder: 130,
  },

  // ─────────────────────────────────────────────────────────
  // BILLING: Rebilling & Credits
  // ─────────────────────────────────────────────────────────
  {
    key: 'crm.customers.billing',
    name: 'Customer Rebilling',
    description: 'Enable customer rebilling feature',
    category: 'BILLING',
    valueType: 'BOOLEAN',
    metering: 'NONE',
    aggregation: 'COUNT',
    scope: 'AGENCY',
    displayName: 'Customer Rebilling',
    icon: 'credit-card',
    displayOrder: 200,
    isToggleable: true,
    defaultEnabled: false,
  },
  {
    key: 'core.billing.priority_support',
    name: 'Priority Support',
    description: '24/7 priority support access',
    category: 'BILLING',
    valueType: 'BOOLEAN',
    metering: 'NONE',
    aggregation: 'COUNT',
    scope: 'AGENCY',
    displayName: '24/7 Priority Support',
    icon: 'headphones',
    displayOrder: 210,
    isToggleable: false,
    defaultEnabled: false,
  },

  // ─────────────────────────────────────────────────────────
  // APPS: Integrations & Webhooks
  // ─────────────────────────────────────────────────────────
  {
    key: 'core.apps.api_keys',
    name: 'API Keys',
    description: 'Maximum API keys per agency',
    category: 'APPS',
    valueType: 'INTEGER',
    unit: 'keys',
    metering: 'COUNT',
    aggregation: 'COUNT',
    scope: 'AGENCY',
    displayName: 'API Keys',
    icon: 'key',
    displayOrder: 300,
  },
  {
    key: 'core.apps.webhooks',
    name: 'Webhooks',
    description: 'Enable webhooks feature with subscription and delivery limits',
    category: 'APPS',
    valueType: 'INTEGER',
    unit: 'subscriptions',
    metering: 'COUNT',
    aggregation: 'COUNT',
    scope: 'AGENCY',
    displayName: 'Webhooks',
    icon: 'webhook',
    displayOrder: 310,
  },

  // ─────────────────────────────────────────────────────────
  // FI: Financial Modules (Add-ons)
  // ─────────────────────────────────────────────────────────
  // FI Configuration (bundled with FI-GL)
  {
    key: 'fi.master_data.accounts',
    name: 'Chart of Accounts Config',
    description: 'Configure chart of accounts structure and templates',
    category: 'FI',
    valueType: 'BOOLEAN',
    metering: 'NONE',
    aggregation: 'COUNT',
    scope: 'AGENCY',
    displayName: 'COA Configuration',
    icon: 'settings',
    displayOrder: 401,
    isToggleable: false,
    defaultEnabled: false,
  },
  {
    key: 'fi.configuration.fiscal_years',
    name: 'Fiscal Years',
    description: 'Configure fiscal years and periods',
    category: 'FI',
    valueType: 'BOOLEAN',
    metering: 'NONE',
    aggregation: 'COUNT',
    scope: 'AGENCY',
    displayName: 'Fiscal Years',
    icon: 'calendar',
    displayOrder: 402,
    isToggleable: false,
    defaultEnabled: false,
  },
  {
    key: 'fi.configuration.currencies',
    name: 'Multi-Currency',
    description: 'Configure multiple currencies and exchange rates',
    category: 'FI',
    valueType: 'BOOLEAN',
    metering: 'NONE',
    aggregation: 'COUNT',
    scope: 'AGENCY',
    displayName: 'Multi-Currency',
    icon: 'currency-dollar',
    displayOrder: 403,
    isToggleable: false,
    defaultEnabled: false,
  },
  {
    key: 'fi.configuration.tax_settings',
    name: 'Tax Settings',
    description: 'Configure tax codes and rates',
    category: 'FI',
    valueType: 'BOOLEAN',
    metering: 'NONE',
    aggregation: 'COUNT',
    scope: 'AGENCY',
    displayName: 'Tax Settings',
    icon: 'percent',
    displayOrder: 404,
    isToggleable: false,
    defaultEnabled: false,
  },
  {
    key: 'fi.configuration.number_ranges',
    name: 'Number Ranges',
    description: 'Configure document number ranges',
    category: 'FI',
    valueType: 'BOOLEAN',
    metering: 'NONE',
    aggregation: 'COUNT',
    scope: 'AGENCY',
    displayName: 'Number Ranges',
    icon: 'hash',
    displayOrder: 405,
    isToggleable: false,
    defaultEnabled: false,
  },
  {
    key: 'fi.configuration.posting_rules',
    name: 'Auto-Posting Rules',
    description: 'Configure automatic account determination rules',
    category: 'FI',
    valueType: 'BOOLEAN',
    metering: 'NONE',
    aggregation: 'COUNT',
    scope: 'AGENCY',
    displayName: 'Posting Rules',
    icon: 'git-branch',
    displayOrder: 406,
    isToggleable: false,
    defaultEnabled: false,
  },
  // FI Master Data
  {
    key: 'fi.master_data.accounts',
    name: 'GL Accounts',
    description: 'Maximum GL account entries',
    category: 'FI',
    valueType: 'INTEGER',
    unit: 'accounts',
    metering: 'COUNT',
    aggregation: 'COUNT',
    scope: 'AGENCY',
    displayName: 'GL Accounts',
    icon: 'list',
    displayOrder: 410,
  },
  {
    key: 'fi.master_data.customers',
    name: 'Customer Master',
    description: 'Maximum customer master records (AR subledger)',
    category: 'FI',
    valueType: 'INTEGER',
    unit: 'customers',
    metering: 'COUNT',
    aggregation: 'COUNT',
    scope: 'AGENCY',
    displayName: 'Customers',
    icon: 'users',
    displayOrder: 411,
  },
  {
    key: 'fi.master_data.vendors',
    name: 'Vendor Master',
    description: 'Maximum vendor master records (AP subledger)',
    category: 'FI',
    valueType: 'INTEGER',
    unit: 'vendors',
    metering: 'COUNT',
    aggregation: 'COUNT',
    scope: 'AGENCY',
    displayName: 'Vendors',
    icon: 'building',
    displayOrder: 412,
  },
  {
    key: 'fi.master_data.banks',
    name: 'Bank Accounts',
    description: 'Maximum bank account master records',
    category: 'FI',
    valueType: 'INTEGER',
    unit: 'banks',
    metering: 'COUNT',
    aggregation: 'COUNT',
    scope: 'AGENCY',
    displayName: 'Bank Accounts',
    icon: 'building-bank',
    displayOrder: 413,
  },
  // FI General Ledger Operations
  {
    key: 'fi.general_ledger.settings',
    name: 'General Ledger Access',
    description: 'Access to FI-GL module (Chart of Accounts, Journals)',
    category: 'FI',
    valueType: 'BOOLEAN',
    metering: 'NONE',
    aggregation: 'COUNT',
    scope: 'AGENCY',
    displayName: 'General Ledger',
    icon: 'book-open',
    displayOrder: 400,
    isToggleable: false,
    defaultEnabled: false,
  },
  {
    key: 'fi.general_ledger.journal_entries',
    name: 'Monthly Journal Entries',
    description: 'Journal entries per month',
    category: 'FI',
    valueType: 'INTEGER',
    unit: 'entries',
    metering: 'SUM',
    aggregation: 'COUNT',
    scope: 'AGENCY',
    period: 'MONTHLY',
    displayName: 'Monthly Journal Entries',
    icon: 'file-text',
    displayOrder: 420,
  },
  {
    key: 'fi.accounts_receivable.subledgers',
    name: 'Accounts Receivable Access',
    description: 'Access to FI-AR module (Invoicing, Collections)',
    category: 'FI',
    valueType: 'BOOLEAN',
    metering: 'NONE',
    aggregation: 'COUNT',
    scope: 'AGENCY',
    displayName: 'Accounts Receivable',
    icon: 'invoice',
    displayOrder: 500,
    isToggleable: false,
    defaultEnabled: false,
  },
  {
    key: 'fi.accounts_payable.subledgers',
    name: 'Accounts Payable Access',
    description: 'Access to FI-AP module (Bills, Payments)',
    category: 'FI',
    valueType: 'BOOLEAN',
    metering: 'NONE',
    aggregation: 'COUNT',
    scope: 'AGENCY',
    displayName: 'Accounts Payable',
    icon: 'receipt',
    displayOrder: 600,
    isToggleable: false,
    defaultEnabled: false,
  },
  {
    key: 'fi.bank_ledger.bank_accounts',
    name: 'Bank Ledger Access',
    description: 'Access to FI-BL module (Bank Sync, Reconciliation)',
    category: 'FI',
    valueType: 'BOOLEAN',
    metering: 'NONE',
    aggregation: 'COUNT',
    scope: 'AGENCY',
    displayName: 'Bank Ledger',
    icon: 'building-bank',
    displayOrder: 700,
    isToggleable: false,
    defaultEnabled: false,
  },
  {
    key: 'fi.controlling.cost_centers',
    name: 'Controlling Access',
    description: 'Access to FI-CO module (Cost Centers, Allocations)',
    category: 'FI',
    valueType: 'BOOLEAN',
    metering: 'NONE',
    aggregation: 'COUNT',
    scope: 'AGENCY',
    displayName: 'Controlling',
    icon: 'chart-pie',
    displayOrder: 800,
    isToggleable: false,
    defaultEnabled: false,
  },

  // FI-GL Advanced Features
  {
    key: 'fi.general_ledger.consolidation',
    name: 'Multi-Entity Consolidation',
    description: 'Consolidate financials across multiple sub-accounts (Agency-only)',
    category: 'FI',
    valueType: 'BOOLEAN',
    metering: 'NONE',
    aggregation: 'COUNT',
    scope: 'AGENCY',
    displayName: 'Consolidation',
    icon: 'git-merge',
    displayOrder: 430,
    isToggleable: false,
    defaultEnabled: false,
  },
  {
    key: 'fi.general_ledger.reports',
    name: 'GL Reports & Approvals',
    description: 'GL reporting with approval workflows',
    category: 'FI',
    valueType: 'BOOLEAN',
    metering: 'NONE',
    aggregation: 'COUNT',
    scope: 'AGENCY',
    displayName: 'Reports & Approvals',
    icon: 'check-circle',
    displayOrder: 450,
    isToggleable: false,
    defaultEnabled: false,
  },
  {
    key: 'fi.general_ledger.year_end',
    name: 'Year-End Closing',
    description: 'Year-end closing operations and carryforward',
    category: 'FI',
    valueType: 'BOOLEAN',
    metering: 'NONE',
    aggregation: 'COUNT',
    scope: 'AGENCY',
    displayName: 'Year-End Closing',
    icon: 'calendar',
    displayOrder: 455,
    isToggleable: false,
    defaultEnabled: false,
  },
  {
    key: 'fi.general_ledger.reconciliation',
    name: 'Account Reconciliation',
    description: 'Open item management and clearing',
    category: 'FI',
    valueType: 'BOOLEAN',
    metering: 'NONE',
    aggregation: 'COUNT',
    scope: 'AGENCY',
    displayName: 'Account Reconciliation',
    icon: 'check-square',
    displayOrder: 458,
    isToggleable: false,
    defaultEnabled: false,
  },
  {
    key: 'fi.advanced_reporting.financial_statements',
    name: 'Advanced Reporting',
    description: 'Scheduled reports, PDF export, comparative analysis',
    category: 'FI',
    valueType: 'BOOLEAN',
    metering: 'NONE',
    aggregation: 'COUNT',
    scope: 'AGENCY',
    displayName: 'Advanced Reporting',
    icon: 'chart-bar',
    displayOrder: 470,
    isToggleable: false,
    defaultEnabled: false,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CO - Controlling Module (SAP CO-inspired)
  // ─────────────────────────────────────────────────────────────────────────
  {
    key: 'co.cost_centers.master_data',
    name: 'Cost Center Accounting',
    description: 'Cost center master data and cost allocations (CO-CCA)',
    category: 'CO',
    valueType: 'BOOLEAN',
    metering: 'NONE',
    aggregation: 'COUNT',
    scope: 'AGENCY',
    displayName: 'Cost Centers',
    icon: 'wallet',
    displayOrder: 900,
    isToggleable: false,
    defaultEnabled: false,
  },
  {
    key: 'co.profit_centers.master_data',
    name: 'Profit Center Accounting',
    description: 'Profit center master data for profitability tracking (CO-PCA)',
    category: 'CO',
    valueType: 'BOOLEAN',
    metering: 'NONE',
    aggregation: 'COUNT',
    scope: 'AGENCY',
    displayName: 'Profit Centers',
    icon: 'trending-up',
    displayOrder: 910,
    isToggleable: false,
    defaultEnabled: false,
  },
  {
    key: 'co.internal_orders.master_data',
    name: 'Internal Orders',
    description: 'Project-based cost tracking and internal orders',
    category: 'CO',
    valueType: 'BOOLEAN',
    metering: 'NONE',
    aggregation: 'COUNT',
    scope: 'AGENCY',
    displayName: 'Internal Orders',
    icon: 'clipboard-list',
    displayOrder: 920,
    isToggleable: false,
    defaultEnabled: false,
  },
  {
    key: 'co.profitability.segments',
    name: 'Profitability Analysis',
    description: 'Multi-dimensional profitability segments (CO-PA)',
    category: 'CO',
    valueType: 'BOOLEAN',
    metering: 'NONE',
    aggregation: 'COUNT',
    scope: 'AGENCY',
    displayName: 'Profitability',
    icon: 'chart-pie',
    displayOrder: 930,
    isToggleable: false,
    defaultEnabled: false,
  },
  {
    key: 'co.budgets.planning',
    name: 'Budget Planning',
    description: 'Budget planning, monitoring and variance analysis',
    category: 'CO',
    valueType: 'BOOLEAN',
    metering: 'NONE',
    aggregation: 'COUNT',
    scope: 'AGENCY',
    displayName: 'Budgets',
    icon: 'calculator',
    displayOrder: 940,
    isToggleable: false,
    defaultEnabled: false,
  },
]

/** Helper to get features by category */
export function getFeaturesByCategory(category: string): EntitlementFeatureSeed[] {
  return ENTITLEMENT_FEATURES.filter(f => f.category === category)
}

/** Helper to get feature by key */
export function getFeatureByKey(key: string): EntitlementFeatureSeed | undefined {
  return ENTITLEMENT_FEATURES.find(f => f.key === key)
}

/** Re-export EntitlementFeatureKey from features.ts (source of truth) */
export type { FeatureKey as EntitlementFeatureKey } from '@/lib/registry/keys/features'

/** Feature categories */
export const ENTITLEMENT_CATEGORIES = ['CORE', 'CRM', 'BILLING', 'APPS', 'FI', 'CO'] as const
export type EntitlementCategory = typeof ENTITLEMENT_CATEGORIES[number]
