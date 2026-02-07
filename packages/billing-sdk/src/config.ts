/**
 * Autlify Billing SDK Configuration
 *
 * PROPRIETARY SOFTWARE
 * Copyright © 2026 Autlify. All rights reserved.
 */

import type { GatewayEnvironment } from "./types/gateway";

export interface BillingSDKConfig {
  /**
   * Your Autlify API key
   * Get one at: https://naropo.com/dashboard/api-keys
   */
  apiKey?: string;

  /**
   * Bypass license validation (for testing only)
   * Should never be true in production
   */
  bypassValidation?: boolean;

  /**
   * Enable usage tracking and analytics
   * @default true
   */
  enableTracking?: boolean;

  /**
   * Custom API endpoint (for internal use)
   * @default 'https://api.naropo.com/v1'
   */
  apiEndpoint?: string;

  /**
   * SDK mode
   * - 'internal': For Autlify apps (no API key needed on whitelisted domains)
   * - 'external': For external integrations (API key required)
   * - 'gateway': For payment gateway mode (merchant ID required)
   * @default 'internal'
   */
  mode?: "internal" | "external" | "gateway";

  /**
   * Gateway environment (only for gateway mode)
   */
  gatewayEnvironment?: GatewayEnvironment;

  /**
   * Merchant ID (only for gateway mode)
   */
  merchantId?: string;
}

/**
 * Stripe configuration
 */
export interface StripeConfig {
  /**
   * Stripe publishable key
   */
  publishableKey: string;

  /**
   * Payment intent client secret
   */
  clientSecret?: string;

  /**
   * Connect account ID (for gateway mode)
   */
  connectedAccountId?: string;

  /**
   * Stripe Elements appearance
   */
  appearance?: {
    theme?: "stripe" | "night" | "flat";
    variables?: Record<string, string>;
    rules?: Record<string, Record<string, string>>;
  };

  /**
   * Stripe locale
   */
  locale?: string;
}

/**
 * Component configuration
 */
export interface ComponentConfig {
  /**
   * Default currency code
   * @default 'MYR'
   */
  currency?: string;

  /**
   * Date format
   * @default 'DD/MM/YYYY'
   */
  dateFormat?: string;

  /**
   * Enable dark mode
   * @default true
   */
  darkMode?: boolean;

  /**
   * Custom theme overrides
   */
  theme?: {
    primary?: string;
    secondary?: string;
    background?: string;
    foreground?: string;
    muted?: string;
    accent?: string;
    destructive?: string;
    border?: string;
    radius?: string;
  };

  /**
   * Component size variant
   * @default 'default'
   */
  size?: "sm" | "default" | "lg";

  /**
   * Show powered by Autlify branding
   * @default true for gateway mode, false for internal
   */
  showBranding?: boolean;
}

/**
 * Full SDK initialization config
 */
export interface InitConfig extends BillingSDKConfig {
  stripe?: StripeConfig;
  components?: ComponentConfig;
}
