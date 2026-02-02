/**
 * General Ledger Constants
 * FI-GL Module - Shared constants and configurations
 */

// Account Categories
export const ACCOUNT_CATEGORIES = {
  ASSET: 'ASSET',
  LIABILITY: 'LIABILITY',
  EQUITY: 'EQUITY',
  REVENUE: 'REVENUE',
  EXPENSE: 'EXPENSE',
} as const;

export type AccountCategory = typeof ACCOUNT_CATEGORIES[keyof typeof ACCOUNT_CATEGORIES];

// Account Types for each category
export const ASSET_TYPES = [
  'CURRENT_ASSET',
  'FIXED_ASSET',
  'OTHER_ASSET',
  'BANK',
  'ACCOUNTS_RECEIVABLE',
  'INVENTORY',
  'PREPAID_EXPENSE',
];

export const LIABILITY_TYPES = [
  'CURRENT_LIABILITY',
  'LONG_TERM_LIABILITY',
  'ACCOUNTS_PAYABLE',
  'CREDIT_CARD',
  'ACCRUED_EXPENSE',
];

export const EQUITY_TYPES = [
  'EQUITY',
  'RETAINED_EARNINGS',
  'OWNERS_EQUITY',
  'ACCUMULATED_OTHER_COMPREHENSIVE_INCOME',
];

export const REVENUE_TYPES = [
  'OPERATING_REVENUE',
  'OTHER_REVENUE',
  'SALES',
  'SERVICE_REVENUE',
];

export const EXPENSE_TYPES = [
  'OPERATING_EXPENSE',
  'COST_OF_GOODS_SOLD',
  'DEPRECIATION',
  'OTHER_EXPENSE',
  'ADMINISTRATIVE_EXPENSE',
];

// Journal Entry Types
export const JOURNAL_ENTRY_TYPES = {
  MANUAL: 'MANUAL',
  AUTO: 'AUTO',
  ADJUSTMENT: 'ADJUSTMENT',
  ACCRUAL: 'ACCRUAL',
  DEFERRAL: 'DEFERRAL',
  REVERSAL: 'REVERSAL',
  CLOSING: 'CLOSING',
  OPENING: 'OPENING',
  RECLASSIFICATION: 'RECLASSIFICATION',
  CONSOLIDATION: 'CONSOLIDATION',
} as const;

// Journal Entry Statuses
export const JOURNAL_ENTRY_STATUSES = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  VOIDED: 'VOIDED',
} as const;

// Period Statuses
export const PERIOD_STATUSES = {
  DRAFT: 'DRAFT',
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  LOCKED: 'LOCKED',
} as const;

// Report Types
export const REPORT_TYPES = {
  TRIAL_BALANCE: 'Trial Balance',
  BALANCE_SHEET: 'Balance Sheet',
  INCOME_STATEMENT: 'Income Statement',
  CASH_FLOW: 'Cash Flow Statement',
  GENERAL_LEDGER: 'General Ledger',
  ACCOUNT_ACTIVITY: 'Account Activity',
  JOURNAL_REGISTER: 'Journal Register',
} as const;

// Financial Statement Templates
export const BALANCE_SHEET_SECTIONS = {
  ASSETS: {
    CURRENT_ASSETS: ['BANK', 'ACCOUNTS_RECEIVABLE', 'INVENTORY', 'PREPAID_EXPENSE', 'CURRENT_ASSET'],
    FIXED_ASSETS: ['FIXED_ASSET'],
    OTHER_ASSETS: ['OTHER_ASSET'],
  },
  LIABILITIES: {
    CURRENT_LIABILITIES: ['ACCOUNTS_PAYABLE', 'CREDIT_CARD', 'ACCRUED_EXPENSE', 'CURRENT_LIABILITY'],
    LONG_TERM_LIABILITIES: ['LONG_TERM_LIABILITY'],
  },
  EQUITY: {
    EQUITY: ['EQUITY', 'OWNERS_EQUITY', 'RETAINED_EARNINGS', 'ACCUMULATED_OTHER_COMPREHENSIVE_INCOME'],
  },
};

export const INCOME_STATEMENT_SECTIONS = {
  REVENUE: {
    OPERATING_REVENUE: ['OPERATING_REVENUE', 'SALES', 'SERVICE_REVENUE'],
    OTHER_REVENUE: ['OTHER_REVENUE'],
  },
  EXPENSES: {
    COST_OF_GOODS_SOLD: ['COST_OF_GOODS_SOLD'],
    OPERATING_EXPENSES: ['OPERATING_EXPENSE', 'ADMINISTRATIVE_EXPENSE'],
    DEPRECIATION: ['DEPRECIATION'],
    OTHER_EXPENSES: ['OTHER_EXPENSE'],
  },
};

// Default COA Templates
export const DEFAULT_COA_TEMPLATES = {
  STARTUP: 'startup',
  SMALL_BUSINESS: 'small_business',
  ECOMMERCE: 'ecommerce',
  SERVICE_COMPANY: 'service_company',
  MANUFACTURING: 'manufacturing',
  NONPROFIT: 'nonprofit',
} as const;

// Currencies (common ones)
export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
];

