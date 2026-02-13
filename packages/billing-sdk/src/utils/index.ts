/**
 * Autlify Billing SDK - Utilities
 * @packageDocumentation
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}

/**
 * Format currency amount with locale
 */
export function formatCurrency(
    amount: number,
    currency: string = "USD",
    locale: string = "en-US"
): string {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
    }).format(amount / 100); // Stripe amounts are in cents
}

/**
 * Format currency amount without conversion (already in major units)
 */
export function formatCurrencyMajor(
    amount: number,
    currency: string = "USD",
    locale: string = "en-US"
): string {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
    }).format(amount);
}

/**
 * Format date to locale string
 */
export function formatDate(
    date: Date | string | number,
    locale: string = "en-US",
    options?: Intl.DateTimeFormatOptions
): string {
    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
        ...options,
    };
    return new Date(date).toLocaleDateString(locale, defaultOptions);
}

/**
 * Format date to short format
 */
export function formatDateShort(
    date: Date | string | number,
    locale: string = "en-US"
): string {
    return new Date(date).toLocaleDateString(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

/**
 * Format relative time (e.g., "in 3 days", "2 hours ago")
 */
export function formatRelativeTime(
    date: Date | string | number,
    locale: string = "en-US"
): string {
    const now = new Date();
    const target = new Date(date);
    const diffMs = target.getTime() - now.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

    if (Math.abs(diffDays) >= 1) {
        return rtf.format(diffDays, "day");
    }
    return rtf.format(diffHours, "hour");
}

/**
 * Format number with locale
 */
export function formatNumber(
    value: number,
    locale: string = "en-US"
): string {
    return new Intl.NumberFormat(locale).format(value);
}

/**
 * Format percentage
 */
export function formatPercent(
    value: number,
    decimals: number = 0,
    locale: string = "en-US"
): string {
    return new Intl.NumberFormat(locale, {
        style: "percent",
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value / 100);
}

/**
 * Get usage percentage with clamping
 */
export function getUsagePercentage(current: number, limit: number): number {
    if (limit === 0) return 0;
    return Math.min((current / limit) * 100, 100);
}

/**
 * Get color class based on usage percentage
 */
export function getUsageColorClass(percentage: number): string {
    if (percentage >= 90) return "text-destructive";
    if (percentage >= 75) return "text-orange-500";
    return "text-primary";
}

/**
 * Get background color class based on usage percentage
 */
export function getUsageBgClass(percentage: number): string {
    if (percentage >= 90) return "bg-destructive";
    if (percentage >= 75) return "bg-orange-500";
    return "bg-primary";
}

/**
 * Mask card number for display
 */
export function maskCardNumber(last4: string): string {
    return `•••• •••• •••• ${last4}`;
}

/**
 * Format card expiry
 */
export function formatCardExpiry(month: number, year: number): string {
    return `${String(month).padStart(2, "0")}/${String(year).slice(-2)}`;
}

/**
 * Get card brand display name
 */
export function getCardBrandName(brand: string): string {
    const brands: Record<string, string> = {
        visa: "Visa",
        mastercard: "Mastercard",
        amex: "American Express",
        discover: "Discover",
        diners: "Diners Club",
        jcb: "JCB",
        unionpay: "UnionPay",
    };
    return brands[brand.toLowerCase()] || brand;
}

/**
 * Calculate days remaining until a date
 */
export function getDaysRemaining(date: Date | string | number): number {
    const now = new Date();
    const target = new Date(date);
    const diffMs = target.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Check if subscription is in grace period
 */
export function isInGracePeriod(
    endDate: Date | string | number,
    graceDays: number = 3
): boolean {
    const days = getDaysRemaining(endDate);
    return days < 0 && days >= -graceDays;
}

/**
 * Debounce utility
 */
export function debounce<T extends (...args: unknown[]) => void>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}
