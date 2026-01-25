/**
 * Auth helpers for Next.js 15+ compatibility
 * Wraps NextAuth's auth() to handle async headers/cookies
 */

import { auth as nextAuthAuth } from '@/auth'
import { cache } from 'react'

/**
 * Get current session - cached per request
 * Use this in Server Components instead of auth() directly
 */
export const auth = cache(async () => {
  return await nextAuthAuth()
})
