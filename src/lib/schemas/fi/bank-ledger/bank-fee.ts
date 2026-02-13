/**
 * Bank Fees
 *
 * Schema stub for bank fee posting/categorization.
 */

import { z } from 'zod'

export const bankFeeSchema = z.object({
  bankAccountId: z.string().uuid(),
  feeDate: z.coerce.date(),
  amount: z.number(),
  currencyCode: z.string().min(3).max(3).optional(),
  description: z.string().max(512).optional().nullable(),
  reference: z.string().max(128).optional().nullable(),
})

export type BankFeeInput = z.infer<typeof bankFeeSchema>
