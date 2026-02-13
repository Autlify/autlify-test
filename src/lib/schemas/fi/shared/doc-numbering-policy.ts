/**
 * Document Numbering Policy (contract schema)
 *
 * This complements `number-range` and the `GLConfiguration.*Format` fields.
 * For now, it is a pure contract used by UI/setup wizard.
 */

import { z } from 'zod'

export const numberingResetRuleEnum = z.enum(['NEVER', 'YEARLY', 'MONTHLY', 'DAILY'])

export const docNumberingPolicySchema = z.object({
  id: z.string().uuid().optional(),
  agencyId: z.string().uuid().optional().nullable(),
  subAccountId: z.string().uuid().optional().nullable(),

  key: z.string().min(1).max(50), // e.g. 'ar_receipt', 'ap_payment', 'journal_entry'
  format: z.string().min(1).max(100),
  resetRule: numberingResetRuleEnum.default('YEARLY'),

  // Optional start seed for sequence numbers
  startSequence: z.number().int().min(1).optional().nullable(),

  isActive: z.boolean().default(true),
})

export type DocNumberingPolicy = z.infer<typeof docNumberingPolicySchema>
