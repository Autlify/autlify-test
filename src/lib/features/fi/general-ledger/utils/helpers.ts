/**
 * General Ledger Utility Functions
 * FI-GL Module - Helper functions for calculations, formatting, and validations
 */

import { Decimal } from 'decimal.js';
import type { AccountCategory } from '@/generated/prisma/client';

/**
 * Format currency value
 */
export function formatCurrency(
  amount: number | string,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
}

/**
 * Format account code with padding
 */
export function formatAccountCode(code: string, length: number = 4): string {
  return code.padStart(length, '0');
}

/**
 * Parse account hierarchy path
 */
export function parseAccountPath(path: string): string[] {
  return path.split('/').filter(Boolean);
}

/**
 * Build account hierarchy path
 */
export function buildAccountPath(codes: string[]): string {
  return '/' + codes.join('/') + '/';
}

/**
 * Calculate account hierarchy level
 */
export function calculateAccountLevel(path: string): number {
  return parseAccountPath(path).length - 1;
}

/**
 * Validate double-entry balance
 */
export function validateDoubleEntry(
  debits: number[],
  credits: number[]
): { valid: boolean; difference: number } {
  const totalDebits = debits.reduce((sum, amt) => sum + amt, 0);
  const totalCredits = credits.reduce((sum, amt) => sum + amt, 0);
  const difference = Math.abs(totalDebits - totalCredits);

  return {
    valid: difference < 0.01, // Tolerance for floating point
    difference,
  };
}

/**
 * Calculate account balance based on category
 */
export function calculateAccountBalance(
  category: AccountCategory,
  openingBalance: number,
  debits: number,
  credits: number
): number {
  const opening = new Decimal(openingBalance);
  const debit = new Decimal(debits);
  const credit = new Decimal(credits);

  // Debit balance accounts: Assets, Expenses
  if (['ASSET', 'EXPENSE'].includes(category)) {
    return opening.plus(debit).minus(credit).toNumber();
  }

  // Credit balance accounts: Liabilities, Equity, Revenue
  return opening.minus(debit).plus(credit).toNumber();
}

/**
 * Get normal balance side for account category
 */
export function getNormalBalanceSide(category: AccountCategory): 'DEBIT' | 'CREDIT' {
  if (['ASSET', 'EXPENSE'].includes(category)) {
    return 'DEBIT';
  }
  return 'CREDIT';
}

/**
 * Check if account has debit balance
 */
export function hasDebitBalance(category: AccountCategory, balance: number): boolean {
  const normalSide = getNormalBalanceSide(category);
  return (normalSide === 'DEBIT' && balance >= 0) || (normalSide === 'CREDIT' && balance < 0);
}

/**
 * Format period name
 */
export function formatPeriodName(year: number, periodNumber: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  if (periodNumber >= 1 && periodNumber <= 12) {
    return `${months[periodNumber - 1]} ${year}`;
  }
  
  return `Period ${periodNumber} ${year}`;
}

/**
 * Calculate period end date
 */
export function calculatePeriodEndDate(startDate: Date, periodType: 'MONTH' | 'QUARTER' | 'YEAR'): Date {
  const end = new Date(startDate);
  
  switch (periodType) {
    case 'MONTH':
      end.setMonth(end.getMonth() + 1);
      break;
    case 'QUARTER':
      end.setMonth(end.getMonth() + 3);
      break;
    case 'YEAR':
      end.setFullYear(end.getFullYear() + 1);
      break;
  }
  
  end.setDate(end.getDate() - 1); // Last day of period
  return end;
}

/**
 * Convert amount to base currency
 */
export function convertToBaseCurrency(
  amount: number,
  exchangeRate: number
): number {
  return new Decimal(amount).times(exchangeRate).toNumber();
}

/**
 * Calculate exchange rate gain/loss
 */
