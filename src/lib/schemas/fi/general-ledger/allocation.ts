import { z } from 'zod';

/**
 * Allocation / Assessment / Distribution
 *
 * Contract-only schema (no persistence assumptions).
 * Used for automated cost allocations across accounts/dimensions.
 */

export const allocationFrequencySchema = z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY', 'ON_DEMAND']);

export const allocationTargetSchema = z.object({
  targetAccountId: z.string().uuid().optional(),
  targetCostCenterId: z.string().uuid().optional(),
  targetProfitCenterId: z.string().uuid().optional(),
  percentage: z.number().min(0).max(100),
});

export const createAllocationSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(1000).optional(),
  isActive: z.boolean().default(true),

  // Source scope
  sourceAccountIds: z.array(z.string().uuid()).min(1),
  sourceCostCenterIds: z.array(z.string().uuid()).optional(),
  sourceProfitCenterIds: z.array(z.string().uuid()).optional(),

  // Allocation driver
  driver: z.enum(['PERCENTAGE', 'STATISTICAL_KEY']).default('PERCENTAGE'),
  statisticalKey: z.string().max(64).optional(),

  // Targets
  targets: z.array(allocationTargetSchema).min(1),

  // Execution
  frequency: allocationFrequencySchema.default('ON_DEMAND'),
  roundingDecimals: z.number().int().min(0).max(6).default(2),
});

export const updateAllocationSchema = createAllocationSchema.extend({
  id: z.string().uuid(),
});

export const runAllocationSchema = z.object({
  id: z.string().uuid(),
  periodId: z.string().uuid().optional(),
  runDate: z.coerce.date().optional(),
});

export type CreateAllocationInput = z.infer<typeof createAllocationSchema>;
export type UpdateAllocationInput = z.infer<typeof updateAllocationSchema>;
export type RunAllocationInput = z.infer<typeof runAllocationSchema>;
