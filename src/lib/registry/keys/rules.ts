// Dependency/prerequisite rules.
// Use cases:
// - Assigning permission A requires permission B + D (fan-out)
// - UI gating: show why an action is unavailable

export type KeyRuleMap = Record<string, string[]>

// Example:
// {
//   'iam.authz.roles.manage': ['iam.authz.permissions.read', 'iam.authz.roles.read'],
// }
export const KEY_PREREQUISITES: KeyRuleMap = {}

export function getPrerequisites(key: string): string[] {
  return KEY_PREREQUISITES[key] ?? []
}
