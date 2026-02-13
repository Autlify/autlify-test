/**
 * Recurring Journal Server Actions
 *
 * Template-based recurring journal entries for periodic postings.
 */

'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { hasAgencyPermission, hasSubAccountPermission } from '@/lib/features/iam/authz/permissions'
import { KEYS } from '@/lib/registry/keys/permissions'
import { reserveDocumentNumber } from '@/lib/features/fi/general-ledger/utils/number-ranges'
import { z } from 'zod'

type ActionResult<T> = { success: true; data: T } | { success: false; error: string }

type FiContext = {
  userId: string
  agencyId: string
  subAccountId?: string
}

const getContext = async (): Promise<FiContext | null> => {
  const session = await auth()
  if (!session?.user?.id) return null
  const dbSession = await db.session.findFirst({
    where: { userId: session.user.id },
    select: { activeAgencyId: true, activeSubAccountId: true },
  })
  if (!dbSession?.activeAgencyId) return null
  return {
    userId: session.user.id,
    agencyId: dbSession.activeAgencyId,
    subAccountId: dbSession.activeSubAccountId ?? undefined,
  }
}

const checkPermission = async (ctx: FiContext, key: string) => {
  if (ctx.subAccountId) return hasSubAccountPermission(ctx.subAccountId, key as any)
  return hasAgencyPermission(ctx.agencyId, key as any)
}

const scopeWhere = (ctx: FiContext) =>
  ctx.subAccountId
    ? { agencyId: ctx.agencyId, subAccountId: ctx.subAccountId }
    : { agencyId: ctx.agencyId, subAccountId: null }

const ensureScope = (ctx: FiContext, row: { agencyId: string; subAccountId: string | null }) => {
  if (row.agencyId !== ctx.agencyId) return false
  if (ctx.subAccountId) return row.subAccountId === ctx.subAccountId
  return row.subAccountId === null
}

const PERM_READ = KEYS.fi.general_ledger.recurring_journals.read
const PERM_CREATE = KEYS.fi.general_ledger.recurring_journals.create
const PERM_UPDATE = KEYS.fi.general_ledger.recurring_journals.update
const PERM_DELETE = KEYS.fi.general_ledger.recurring_journals.delete
const PERM_EXECUTE = KEYS.fi.general_ledger.recurring_journals.execute

const lineItemSchema = z.object({
  accountId: z.string().uuid(),
  costCenterId: z.string().uuid().optional(),
  profitCenterId: z.string().uuid().optional(),
  description: z.string().optional(),
  debitAmount: z.number().nonnegative().optional(),
  creditAmount: z.number().nonnegative().optional(),
})

const createSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY']),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  dayOfMonth: z.number().int().min(1).max(31).optional(),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  currency: z.string().length(3).default('USD'),
  autoPost: z.boolean().default(false),
  lineItems: z.array(lineItemSchema).min(2),
})

const updateSchema = createSchema.partial().extend({ id: z.string().uuid() })

const listFilterSchema = z.object({
  status: z.enum(['ACTIVE', 'PAUSED', 'EXPIRED', 'DELETED']).optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY']).optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(25),
}).optional()

const generateTemplateCode = async (ctx: FiContext) => {
  const cfg = await db.gLConfiguration.findFirst({
    where: { agencyId: ctx.agencyId },
    orderBy: { updatedAt: 'desc' },
    select: { documentNumberResetRule: true },
  })
  const scope = ctx.subAccountId
    ? { kind: 'subaccount' as const, subAccountId: ctx.subAccountId }
    : { kind: 'agency' as const, agencyId: ctx.agencyId }
  const { docNumber } = await reserveDocumentNumber(scope, {
    rangeKey: 'gl.recurring_journal',
    format: 'RJ-{####}',
    prefixFallback: 'RJ',
    reset: (cfg?.documentNumberResetRule as any) ?? 'NEVER',
    date: new Date(),
  })
  return docNumber
}

