/**
 * Exchange Rate schema (FI shared)
 */

import { z } from 'zod'

const CurrencyCode = z
  .string()
  .min(3)
  .max(3)
  .transform((s) => s.toUpperCase())
  .refine((s) => /^[A-Z]{3}$/u.test(s), { message: 'Currency must be a 3-letter ISO code' })

export const exchangeRateSchema = z.object({
  id: z.string().uuid().optional(),
  agencyId: z.string().uuid().optional(),
  subAccountId: z.string().uuid().nullable().optional(),

  rateDate: z.coerce.date(),
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  rate: z.number().positive(),

  source: z.string().max(64).optional().nullable(),
})

export type ExchangeRate = z.infer<typeof exchangeRateSchema>