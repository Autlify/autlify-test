/**
 * AR Aging (schema placeholder)
 */

import { z } from 'zod'

export const arAgingBucketSchema = z.object({
  label: z.string().min(1).max(32),
  fromDays: z.number().int().nonnegative(),
  toDays: z.number().int().nonnegative().optional().nullable(),
})

export const arAgingFilterSchema = z.object({
  customerId: z.string().uuid().optional(),
  asOfDate: z.coerce.date().optional(),
  buckets: z.array(arAgingBucketSchema).optional(),
})

export type ArAgingFilter = z.infer<typeof arAgingFilterSchema>
