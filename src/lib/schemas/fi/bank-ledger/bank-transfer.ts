/**
 * Bank Transfer (schema placeholder)
 */

import { z } from 'zod'

export const bankTransferSchema = z.object({
  id: z.string().uuid().optional(),
  agencyId: z.string().uuid().optional(),
  subAccountId: z.string().uuid().nullable().optional(),

  fromBankAccountId: z.string().uuid(),
  toBankAccountId: z.string().uuid(),

  transferDate: z.coerce.date(),
  amount: z.number().positive(),
  currency: z.string().min(3).max(3).transform((s) => s.toUpperCase()),
  reference: z.string().max(140).optional().nullable(),

  status: z.enum(['DRAFT', 'SUBMITTED', 'COMPLETED', 'VOID']).default('DRAFT'),
})

export type BankTransfer = z.infer<typeof bankTransferSchema>
