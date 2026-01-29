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

// Permissions Map
export const GL_PERMISSIONS = {
  COA: {
    VIEW: 'fi.general-ledger.coa.view',
    CREATE: 'fi.general-ledger.coa.create',
    EDIT: 'fi.general-ledger.coa.edit',
    DELETE: 'fi.general-ledger.coa.delete',
    MANAGE_HIERARCHY: 'fi.general-ledger.coa.manage_hierarchy',
  },
  JOURNAL: {
    VIEW: 'fi.general-ledger.journal.view',
    CREATE: 'fi.general-ledger.journal.create',
    EDIT_DRAFT: 'fi.general-ledger.journal.edit_draft',
    SUBMIT: 'fi.general-ledger.journal.submit',
    APPROVE: 'fi.general-ledger.journal.approve',
    REJECT: 'fi.general-ledger.journal.reject',
    POST: 'fi.general-ledger.journal.post',
    REVERSE: 'fi.general-ledger.journal.reverse',
    VOID: 'fi.general-ledger.journal.void',
  },
  PERIOD: {
    VIEW: 'fi.general-ledger.period.view',
    CREATE: 'fi.general-ledger.period.create',
    EDIT: 'fi.general-ledger.period.edit',
    OPEN: 'fi.general-ledger.period.open',
    CLOSE: 'fi.general-ledger.period.close',
    LOCK: 'fi.general-ledger.period.lock',
  },
  REPORT: {
    VIEW: 'fi.general-ledger.report.view',
    GENERATE: 'fi.general-ledger.report.generate',
    EXPORT: 'fi.general-ledger.report.export',
  },
  SETTINGS: {
    VIEW: 'fi.general-ledger.settings.view',
    EDIT: 'fi.general-ledger.settings.edit',
  },
};

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
