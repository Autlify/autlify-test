// Platform-level entitlement feature catalog.
// Runtime entitlements should come from DB (EntitlementFeature/PlanFeature). This file is optional.

export const FEATURE_KEYS = {} as const

// Feature keys are stored in DB; keep as string for now.
export type FeatureKey = string
