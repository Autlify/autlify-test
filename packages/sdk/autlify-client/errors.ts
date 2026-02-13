export class AutlifySdkError extends Error {
  status?: number
  code?: string
  details?: unknown

  constructor(message: string, opts?: { status?: number; code?: string; details?: unknown }) {
    super(message)
    this.name = 'AutlifySdkError'
    this.status = opts?.status
    this.code = opts?.code
    this.details = opts?.details
  }
}

export class AutlifyContractError extends AutlifySdkError {
  constructor(message: string, opts?: { details?: unknown }) {
    super(message, { code: 'CONTRACT_MISMATCH', details: opts?.details })
    this.name = 'AutlifyContractError'
  }
}
