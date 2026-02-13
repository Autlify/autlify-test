/**
 * Shared context retrieval utility for FI-GL module
 */

'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';
import type { GLContext } from '../types';

/**
 * Retrieves the current user context including agency and subaccount scope
 * Used across all FI-GL server actions
 * 
 * @returns GLContext with userId, agencyId, and subAccountId, or null if unauthenticated
 */
export const getContext = async (): Promise<GLContext | null> => {
  const session = await auth();
  if (!session?.user?.id) return null;

  const dbSession = await db.session.findFirst({
    where: { userId: session.user.id },
    select: { activeAgencyId: true, activeSubAccountId: true },
  });

  return {
    userId: session.user.id,
    agencyId: dbSession?.activeAgencyId ?? undefined,
    subAccountId: dbSession?.activeSubAccountId ?? undefined,
  };
};
