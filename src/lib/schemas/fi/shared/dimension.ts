/**
 * Dimension / Segment (contract schema)
 */

import { z } from 'zod'

export const dimensionValueSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(120),
  isActive: z.boolean().default(true),
})

export const dimensionSchema = z.object({
  id: z.string().uuid().optional(),
  agencyId: z.string().uuid().optional().nullable(),
  subAccountId: z.string().uuid().optional().nullable(),

  key: z.string().min(1).max(30), // e.g. 'segment', 'channel', 'project'
  displayName: z.string().min(1).max(120),

  values: z.array(dimensionValueSchema).default([]),
  isActive: z.boolean().default(true),
})

export type Dimension = z.infer<typeof dimensionSchema>