export const listRecurringJournals = async (
  filter?: z.infer<typeof listFilterSchema>
): Promise<ActionResult<any[]>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_READ)
    if (!ok) return { success: false, error: 'Missing permission' }

    const f = listFilterSchema.parse(filter ?? {})
    const where: any = { ...scopeWhere(ctx) }
    if (f?.status) where.status = f.status
    if (f?.frequency) where.frequency = f.frequency
    if (f?.search) {
      where.OR = [
        { name: { contains: f.search, mode: 'insensitive' } },
        { templateCode: { contains: f.search, mode: 'insensitive' } },
        { description: { contains: f.search, mode: 'insensitive' } },
      ]
    }

    const rows = await db.recurringJournal.findMany({
      where,
      orderBy: [{ name: 'asc' }],
      take: f?.pageSize ?? 25,
      skip: ((f?.page ?? 1) - 1) * (f?.pageSize ?? 25),
    })
    return { success: true, data: rows }
  } catch (e) {
    console.error('listRecurringJournals error', e)
    return { success: false, error: 'Failed to list recurring journals' }
  }
}

export const getRecurringJournal = async (id: string): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_READ)
    if (!ok) return { success: false, error: 'Missing permission' }

    const row = await db.recurringJournal.findUnique({
      where: { id },
      include: {
        lineItems: {
          include: {
            
            
            
          },
        },
        executions: {
          orderBy: { executedAt: 'desc' },
          take: 10,
          include: {
            
          },
        },
      },
    })
    if (!row) return { success: false, error: 'Recurring journal not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }
    return { success: true, data: row }
  } catch (e) {
    console.error('getRecurringJournal error', e)
    return { success: false, error: 'Failed to fetch recurring journal' }
  }
}

export const createRecurringJournal = async (
  input: z.infer<typeof createSchema>
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_CREATE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const data = createSchema.parse(input)

    // Validate that debits equal credits
    const totalDebit = data.lineItems.reduce((s, l) => s + (l.debitAmount ?? 0), 0)
    const totalCredit = data.lineItems.reduce((s, l) => s + (l.creditAmount ?? 0), 0)
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return { success: false, error: 'Total debits must equal total credits' }
    }

    const templateCode = await generateTemplateCode(ctx)

    // Calculate next run date
    const nextRunDate = calculateNextRunDate(data.startDate, data.frequency, data.dayOfMonth, data.dayOfWeek)

    const { lineItems, ...rest } = data
    const row = await db.recurringJournal.create({
      data: {
        ...rest,
        templateCode,
        nextRunDate,
        lastRunDate: null,
        runCount: 0,
        agencyId: ctx.agencyId,
        subAccountId: ctx.subAccountId ?? null,
        status: 'ACTIVE',
        createdBy: ctx.userId,
        lineItems: {
          create: lineItems.map((item, idx) => ({
            lineNumber: idx + 1,
            accountId: item.accountId,
            costCenterId: item.costCenterId ?? null,
            profitCenterId: item.profitCenterId ?? null,
            description: item.description ?? null,
            debitAmount: item.debitAmount ?? 0,
            creditAmount: item.creditAmount ?? 0,
          })),
        },
      } as any,
      include: { lineItems: true },
    })

    revalidatePath('/fi/gl')
    return { success: true, data: row }
  } catch (e: any) {
    console.error('createRecurringJournal error', e)
    return { success: false, error: e?.message ?? 'Failed to create recurring journal' }
  }
}

export const updateRecurringJournal = async (
  input: z.infer<typeof updateSchema>
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_UPDATE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id, lineItems, ...rest } = updateSchema.parse(input)
    const row = await db.recurringJournal.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Recurring journal not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }
    if (row.status === 'DELETED') return { success: false, error: 'Cannot update deleted template' }

    if (lineItems) {
      const totalDebit = lineItems.reduce((s, l) => s + (l.debitAmount ?? 0), 0)
      const totalCredit = lineItems.reduce((s, l) => s + (l.creditAmount ?? 0), 0)
      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        return { success: false, error: 'Total debits must equal total credits' }
      }

      // Delete existing and recreate
      await db.recurringJournalLineItem.deleteMany({ where: { recurringJournalId: id } })
      await db.recurringJournalLineItem.createMany({
        data: lineItems.map((item, idx) => ({
          recurringJournalId: id,
          lineNumber: idx + 1,
          accountId: item.accountId,
          costCenterId: item.costCenterId ?? null,
          profitCenterId: item.profitCenterId ?? null,
          description: item.description ?? null,
          debitAmount: item.debitAmount ?? 0,
          creditAmount: item.creditAmount ?? 0,
        })),
      })
    }

    // Recalculate next run date if schedule changed
    let nextRunDate = row.nextRunDate
    if (rest.frequency || rest.startDate || rest.dayOfMonth || rest.dayOfWeek) {
      const freq = rest.frequency ?? (row.frequency as any)
      const start = rest.startDate ?? row.startDate
      const dom = rest.dayOfMonth ?? row.dayOfMonth ?? undefined
      const dow = rest.dayOfWeek ?? row.dayOfWeek ?? undefined
      nextRunDate = calculateNextRunDate(start!, freq, dom, dow)
    }

    const updated = await db.recurringJournal.update({
      where: { id },
      data: { ...rest, nextRunDate, updatedBy: ctx.userId },
      include: { lineItems: true },
    })
    revalidatePath('/fi/gl')
    return { success: true, data: updated }
  } catch (e: any) {
    console.error('updateRecurringJournal error', e)
    return { success: false, error: e?.message ?? 'Failed to update recurring journal' }
  }
}

