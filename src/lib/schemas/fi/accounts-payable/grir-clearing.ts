/**
 * GR/IR Clearing
 *
 * Contract stub for matching Goods Receipts (GR) to Invoice Receipts (IR).
 * In MVP we only define the schema so UI + service boundaries are stable.
 */

import { z } from 'zod'

export const grirClearingItemSchema = z.object({
  goodsReceiptId: z.string().uuid().optional(),
  purchaseOrderId: z.string().uuid().optional(),
  apInvoiceId: z.string().uuid().optional(),
  amount: z.number(),
  currencyCode: z.string().min(3).max(3).optional(),
})

export const grirClearingRunInputSchema = z.object({
  items: z.array(grirClearingItemSchema).min(1).max(500),
  postingDate: z.coerce.date().optional(),
  reference: z.string().max(128).optional(),
  notes: z.string().max(2000).optional().nullable(),
  dryRun: z.boolean().optional().default(true),
})

export type GrirClearingRunInput = z.infer<typeof grirClearingRunInputSchema>

export const grirClearingRunResultSchema = z.object({
  dryRun: z.boolean(),
  itemsProcessed: z.number().int().nonnegative(),
  totalAmount: z.number(),
  message: z.string().optional(),
})

export type GrirClearingRunResult = z.infer<typeof grirClearingRunResultSchema>
