// Dependency/prerequisite rules.
// Use cases:
// - Assigning permission A requires permission B + D (fan-out)
// - UI gating: show why an action is unavailable

export type KeyRuleMap = Record<string, string[]>

// Example:
// {
//   'iam.authz.roles.manage': ['iam.authz.permissions.read', 'iam.authz.roles.read'],
// }
export const KEY_PREREQUISITES: KeyRuleMap = {
  // FI-GL: Consolidation requires COA access
  'fi.general_ledger.consolidation.manage': [
    'fi.general_ledger.chart-of-accounts.read',
    'fi.general_ledger.journal-entries.read',
  ],
  'fi.general_ledger.consolidation.view': [
    'fi.general_ledger.chart-of-accounts.read',
  ],
  // FI-GL: Year-end requires period management
  'fi.general_ledger.year-end.manage': [
    'fi.configuration.fiscal_yearss.manage',
    'fi.general_ledger.journal-entries.create',
  ],
  'fi.general_ledger.year-end.view': [
    'fi.configuration.fiscal_yearss.view',
  ],
  // FI-GL: Posting rules require COA access
  'fi.configuration.posting_rules.manage': [
    'fi.general_ledger.chart-of-accounts.read',
  ],
  'fi.general_ledger.posting-rules.update': [
    'fi.general_ledger.chart-of-accounts.read',
  ],
  // FI-GL: Approval requires journal access
  'fi.general_ledger.approval.approve': [
    'fi.general_ledger.journal-entries.read',
  ],
  'fi.general_ledger.approval.manage': [
    'fi.general_ledger.journal-entries.read',
    'fi.general_ledger.settings.manage',
  ],
  // FI-GL: Tax management requires COA and settings
  'fi.general_ledger.tax.manage': [
    'fi.general_ledger.chart-of-accounts.read',
    'fi.general_ledger.settings.view',
  ],
  // FI-GL: Reports require data access
  'fi.general_ledger.reports.generate': [
    'fi.general_ledger.chart-of-accounts.read',
    'fi.general_ledger.journal-entries.read',
    'fi.configuration.fiscal_yearss.view',
  ],
}

export function getPrerequisites(key: string): string[] {
  return KEY_PREREQUISITES[key] ?? []
}