const idSchema = z.object({ id: z.string().uuid() })

export const pauseRecurringJournal = async (input: z.infer<typeof idSchema>): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_UPDATE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id } = idSchema.parse(input)
    const row = await db.recurringJournal.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Recurring journal not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }
    if (row.status !== 'ACTIVE') return { success: false, error: 'Can only pause active templates' }

    const updated = await db.recurringJournal.update({
      where: { id },
      data: { status: 'PAUSED', updatedBy: ctx.userId },
    })
    revalidatePath('/fi/gl')
    return { success: true, data: updated }
  } catch (e) {
    console.error('pauseRecurringJournal error', e)
    return { success: false, error: 'Failed to pause recurring journal' }
  }
}

export const resumeRecurringJournal = async (input: z.infer<typeof idSchema>): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_UPDATE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id } = idSchema.parse(input)
    const row = await db.recurringJournal.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Recurring journal not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }
    if (row.status !== 'PAUSED') return { success: false, error: 'Can only resume paused templates' }

    const updated = await db.recurringJournal.update({
      where: { id },
      data: { status: 'ACTIVE', updatedBy: ctx.userId },
    })
    revalidatePath('/fi/gl')
    return { success: true, data: updated }
  } catch (e) {
    console.error('resumeRecurringJournal error', e)
    return { success: false, error: 'Failed to resume recurring journal' }
  }
}

export const deleteRecurringJournal = async (input: z.infer<typeof idSchema>): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_DELETE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id } = idSchema.parse(input)
    const row = await db.recurringJournal.findUnique({ where: { id } })
    if (!row) return { success: false, error: 'Recurring journal not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }

    const updated = await db.recurringJournal.update({
      where: { id },
      data: { status: 'DELETED', deletedAt: new Date(), deletedBy: ctx.userId, updatedBy: ctx.userId },
    })
    revalidatePath('/fi/gl')
    return { success: true, data: updated }
  } catch (e) {
    console.error('deleteRecurringJournal error', e)
    return { success: false, error: 'Failed to delete recurring journal' }
  }
}

const executeSchema = z.object({
  id: z.string().uuid(),
  postingDate: z.coerce.date().optional(),
  autoPost: z.boolean().default(false),
})

