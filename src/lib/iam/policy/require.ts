import 'server-only'

import { canPerform, type CanPerformArgs } from './can'

export class PolicyError extends Error {
  public readonly reason?: string
  public readonly suggestion?: string

  constructor(message: string, opts?: { reason?: string; suggestion?: string }) {
    super(message)
    this.name = 'PolicyError'
    this.reason = opts?.reason
    this.suggestion = opts?.suggestion
  }
}

export async function requireCanPerform(args: CanPerformArgs) {
  const res = await canPerform(args)
  if (!res.allowed) {
    throw new PolicyError(res.message ?? 'Not allowed', {
      reason: res.reason,
      suggestion: res.suggestion,
    })
  }
  return res
}
