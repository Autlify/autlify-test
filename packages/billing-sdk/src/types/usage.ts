/**
 * Naropo Billing SDK - Usage & Metering Types
 *
 * PROPRIETARY SOFTWARE
 * Copyright © 2026 Naropo. All rights reserved.
 */

export type UsagePeriod = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
export type MeteringScope = "AGENCY" | "SUBACCOUNT";
export type MeteringType = "NONE" | "COUNT" | "SUM";
export type LimitEnforcement = "HARD" | "SOFT";
export type OverageMode = "NONE" | "INTERNAL_CREDITS" | "STRIPE_METERED";

export interface UsageMetric {
    key: string;
    name: string;
    description?: string;
    current: number;
    limit: number | "unlimited";
    unit: string;
    period: UsagePeriod;
    percentage?: number;
    isOverage?: boolean;
    overageAmount?: number;
}

export interface UsageEvent {
    id: string;
    featureKey: string;
    quantity: number;
    actionKey?: string;
    idempotencyKey: string;
    createdAt: Date;
    metadata?: Record<string, string>;
}

export interface UsageSummary {
    scope: MeteringScope;
    agencyId: string;
    subAccountId?: string;
    period: UsagePeriod;
    window: {
        periodStart: Date;
        periodEnd: Date;
    };
    metrics: UsageMetric[];
    events: UsageEvent[];
}

export interface Entitlement {
    key: string;
    title: string;
    description?: string;
    category: string;
    enabled: boolean;
    limit?: number | null;
    isUnlimited: boolean;
    meteringType: MeteringType;
    scope: MeteringScope;
    period?: UsagePeriod;
    enforcement?: LimitEnforcement;
    overageMode?: OverageMode;
    overageUnitPrice?: number;
    creditEnabled?: boolean;
    creditExpires?: boolean;
}

export interface EntitlementCheck {
    allowed: boolean;
    reason?: "granted" | "within_limit" | "unlimited" | "disabled" | "over_limit" | "no_entitlement";
    currentUsage?: number;
    limit?: number | null;
    remaining?: number | null;
}

export interface RecordUsageParams {
    agencyId: string;
    subAccountId?: string;
    scope: MeteringScope;
    featureKey: string;
    quantity?: number;
    actionKey?: string;
    idempotencyKey?: string;
    metadata?: Record<string, string>;
}

// Resource allocation for sub-accounts
export interface ResourceAllocation {
    id: string;
    resourceType: string;
    featureKey: string;
    allocated: number;
    used: number;
    unit: string;
    subAccountId?: string;
    subAccountName?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AllocationUpdate {
    resourceType: string;
    featureKey: string;
    newAllocation: number;
    subAccountId?: string;
}
