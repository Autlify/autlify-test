/**
 * AP Aging (schema placeholder)
 */

import { z } from 'zod'

export const apAgingBucketSchema = z.object({
  label: z.string().min(1).max(32),
  fromDays: z.number().int().nonnegative(),
  toDays: z.number().int().nonnegative().optional().nullable(),
})

export const apAgingFilterSchema = z.object({
  vendorId: z.string().uuid().optional(),
  asOfDate: z.coerce.date().optional(),
  buckets: z.array(apAgingBucketSchema).optional(),
})

export type ApAgingFilter = z.infer<typeof apAgingFilterSchema>
