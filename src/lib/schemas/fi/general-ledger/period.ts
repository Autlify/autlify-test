
import { z } from 'zod';

export const createPeriodSchema = z.object({
  name: z.string().min(1).max(100),
  shortName: z.string().max(20).optional(),
  
  periodType: z.enum([
    'MONTH',
    'QUARTER',
    'HALF_YEAR',
    'YEAR',
    'CUSTOM',
  ]),
  
  fiscalYear: z.number().int().min(2000).max(2100),
  fiscalPeriod: z.number().int().min(1).max(12),
  
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  
  isYearEnd: z.boolean().default(false),
  notes: z.string().max(1000).optional(),
}).refine(
  (data) => data.endDate > data.startDate,
  { message: 'End date must be after start date' }
);

export const updatePeriodSchema = createPeriodSchema.extend({
  id: z.string().uuid(),
});

export const openPeriodSchema = z.object({
  id: z.string().uuid(),
});

export const closePeriodSchema = z.object({
  id: z.string().uuid(),
  notes: z.string().max(500).optional(),
});

export const lockPeriodSchema = z.object({
  id: z.string().uuid(),
  notes: z.string().max(500).optional(),
});

export const yearEndProcessingSchema = z.object({
  periodId: z.string().uuid(),
  retainedEarningsAccountId: z.string().uuid(),
  createBroughtForward: z.boolean().default(true),
  notes: z.string().max(1000).optional(),
});


export type UpdatePeriodInput = Partial<z.infer<typeof updatePeriodSchema>>;
export type CreatePeriodInput = z.infer<typeof createPeriodSchema>;
export type YearEndProcessingInput = z.infer<typeof yearEndProcessingSchema>;