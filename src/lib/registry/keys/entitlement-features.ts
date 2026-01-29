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

/** Entitlement feature definition for seeding/catalog */
export interface EntitlementFeatureSeed {
  key: string
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
    key: 'core.agency.team_members',
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
  // CRM: Funnels, Pipelines, Contacts
  // ─────────────────────────────────────────────────────────
  {
    key: 'crm.funnels.count',
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
    key: 'crm.pipelines.count',
    name: 'Pipelines',
    description: 'Maximum pipelines allowed',
    category: 'CRM',
    valueType: 'INTEGER',
    unit: 'pipelines',
    metering: 'COUNT',
    aggregation: 'COUNT',
    scope: 'AGENCY',
    displayName: 'Pipelines',
    icon: 'git-branch',
    displayOrder: 110,
  },
  {
    key: 'crm.contacts.count',
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

  // ─────────────────────────────────────────────────────────
  // BILLING: Rebilling & Credits
  // ─────────────────────────────────────────────────────────
  {
    key: 'billing.rebilling',
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
    key: 'billing.priority_support',
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
    key: 'apps.integrations.api_keys',
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
    key: 'apps.webhooks.subscriptions',
    name: 'Webhook Subscriptions',
    description: 'Maximum webhook subscriptions',
    category: 'APPS',
    valueType: 'INTEGER',
    unit: 'subscriptions',
    metering: 'COUNT',
    aggregation: 'COUNT',
    scope: 'AGENCY',
    displayName: 'Webhook Subscriptions',
    icon: 'webhook',
    displayOrder: 310,
  },
  {
    key: 'apps.webhooks.deliveries_month',
    name: 'Monthly Webhook Deliveries',
    description: 'Maximum webhook deliveries per month',
    category: 'APPS',
    valueType: 'INTEGER',
    unit: 'deliveries',
    metering: 'SUM',
    aggregation: 'COUNT',
    scope: 'AGENCY',
    period: 'MONTHLY',
    displayName: 'Monthly Deliveries',
    icon: 'send',
    displayOrder: 320,
    creditEnabled: true,
    creditUnit: 'deliveries',
  },

  // ─────────────────────────────────────────────────────────
  // FI: Financial Modules (Add-ons)
  // ─────────────────────────────────────────────────────────
  {
    key: 'fi.gl.access',
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
    key: 'fi.gl.accounts',
    name: 'GL Accounts',
    description: 'Maximum chart of accounts entries',
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
    key: 'fi.gl.journals_month',
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
    key: 'fi.ar.access',
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
    key: 'fi.ap.access',
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
    key: 'fi.bl.access',
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
    key: 'fi.co.access',
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
]

/** Helper to get features by category */
export function getFeaturesByCategory(category: string): EntitlementFeatureSeed[] {
  return ENTITLEMENT_FEATURES.filter(f => f.category === category)
}

/** Helper to get feature by key */
export function getFeatureByKey(key: string): EntitlementFeatureSeed | undefined {
  return ENTITLEMENT_FEATURES.find(f => f.key === key)
}

/** All feature keys as a union type */
export type EntitlementFeatureKey = typeof ENTITLEMENT_FEATURES[number]['key']

/** Feature categories */
export const ENTITLEMENT_CATEGORIES = ['CORE', 'CRM', 'BILLING', 'APPS', 'FI'] as const
export type EntitlementCategory = typeof ENTITLEMENT_CATEGORIES[number]
