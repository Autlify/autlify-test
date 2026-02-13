/**
 * Cost Center schema (FI shared)
 *
 * Minimal master data used for future allocations/assessments.
 */

import { z } from 'zod'

export const costCenterSchema = z.object({
  id: z.string().uuid().optional(),
  agencyId: z.string().uuid().optional(),
  subAccountId: z.string().uuid().nullable().optional(),

  code: z.string().min(1).max(32),
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional().nullable(),

  isActive: z.boolean().default(true),
})

export type CostCenter = z.infer<typeof costCenterSchema>
