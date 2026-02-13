/**
 * Bank Statement Import (schema placeholder)
 */

import { z } from 'zod'

export const bankStatementFormatEnum = z.enum(['MT940', 'CAMT053', 'CSV', 'OFX'])

export const bankStatementImportSchema = z.object({
  id: z.string().uuid().optional(),
  agencyId: z.string().uuid().optional(),
  subAccountId: z.string().uuid().nullable().optional(),

  bankAccountId: z.string().uuid(),
  format: bankStatementFormatEnum,
  statementDate: z.coerce.date().optional(),
  rawContent: z.string().min(1),

  status: z.enum(['RECEIVED', 'PARSED', 'FAILED']).default('RECEIVED'),
  errorMessage: z.string().max(2000).optional().nullable(),
})

export type BankStatementImport = z.infer<typeof bankStatementImportSchema>
