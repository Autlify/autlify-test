/**
 * Autlify Billing SDK - License Validation
 * 
 * Validates API keys and checks whitelisted domains for internal use
 */

const WHITELISTED_DOMAINS = [
  'localhost',
  '127.0.0.1',
  '.autlify.com',
  '.autlify.dev',
]

const WHITELISTED_HOSTS = [
  'localhost',
  '127.0.0.1',
]

export interface LicenseConfig {
  apiKey?: string
  bypassValidation?: boolean
  enableTracking?: boolean
}

export class LicenseValidator {
  private apiKey?: string
  private isWhitelisted: boolean = false
  private validationPromise?: Promise<boolean>

  constructor(config?: LicenseConfig) {
    this.apiKey = config?.apiKey || process.env.AUTLIFY_API_KEY
    this.isWhitelisted = this.checkWhitelist() || config?.bypassValidation || false
  }

  /**
   * Check if current environment is whitelisted for internal use
   */
  private checkWhitelist(): boolean {
    // Server-side check
    if (typeof window === 'undefined') {
      return true // Allow server-side rendering
    }

    const hostname = window.location.hostname
    const origin = window.location.origin

    // Check exact hostname matches
    if (WHITELISTED_HOSTS.includes(hostname)) {
      return true
    }

    // Check domain wildcards
    for (const domain of WHITELISTED_DOMAINS) {
      if (domain.startsWith('.') && hostname.endsWith(domain)) {
        return true
      }
      if (hostname === domain || hostname.endsWith(`.${domain}`)) {
        return true
      }
    }

    return false
  }

  /**
   * Validate API key with Autlify servers
   */
  async validate(): Promise<boolean> {
    // Skip validation for whitelisted domains
    if (this.isWhitelisted) {
      console.log('[Autlify] Running on whitelisted domain - validation skipped')
      return true
    }

    // API key is required for non-whitelisted domains
    if (!this.apiKey) {
      console.error(
        '[Autlify] API key required. Get one at https://autlify.com/dashboard/api-keys'
      )
      return false
    }

    // Cache validation result
    if (this.validationPromise) {
      return this.validationPromise
    }

    this.validationPromise = this.performValidation()
    return this.validationPromise
  }

  private async performValidation(): Promise<boolean> {
    try {
      const response = await fetch('https://api.autlify.com/v1/validate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          product: 'billing-sdk',
          version: '0.1.0',
          domain: typeof window !== 'undefined' ? window.location.hostname : 'server',
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          console.error('[Autlify] Invalid API key')
        } else if (response.status === 403) {
          console.error('[Autlify] API key quota exceeded or not authorized')
        } else {
          console.error('[Autlify] License validation failed')
        }
        return false
      }

      const data = await response.json()

      if (data.valid) {
        console.log('[Autlify] License validated successfully')
        return true
      }

      return false
    } catch (error) {
      console.warn('[Autlify] Could not validate license (network error), allowing usage')
      // Allow usage if validation server is unreachable (fail-open for better UX)
      return true
    }
  }

  /**
   * Get license information
   */
  getLicenseInfo() {
    return {
      isWhitelisted: this.isWhitelisted,
      hasApiKey: !!this.apiKey,
      domain: typeof window !== 'undefined' ? window.location.hostname : 'server',
    }
  }
}

/**
 * Initialize license validation
 * Call this before using any SDK components
 */
export const initLicense = async (config?: LicenseConfig): Promise<boolean> => {
  const validator = new LicenseValidator(config)
  return validator.validate()
}

/**
 * Check if running in whitelisted environment (no API key needed)
 */
export const isInternalEnvironment = (): boolean => {
  const validator = new LicenseValidator()
  return validator.getLicenseInfo().isWhitelisted
}
