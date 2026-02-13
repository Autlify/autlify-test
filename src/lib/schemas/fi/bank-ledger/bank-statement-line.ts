import { z } from 'zod'

export const bankStatementLineSchema = z.object({
  id: z.string().uuid().optional(),
  entryDate: z.coerce.date(),
  amount: z.number(),
  currency: z.string().length(3).default('MYR'),
  description: z.string().max(1000).optional().nullable(),
  reference: z.string().max(200).optional().nullable(),
})

export const bankStatementLinesSchema = z.array(bankStatementLineSchema)

export type BankStatementLine = z.infer<typeof bankStatementLineSchema>
export type BankStatementLines = z.infer<typeof bankStatementLinesSchema>
