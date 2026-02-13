/**
 * Withholding Tax (contract schema)
 */

import { z } from 'zod'

export const withholdingTaxSchema = z.object({
  id: z.string().uuid().optional(),
  agencyId: z.string().uuid().optional().nullable(),
  subAccountId: z.string().uuid().optional().nullable(),

  code: z.string().min(1).max(20),
  name: z.string().min(1).max(120),

  // Rate percentage 0..100
  ratePercent: z.number().min(0).max(100),

  // Optional GL account mapping (withholding payable)
  accountId: z.string().uuid().optional().nullable(),

  isActive: z.boolean().default(true),
})

export type WithholdingTax = z.infer<typeof withholdingTaxSchema>
