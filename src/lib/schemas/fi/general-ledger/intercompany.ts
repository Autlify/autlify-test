/**
 * Intercompany (contract schema)
 */

import { z } from 'zod'

export const intercompanyTransactionSchema = z.object({
  id: z.string().uuid().optional(),
  agencyId: z.string().uuid().optional().nullable(),
  subAccountId: z.string().uuid().optional().nullable(),

  icPartnerCode: z.string().min(1).max(30),
  reference: z.string().max(100).optional().nullable(),
  documentDate: z.coerce.date(),
  postingDate: z.coerce.date().optional().nullable(),

  currencyCode: z.string().length(3).transform((s) => s.toUpperCase()).optional().nullable(),
  amount: z.number(),

  status: z.enum(['DRAFT', 'POSTED', 'SETTLED']).default('DRAFT'),
})

export type IntercompanyTransaction = z.infer<typeof intercompanyTransactionSchema>
