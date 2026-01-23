import type { UsagePeriod } from '@/generated/prisma/client'

export type UsageWindow = { periodStart: Date; periodEnd: Date }

function startOfDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

function addDays(d: Date, days: number): Date {
  const out = new Date(d)
  out.setUTCDate(out.getUTCDate() + days)
  return out
}

export function getUsageWindow(period: UsagePeriod, now: Date = new Date()): UsageWindow {
  const n = new Date(now)
  switch (period) {
    case 'DAILY': {
      const periodStart = startOfDay(n)
      const periodEnd = addDays(periodStart, 1)
      return { periodStart, periodEnd }
    }
    case 'WEEKLY': {
      // Monday-based week in UTC
      const day = n.getUTCDay() // 0=Sun..6=Sat
      const mondayOffset = (day + 6) % 7
      const periodStart = addDays(startOfDay(n), -mondayOffset)
      const periodEnd = addDays(periodStart, 7)
      return { periodStart, periodEnd }
    }
    case 'YEARLY': {
      const periodStart = new Date(Date.UTC(n.getUTCFullYear(), 0, 1))
      const periodEnd = new Date(Date.UTC(n.getUTCFullYear() + 1, 0, 1))
      return { periodStart, periodEnd }
    }
    case 'MONTHLY':
    default: {
      const periodStart = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), 1))
      const periodEnd = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth() + 1, 1))
      return { periodStart, periodEnd }
    }
  }
}
