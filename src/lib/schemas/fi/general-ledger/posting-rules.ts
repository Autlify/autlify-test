import { z } from 'zod'
// ========== Schemas ==========

export const postingRuleSchema = z.object({
  code: z.string().min(1, 'Code is required').max(50),
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  sourceModule: z.enum([
    'MANUAL',
    'INVOICE',
    'PAYMENT',
    'EXPENSE',
    'PAYROLL',
    'ASSET',
    'INVENTORY',
    'BANK',
    'ADJUSTMENT',
    'CONSOLIDATION',
    'INTERCOMPANY',
    'REVERSAL',
    'YEAR_END',
    'OPENING_BALANCE',
  ]),
  debitAccountId: z.string().uuid('Invalid debit account'),
  creditAccountId: z.string().uuid('Invalid credit account'),
  amountType: z.enum(['FULL', 'PERCENTAGE', 'FIXED']),
  percentage: z.number().optional(),
  fixedAmount: z.number().optional(),
  conditions: z.record(z.string(), z.any()).optional(),
  isActive: z.boolean().default(true),
  priority: z.number().int().min(0).default(0),
  autoPost: z.boolean().default(false),
})

export const updatePostingRuleSchema = postingRuleSchema.partial().extend({
  id: z.string().uuid(),
})

export type PostingRuleInput = z.infer<typeof postingRuleSchema>
export type UpdatePostingRuleInput = z.infer<typeof updatePostingRuleSchema>
