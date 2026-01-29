
import { z } from 'zod';

export const glConfigurationSchema = z.object({
  // General settings
  baseCurrency: z.string().length(3).default('USD'),
  fiscalYearEnd: z.string().regex(/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/).default('12-31'),
  fiscalYearStart: z.string().regex(/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/).default('01-01'),
  useControlAccounts: z.boolean().default(true),
  
  // Posting settings
  requireApproval: z.boolean().default(true),
  approvalThreshold: z.number().positive().optional(),
  autoPostingEnabled: z.boolean().default(false),
  allowFuturePeriodPost: z.boolean().default(false),
  allowClosedPeriodPost: z.boolean().default(false),
  
  // Consolidation settings
  consolidationEnabled: z.boolean().default(false),
  consolidationMethod: z.enum(['FULL', 'PROPORTIONAL', 'EQUITY']).default('FULL'),
  eliminateIntercompany: z.boolean().default(true),
  
  // Period settings
  autoCreatePeriods: z.boolean().default(true),
  periodLockDays: z.number().int().min(0).max(365).default(5),
  
  // Number formats
  accountCodeFormat: z.string().max(20).default('####-####'),
  accountCodeLength: z.number().int().min(4).max(20).default(8),
  accountCodeSeparator: z.string().max(1).default('-'),
  
  // ERP Integrations
  erpIntegrationEnabled: z.boolean().default(false),
  erpSystemType: z.string().nullable().optional(),
  erpApiUrl: z.string().url().nullable().optional(),
  erpApiKey: z.string().nullable().optional(),
  
  // Audit retention
  retainAuditDays: z.number().int().min(365).max(3650).default(2555),
});

export const updateGLConfigurationSchema = glConfigurationSchema.partial();

export type GLConfigurationInput = z.infer<typeof glConfigurationSchema>;
export type UpdateGLConfigurationInput = z.infer<typeof updateGLConfigurationSchema>;