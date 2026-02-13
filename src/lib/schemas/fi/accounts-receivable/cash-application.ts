/**
 * AR Cash Application
 *
 * Allocate an AR receipt to outstanding customer open items (FIFO / due-date order).
 * This is a lightweight contract; journal posting/fanout is handled separately.
 */

import { z } from 'zod'

export const cashApplicationOrderSchema = z.enum(['DUE_DATE', 'DOCUMENT_DATE', 'OLDEST_ENTRY'])

export const cashApplicationInputSchema = z.object({
  receiptId: z.string().uuid(),
  orderBy: cashApplicationOrderSchema.optional().default('DUE_DATE'),
  maxOpenItems: z.number().int().positive().max(500).optional().default(100),
  includeNotYetDue: z.boolean().optional().default(true),
  allowOverapply: z.boolean().optional().default(false),
  asOfDate: z.coerce.date().optional(),
  notes: z.string().max(2000).optional().nullable(),
})

export type CashApplicationInput = z.infer<typeof cashApplicationInputSchema>

export const cashApplicationAllocationSchema = z.object({
  openItemId: z.string().uuid(),
  allocatedAmount: z.number(),
  remainingOpenItemAmount: z.number().optional(),
  openItemStatus: z.enum(['OPEN', 'PARTIALLY_CLEARED', 'CLEARED']).optional(),
})

export const cashApplicationResultSchema = z.object({
  receiptId: z.string().uuid(),
  receiptNumber: z.string().optional().nullable(),
  customerId: z.string().uuid().optional().nullable(),
  appliedAmount: z.number(),
  remainingUnappliedAmount: z.number(),
  allocations: z.array(cashApplicationAllocationSchema),
})

export type CashApplicationAllocation = z.infer<typeof cashApplicationAllocationSchema>
export type CashApplicationResult = z.infer<typeof cashApplicationResultSchema>
