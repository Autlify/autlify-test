import { z } from 'zod';

import { createJournalEntrySchema } from './journal-entry';

/**
 * Recurring Journal
 *
 * Contract-only schema (no persistence assumptions).
 * We reuse the Journal Entry create schema, but omit runtime-bound
 * fields (periodId, entryDate).
 */

export const recurringJournalTemplateSchema = createJournalEntrySchema.omit({
  periodId: true,
  entryDate: true,
});

export const createRecurringJournalSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isActive: z.boolean().default(true),

  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']),
  interval: z.number().int().min(1).default(1),

  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  timezone: z.string().max(64).optional(),

  nextRunDate: z.coerce.date().optional(),
  lastRunDate: z.coerce.date().optional(),

  template: recurringJournalTemplateSchema,
});

export const updateRecurringJournalSchema = createRecurringJournalSchema.extend({
  id: z.string().uuid(),
});

export const runRecurringJournalSchema = z.object({
  id: z.string().uuid(),
  runDate: z.coerce.date().optional(),
  periodId: z.string().uuid().optional(),
});

export type CreateRecurringJournalInput = z.infer<typeof createRecurringJournalSchema>;
export type UpdateRecurringJournalInput = z.infer<typeof updateRecurringJournalSchema>;
export type RunRecurringJournalInput = z.infer<typeof runRecurringJournalSchema>;
