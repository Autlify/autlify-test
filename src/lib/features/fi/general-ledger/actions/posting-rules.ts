/**
 * GL Posting Rules Server Actions
 * FI-GL Module - Automatic posting rules and templates
 */

'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { hasAgencyPermission, hasSubAccountPermission } from '@/lib/features/iam/authz/permissions'
import { logGLAudit } from './audit'
import { Prisma } from '@/generated/prisma/client'
import { PostingRuleInput, postingRuleSchema, UpdatePostingRuleInput, updatePostingRuleSchema } from '@/lib/schemas/fi/general-ledger/posting-rules'
import { ActionKey } from '@/lib/registry'


// ========== Types ==========

type ActionResult<T> = {
  success: boolean
  data?: T
  error?: string
}

type RulesContext = {
  agencyId?: string
  subAccountId?: string
  userId: string
}

// ========== Helper Functions ==========

const getContext = async (): Promise<RulesContext | null> => {
  const session = await auth()
  if (!session?.user?.id) return null

  const dbSession = await db.session.findFirst({
    where: { userId: session.user.id },
    select: { activeAgencyId: true, activeSubAccountId: true },
  })

  return {
    userId: session.user.id,
    agencyId: dbSession?.activeAgencyId ?? undefined,
    subAccountId: dbSession?.activeSubAccountId ?? undefined,
  }
}

const checkPermission = async (
  context: RulesContext,
  permissionKey: ActionKey
): Promise<boolean> => {
  if (context.subAccountId) {
    return hasSubAccountPermission(context.subAccountId, permissionKey)
  }
  if (context.agencyId) {
    return hasAgencyPermission(context.agencyId, permissionKey)
  }
  return false
}

// ========== CRUD Actions ==========

/**
 * Get a single posting rule by ID
 */
export const getPostingRule = async (
  id: string
): Promise<ActionResult<any>> => {
  try {
    const context = await getContext()
    if (!context) {
      return { success: false, error: 'Unauthorized: No session found' }
    }

    const hasPermission = await checkPermission(context, 'fi.configuration.posting_rules.view')
    if (!hasPermission) {
      return { success: false, error: 'Unauthorized: Missing permission' }
    }

    const rule = await db.postingRule.findUnique({
      where: { id },
      include: {
        DebitAccount: { select: { id: true, code: true, name: true } },
        CreditAccount: { select: { id: true, code: true, name: true } },
      },
    })

    if (!rule) {
      return { success: false, error: 'Posting rule not found' }
    }

    // Verify ownership
    const isOwned = context.subAccountId
      ? rule.subAccountId === context.subAccountId
      : rule.agencyId === context.agencyId

    if (!isOwned) {
      return { success: false, error: 'Unauthorized: Access denied' }
    }

    return { success: true, data: rule }
  } catch (error) {
    console.error('Error fetching posting rule:', error)
    return { success: false, error: 'Failed to fetch posting rule' }
  }
}

/**
 * List all posting rules
 */
export const listPostingRules = async (options?: {
  isActive?: boolean
  triggerType?: string
  page?: number
  pageSize?: number
}): Promise<ActionResult<{ rules: any[]; total: number }>> => {
  try {
    const context = await getContext()
    if (!context) {
      return { success: false, error: 'Unauthorized: No session found' }
    }

    const hasPermission = await checkPermission(context, 'fi.configuration.posting_rules.view')
    if (!hasPermission) {
      return { success: false, error: 'Unauthorized: Missing permission' }
    }

    const page = options?.page ?? 1
    const pageSize = options?.pageSize ?? 50
    const skip = (page - 1) * pageSize

    const whereClause: any = context.subAccountId
      ? { subAccountId: context.subAccountId }
      : { agencyId: context.agencyId, subAccountId: null }

    if (options?.isActive !== undefined) {
      whereClause.isActive = options.isActive
    }

    if (options?.triggerType) {
      whereClause.sourceModule = options.triggerType
    }

    const [rules, total] = await Promise.all([
      db.postingRule.findMany({
        where: whereClause,
        include: {
          DebitAccount: { select: { id: true, code: true, name: true } },
          CreditAccount: { select: { id: true, code: true, name: true } },
        },
        orderBy: [{ priority: 'asc' }, { name: 'asc' }],
        skip,
        take: pageSize,
      }),
      db.postingRule.count({ where: whereClause }),
    ])

    return { success: true, data: { rules, total } }
  } catch (error) {
    console.error('Error listing posting rules:', error)
    return { success: false, error: 'Failed to list posting rules' }
  }
}

/**
 * Create a new posting rule
 */
