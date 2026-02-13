/**
 * Dunning (schema placeholder)
 */

import { z } from 'zod'

export const dunningLevelSchema = z.object({
  level: z.number().int().positive(),
  daysPastDue: z.number().int().nonnegative(),
  feeAmount: z.number().nonnegative().optional().nullable(),
  templateId: z.string().uuid().optional().nullable(),
})

export const dunningPolicySchema = z.object({
  id: z.string().uuid().optional(),
  agencyId: z.string().uuid().optional(),
  subAccountId: z.string().uuid().nullable().optional(),

  name: z.string().min(1).max(120),
  currency: z.string().min(3).max(3).transform((s) => s.toUpperCase()).optional().nullable(),
  levels: z.array(dunningLevelSchema).min(1),
  isActive: z.boolean().default(true),
})

export type DunningPolicy = z.infer<typeof dunningPolicySchema>
