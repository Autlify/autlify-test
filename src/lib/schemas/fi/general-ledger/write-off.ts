/**
 * Open Item Write-Off
 *
 * Marks one or more open items as written-off and creates allocation records.
 * Journal posting (expense/income recognition) is intentionally out-of-scope for now.
 */

import { z } from 'zod'

export const writeOffOpenItemsInputSchema = z.object({
  openItemIds: z.array(z.string().uuid()).min(1).max(500),
  writeOffDate: z.coerce.date().optional(),
  documentNumber: z.string().min(1).max(64).optional(),
  reason: z.string().min(1).max(512),
  notes: z.string().max(2000).optional().nullable(),
  // Future: specify GL write-off account and whether to post journal entry
  writeOffAccountId: z.string().uuid().optional(),
  postJournal: z.boolean().optional().default(false),
})

export type WriteOffOpenItemsInput = z.infer<typeof writeOffOpenItemsInputSchema>

export const writeOffOpenItemsResultSchema = z.object({
  documentNumber: z.string(),
  writeOffDate: z.coerce.date(),
  itemsWrittenOff: z.number().int().nonnegative(),
  totalLocalAmount: z.number(),
  openItemIds: z.array(z.string().uuid()),
})

export type WriteOffOpenItemsResult = z.infer<typeof writeOffOpenItemsResultSchema>
