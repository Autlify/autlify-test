/**
 * GL Audit Trail Actions
 * FI-GL Module - Audit logging functionality
 */

'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';
import type { AuditAction } from '@/generated/prisma/client';

type AuditLogInput = {
  action: AuditAction;
  entityType: string;
  entityId: string;
  agencyId?: string;
  subAccountId?: string;
  description: string;
  previousValues?: any;
  newValues?: any;
  reason?: string;
};

/**
 * Log GL audit trail entry
 */
export async function logGLAudit(input: AuditLogInput): Promise<void> {
  try {
    const session = await auth();
    if (!session?.user?.id) return;

    // Get user details
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true },
    });

    if (!user) return;

    // Get session metadata
    const dbSession = await db.session.findFirst({
      where: { userId: session.user.id },
      select: { ipAddress: true, userAgent: true, id: true },
    });

    await db.gLAuditTrail.create({
      data: {
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        agencyId: input.agencyId,
        subAccountId: input.subAccountId,
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        previousValues: input.previousValues || null,
        newValues: input.newValues || null,
        reason: input.reason,
        ipAddress: dbSession?.ipAddress || null,
        userAgent: dbSession?.userAgent || null,
        sessionId: dbSession?.id || null,
      },
    });
  } catch (error) {
    // Don't throw - audit logging should never break the main flow
    console.error('Failed to log GL audit trail:', error);
  }
}

/**
 * Get audit trail for an entity
 */
export async function getEntityAuditTrail(
  entityType: string,
  entityId: string
): Promise<any[]> {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    const auditTrail = await db.gLAuditTrail.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 100,
    });

    return auditTrail;
  } catch (error) {
    console.error('Failed to get audit trail:', error);
    return [];
  }
}
