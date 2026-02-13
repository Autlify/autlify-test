/**
 * Payment Terms (contract schema)
 */

import { z } from 'zod'

export const paymentTermsSchema = z.object({
  id: z.string().uuid().optional(),
  agencyId: z.string().uuid().optional().nullable(),
  subAccountId: z.string().uuid().optional().nullable(),

  code: z.string().min(1).max(20),
  name: z.string().min(1).max(120),

  // Simple due date logic
  netDays: z.number().int().min(0).default(0),

  // Optional early payment discount
  discountDays: z.number().int().min(0).optional().nullable(),
  discountPercent: z.number().min(0).max(100).optional().nullable(),

  isActive: z.boolean().default(true),
})

export type PaymentTerms = z.infer<typeof paymentTermsSchema>