export function calculateExchangeGainLoss(
  originalAmount: number,
  originalRate: number,
  currentRate: number
): number {
  const original = new Decimal(originalAmount).times(originalRate);
  const current = new Decimal(originalAmount).times(currentRate);
  return current.minus(original).toNumber();
}

/**
 * Generate journal entry number
 */
export function generateJournalEntryNumber(
  lastNumber: number,
  prefix: string = 'JE',
  year?: number
): string {
  const nextNumber = lastNumber + 1;
  const paddedNumber = nextNumber.toString().padStart(6, '0');
  
  if (year) {
    return `${prefix}-${year}-${paddedNumber}`;
  }
  
  return `${prefix}-${paddedNumber}`;
}

/**
 * Validate account code format
 */
export function validateAccountCode(code: string): { valid: boolean; error?: string } {
  if (!code || code.length < 2) {
    return { valid: false, error: 'Account code must be at least 2 characters' };
  }
  
  if (code.length > 20) {
    return { valid: false, error: 'Account code cannot exceed 20 characters' };
  }
  
  if (!/^[A-Z0-9-]+$/.test(code)) {
    return { valid: false, error: 'Account code can only contain uppercase letters, numbers, and hyphens' };
  }
  
  return { valid: true };
}

/**
 * Sort accounts by hierarchy
 */
export function sortAccountsByHierarchy<T extends { path: string; sortOrder?: number }>(
  accounts: T[]
): T[] {
  return accounts.sort((a, b) => {
    // First sort by path
    if (a.path !== b.path) {
      return a.path.localeCompare(b.path);
    }
    // Then by sortOrder if provided
    if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
      return a.sortOrder - b.sortOrder;
    }
    return 0;
  });
}

/**
 * Build account hierarchy tree
 */
export interface AccountTreeNode {
  id: string;
  code: string;
  name: string;
  path: string;
  level: number;
  children: AccountTreeNode[];
}

export function buildAccountTree<T extends { id: string; code: string; name: string; path: string; level: number }>(
  accounts: T[]
): AccountTreeNode[] {
  const sorted = sortAccountsByHierarchy(accounts);
  const tree: AccountTreeNode[] = [];
  const map = new Map<string, AccountTreeNode>();

  for (const account of sorted) {
    const node: AccountTreeNode = {
      id: account.id,
      code: account.code,
      name: account.name,
      path: account.path,
      level: account.level,
      children: [],
    };

    map.set(account.path, node);

    if (account.level === 0) {
      tree.push(node);
    } else {
      // Find parent
      const pathParts = parseAccountPath(account.path);
      const parentPath = buildAccountPath(pathParts.slice(0, -1));
      const parent = map.get(parentPath);
      
      if (parent) {
        parent.children.push(node);
      } else {
        tree.push(node); // Orphan - add to root
      }
    }
  }

  return tree;
}

/**
 * Format date for display
 */
export function formatDate(date: Date, format: 'short' | 'medium' | 'long' = 'medium'): string {
  const options: Intl.DateTimeFormatOptions = 
    format === 'short' ? { month: 'numeric', day: 'numeric', year: '2-digit' } :
    format === 'medium' ? { month: 'short', day: 'numeric', year: 'numeric' } :
    { month: 'long', day: 'numeric', year: 'numeric' };

  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * Check if date is in period
 */
export function isDateInPeriod(date: Date, startDate: Date, endDate: Date): boolean {
  const timestamp = date.getTime();
  return timestamp >= startDate.getTime() && timestamp <= endDate.getTime();
}

/**
 * Round to decimal precision
 */
export function roundDecimal(value: number, precision: number = 2): number {
  const multiplier = Math.pow(10, precision);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Calculate percentage
 */
export function calculatePercentage(part: number, whole: number, precision: number = 2): number {
  if (whole === 0) return 0;
  return roundDecimal((part / whole) * 100, precision);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, precision: number = 2): string {
  return `${roundDecimal(value, precision)}%`;
}
