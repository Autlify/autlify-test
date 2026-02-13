/**
 * Workflow Approval (contract schema)
 *
 * Generic approval request schema that can be reused across FI documents.
 * Persistence and notifications are intentionally out-of-scope.
 */

import { z } from 'zod'

export const approvalStatusEnum = z.enum(['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'])

export const approvalActorSchema = z.object({
  userId: z.string().uuid(),
  displayName: z.string().min(1).max(120).optional().nullable(),
})

export const approvalStepSchema = z.object({
  step: z.number().int().positive(),
  name: z.string().min(1).max(120).optional().nullable(),
  requiredApprovals: z.number().int().min(1).default(1),
  approverUserIds: z.array(z.string().uuid()).min(1),
})

export const approvalDecisionSchema = z.object({
  userId: z.string().uuid(),
  decidedAt: z.coerce.date(),
  decision: z.enum(['APPROVE', 'REJECT']),
  reason: z.string().max(500).optional().nullable(),
})

export const workflowApprovalSchema = z.object({
  id: z.string().uuid().optional(),

  agencyId: z.string().uuid().optional().nullable(),
  subAccountId: z.string().uuid().optional().nullable(),

  entityType: z.string().min(1).max(80),
  entityId: z.string().min(1).max(64),

  status: approvalStatusEnum.default('DRAFT'),
  steps: z.array(approvalStepSchema).min(1),
  decisions: z.array(approvalDecisionSchema).optional().default([]),

  requestedBy: approvalActorSchema.optional().nullable(),
  requestedAt: z.coerce.date().optional().nullable(),
  finalizedAt: z.coerce.date().optional().nullable(),
})

export type WorkflowApproval = z.infer<typeof workflowApprovalSchema>