// Validation Rules
export const VALIDATION_RULES = {
  MAX_HIERARCHY_DEPTH: 7,
  MAX_ACCOUNT_CODE_LENGTH: 20,
  MAX_ACCOUNT_NAME_LENGTH: 100,
  MIN_ACCOUNT_CODE_LENGTH: 2,
  DECIMAL_PRECISION: 6,
  DECIMAL_SCALE: 2,
  MAX_JOURNAL_ENTRY_LINES: 1000,
  MIN_JOURNAL_ENTRY_LINES: 2,
};

// ─────────────────────────────────────────────────────────────────────────────
// GL Permissions - Re-export from Single Source of Truth (Registry)
// ─────────────────────────────────────────────────────────────────────────────
// DEPRECATED: Import directly from '@/lib/registry/keys/permissions' instead
// or use the convenience exports from './core/permissions.ts'
// ─────────────────────────────────────────────────────────────────────────────
import { KEYS } from '@/lib/registry/keys/permissions'

/** @deprecated Use KEYS.fi directly from '@/lib/registry/keys/permissions' */
export const GL_PERMISSIONS = {
  // Accounts (Master Data)
  COA: {
    VIEW: KEYS.fi.master_data.accounts.view,
    MANAGE: KEYS.fi.master_data.accounts.manage,
  },
  // Journal Entries (Transactions)
  JOURNAL: {
    VIEW: KEYS.fi.general_ledger.journal_entries.read,
    CREATE: KEYS.fi.general_ledger.journal_entries.create,
    EDIT: KEYS.fi.general_ledger.journal_entries.update,
    DELETE: KEYS.fi.general_ledger.journal_entries.delete,
    APPROVE: KEYS.fi.general_ledger.journal_entries.approve,
  },
  // Periods (Configuration)
  PERIOD: {
    VIEW: KEYS.fi.configuration.fiscal_years.view,
    MANAGE: KEYS.fi.configuration.fiscal_years.manage,
  },
  // Reports
  REPORT: {
    VIEW: KEYS.fi.general_ledger.reports.view,
    GENERATE: KEYS.fi.general_ledger.reports.generate,
    APPROVE: KEYS.fi.general_ledger.reports.approve,
  },
  // Settings
  SETTINGS: {
    VIEW: KEYS.fi.general_ledger.settings.view,
    MANAGE: KEYS.fi.general_ledger.settings.manage,
    SETUP: KEYS.fi.general_ledger.settings.setup,
  },
  // Reconciliation
  RECONCILIATION: {
    VIEW: KEYS.fi.general_ledger.reconciliation.view,
    MANAGE: KEYS.fi.general_ledger.reconciliation.manage,
    CLEAR: KEYS.fi.general_ledger.reconciliation.clear,
  },
  // Consolidation
  CONSOLIDATION: {
    VIEW: KEYS.fi.general_ledger.consolidation.view,
    MANAGE: KEYS.fi.general_ledger.consolidation.manage,
  },
  // Year-End Closing
  YEAR_END: {
    VIEW: KEYS.fi.general_ledger.year_end.view,
    MANAGE: KEYS.fi.general_ledger.year_end.manage,
    CLOSE: KEYS.fi.general_ledger.year_end.close,
  },
  // Currency (Configuration)
  CURRENCY: {
    VIEW: KEYS.fi.configuration.currencies.view,
    MANAGE: KEYS.fi.configuration.currencies.manage,
  },
  // Tax (Configuration)
  TAX: {
    VIEW: KEYS.fi.configuration.tax_settings.view,
    MANAGE: KEYS.fi.configuration.tax_settings.manage,
  },
  // Posting Rules (Configuration)
  POSTING_RULES: {
    VIEW: KEYS.fi.configuration.posting_rules.view,
    MANAGE: KEYS.fi.configuration.posting_rules.manage,
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You do not have permission to perform this action',
  PERIOD_CLOSED: 'Cannot modify entries in closed periods',
  PERIOD_LOCKED: 'Cannot modify entries in locked periods',
  INVALID_DOUBLE_ENTRY: 'Debits and credits must balance',
  DUPLICATE_ACCOUNT_CODE: 'Account code already exists',
  ACCOUNT_HAS_CHILDREN: 'Cannot delete account with child accounts',
  ACCOUNT_HAS_TRANSACTIONS: 'Cannot delete account with transactions',
  MAX_HIERARCHY_DEPTH_EXCEEDED: 'Maximum account hierarchy depth exceeded',
  PERIOD_OVERLAP: 'Financial period overlaps with existing period',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  ACCOUNT_CREATED: 'Account created successfully',
  ACCOUNT_UPDATED: 'Account updated successfully',
  ACCOUNT_DELETED: 'Account deleted successfully',
  JOURNAL_ENTRY_CREATED: 'Journal entry created successfully',
  JOURNAL_ENTRY_UPDATED: 'Journal entry updated successfully',
  JOURNAL_ENTRY_SUBMITTED: 'Journal entry submitted for approval',
  JOURNAL_ENTRY_APPROVED: 'Journal entry approved and posted',
  JOURNAL_ENTRY_REJECTED: 'Journal entry rejected',
  PERIOD_OPENED: 'Period opened successfully',
  PERIOD_CLOSED: 'Period closed successfully',
  PERIOD_LOCKED: 'Period locked successfully',
};