export const executeRecurringJournal = async (
  input: z.infer<typeof executeSchema>
): Promise<ActionResult<any>> => {
  try {
    const ctx = await getContext()
    if (!ctx) return { success: false, error: 'Unauthorized' }
    const ok = await checkPermission(ctx, PERM_EXECUTE)
    if (!ok) return { success: false, error: 'Missing permission' }

    const { id, postingDate, autoPost } = executeSchema.parse(input)
    const row = await db.recurringJournal.findUnique({
      where: { id },
      include: { lineItems: true },
    })
    if (!row) return { success: false, error: 'Recurring journal not found' }
    if (!ensureScope(ctx, row)) return { success: false, error: 'Not allowed' }
    if (row.status !== 'ACTIVE') return { success: false, error: 'Template is not active' }

    const docDate = postingDate ?? new Date()

    // Generate journal entry document number
    const cfg = await db.gLConfiguration.findFirst({
      where: { agencyId: ctx.agencyId },
      orderBy: { updatedAt: 'desc' },
      select: { documentNumberResetRule: true },
    })
    const scope = ctx.subAccountId
      ? { kind: 'subaccount' as const, subAccountId: ctx.subAccountId }
      : { kind: 'agency' as const, agencyId: ctx.agencyId }
    const { docNumber } = await reserveDocumentNumber(scope, {
      rangeKey: 'gl.journal_entry',
      format: 'JE-{YYYY}-{######}',
      prefixFallback: 'JE',
      reset: (cfg?.documentNumberResetRule as any) ?? 'YEARLY',
      date: docDate,
    })

    // Create the journal entry
    const je = await db.journalEntry.create({
      data: {
        documentNumber: docNumber,
        documentDate: docDate,
        postingDate: docDate,
        description: `${row.name} - Recurring #${(row.runCount ?? 0) + 1}`,
        entryType: 'RECURRING',
        currency: row.currency ?? 'USD',
        status: autoPost || row.autoPost ? 'POSTED' : 'DRAFT',
        agencyId: ctx.agencyId,
        subAccountId: ctx.subAccountId ?? null,
        totalDebit: row.lineItems?.reduce((s: number, l: any) => s + ((l.debitAmount as any)?.toNumber?.() ?? l.debitAmount ?? 0), 0) ?? 0,
        totalCredit: row.lineItems?.reduce((s: number, l: any) => s + ((l.creditAmount as any)?.toNumber?.() ?? l.creditAmount ?? 0), 0) ?? 0,
        createdBy: ctx.userId,
        postedAt: (autoPost || row.autoPost) ? new Date() : null,
        postedBy: (autoPost || row.autoPost) ? ctx.userId : null,
        lineItems: {
          create: (row.lineItems ?? []).map((item: any, idx: number) => ({
            lineNumber: idx + 1,
            accountId: item.accountId,
            costCenterId: item.costCenterId ?? null,
            profitCenterId: item.profitCenterId ?? null,
            description: item.description ?? null,
            debitAmount: item.debitAmount ?? 0,
            creditAmount: item.creditAmount ?? 0,
          })),
        },
      } as any,
    })

    // Record execution
    await db.recurringJournalExecution.create({
      data: {
        recurringJournalId: id,
        journalEntryId: je.id,
        executedAt: new Date(),
        executedBy: ctx.userId,
        postingDate: docDate,
        status: 'SUCCESS',
      } as any,
    })

    // Update template
    const nextRunDate = calculateNextRunDate(
      new Date(),
      row.frequency as any,
      row.dayOfMonth ?? undefined,
      row.dayOfWeek ?? undefined
    )

    // Check if expired
    const expired = row.endDate && nextRunDate > row.endDate

    await db.recurringJournal.update({
      where: { id },
      data: {
        lastRunDate: new Date(),
        nextRunDate: expired ? null : nextRunDate,
        runCount: { increment: 1 },
        status: expired ? 'EXPIRED' : 'ACTIVE',
        updatedBy: ctx.userId,
      },
    })

    revalidatePath('/fi/gl')
    return { success: true, data: { journalEntry: je, nextRunDate: expired ? null : nextRunDate } }
  } catch (e: any) {
    console.error('executeRecurringJournal error', e)
    return { success: false, error: e?.message ?? 'Failed to execute recurring journal' }
  }
}

// Helper function to calculate next run date based on frequency
function calculateNextRunDate(
  fromDate: Date,
  frequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY',
  dayOfMonth?: number,
  dayOfWeek?: number
): Date {
  const date = new Date(fromDate)

  switch (frequency) {
    case 'DAILY':
      date.setDate(date.getDate() + 1)
      break
    case 'WEEKLY':
      date.setDate(date.getDate() + 7)
      if (dayOfWeek !== undefined) {
        const currentDay = date.getDay()
        const diff = dayOfWeek - currentDay
        date.setDate(date.getDate() + diff)
      }
      break
    case 'BIWEEKLY':
      date.setDate(date.getDate() + 14)
      break
    case 'MONTHLY':
      date.setMonth(date.getMonth() + 1)
      if (dayOfMonth) {
        date.setDate(Math.min(dayOfMonth, getDaysInMonth(date.getFullYear(), date.getMonth())))
      }
      break
    case 'QUARTERLY':
      date.setMonth(date.getMonth() + 3)
      if (dayOfMonth) {
        date.setDate(Math.min(dayOfMonth, getDaysInMonth(date.getFullYear(), date.getMonth())))
      }
      break
    case 'ANNUALLY':
      date.setFullYear(date.getFullYear() + 1)
      if (dayOfMonth) {
        date.setDate(Math.min(dayOfMonth, getDaysInMonth(date.getFullYear(), date.getMonth())))
      }
      break
  }

  return date
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}
