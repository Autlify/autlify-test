import { z } from 'zod';

/**
 * Financial Statement Layout (FSV)
 *
 * Contract-only schema (no persistence assumptions).
 * Allows the UI to define report grouping & presentation.
 */

export const fsvReportTypeSchema = z.enum(['BALANCE_SHEET', 'INCOME_STATEMENT', 'CASH_FLOW', 'TRIAL_BALANCE']);

export const fsvLineTypeSchema = z.enum(['HEADER', 'GROUP', 'ACCOUNT', 'FORMULA']);

export const fsvLineSchema = z.object({
  id: z.string().max(64),
  label: z.string().min(1).max(120),
  lineType: fsvLineTypeSchema,
  // For ACCOUNT lines
  accountIds: z.array(z.string().uuid()).optional(),
  accountCodes: z.array(z.string().min(1)).optional(),
  // For FORMULA lines
  formula: z.string().max(500).optional(),
  // Hierarchy
  children: z.array(z.string().max(64)).optional(),
});

export const createFinancialStatementLayoutSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(1000).optional(),
  isActive: z.boolean().default(true),
  reportType: fsvReportTypeSchema,
  currencyCode: z.string().length(3).optional(),

  lines: z.array(fsvLineSchema).min(1),
  rootLineIds: z.array(z.string().max(64)).min(1),
});

export const updateFinancialStatementLayoutSchema = createFinancialStatementLayoutSchema.extend({
  id: z.string().uuid(),
});

export type CreateFinancialStatementLayoutInput = z.infer<typeof createFinancialStatementLayoutSchema>;
export type UpdateFinancialStatementLayoutInput = z.infer<typeof updateFinancialStatementLayoutSchema>;
