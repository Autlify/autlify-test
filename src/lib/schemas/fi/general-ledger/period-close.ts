/**
 * Period Close / Closing Cockpit (contract schema)
 */

import { z } from 'zod'

export const closeTaskSchema = z.object({
  key: z.string().min(1).max(50),
  title: z.string().min(1).max(200),
  isCompleted: z.boolean().default(false),
  completedAt: z.coerce.date().optional().nullable(),
})

export const periodCloseSchema = z.object({
  id: z.string().uuid().optional(),
  agencyId: z.string().uuid().optional().nullable(),
  subAccountId: z.string().uuid().optional().nullable(),

  fiscalYear: z.number().int(),
  period: z.number().int().min(1).max(16),

  status: z.enum(['OPEN', 'SOFT_CLOSE', 'FINAL_CLOSE']).default('OPEN'),
  tasks: z.array(closeTaskSchema).default([]),

  lockedAt: z.coerce.date().optional().nullable(),
  lockedBy: z.string().uuid().optional().nullable(),
})

export type PeriodClose = z.infer<typeof periodCloseSchema>
