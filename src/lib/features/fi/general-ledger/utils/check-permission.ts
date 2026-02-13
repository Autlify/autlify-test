/**
 * Shared permission checking utility for FI-GL module
 */

'use server';

import { hasAgencyPermission, hasSubAccountPermission } from '@/lib/features/iam/authz/permissions';
import type { ActionKey } from '@/lib/registry';
import type { GLContext } from '../types';

/**
 * Checks if the current context has the required permission
 * Delegates to either hasSubAccountPermission or hasAgencyPermission based on context
 * 
 * @param context - The GL context containing agency/subaccount information
 * @param permissionKey - The permission key to check
 * @returns Promise<boolean> - Whether the permission is granted
 */
export const checkPermission = async (
  context: GLContext,
  permissionKey: ActionKey
): Promise<boolean> => {
  if (context.subAccountId) {
    return hasSubAccountPermission(context.subAccountId, permissionKey);
  }
  if (context.agencyId) {
    return hasAgencyPermission(context.agencyId, permissionKey);
  }
  return false;
};
