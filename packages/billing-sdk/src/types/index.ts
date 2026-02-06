/**
 * Autlify Billing SDK - Type Definitions
 *
 * PROPRIETARY SOFTWARE - API Key Required
 * Copyright © 2026 Autlify. All rights reserved.
 *
 * @packageDocumentation
 */

// Core subscription types
export * from "./subscription";

// Payment method types
export * from "./payment";

// Invoice types
export * from "./invoice";

// Usage & metering types
export * from "./usage";

// Credits & balance types
export * from "./credits";

// Payment gateway types (PayKit mode)
export * from "./gateway";

// Common utility types
export type Currency =
    | "MYR"
    | "USD"
    | "EUR"
    | "GBP"
    | "SGD"
    | "AUD"
    | "JPY"
    | "CNY"
    | "INR";

export type Locale =
    | "en"
    | "ms"
    | "zh"
    | "ja"
    | "ko"
    | "th"
    | "vi"
    | "id"
    | "ar";

export interface PaginationParams {
    page?: number;
    limit?: number;
    cursor?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        hasMore: boolean;
        nextCursor?: string;
    };
}

export interface ApiResponse<T = unknown> {
    ok: boolean;
    data?: T;
    error?: string;
    code?: string;
    details?: Record<string, unknown>;
}
