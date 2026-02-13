/**
 * Shared type definitions for FI-GL module
 */

/**
 * Standard action result type for server actions
 */
export type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Context type containing user and organizational scope
 */
export type GLContext = {
  agencyId?: string;
  subAccountId?: string;
  userId: string;
};
