/**
 * Ledger Group (contract schema)
 */

import { z } from 'zod'

export const ledgerGroupSchema = z.object({
  id: z.string().uuid().optional(),
  agencyId: z.string().uuid().optional().nullable(),
  subAccountId: z.string().uuid().optional().nullable(),

  code: z.string().min(1).max(10),
  name: z.string().min(1).max(120),

  ledgerCodes: z.array(z.string().min(1).max(10)).min(1),
  isActive: z.boolean().default(true),
})

export type LedgerGroup = z.infer<typeof ledgerGroupSchema>
