import { z } from 'zod';

/**
 * Budget / Plan
 *
 * Contract-only schema (no persistence assumptions).
 * Designed to support simple account+dimension budgeting.
 */

export const budgetLineSchema = z.object({
  accountId: z.string().uuid(),
  costCenterId: z.string().uuid().optional(),
  profitCenterId: z.string().uuid().optional(),
  // Amounts keyed by period identifier (e.g. '2026-01' or a periodId)
  amounts: z.record(z.string().min(1), z.number()),
});

export const createBudgetSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(1000).optional(),
  isActive: z.boolean().default(true),

  currencyCode: z.string().length(3).default('USD'),

  // Optional scoping: can be used for agency/subaccount-level budgets
  agencyId: z.string().uuid().optional(),
  subAccountId: z.string().uuid().optional(),

  // Budget horizon
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  periodIds: z.array(z.string().uuid()).optional(),

  lines: z.array(budgetLineSchema).min(1),
});

export const updateBudgetSchema = createBudgetSchema.extend({
  id: z.string().uuid(),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
