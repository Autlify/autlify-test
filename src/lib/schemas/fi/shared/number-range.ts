/**
 * Number Range schema (FI shared)
 *
 * A future persisted number range service should be used for doc numbering.
 * For now, this is a schema placeholder to keep contracts consistent.
 */

import { z } from 'zod'

export const numberRangeResetRuleEnum = z.enum(['NEVER', 'YEARLY', 'MONTHLY'])

export const numberRangeSchema = z.object({
  id: z.string().uuid().optional(),
  agencyId: z.string().uuid().optional(),
  subAccountId: z.string().uuid().nullable().optional(),

  key: z.string().min(1).max(64), // e.g. 'AP_PAYMENT', 'AR_RECEIPT'
  prefix: z.string().max(16).optional().nullable(),
  format: z.string().max(64).optional().nullable(),
  nextSequence: z.number().int().nonnegative().default(1),
  resetRule: numberRangeResetRuleEnum.default('YEARLY'),
  isActive: z.boolean().default(true),
})

export type NumberRange = z.infer<typeof numberRangeSchema>
