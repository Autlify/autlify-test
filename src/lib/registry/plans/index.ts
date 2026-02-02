export * from './price-mapping'
export * from './plan-entitlements'
// Export unified plans with explicit names to avoid conflicts
// Note: FeatureKey is exported from @/lib/registry/keys/features, not here
export {
  PLANS,
  ADDONS,
  FEATURES,
  PLAN_LIMITS,
  ADDON_GRANTS,
  getEffectiveLimit,
  isFeatureEnabled,
  isUnlimited,
  getNumericLimit,
  formatLimit,
  getFeature,
  getPlanByPriceId,
  getPlanKeyByPriceId,
  generatePlanFeatureSeeds,
  type PlanKey,
  type AddonKey,
  type UnifiedFeatureKey,
} from './unified-plans'
