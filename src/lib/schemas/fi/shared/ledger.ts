/**
 * Ledger (contract schema)
 */

import { z } from 'zod'

export const ledgerSchema = z.object({
  id: z.string().uuid().optional(),
  agencyId: z.string().uuid().optional().nullable(),
  subAccountId: z.string().uuid().optional().nullable(),

  code: z.string().min(1).max(10),
  name: z.string().min(1).max(120),
  currencyCode: z.string().length(3).transform((s) => s.toUpperCase()).optional().nullable(),

  isLeading: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

export type Ledger = z.infer<typeof ledgerSchema>
