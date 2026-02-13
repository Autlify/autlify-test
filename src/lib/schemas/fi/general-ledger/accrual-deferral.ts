import { z } from 'zod';

/**
 * Accrual / Deferral Schedule
 *
 * Contract-only schema (no persistence assumptions).
 * Intended for prepaid expenses / deferred revenue / accrual postings.
 */

export const accrualMethodSchema = z.enum(['STRAIGHT_LINE', 'CUSTOM']);
export const recognitionFrequencySchema = z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']);

export const accrualCustomScheduleLineSchema = z.object({
  recognitionDate: z.coerce.date(),
  amount: z.number().positive(),
});

export const createAccrualDeferralSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(1000).optional(),
  isActive: z.boolean().default(true),

  // Core accounting
  debitAccountId: z.string().uuid(),
  creditAccountId: z.string().uuid(),
  currencyCode: z.string().length(3).default('USD'),
  totalAmount: z.number().positive(),

  // Timing
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  recognitionFrequency: recognitionFrequencySchema.default('MONTHLY'),
  postingDayOfMonth: z.number().int().min(1).max(31).optional(),

  method: accrualMethodSchema.default('STRAIGHT_LINE'),
  customSchedule: z.array(accrualCustomScheduleLineSchema).optional(),

  // Reversal behavior
  autoReverse: z.boolean().default(false),
  reversalDate: z.coerce.date().optional(),

  // Optional allocations/dimensions
  dimension1: z.string().max(50).optional(),
  dimension2: z.string().max(50).optional(),
  dimension3: z.string().max(50).optional(),
  dimension4: z.string().max(50).optional(),
}).refine(
  (data) => {
    if (data.method !== 'CUSTOM') return true;
    return !!data.customSchedule && data.customSchedule.length > 0;
  },
  { message: 'customSchedule is required when method=CUSTOM' }
).refine(
  (data) => {
    if (!data.autoReverse) return true;
    return !!data.reversalDate;
  },
  { message: 'reversalDate is required when autoReverse=true' }
);

export const updateAccrualDeferralSchema = createAccrualDeferralSchema.extend({
  id: z.string().uuid(),
});

export const runAccrualDeferralSchema = z.object({
  id: z.string().uuid(),
  asOfDate: z.coerce.date().optional(),
  periodId: z.string().uuid().optional(),
});

export type CreateAccrualDeferralInput = z.infer<typeof createAccrualDeferralSchema>;
export type UpdateAccrualDeferralInput = z.infer<typeof updateAccrualDeferralSchema>;
export type RunAccrualDeferralInput = z.infer<typeof runAccrualDeferralSchema>;
