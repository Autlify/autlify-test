// Static mapping layer (optional).
// In your design, planId == Stripe recurring priceId, so the default mapping is identity.

export function resolvePlanIdFromPriceId(priceId: string): string {
  return priceId
}
