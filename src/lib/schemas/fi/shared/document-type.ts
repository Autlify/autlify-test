/**
 * Document Type schema (FI shared)
 */

import { z } from 'zod'

export const documentTypeSchema = z.object({
  id: z.string().uuid().optional(),
  agencyId: z.string().uuid().optional(),
  subAccountId: z.string().uuid().nullable().optional(),

  code: z.string().min(1).max(32), // e.g. 'APINV', 'ARINV', 'PAY', 'RCP'
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional().nullable(),

  // Optional defaults used when posting
  defaultDebitAccountId: z.string().uuid().optional().nullable(),
  defaultCreditAccountId: z.string().uuid().optional().nullable(),

  isActive: z.boolean().default(true),
})

export type DocumentType = z.infer<typeof documentTypeSchema>