export const createPostingRule = async (
  input: PostingRuleInput
): Promise<ActionResult<any>> => {
  try {
    const context = await getContext()
    if (!context) {
      return { success: false, error: 'Unauthorized: No session found' }
    }

    const hasPermission = await checkPermission(context, 'fi.configuration.posting_rules.manage')
    if (!hasPermission) {
      return { success: false, error: 'Unauthorized: Missing permission' }
    }

    const parsed = postingRuleSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Validation failed' }
    }

    const { conditions, ...ruleData } = parsed.data

    const rule = await db.postingRule.create({
      data: {
        ...ruleData,
        conditions: (conditions ?? {}) as Prisma.InputJsonValue,
        agencyId: context.agencyId ?? null,
        subAccountId: context.subAccountId ?? null,
        createdBy: context.userId,
      },
      include: {
        DebitAccount: { select: { id: true, code: true, name: true } },
        CreditAccount: { select: { id: true, code: true, name: true } },
      },
    })

    await logGLAudit({
      action: 'CREATE',
      entityType: 'PostingRule',
      entityId: rule.id,
      agencyId: context.agencyId,
      subAccountId: context.subAccountId,
      description: `Created posting rule: ${rule.name}`,
    })

    revalidatePath(`/agency/${context.agencyId}/fi/general-ledger/posting-rules`)

    return { success: true, data: rule }
  } catch (error) {
    console.error('Error creating posting rule:', error)
    return { success: false, error: 'Failed to create posting rule' }
  }
}

/**
 * Update an existing posting rule
 */
export const updatePostingRule = async (
  input: UpdatePostingRuleInput
): Promise<ActionResult<any>> => {
  try {
    const context = await getContext()
    if (!context) {
      return { success: false, error: 'Unauthorized: No session found' }
    }

    const hasPermission = await checkPermission(context, 'fi.configuration.posting_rules.manage')
    if (!hasPermission) {
      return { success: false, error: 'Unauthorized: Missing permission' }
    }

    const parsed = updatePostingRuleSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Validation failed' }
    }

    const { id, conditions, debitAccountId, creditAccountId, ...updateData } = parsed.data

    // Verify ownership
    const existing = await db.postingRule.findUnique({ where: { id } })
    if (!existing) {
      return { success: false, error: 'Posting rule not found' }
    }

    const isOwned = context.subAccountId
      ? existing.subAccountId === context.subAccountId
      : existing.agencyId === context.agencyId

    if (!isOwned) {
      return { success: false, error: 'Unauthorized: Access denied' }
    }

    const rule = await db.postingRule.update({
      where: { id },
      data: {
        ...updateData,
        ...(debitAccountId && { debitAccountId }),
        ...(creditAccountId && { creditAccountId }),
        ...(conditions !== undefined && { conditions: conditions as Prisma.InputJsonValue }),
        updatedBy: context.userId,
      } as Prisma.PostingRuleUncheckedUpdateInput,
      include: {
        DebitAccount: { select: { id: true, code: true, name: true } },
        CreditAccount: { select: { id: true, code: true, name: true } },
      },
    })

    await logGLAudit({
      action: 'UPDATE',
      entityType: 'PostingRule',
      entityId: rule.id,
      agencyId: context.agencyId,
      subAccountId: context.subAccountId,
      description: `Updated posting rule: ${rule.name}`,
      previousValues: existing as any,
      newValues: rule as any,
    })

    revalidatePath(`/agency/${context.agencyId}/fi/general-ledger/posting-rules`)

    return { success: true, data: rule }
  } catch (error) {
    console.error('Error updating posting rule:', error)
    return { success: false, error: 'Failed to update posting rule' }
  }
}

/**
 * Delete a posting rule
 */
export const deletePostingRule = async (
  id: string
): Promise<ActionResult<void>> => {
  try {
    const context = await getContext()
    if (!context) {
      return { success: false, error: 'Unauthorized: No session found' }
    }

    const hasPermission = await checkPermission(context, 'fi.configuration.posting_rules.manage')
    if (!hasPermission) {
      return { success: false, error: 'Unauthorized: Missing permission' }
    }

    // Verify ownership
    const existing = await db.postingRule.findUnique({ where: { id } })
    if (!existing) {
      return { success: false, error: 'Posting rule not found' }
    }

    const isOwned = context.subAccountId
      ? existing.subAccountId === context.subAccountId
      : existing.agencyId === context.agencyId

    if (!isOwned) {
      return { success: false, error: 'Unauthorized: Access denied' }
    }

    await db.postingRule.delete({ where: { id } })

    await logGLAudit({
      action: 'DELETE',
      entityType: 'PostingRule',
      entityId: id,
      agencyId: context.agencyId,
      subAccountId: context.subAccountId,
      description: `Deleted posting rule: ${existing.name}`,
    })

    revalidatePath(`/agency/${context.agencyId}/fi/general-ledger/posting-rules`)

    return { success: true }
  } catch (error) {
    console.error('Error deleting posting rule:', error)
    return { success: false, error: 'Failed to delete posting rule' }
  }
}

/**
 * Toggle posting rule active status
 */
export const togglePostingRuleStatus = async (
  id: string,
  isActive: boolean
): Promise<ActionResult<any>> => {
  return updatePostingRule({ id, isActive })
}

// ========== Execution Actions ==========

/**
 * Execute posting rules for a trigger event
 */
