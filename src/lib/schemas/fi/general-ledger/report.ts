
import { z } from 'zod';

export const generateReportSchema = z.object({
  reportType: z.enum([
    'BALANCE_SHEET',
    'INCOME_STATEMENT',
    'CASH_FLOW',
    'TRIAL_BALANCE',
    'GENERAL_LEDGER',
    'SUBSIDIARY_LEDGER',
    'ACCOUNT_BALANCE',
    'CONSOLIDATED_BALANCE_SHEET',
    'CONSOLIDATED_INCOME_STATEMENT',
    'CONSOLIDATED_CASH_FLOW',
    'INTERCOMPANY_REPORT',
    'CUSTOM',
  ]),
  
  // Time range
  periodId: z.string().uuid().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  
  // Filters
  accountIds: z.array(z.string().uuid()).optional(),
  accountTypes: z.array(z.enum([
    'ASSET',
    'LIABILITY',
    'EQUITY',
    'REVENUE',
    'EXPENSE',
  ])).optional(),
  
  // For consolidation reports
  subAccountIds: z.array(z.string().uuid()).optional(),
  consolidationSnapshotId: z.string().uuid().optional(),
  
  // Options
  includeZeroBalances: z.boolean().default(false),
  showAccountDetails: z.boolean().default(true),
  comparePeriodId: z.string().uuid().optional(), // For comparative reports
  
  // Export format
  format: z.enum(['PDF', 'EXCEL', 'CSV', 'JSON']).default('PDF'),
});

export const saveReportSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  reportType: z.enum([
    'BALANCE_SHEET',
    'INCOME_STATEMENT',
    'CASH_FLOW',
    'TRIAL_BALANCE',
    'GENERAL_LEDGER',
    'SUBSIDIARY_LEDGER',
    'ACCOUNT_BALANCE',
    'CONSOLIDATED_BALANCE_SHEET',
    'CONSOLIDATED_INCOME_STATEMENT',
    'CONSOLIDATED_CASH_FLOW',
    'INTERCOMPANY_REPORT',
    'CUSTOM',
  ]),
  parameters: z.array(z.object({
    key: z.string(),
    value: z.any(),
  })),
  isScheduled: z.boolean().default(false),
  schedule: z.string().optional(), // Cron expression
});

export type GenerateReportInput = z.infer<typeof generateReportSchema>;
export type SaveReportInput = z.infer<typeof saveReportSchema>;