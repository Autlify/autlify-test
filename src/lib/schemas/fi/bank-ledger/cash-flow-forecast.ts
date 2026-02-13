/**
 * Cash Flow Forecast
 *
 * Schema stub for generating cash flow forecast scenarios.
 */

import { z } from 'zod'

export const cashFlowForecastInputSchema = z.object({
  asOfDate: z.coerce.date().optional(),
  horizonDays: z.number().int().positive().max(365).optional().default(90),
  includeOpenItems: z.boolean().optional().default(true),
  includePlannedPayments: z.boolean().optional().default(false),
  includePlannedReceipts: z.boolean().optional().default(false),
  currencyCode: z.string().min(3).max(3).optional(),
})

export type CashFlowForecastInput = z.infer<typeof cashFlowForecastInputSchema>