export const executePostingRules = async (
  triggerType: string,
  triggerData: Record<string, any>
): Promise<ActionResult<{ entriesCreated: number; errors: string[] }>> => {
  try {
    const context = await getContext()
    if (!context) {
      return { success: false, error: 'Unauthorized: No session found' }
    }

    const hasPermission = await checkPermission(context, 'fi.configuration.posting_rules.simulate')
    if (!hasPermission) {
      return { success: false, error: 'Unauthorized: Missing permission' }
    }

    const whereClause: any = context.subAccountId
      ? { subAccountId: context.subAccountId }
      : { agencyId: context.agencyId, subAccountId: null }

    // Get active rules for this trigger
    const rules = await db.postingRule.findMany({
      where: {
        ...whereClause,
        sourceModule: triggerType as any,
        isActive: true,
      },
      orderBy: { priority: 'asc' },
    })

    let entriesCreated = 0
    const errors: string[] = []

    for (const rule of rules) {
      try {
        // Evaluate conditions
        const conditionsMet = evaluateConditions(rule.conditions as any[], triggerData)
        if (!conditionsMet) continue

        // Calculate amount
        const amount = calculateAmount(rule, triggerData)
        if (amount <= 0) continue

        // Get current period
        const period = await db.financialPeriod.findFirst({
          where: {
            agencyId: context.agencyId,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
        })

        if (!period) {
          errors.push(`Rule ${rule.name}: No open period found`)
          continue
        }

        // Create journal entry
        await db.journalEntry.create({
          data: {
            agencyId: context?.agencyId ?? null,
            subAccountId: context?.subAccountId ?? null,
            periodId: period.id,
            entryNumber: await generateEntryNumber(context),
            entryDate: new Date(),
            description: `Auto-post: ${rule.name}`,
            reference: `RULE-${rule.id}`,
            status: 'POSTED',
            createdBy: context.userId,
            postedBy: context.userId,
            postedAt: new Date(),
            Lines: {
              create: [
                {
                  lineNumber: 1,
                  accountId: rule.debitAccountId,
                  debitAmount: amount,
                  creditAmount: 0,
                  debitAmountBase: amount,
                  creditAmountBase: 0,
                  description: rule.description ?? rule.name,
                },
                {
                  lineNumber: 2,
                  accountId: rule.creditAccountId,
                  debitAmount: 0,
                  creditAmount: amount,
                  debitAmountBase: 0,
                  creditAmountBase: amount,
                  description: rule.description ?? rule.name,
                },
              ],
            },
          }
        })

        entriesCreated++
      } catch (err: any) {
        errors.push(`Rule ${rule.name}: ${err.message}`)
      }
    }

    return { success: true, data: { entriesCreated, errors } }
  } catch (error) {
    console.error('Error executing posting rules:', error)
    return { success: false, error: 'Failed to execute posting rules' }
  }
}

// ========== Helper Functions ==========

function evaluateConditions(
  conditions: { field: string; operator: string; value: any }[] | null,
  data: Record<string, any>
): boolean {
  if (!conditions || conditions.length === 0) return true

  return conditions.every((condition) => {
    const fieldValue = data[condition.field]

    switch (condition.operator) {
      case 'EQUALS':
        return fieldValue === condition.value
      case 'NOT_EQUALS':
        return fieldValue !== condition.value
      case 'GREATER_THAN':
        return Number(fieldValue) > Number(condition.value)
      case 'LESS_THAN':
        return Number(fieldValue) < Number(condition.value)
      case 'CONTAINS':
        return String(fieldValue).includes(String(condition.value))
      case 'IN':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue)
      default:
        return false
    }
  })
}

function calculateAmount(rule: any, data: Record<string, any>): number {
  switch (rule.amountType) {
    case 'FIXED':
      return Number(rule.amountValue) || 0
    case 'PERCENTAGE':
      const baseAmount = Number(data.amount) || 0
      return baseAmount * (Number(rule.amountValue) / 100)
    case 'FORMULA':
      // Simple formula evaluation (for complex formulas, use a proper parser)
      try {
        const formula = rule.amountFormula
          ?.replace(/\{(\w+)\}/g, (_: any, key: string) => String(data[key] || 0))
        return eval(formula) || 0
      } catch {
        return 0
      }
    default:
      return 0
  }
}

async function generateEntryNumber(context: RulesContext): Promise<string> {
  const whereClause: any = context.subAccountId
    ? { subAccountId: context.subAccountId }
    : { agencyId: context.agencyId, subAccountId: null }

  const count = await db.journalEntry.count({ where: whereClause })
  const year = new Date().getFullYear()
  return `JE-${year}-${String(count + 1).padStart(6, '0')}`
}

async function generateLineNumber(context: RulesContext): Promise<number> {
  const whereClause: any = context.subAccountId
    ? { subAccountId: context.subAccountId }
    : { agencyId: context.agencyId, subAccountId: null }

  const count = await db.journalEntryLine.count({ where: whereClause })
  return count + 1
}