/**
 * Petty Cash
 *
 * Schema stub for petty cash transactions (in/out) and reimbursements.
 */

import { z } from 'zod'

export const pettyCashTransactionSchema = z.object({
  fundId: z.string().uuid(),
  transactionDate: z.coerce.date(),
  direction: z.enum(['IN', 'OUT']),
  amount: z.number(),
  currencyCode: z.string().min(3).max(3).optional(),
  narration: z.string().max(512).optional().nullable(),
  reference: z.string().max(128).optional().nullable(),
})

export type PettyCashTransactionInput = z.infer<typeof pettyCashTransactionSchema>
