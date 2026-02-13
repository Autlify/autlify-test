import { z } from 'zod'

/**
 * Bank statement matching rules (contract-only for MVP).
 *
 * Persisted via tenant settingsJson (no migration) under namespace:
 *   fi.bankLedger.matchingRules
 */

export const bankMatchingCriteriaSchema = z.object({
  /** Optional currency filter (ISO-4217) */
  currency: z.string().length(3).optional(),
  /** Absolute tolerance on amount matching (e.g. 0.01 for cents) */
  amountTolerance: z.number().nonnegative().default(0),
  /** Window around booking date to consider a match (days) */
  dateWindowDays: z.number().int().min(0).max(365).default(3),
  /** Free-text contains match against description / memo */
  descriptionContainsAny: z.array(z.string().min(1)).default([]),
  /** Counterparty contains match (payer/payee) */
  counterpartyContainsAny: z.array(z.string().min(1)).default([]),
})

export const bankMatchingActionSchema = z.object({
  /** Suggest posting to a GL account */
  suggestedGlAccountId: z.string().uuid().optional(),
  /** Suggest applying a posting rule template */
  postingRuleTemplateId: z.string().uuid().optional(),
  /** Optional tag/label for UI */
  label: z.string().max(64).optional(),
})

export const bankMatchingRuleSchema = z.object({
  id: z.string().min(6),
  name: z.string().min(2).max(80),
  enabled: z.boolean().default(true),
  /** Lower number = higher priority */
  priority: z.number().int().min(0).default(100),
  criteria: bankMatchingCriteriaSchema,
  action: bankMatchingActionSchema,
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export const bankMatchingRulesSchema = z.array(bankMatchingRuleSchema)

export type BankMatchingRule = z.infer<typeof bankMatchingRuleSchema>
export type BankMatchingRules = z.infer<typeof bankMatchingRulesSchema>
