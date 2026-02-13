/**
 * FX Revaluation (contract schema)
 *
 * Represents an FX revaluation run for open items / balances.
 * Persistence + posting logic is out-of-scope for this contract.
 */

import { z } from 'zod'

export const fxRevaluationScopeEnum = z.enum(['OPEN_ITEMS', 'BALANCES'])

export const fxRevaluationRunSchema = z.object({
  id: z.string().uuid().optional(),
  agencyId: z.string().uuid().optional().nullable(),
  subAccountId: z.string().uuid().optional().nullable(),

  asOfDate: z.coerce.date(),
  scope: fxRevaluationScopeEnum.default('OPEN_ITEMS'),

  currencyCode: z.string().length(3).transform((s) => s.toUpperCase()).optional().nullable(),
  exchangeRateType: z.string().min(1).max(30).optional().nullable(),

  status: z.enum(['DRAFT', 'SIMULATED', 'POSTED']).default('DRAFT'),
  createdAt: z.coerce.date().optional().nullable(),
})

export type FxRevaluationRun = z.infer<typeof fxRevaluationRunSchema>
