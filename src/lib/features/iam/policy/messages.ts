export type PolicySuggestion = 'NONE' | 'TOPUP' | 'UPGRADE' | 'CONTACT_ADMIN'

export type PolicyReason =
  | 'NO_SESSION'
  | 'NO_MEMBERSHIP'
  | 'NO_PERMISSION'
  | 'NO_SUBSCRIPTION'
  | 'FEATURE_DISABLED'
  | 'LIMIT_EXCEEDED'
  | 'INSUFFICIENT_CREDITS'

export const POLICY_MESSAGES: Record<PolicyReason, string> = {
  NO_SESSION: 'You must be signed in to perform this action.',
  NO_MEMBERSHIP: 'You do not have access to this workspace.',
  NO_PERMISSION: 'You do not have permission to perform this action.',
  NO_SUBSCRIPTION: 'This workspace does not have an active subscription.',
  FEATURE_DISABLED: 'This feature is not enabled for the current plan.',
  LIMIT_EXCEEDED: 'You have exceeded the current plan limit.',
  INSUFFICIENT_CREDITS: 'You have insufficient credits to perform this action.',
}
