# PLAN: Enterprise FI-GL (General Ledger) Module

> **Version:** 1.0.0  
> **Created:** 2026-01-16  
> **Status:** Implementation Ready  
> **Dependencies:** Prisma, Next.js 16, React 19, TanStack Table, react-pdf, xlsx

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Database Schema](#3-database-schema)
4. [RBAC Permissions](#4-rbac-permissions)
5. [Validation Schemas](#5-validation-schemas)
6. [Server Actions](#6-server-actions)
7. [API Routes](#7-api-routes)
8. [UI Components & Routes](#8-ui-components--routes)
9. [Seed Scripts](#9-seed-scripts)
10. [Implementation Checklist](#10-implementation-checklist)

---

## 1. Executive Summary

### 1.1 Scope

Build an enterprise-grade Financial General Ledger (FI-GL) module that provides:

- **Chart of Accounts (COA)** - Hierarchical account structure with 7 levels, control accounts, system accounts
- **Journal Entries** - Double-entry bookkeeping with approval workflow
- **Financial Periods** - Period management with open/close/lock lifecycle
- **Multi-Currency** - Exchange rates, revaluation, realized/unrealized gains
- **Reconciliation** - Account matching, discrepancy resolution
- **Consolidation** - Agency-level rollup with intercompany eliminations and ownership %
- **Financial Statements** - Balance Sheet, P&L, Cash Flow with PDF/Excel/CSV export
- **Audit Trail** - Immutable transaction logs for SOX/IFRS compliance

### 1.2 Tech Stack Alignment

Following existing codebase patterns:

| Component | Technology | Pattern Source |
|-----------|------------|----------------|
| Database | Prisma + PostgreSQL | `prisma/schema.prisma` |
| Auth | NextAuth.js | `src/auth.ts` |
| RBAC | Custom permission system | `src/lib/iam/authz/*` |
| Forms | react-hook-form + Zod | `src/components/forms/*` |
| Tables | TanStack Table | `src/app/(main)/agency/[agencyId]/team/data-table.tsx` |
| UI | shadcn/ui + Tailwind | `src/components/ui/*` |
| PDF Export | react-pdf | New dependency |
| Excel Export | xlsx | New dependency |

### 1.3 Multi-Tenancy Model

```
Agency (Parent Tenant)
├── GLConfiguration (1:1)
├── ChartOfAccount[] (Agency-level COA)
├── FinancialPeriod[] (Agency periods)
├── ConsolidationSnapshot[] (Consolidated statements)
└── SubAccount[] (Child Tenants)
    ├── ChartOfAccount[] (SubAccount-level COA)
    ├── JournalEntry[] (Transactions)
    ├── AccountBalance[] (Period balances)
    └── FinancialPeriod[] (SubAccount periods - can differ from Agency)
```

---

## 2. Architecture Overview

### 2.1 Module Structure

```
src/
├── lib/
│   ├── finance/
│   │   └── gl/
│   │       ├── actions/
│   │       │   ├── chart-of-accounts.ts
│   │       │   ├── journal-entries.ts
│   │       │   ├── transactions.ts
│   │       │   ├── reconciliation.ts
│   │       │   ├── balances.ts
│   │       │   ├── periods.ts
│   │       │   ├── currency.ts
│   │       │   ├── consolidation.ts
│   │       │   ├── reports.ts
│   │       │   ├── posting.ts
│   │       │   └── audit.ts
│   │       ├── utils/
│   │       │   ├── decimal.ts
│   │       │   ├── currency-precision.ts
│   │       │   ├── period-utils.ts
│   │       │   └── hierarchy-utils.ts
│   │       └── constants.ts
│   └── schemas/
│       └── finance/
│           └── gl/
│               ├── chart-of-accounts.ts
│               ├── journal-entry.ts
│               ├── transaction.ts
│               ├── reconciliation.ts
│               ├── period.ts
│               ├── currency.ts
│               ├── consolidation.ts
│               └── report.ts
├── app/
│   └── (main)/
│       └── agency/
│           └── [agencyId]/
│               └── finance/
│                   └── gl/
│                       ├── layout.tsx
│                       ├── page.tsx (Dashboard)
│                       ├── chart-of-accounts/
│                       ├── journal-entries/
│                       ├── transactions/
│                       ├── reconciliation/
│                       ├── balances/
│                       ├── periods/
│                       ├── currency/
│                       ├── consolidation/
│                       ├── reports/
│                       ├── audit/
│                       └── settings/
│       └── subaccount/
│           └── [subaccountId]/
│               └── finance/
│                   └── gl/
│                       └── ... (similar structure, scoped to subaccount)
scripts/
├── seed-gl-system.ts
├── seed-coa-templates.ts
└── seed-gl-permissions.ts
```

### 2.2 Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                               │
│  Forms → Validation (Zod) → Server Actions → Database (Prisma)      │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      PERMISSION CHECK                                │
│  hasAgencyPermission() / hasSubAccountPermission()                  │
│  finance.gl.{resource}.{action}                                     │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC                                  │
│  Double-entry validation │ Period validation │ Balance updates      │
│  Currency conversion │ Approval workflow │ Audit logging            │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DATABASE (Prisma)                               │
│  Transactions │ Journal Entries │ Account Balances │ Audit Trail    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema

### 3.1 Enums

Add to `prisma/schema.prisma`:

```prisma
// ========================================
// FI-GL ENUMS
// ========================================

enum AccountType {
  ASSET
  LIABILITY
  EQUITY
  REVENUE
  EXPENSE
}

enum AccountCategory {
  // Assets
  CURRENT_ASSET
  FIXED_ASSET
  OTHER_ASSET
  // Liabilities
  CURRENT_LIABILITY
  LONG_TERM_LIABILITY
  // Equity
  CAPITAL
  RETAINED_EARNINGS_CAT
  // Revenue
  OPERATING_REVENUE
  OTHER_REVENUE
  // Expense
  COST_OF_GOODS_SOLD
  OPERATING_EXPENSE
  OTHER_EXPENSE
}

enum SubledgerType {
  NONE
  ACCOUNTS_RECEIVABLE
  ACCOUNTS_PAYABLE
  INVENTORY
  FIXED_ASSETS
  PAYROLL
  BANK
}

enum SystemAccountType {
  RETAINED_EARNINGS
  OPENING_BALANCE_CONTROL
  SUSPENSE
  ROUNDING_DIFFERENCE
  INTERCOMPANY_CLEARING
  PAYROLL_CLEARING
  PAYMENT_CLEARING
  BANK_RECONCILIATION
  FOREIGN_EXCHANGE_GAIN
  FOREIGN_EXCHANGE_LOSS
  UNREALIZED_FX_GAIN
  UNREALIZED_FX_LOSS
  CONSOLIDATION_ADJUSTMENT
  ELIMINATION_ACCOUNT
}

enum PeriodType {
  MONTH
  QUARTER
  HALF_YEAR
  YEAR
  CUSTOM
}

enum PeriodStatus {
  FUTURE
  OPEN
  CLOSED
  LOCKED
}

enum JournalEntryStatus {
  DRAFT
  PENDING_APPROVAL
  APPROVED
  REJECTED
  POSTED
  REVERSED
  VOIDED
}

enum JournalEntryType {
  NORMAL
  OPENING
  CLOSING
  CARRY_FORWARD
  BROUGHT_FORWARD
  YEAR_END_CLOSING
  ADJUSTMENT
  REVERSAL
  CONSOLIDATION
  ELIMINATION
}

enum BalanceType {
  NORMAL
  OPENING
  CLOSING
  ADJUSTMENT
  REVERSAL
}

enum SourceModule {
  MANUAL
  INVOICE
  PAYMENT
  EXPENSE
  PAYROLL
  ASSET
  INVENTORY
  BANK
  ADJUSTMENT
  CONSOLIDATION
  INTERCOMPANY
  REVERSAL
  YEAR_END
  OPENING_BALANCE
}

enum ReconciliationStatus {
  IN_PROGRESS
  PENDING_APPROVAL
  APPROVED
  REJECTED
  CLOSED
}

enum ReconciliationItemStatus {
  UNMATCHED
  MATCHED
  EXCLUDED
  DISCREPANCY
}

enum ConsolidationMethod {
  FULL
  PROPORTIONAL
  EQUITY
}

enum ConsolidationStatus {
  DRAFT
  IN_PROGRESS
  PENDING_APPROVAL
  APPROVED
  REJECTED
  SUPERSEDED
}

enum Industry {
  RETAIL
  MANUFACTURING
  SAAS
  ECOMMERCE
  CONSULTING
  REAL_ESTATE
  HOSPITALITY
  HEALTHCARE
  CONSTRUCTION
  NON_PROFIT
  EDUCATION
  AGRICULTURE
  GENERIC
}

enum ReportType {
  BALANCE_SHEET
  INCOME_STATEMENT
  CASH_FLOW
  TRIAL_BALANCE
  GENERAL_LEDGER
  SUBSIDIARY_LEDGER
  ACCOUNT_BALANCE
  CONSOLIDATED_BALANCE_SHEET
  CONSOLIDATED_INCOME_STATEMENT
  CONSOLIDATED_CASH_FLOW
  INTERCOMPANY_REPORT
  CUSTOM
}

enum ReportFormat {
  PDF
  EXCEL
  CSV
  JSON
}

enum AuditAction {
  CREATE
  UPDATE
  DELETE
  SUBMIT
  APPROVE
  REJECT
  POST
  REVERSE
  VOID
  CLOSE
  LOCK
  CONSOLIDATE
  ELIMINATE
}
```

### 3.2 Core GL Models

```prisma
// ========================================
// FI-GL CONFIGURATION
// ========================================

model GLConfiguration {
  id                    String   @id @default(uuid())
  
  agencyId              String   @unique
  agency                Agency   @relation(fields: [agencyId], references: [id], onDelete: Cascade)
  
  // General settings
  baseCurrency          String   @default("USD")
  fiscalYearEnd         String   @default("12-31") // MM-DD format
  fiscalYearStart       String   @default("01-01") // MM-DD format
  useControlAccounts    Boolean  @default(true)
  
  // Posting settings
  requireApproval       Boolean  @default(true)
  approvalThreshold     Decimal? @db.Decimal(18, 6) // Amount above which requires approval
  autoPostingEnabled    Boolean  @default(false)
  allowFuturePeriodPost Boolean  @default(false)
  allowClosedPeriodPost Boolean  @default(false)
  
  // Consolidation settings
  consolidationEnabled  Boolean  @default(false)
  consolidationMethod   ConsolidationMethod @default(FULL)
  eliminateIntercompany Boolean  @default(true)
  
  // Period settings
  autoCreatePeriods     Boolean  @default(true)
  periodLockDays        Int      @default(5) // Days after period end to auto-lock
  
  // Number formats
  accountCodeFormat     String   @default("####-####")
  accountCodeLength     Int      @default(8)
  accountCodeSeparator  String   @default("-")
  
  // Integrations
  erpIntegrationEnabled Boolean  @default(false)
  erpSystemType         String?
  erpApiUrl             String?
  erpApiKey             String?  @db.Text
  
  // Audit retention
  retainAuditDays       Int      @default(2555) // ~7 years
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  updatedBy             String?
  
  @@index([agencyId])
}

// ========================================
// CHART OF ACCOUNTS
// ========================================

model ChartOfAccount {
  id                    String   @id @default(uuid())
  
  // Multi-tenant scope
  agencyId              String?
  subAccountId          String?
  agency                Agency?   @relation(fields: [agencyId], references: [id], onDelete: Cascade)
  subAccount            SubAccount? @relation(fields: [subAccountId], references: [id], onDelete: Cascade)
  
  // Account identification
  code                  String
  name                  String
  description           String?  @db.Text
  
  // Hierarchy (hybrid: parentId + materialized path + level)
  parentAccountId       String?
  parentAccount         ChartOfAccount? @relation("AccountHierarchy", fields: [parentAccountId], references: [id], onDelete: Restrict)
  childAccounts         ChartOfAccount[] @relation("AccountHierarchy")
  path                  String   @default("/") // Materialized path: "/1/12/123/"
  level                 Int      @default(0)   // 0-based depth (max 7)
  
  // Classification
  accountType           AccountType
  category              AccountCategory?
  subcategory           String?
  
  // Control account settings
  isControlAccount      Boolean  @default(false)
  subledgerType         SubledgerType @default(NONE)
  controlAccountId      String?
  controlAccount        ChartOfAccount? @relation("ControlAccountLink", fields: [controlAccountId], references: [id])
  subledgerAccounts     ChartOfAccount[] @relation("ControlAccountLink")
  
  // System account settings
  isSystemAccount       Boolean  @default(false)
  isSystemManaged       Boolean  @default(false)
  systemAccountType     SystemAccountType?
  
  // Special account flags
  isClearingAccount     Boolean  @default(false)
  isSuspenseAccount     Boolean  @default(false)
  isRetainedEarnings    Boolean  @default(false)
  isOpeningBalControl   Boolean  @default(false)
  
  // Posting behavior
  allowManualPosting    Boolean  @default(true)
  requireApproval       Boolean  @default(false)
  isPostingAccount      Boolean  @default(true) // Can post to this account (leaf node)
  
  // Consolidation settings
  isConsolidationEnabled Boolean @default(false)
  consolidationAccountCode String? // Maps to Agency Group COA
  
  // Currency settings
  currencyCode          String?  // If null, uses base currency
  isMultiCurrency       Boolean  @default(false)
  
  // Status
  isActive              Boolean  @default(true)
  isArchived            Boolean  @default(false)
  archivedAt            DateTime?
  archivedBy            String?
  
  // Normal balance (for display/validation)
  normalBalance         String   @default("DEBIT") // DEBIT or CREDIT
  
  // Sort order within parent
  sortOrder             Int      @default(0)
  
  // Audit fields
  createdAt             DateTime @default(now())
  createdBy             String
  updatedAt             DateTime @updatedAt
  updatedBy             String?
  
  // Relations
  journalEntryLines     JournalEntryLine[]
  accountBalances       AccountBalance[]
  reconciliations       Reconciliation[]
  postingRuleDebits     PostingRule[] @relation("PostingRuleDebit")
  postingRuleCredits    PostingRule[] @relation("PostingRuleCredit")
  
  @@unique([agencyId, code])
  @@unique([subAccountId, code])
  @@index([agencyId, accountType])
  @@index([agencyId, isActive])
  @@index([agencyId, path])
  @@index([agencyId, level])
  @@index([subAccountId, accountType])
  @@index([subAccountId, isActive])
  @@index([subAccountId, path])
  @@index([parentAccountId])
  @@index([controlAccountId])
  @@index([isControlAccount])
  @@index([isSystemAccount])
  @@index([isConsolidationEnabled])
}

// ========================================
// AGENCY GROUP COA (For Consolidation)
// ========================================

model AgencyGroupCOA {
  id                    String   @id @default(uuid())
  
  agencyId              String
  agency                Agency   @relation(fields: [agencyId], references: [id], onDelete: Cascade)
  
  // Account identification
  code                  String
  name                  String
  description           String?  @db.Text
  
  // Classification
  accountType           AccountType
  category              AccountCategory?
  
  // Hierarchy
  parentId              String?
  parent                AgencyGroupCOA? @relation("GroupCOAHierarchy", fields: [parentId], references: [id], onDelete: Restrict)
  children              AgencyGroupCOA[] @relation("GroupCOAHierarchy")
  path                  String   @default("/")
  level                 Int      @default(0)
  
  // Status
  isActive              Boolean  @default(true)
  sortOrder             Int      @default(0)
  
  // Audit
  createdAt             DateTime @default(now())
  createdBy             String
  updatedAt             DateTime @updatedAt
  updatedBy             String?
  
  // Relations
  consolidationMappings ConsolidationMapping[]
  consolidatedBalances  ConsolidatedBalance[]
  worksheetLines        ConsolidationWorksheetLine[]
  
  @@unique([agencyId, code])
  @@index([agencyId, accountType])
  @@index([agencyId, isActive])
  @@index([parentId])
}

// ========================================
// CONSOLIDATION MAPPING
// ========================================

model ConsolidationMapping {
  id                    String   @id @default(uuid())
  
  agencyId              String
  agency                Agency   @relation(fields: [agencyId], references: [id], onDelete: Cascade)
  
  // SubAccount COA → Agency Group COA mapping
  subAccountId          String
  subAccount            SubAccount @relation(fields: [subAccountId], references: [id], onDelete: Cascade)
  
  subAccountCOACode     String   // Source account code from subaccount
  groupCOAId            String   // Target Agency Group COA
  groupCOA              AgencyGroupCOA @relation(fields: [groupCOAId], references: [id], onDelete: Cascade)
  
  // Mapping rules
  mappingPercentage     Decimal  @default(100) @db.Decimal(5, 2) // For proportional consolidation
  isElimination         Boolean  @default(false) // Intercompany elimination account
  eliminationPairId     String?  // Linked elimination account in other subaccount
  
  // Status
  isActive              Boolean  @default(true)
  
  // Audit
  createdAt             DateTime @default(now())
  createdBy             String
  updatedAt             DateTime @updatedAt
  updatedBy             String?
  
  @@unique([agencyId, subAccountId, subAccountCOACode])
  @@index([agencyId])
  @@index([subAccountId])
  @@index([groupCOAId])
  @@index([isElimination])
}

// ========================================
// FINANCIAL PERIODS
// ========================================

model FinancialPeriod {
  id                    String   @id @default(uuid())
  
  // Multi-tenant scope (can be Agency or SubAccount level)
  agencyId              String?
  subAccountId          String?
  agency                Agency?   @relation(fields: [agencyId], references: [id], onDelete: Cascade)
  subAccount            SubAccount? @relation(fields: [subAccountId], references: [id], onDelete: Cascade)
  
  // Period identification
  name                  String   // "January 2026", "Q1 FY2026"
  shortName             String?  // "Jan-26", "Q1-26"
  periodType            PeriodType
  fiscalYear            Int
  fiscalPeriod          Int      // 1-12 for months, 1-4 for quarters
  
  // Date range
  startDate             DateTime
  endDate               DateTime
  
  // Status workflow
  status                PeriodStatus @default(FUTURE)
  
  // Workflow metadata
  openedAt              DateTime?
  openedBy              String?
  closedAt              DateTime?
  closedBy              String?
  lockedAt              DateTime?
  lockedBy              String?
  
  // Balance snapshots (JSON for efficiency)
  openingBalances       Json?
  closingBalances       Json?
  
  // Year-end
  isYearEnd             Boolean  @default(false)
  yearEndProcessedAt    DateTime?
  yearEndProcessedBy    String?
  
  // Notes
  notes                 String?  @db.Text
  
  // Audit
  createdAt             DateTime @default(now())
  createdBy             String
  updatedAt             DateTime @updatedAt
  updatedBy             String?
  
  // Relations
  journalEntries        JournalEntry[]
  accountBalances       AccountBalance[]
  reconciliations       Reconciliation[]
  consolidationSnapshots ConsolidationSnapshot[]
  
  @@unique([agencyId, fiscalYear, periodType, fiscalPeriod])
  @@unique([subAccountId, fiscalYear, periodType, fiscalPeriod])
  @@index([agencyId, status])
  @@index([agencyId, fiscalYear])
  @@index([subAccountId, status])
  @@index([subAccountId, fiscalYear])
  @@index([startDate, endDate])
  @@index([status])
}

// ========================================
// JOURNAL ENTRIES
// ========================================

model JournalEntry {
  id                    String   @id @default(uuid())
  
  // Multi-tenant scope
  agencyId              String?
  subAccountId          String?
  agency                Agency?   @relation(fields: [agencyId], references: [id], onDelete: Cascade)
  subAccount            SubAccount? @relation(fields: [subAccountId], references: [id], onDelete: Cascade)
  
  // Entry identification
  entryNumber           String   // Auto-generated: JE-2026-00001
  reference             String?  // External reference
  
  // Period
  periodId              String
  period                FinancialPeriod @relation(fields: [periodId], references: [id])
  entryDate             DateTime
  
  // Type and source
  entryType             JournalEntryType @default(NORMAL)
  sourceModule          SourceModule @default(MANUAL)
  sourceId              String?  // ID of source document
  sourceReference       String?  // Reference number of source
  
  // Posting rule (if auto-generated)
  postingRuleId         String?
  postingRule           PostingRule? @relation(fields: [postingRuleId], references: [id])
  
  // Description
  description           String   @db.Text
  notes                 String?  @db.Text
  
  // Currency
  currencyCode          String   @default("USD")
  exchangeRate          Decimal  @default(1) @db.Decimal(12, 6)
  
  // Totals (denormalized for performance)
  totalDebit            Decimal  @default(0) @db.Decimal(18, 6)
  totalCredit           Decimal  @default(0) @db.Decimal(18, 6)
  totalDebitBase        Decimal  @default(0) @db.Decimal(18, 6) // In base currency
  totalCreditBase       Decimal  @default(0) @db.Decimal(18, 6)
  
  // Status workflow
  status                JournalEntryStatus @default(DRAFT)
  
  // CF/BF tracking
  isCarryForward        Boolean  @default(false)
  isBroughtForward      Boolean  @default(false)
  carryForwardFromId    String?
  carryForwardFrom      JournalEntry? @relation("CarryForwardLink", fields: [carryForwardFromId], references: [id])
  carriedForwardTo      JournalEntry[] @relation("CarryForwardLink")
  
  // Reversal tracking
  isReversal            Boolean  @default(false)
  reversalOfId          String?
  reversalOf            JournalEntry? @relation("ReversalLink", fields: [reversalOfId], references: [id])
  reversedBy            JournalEntry[] @relation("ReversalLink")
  
  // Workflow audit
  submittedAt           DateTime?
  submittedBy           String?
  approvedAt            DateTime?
  approvedBy            String?
  rejectedAt            DateTime?
  rejectedBy            String?
  rejectionReason       String?  @db.Text
  postedAt              DateTime?
  postedBy              String?
  reversedAt            DateTime?
  reversedByUser        String?
  reversalReason        String?  @db.Text
  voidedAt              DateTime?
  voidedBy              String?
  voidReason            String?  @db.Text
  
  // Audit
  createdAt             DateTime @default(now())
  createdBy             String
  updatedAt             DateTime @updatedAt
  updatedBy             String?
  
  // Relations
  lines                 JournalEntryLine[]
  
  @@unique([agencyId, entryNumber])
  @@unique([subAccountId, entryNumber])
  @@index([agencyId, status])
  @@index([agencyId, periodId])
  @@index([agencyId, entryDate])
  @@index([agencyId, entryType])
  @@index([subAccountId, status])
  @@index([subAccountId, periodId])
  @@index([subAccountId, entryDate])
  @@index([sourceModule, sourceId])
  @@index([postingRuleId])
  @@index([status])
  @@index([createdBy])
  @@index([approvedBy])
}

model JournalEntryLine {
  id                    String   @id @default(uuid())
  
  journalEntryId        String
  journalEntry          JournalEntry @relation(fields: [journalEntryId], references: [id], onDelete: Cascade)
  
  // Line number
  lineNumber            Int
  
  // Account
  accountId             String
  account               ChartOfAccount @relation(fields: [accountId], references: [id])
  
  // Description
  description           String?
  
  // Amounts (transaction currency)
  debitAmount           Decimal  @default(0) @db.Decimal(18, 6)
  creditAmount          Decimal  @default(0) @db.Decimal(18, 6)
  
  // Base currency amounts
  debitAmountBase       Decimal  @default(0) @db.Decimal(18, 6)
  creditAmountBase      Decimal  @default(0) @db.Decimal(18, 6)
  
  // Exchange rate (line-level override if different from header)
  exchangeRate          Decimal? @db.Decimal(12, 6)
  
  // Reference fields (for subledger linking)
  subledgerType         SubledgerType @default(NONE)
  subledgerReference    String?  // Customer ID, Vendor ID, etc.
  
  // Tax information
  taxCode               String?
  taxAmount             Decimal? @db.Decimal(18, 6)
  
  // Dimensions (future extensibility)
  dimension1            String?  // Cost center
  dimension2            String?  // Department
  dimension3            String?  // Project
  dimension4            String?  // Custom
  
  // Intercompany
  isIntercompany        Boolean  @default(false)
  intercompanySubAccountId String?
  
  createdAt             DateTime @default(now())
  
  @@index([journalEntryId])
  @@index([accountId])
  @@index([subledgerType, subledgerReference])
  @@index([isIntercompany])
}

// ========================================
// ACCOUNT BALANCES
// ========================================

model AccountBalance {
  id                    String   @id @default(uuid())
  
  // Multi-tenant scope
  agencyId              String?
  subAccountId          String?
  
  // Account and period
  accountId             String
  account               ChartOfAccount @relation(fields: [accountId], references: [id], onDelete: Cascade)
  periodId              String
  period                FinancialPeriod @relation(fields: [periodId], references: [id], onDelete: Cascade)
  
  // Currency
  currencyCode          String   @default("USD")
  
  // Balance components
  openingBalance        Decimal  @default(0) @db.Decimal(18, 6) // BF
  debitMovement         Decimal  @default(0) @db.Decimal(18, 6)
  creditMovement        Decimal  @default(0) @db.Decimal(18, 6)
  closingBalance        Decimal  @default(0) @db.Decimal(18, 6) // CF
  
  // Base currency balances
  openingBalanceBase    Decimal  @default(0) @db.Decimal(18, 6)
  debitMovementBase     Decimal  @default(0) @db.Decimal(18, 6)
  creditMovementBase    Decimal  @default(0) @db.Decimal(18, 6)
  closingBalanceBase    Decimal  @default(0) @db.Decimal(18, 6)
  
  // Balance type
  balanceType           BalanceType @default(NORMAL)
  
  // Transaction count
  transactionCount      Int      @default(0)
  
  // Last recalculation
  lastRecalculatedAt    DateTime?
  
  updatedAt             DateTime @updatedAt
  
  @@unique([accountId, periodId, currencyCode])
  @@index([agencyId, periodId])
  @@index([subAccountId, periodId])
  @@index([accountId])
  @@index([periodId])
}
```

### 3.3 Multi-Currency Models

```prisma
// ========================================
// MULTI-CURRENCY
// ========================================

model Currency {
  id                    String   @id @default(uuid())
  
  code                  String   @unique // ISO 4217: USD, EUR, JPY
  name                  String           // US Dollar, Euro, Japanese Yen
  symbol                String           // $, €, ¥
  decimalPlaces         Int      @default(2) // 0 for JPY, 2 for USD
  
  isActive              Boolean  @default(true)
  isBaseCurrency        Boolean  @default(false)
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  exchangeRatesFrom     ExchangeRate[] @relation("FromCurrency")
  exchangeRatesTo       ExchangeRate[] @relation("ToCurrency")
  revaluations          CurrencyRevaluation[]
  
  @@index([isActive])
  @@index([code])
}

model ExchangeRate {
  id                    String   @id @default(uuid())
  
  agencyId              String
  agency                Agency   @relation(fields: [agencyId], references: [id], onDelete: Cascade)
  
  fromCurrencyCode      String
  fromCurrency          Currency @relation("FromCurrency", fields: [fromCurrencyCode], references: [code])
  toCurrencyCode        String
  toCurrency            Currency @relation("ToCurrency", fields: [toCurrencyCode], references: [code])
  
  rate                  Decimal  @db.Decimal(12, 6)
  inverseRate           Decimal  @db.Decimal(12, 6)
  
  effectiveDate         DateTime
  expiryDate            DateTime?
  
  rateType              String   @default("SPOT") // SPOT, AVERAGE, BUDGET
  source                String?  // API source or manual
  
  isActive              Boolean  @default(true)
  
  createdAt             DateTime @default(now())
  createdBy             String
  updatedAt             DateTime @updatedAt
  
  @@unique([agencyId, fromCurrencyCode, toCurrencyCode, effectiveDate, rateType])
  @@index([agencyId, effectiveDate])
  @@index([fromCurrencyCode, toCurrencyCode])
  @@index([effectiveDate])
}

model CurrencyRevaluation {
  id                    String   @id @default(uuid())
  
  agencyId              String?
  subAccountId          String?
  agency                Agency?   @relation(fields: [agencyId], references: [id], onDelete: Cascade)
  subAccount            SubAccount? @relation(fields: [subAccountId], references: [id], onDelete: Cascade)
  
  periodId              String
  currencyCode          String
  currency              Currency @relation(fields: [currencyCode], references: [code])
  
  revaluationDate       DateTime
  exchangeRate          Decimal  @db.Decimal(12, 6)
  previousRate          Decimal  @db.Decimal(12, 6)
  
  // Amounts
  unrealizedGain        Decimal  @default(0) @db.Decimal(18, 6)
  unrealizedLoss        Decimal  @default(0) @db.Decimal(18, 6)
  netGainLoss           Decimal  @default(0) @db.Decimal(18, 6)
  
  // Generated journal entry
  journalEntryId        String?
  
  status                String   @default("DRAFT") // DRAFT, POSTED, REVERSED
  
  createdAt             DateTime @default(now())
  createdBy             String
  postedAt              DateTime?
  postedBy              String?
  
  @@index([agencyId, periodId])
  @@index([subAccountId, periodId])
  @@index([currencyCode])
}
```

### 3.4 Posting Rules & Templates

```prisma
// ========================================
// POSTING RULES & AUTOMATION
// ========================================

model PostingRule {
  id                    String   @id @default(uuid())
  
  // Scope
  agencyId              String?
  subAccountId          String?
  agency                Agency?   @relation(fields: [agencyId], references: [id], onDelete: Cascade)
  subAccount            SubAccount? @relation(fields: [subAccountId], references: [id], onDelete: Cascade)
  
  // Identification
  code                  String
  name                  String
  description           String?  @db.Text
  
  // Source
  sourceModule          SourceModule
  
  // Template accounts
  debitAccountId        String
  debitAccount          ChartOfAccount @relation("PostingRuleDebit", fields: [debitAccountId], references: [id])
  creditAccountId       String
  creditAccount         ChartOfAccount @relation("PostingRuleCredit", fields: [creditAccountId], references: [id])
  
  // Amount calculation
  amountType            String   @default("FULL") // FULL, PERCENTAGE, FIXED
  percentage            Decimal? @db.Decimal(5, 4)
  fixedAmount           Decimal? @db.Decimal(18, 6)
  
  // Conditions (JSON for flexibility)
  conditions            Json?    // { "amountGreaterThan": 1000, "customerType": "VIP" }
  
  // Execution
  priority              Int      @default(0)
  isActive              Boolean  @default(true)
  autoPost              Boolean  @default(false) // Auto-post or create draft
  
  // Audit
  createdAt             DateTime @default(now())
  createdBy             String
  updatedAt             DateTime @updatedAt
  updatedBy             String?
  activatedAt           DateTime?
  activatedBy           String?
  deactivatedAt         DateTime?
  deactivatedBy         String?
  
  journalEntries        JournalEntry[]
  
  @@unique([agencyId, code])
  @@unique([subAccountId, code])
  @@index([agencyId, sourceModule, isActive])
  @@index([subAccountId, sourceModule, isActive])
  @@index([sourceModule])
  @@index([isActive])
}

model PostingTemplate {
  id                    String   @id @default(uuid())
  
  agencyId              String
  agency                Agency   @relation(fields: [agencyId], references: [id], onDelete: Cascade)
  
  name                  String
  description           String?  @db.Text
  
  // Template definition (JSON array of lines)
  // [{ "accountCode": "1000", "debitPercent": 100, "creditPercent": 0 }, ...]
  template              Json
  
  // Default values
  defaultDescription    String?
  defaultCurrency       String   @default("USD")
  
  isActive              Boolean  @default(true)
  
  createdAt             DateTime @default(now())
  createdBy             String
  updatedAt             DateTime @updatedAt
  
  @@unique([agencyId, name])
  @@index([agencyId, isActive])
}
```

### 3.5 Reconciliation Models

```prisma
// ========================================
// RECONCILIATION
// ========================================

model Reconciliation {
  id                    String   @id @default(uuid())
  
  // Scope
  agencyId              String?
  subAccountId          String?
  agency                Agency?   @relation(fields: [agencyId], references: [id], onDelete: Cascade)
  subAccount            SubAccount? @relation(fields: [subAccountId], references: [id], onDelete: Cascade)
  
  // Reconciliation target
  accountId             String
  account               ChartOfAccount @relation(fields: [accountId], references: [id])
  periodId              String
  period                FinancialPeriod @relation(fields: [periodId], references: [id])
  
  // Reference
  reconciliationNumber  String
  description           String?
  
  // Balances
  bookBalance           Decimal  @db.Decimal(18, 6)
  statementBalance      Decimal  @db.Decimal(18, 6)
  adjustedBookBalance   Decimal  @db.Decimal(18, 6)
  difference            Decimal  @db.Decimal(18, 6)
  
  // Status
  status                ReconciliationStatus @default(IN_PROGRESS)
  
  // Workflow
  submittedAt           DateTime?
  submittedBy           String?
  approvedAt            DateTime?
  approvedBy            String?
  rejectedAt            DateTime?
  rejectedBy            String?
  rejectionReason       String?
  closedAt              DateTime?
  closedBy              String?
  
  notes                 String?  @db.Text
  
  createdAt             DateTime @default(now())
  createdBy             String
  updatedAt             DateTime @updatedAt
  updatedBy             String?
  
  items                 ReconciliationItem[]
  
  @@unique([agencyId, reconciliationNumber])
  @@unique([subAccountId, reconciliationNumber])
  @@index([agencyId, status])
  @@index([subAccountId, status])
  @@index([accountId, periodId])
  @@index([status])
}

model ReconciliationItem {
  id                    String   @id @default(uuid())
  
  reconciliationId      String
  reconciliation        Reconciliation @relation(fields: [reconciliationId], references: [id], onDelete: Cascade)
  
  // Item type
  itemType              String   // BOOK, STATEMENT, ADJUSTMENT
  
  // Transaction reference
  transactionDate       DateTime
  reference             String?
  description           String?
  
  // Amounts
  amount                Decimal  @db.Decimal(18, 6)
  
  // Matching
  status                ReconciliationItemStatus @default(UNMATCHED)
  matchedItemId         String?  // Link to matched item
  matchedAt             DateTime?
  matchedBy             String?
  
  notes                 String?
  
  createdAt             DateTime @default(now())
  
  @@index([reconciliationId])
  @@index([status])
  @@index([matchedItemId])
}

model ReconciliationRule {
  id                    String   @id @default(uuid())
  
  agencyId              String
  agency                Agency   @relation(fields: [agencyId], references: [id], onDelete: Cascade)
  
  name                  String
  description           String?
  
  // Rule definition (JSON)
  // { "matchBy": ["reference", "amount"], "tolerance": 0.01 }
  ruleDefinition        Json
  
  priority              Int      @default(0)
  isActive              Boolean  @default(true)
  
  createdAt             DateTime @default(now())
  createdBy             String
  updatedAt             DateTime @updatedAt
  
  @@index([agencyId, isActive])
}

// Intercompany reconciliation
model IntercompanyReconciliation {
  id                    String   @id @default(uuid())
  
  agencyId              String
  agency                Agency   @relation(fields: [agencyId], references: [id], onDelete: Cascade)
  
  periodId              String
  
  // Subaccounts involved
  subAccountId1         String
  subAccount1           SubAccount @relation("ICRecon1", fields: [subAccountId1], references: [id])
  subAccountId2         String
  subAccount2           SubAccount @relation("ICRecon2", fields: [subAccountId2], references: [id])
  
  // Account codes
  accountCode1          String
  accountCode2          String
  
  // Balances
  balance1              Decimal  @db.Decimal(18, 6)
  balance2              Decimal  @db.Decimal(18, 6)
  difference            Decimal  @db.Decimal(18, 6)
  
  status                ReconciliationStatus @default(IN_PROGRESS)
  
  notes                 String?  @db.Text
  
  createdAt             DateTime @default(now())
  createdBy             String
  updatedAt             DateTime @updatedAt
  
  @@index([agencyId, periodId])
  @@index([subAccountId1])
  @@index([subAccountId2])
}
```

### 3.6 Consolidation Models

```prisma
// ========================================
// CONSOLIDATION
// ========================================

model ConsolidationSnapshot {
  id                    String   @id @default(uuid())
  
  agencyId              String
  agency                Agency   @relation(fields: [agencyId], references: [id], onDelete: Cascade)
  
  periodId              String
  period                FinancialPeriod @relation(fields: [periodId], references: [id])
  
  // Snapshot identification
  snapshotNumber        String
  name                  String
  description           String?  @db.Text
  
  // Scope - which subaccounts are included
  subAccountIds         String[] // Array of subaccount IDs
  
  // Consolidation method
  consolidationMethod   ConsolidationMethod
  
  // Consolidated results (denormalized JSON for performance)
  consolidatedBalances  Json     // { "1000": { balance, eliminations, adjusted } }
  balanceSheet          Json
  incomeStatement       Json
  cashFlowStatement     Json
  
  // Adjustments summary
  eliminationEntries    Json     // Array of elimination entries
  adjustmentEntries     Json     // Array of manual adjustments
  totalEliminations     Decimal  @default(0) @db.Decimal(18, 6)
  totalAdjustments      Decimal  @default(0) @db.Decimal(18, 6)
  
  // Ownership percentages (for proportional/equity)
  ownershipPercentages  Json?    // { "subaccount1": 100, "subaccount2": 60 }
  
  // Version control
  version               Int      @default(1)
  previousVersionId     String?
  
  // Status workflow
  status                ConsolidationStatus @default(DRAFT)
  
  // Validation
  validationResults     Json?    // { warnings: [], errors: [] }
  isValid               Boolean  @default(false)
  
  // Workflow
  consolidatedAt        DateTime @default(now())
  consolidatedBy        String
  submittedAt           DateTime?
  submittedBy           String?
  approvedAt            DateTime?
  approvedBy            String?
  rejectedAt            DateTime?
  rejectedBy            String?
  rejectionReason       String?
  
  notes                 String?  @db.Text
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  // Relations
  worksheetLines        ConsolidationWorksheetLine[]
  adjustments           ConsolidationAdjustment[]
  eliminations          IntercompanyElimination[]
  consolidatedBalances_ ConsolidatedBalance[]
  
  @@unique([agencyId, periodId, version])
  @@index([agencyId, periodId, status])
  @@index([agencyId, status])
  @@index([periodId])
}

model ConsolidationWorksheetLine {
  id                    String   @id @default(uuid())
  
  snapshotId            String
  snapshot              ConsolidationSnapshot @relation(fields: [snapshotId], references: [id], onDelete: Cascade)
  
  // Group COA reference
  groupCOAId            String
  groupCOA              AgencyGroupCOA @relation(fields: [groupCOAId], references: [id])
  accountCode           String
  accountName           String
  
  // SubAccount balances (JSON for flexibility)
  // { "subaccount1": 1000.00, "subaccount2": 500.00 }
  subAccountBalances    Json
  
  // Totals before adjustments
  totalBeforeAdj        Decimal  @db.Decimal(18, 6)
  
  // Adjustments
  eliminations          Decimal  @default(0) @db.Decimal(18, 6)
  adjustments           Decimal  @default(0) @db.Decimal(18, 6)
  
  // Final consolidated balance
  consolidatedBalance   Decimal  @db.Decimal(18, 6)
  
  @@unique([snapshotId, accountCode])
  @@index([snapshotId])
  @@index([groupCOAId])
}

model ConsolidatedBalance {
  id                    String   @id @default(uuid())
  
  snapshotId            String
  snapshot              ConsolidationSnapshot @relation(fields: [snapshotId], references: [id], onDelete: Cascade)
  
  groupCOAId            String
  groupCOA              AgencyGroupCOA @relation(fields: [groupCOAId], references: [id])
  
  // Balance
  balance               Decimal  @db.Decimal(18, 6)
  
  @@unique([snapshotId, groupCOAId])
  @@index([snapshotId])
}

model ConsolidationAdjustment {
  id                    String   @id @default(uuid())
  
  snapshotId            String
  snapshot              ConsolidationSnapshot @relation(fields: [snapshotId], references: [id], onDelete: Cascade)
  
  // Adjustment details
  adjustmentNumber      String
  description           String
  
  debitAccountCode      String
  creditAccountCode     String
  amount                Decimal  @db.Decimal(18, 6)
  
  adjustmentType        String   // MANUAL, MINORITY_INTEREST, GOODWILL, OTHER
  
  // Status
  status                String   @default("DRAFT") // DRAFT, APPROVED, REJECTED
  approvedAt            DateTime?
  approvedBy            String?
  
  notes                 String?  @db.Text
  
  createdAt             DateTime @default(now())
  createdBy             String
  updatedAt             DateTime @updatedAt
  
  @@index([snapshotId])
}

model IntercompanyElimination {
  id                    String   @id @default(uuid())
  
  snapshotId            String
  snapshot              ConsolidationSnapshot @relation(fields: [snapshotId], references: [id], onDelete: Cascade)
  
  // Elimination details
  eliminationNumber     String
  description           String
  
  // Intercompany pair
  subAccountId1         String
  subAccountId2         String
  accountCode1          String
  accountCode2          String
  
  // Amount
  amount                Decimal  @db.Decimal(18, 6)
  
  eliminationType       String   // REVENUE_EXPENSE, RECEIVABLE_PAYABLE, INVENTORY_PROFIT, OTHER
  
  // Status
  status                String   @default("DRAFT")
  approvedAt            DateTime?
  approvedBy            String?
  
  // Auto or manual
  isAutoGenerated       Boolean  @default(true)
  
  notes                 String?  @db.Text
  
  createdAt             DateTime @default(now())
  createdBy             String
  
  @@index([snapshotId])
  @@index([subAccountId1, subAccountId2])
}

model SubAccountOwnership {
  id                    String   @id @default(uuid())
  
  agencyId              String
  agency                Agency   @relation(fields: [agencyId], references: [id], onDelete: Cascade)
  
  subAccountId          String
  subAccount            SubAccount @relation(fields: [subAccountId], references: [id], onDelete: Cascade)
  
  // Ownership details
  ownershipPercentage   Decimal  @db.Decimal(5, 2) // 0.00 to 100.00
  consolidationMethod   ConsolidationMethod
  
  // Effective dates
  effectiveFrom         DateTime
  effectiveTo           DateTime?
  
  // Minority interest account (if applicable)
  minorityInterestAccountCode String?
  
  isActive              Boolean  @default(true)
  
  createdAt             DateTime @default(now())
  createdBy             String
  updatedAt             DateTime @updatedAt
  
  @@unique([agencyId, subAccountId, effectiveFrom])
  @@index([agencyId, isActive])
  @@index([subAccountId])
}
```

### 3.7 Reporting & Audit Models

```prisma
// ========================================
// REPORTING
// ========================================

model SavedReport {
  id                    String   @id @default(uuid())
  
  agencyId              String?
  subAccountId          String?
  agency                Agency?   @relation(fields: [agencyId], references: [id], onDelete: Cascade)
  subAccount            SubAccount? @relation(fields: [subAccountId], references: [id], onDelete: Cascade)
  
  name                  String
  description           String?
  
  reportType            ReportType
  
  // Report parameters (JSON)
  parameters            Json     // { periodId, accountIds, etc. }
  
  // Schedule (optional)
  isScheduled           Boolean  @default(false)
  schedule              String?  // Cron expression
  
  // Output
  lastGeneratedAt       DateTime?
  lastGeneratedBy       String?
  
  isActive              Boolean  @default(true)
  
  createdAt             DateTime @default(now())
  createdBy             String
  updatedAt             DateTime @updatedAt
  
  @@index([agencyId, reportType])
  @@index([subAccountId, reportType])
}

model ReportTemplate {
  id                    String   @id @default(uuid())
  
  name                  String   @unique
  description           String?
  
  reportType            ReportType
  
  // Template definition
  templateDefinition    Json     // Layout, columns, calculations
  
  // Default parameters
  defaultParameters     Json?
  
  isSystem              Boolean  @default(true)
  isActive              Boolean  @default(true)
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@index([reportType, isActive])
}

model COATemplate {
  id                    String   @id @default(uuid())
  
  name                  String   // "SaaS Company COA"
  industry              Industry
  description           String   @db.Text
  region                String   @default("US")
  accountingStandard    String   @default("GAAP")
  
  // Full COA structure as JSON
  template              Json
  
  // Metadata
  version               String   @default("1.0")
  isActive              Boolean  @default(true)
  isDefault             Boolean  @default(false)
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@index([industry, isActive])
  @@index([region, accountingStandard])
}

// ========================================
// AUDIT TRAIL
// ========================================

model GLAuditTrail {
  id                    String   @id @default(uuid())
  
  // Scope
  agencyId              String?
  subAccountId          String?
  
  // What changed
  entityType            String   // JournalEntry, ChartOfAccount, etc.
  entityId              String
  
  // Action
  action                AuditAction
  
  // Who
  userId                String
  userEmail             String?
  userName              String?
  
  // When
  timestamp             DateTime @default(now())
  
  // What changed (before/after)
  previousValues        Json?
  newValues             Json?
  
  // Context
  ipAddress             String?
  userAgent             String?
  sessionId             String?
  
  // Notes
  reason                String?
  
  @@index([agencyId, entityType, entityId])
  @@index([subAccountId, entityType, entityId])
  @@index([agencyId, timestamp])
  @@index([subAccountId, timestamp])
  @@index([userId])
  @@index([entityType, entityId])
  @@index([timestamp])
  @@index([action])
}
```

### 3.8 Relation Updates

Add these relations to existing models in `schema.prisma`:

```prisma
// Add to Agency model
model Agency {
  // ... existing fields ...
  
  // FI-GL Relations
  GLConfiguration       GLConfiguration?
  ChartOfAccounts       ChartOfAccount[]
  AgencyGroupCOAs       AgencyGroupCOA[]
  ConsolidationMappings ConsolidationMapping[]
  FinancialPeriods      FinancialPeriod[]
  JournalEntries        JournalEntry[]
  ExchangeRates         ExchangeRate[]
  CurrencyRevaluations  CurrencyRevaluation[]
  PostingRules          PostingRule[]
  PostingTemplates      PostingTemplate[]
  Reconciliations       Reconciliation[]
  ReconciliationRules   ReconciliationRule[]
  IntercompanyReconciliations IntercompanyReconciliation[]
  ConsolidationSnapshots ConsolidationSnapshot[]
  SubAccountOwnerships  SubAccountOwnership[]
  SavedReports          SavedReport[]
}

// Add to SubAccount model
model SubAccount {
  // ... existing fields ...
  
  // FI-GL Relations
  ChartOfAccounts       ChartOfAccount[]
  ConsolidationMappings ConsolidationMapping[]
  FinancialPeriods      FinancialPeriod[]
  JournalEntries        JournalEntry[]
  CurrencyRevaluations  CurrencyRevaluation[]
  PostingRules          PostingRule[]
  Reconciliations       Reconciliation[]
  ICReconciliations1    IntercompanyReconciliation[] @relation("ICRecon1")
  ICReconciliations2    IntercompanyReconciliation[] @relation("ICRecon2")
  SubAccountOwnership   SubAccountOwnership[]
  SavedReports          SavedReport[]
}
```

---

## 4. RBAC Permissions

### 4.1 Permission Key Structure

Following existing pattern: `{module}.{resource}.{action}`

```typescript
// src/lib/entitlement/constants.ts - Add finance module

export const KEYS = {
  // ... existing keys ...
  
  finance: {
    gl: {
      // Chart of Accounts
      coa: {
        view: 'finance.gl.coa.view',
        create: 'finance.gl.coa.create',
        edit: 'finance.gl.coa.edit',
        delete: 'finance.gl.coa.delete',
        manage_hierarchy: 'finance.gl.coa.manage_hierarchy',
        enable_consolidation: 'finance.gl.coa.enable_consolidation',
        manage_group_coa: 'finance.gl.coa.manage_group_coa',
        manage_consolidation_mapping: 'finance.gl.coa.manage_consolidation_mapping',
      },
      // Ledgers
      ledger: {
        view: 'finance.gl.ledger.view',
        create: 'finance.gl.ledger.create',
        edit: 'finance.gl.ledger.edit',
        delete: 'finance.gl.ledger.delete',
        configure: 'finance.gl.ledger.configure',
      },
      // Transactions
      transaction: {
        view: 'finance.gl.transaction.view',
        create: 'finance.gl.transaction.create',
        edit_draft: 'finance.gl.transaction.edit_draft',
        submit: 'finance.gl.transaction.submit',
        approve: 'finance.gl.transaction.approve',
        reject: 'finance.gl.transaction.reject',
        post: 'finance.gl.transaction.post',
        void: 'finance.gl.transaction.void',
      },
      // Journal Entries
      journal: {
        view: 'finance.gl.journal.view',
        create: 'finance.gl.journal.create',
        edit_draft: 'finance.gl.journal.edit_draft',
        submit: 'finance.gl.journal.submit',
        approve: 'finance.gl.journal.approve',
        reject: 'finance.gl.journal.reject',
        post: 'finance.gl.journal.post',
        reverse: 'finance.gl.journal.reverse',
        void: 'finance.gl.journal.void',
        bulk_create: 'finance.gl.journal.bulk_create',
      },
      // Reconciliation
      reconciliation: {
        view: 'finance.gl.reconciliation.view',
        create: 'finance.gl.reconciliation.create',
        execute: 'finance.gl.reconciliation.execute',
        approve: 'finance.gl.reconciliation.approve',
        reject: 'finance.gl.reconciliation.reject',
        close: 'finance.gl.reconciliation.close',
        manage_rules: 'finance.gl.reconciliation.manage_rules',
      },
      // Periods
      period: {
        view: 'finance.gl.period.view',
        create: 'finance.gl.period.create',
        edit: 'finance.gl.period.edit',
        delete: 'finance.gl.period.delete',
        open: 'finance.gl.period.open',
        close: 'finance.gl.period.close',
        lock: 'finance.gl.period.lock',
        year_end: 'finance.gl.period.year_end',
      },
      // Reporting
      report: {
        view: 'finance.gl.report.view',
        generate: 'finance.gl.report.generate',
        export: 'finance.gl.report.export',
        create_custom: 'finance.gl.report.create_custom',
        schedule: 'finance.gl.report.schedule',
      },
      // Audit
      audit: {
        view: 'finance.gl.audit.view',
        search: 'finance.gl.audit.search',
        export: 'finance.gl.audit.export',
      },
      // Multi-Currency
      currency: {
        view: 'finance.gl.currency.view',
        manage_rates: 'finance.gl.currency.manage_rates',
        revaluate: 'finance.gl.currency.revaluate',
      },
      // Consolidation
      consolidation: {
        view: 'finance.gl.consolidation.view',
        execute: 'finance.gl.consolidation.execute',
        adjust: 'finance.gl.consolidation.adjust',
        eliminate: 'finance.gl.consolidation.eliminate',
        approve: 'finance.gl.consolidation.approve',
        reject: 'finance.gl.consolidation.reject',
        rollback: 'finance.gl.consolidation.rollback',
        manage_ownership: 'finance.gl.consolidation.manage_ownership',
      },
      // Settings
      settings: {
        view: 'finance.gl.settings.view',
        edit: 'finance.gl.settings.edit',
      },
      // Posting Rules
      posting: {
        view: 'finance.gl.posting.view',
        create: 'finance.gl.posting.create',
        edit: 'finance.gl.posting.edit',
        delete: 'finance.gl.posting.delete',
        activate: 'finance.gl.posting.activate',
        execute: 'finance.gl.posting.execute',
      },
    },
  },
} as const;
```

### 4.2 Permission Definitions

```typescript
// scripts/seed-gl-permissions.ts

export const GL_PERMISSION_DEFINITIONS = [
  // ========== Chart of Accounts ==========
  {
    key: 'finance.gl.coa.view',
    name: 'View Chart of Accounts',
    description: 'Can view chart of accounts and account hierarchy',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.coa.create',
    name: 'Create Accounts',
    description: 'Can create new accounts in chart of accounts',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.coa.edit',
    name: 'Edit Accounts',
    description: 'Can edit existing accounts',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.coa.delete',
    name: 'Delete Accounts',
    description: 'Can delete accounts (if no transactions)',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.coa.manage_hierarchy',
    name: 'Manage Account Hierarchy',
    description: 'Can reorganize account hierarchy and parent relationships',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.coa.enable_consolidation',
    name: 'Enable Account Consolidation',
    description: 'Can enable/disable consolidation for accounts',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.coa.manage_group_coa',
    name: 'Manage Group COA',
    description: 'Can manage Agency-level group chart of accounts',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.coa.manage_consolidation_mapping',
    name: 'Manage Consolidation Mappings',
    description: 'Can map subaccount COA to group COA for consolidation',
    category: 'finance.gl',
  },

  // ========== Ledgers ==========
  {
    key: 'finance.gl.ledger.view',
    name: 'View Ledgers',
    description: 'Can view general and subsidiary ledgers',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.ledger.create',
    name: 'Create Ledgers',
    description: 'Can create new ledgers',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.ledger.edit',
    name: 'Edit Ledgers',
    description: 'Can edit ledger configurations',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.ledger.delete',
    name: 'Delete Ledgers',
    description: 'Can delete ledgers',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.ledger.configure',
    name: 'Configure Ledgers',
    description: 'Can configure ledger rules and settings',
    category: 'finance.gl',
  },

  // ========== Transactions ==========
  {
    key: 'finance.gl.transaction.view',
    name: 'View Transactions',
    description: 'Can view financial transactions',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.transaction.create',
    name: 'Create Transactions',
    description: 'Can create new transactions',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.transaction.edit_draft',
    name: 'Edit Draft Transactions',
    description: 'Can edit transactions in draft status',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.transaction.submit',
    name: 'Submit Transactions',
    description: 'Can submit transactions for approval',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.transaction.approve',
    name: 'Approve Transactions',
    description: 'Can approve submitted transactions',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.transaction.reject',
    name: 'Reject Transactions',
    description: 'Can reject submitted transactions',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.transaction.post',
    name: 'Post Transactions',
    description: 'Can post approved transactions to ledger',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.transaction.void',
    name: 'Void Transactions',
    description: 'Can void posted transactions',
    category: 'finance.gl',
  },

  // ========== Journal Entries ==========
  {
    key: 'finance.gl.journal.view',
    name: 'View Journal Entries',
    description: 'Can view journal entries',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.journal.create',
    name: 'Create Journal Entries',
    description: 'Can create new journal entries',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.journal.edit_draft',
    name: 'Edit Draft Journal Entries',
    description: 'Can edit journal entries in draft status',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.journal.submit',
    name: 'Submit Journal Entries',
    description: 'Can submit journal entries for approval',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.journal.approve',
    name: 'Approve Journal Entries',
    description: 'Can approve submitted journal entries',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.journal.reject',
    name: 'Reject Journal Entries',
    description: 'Can reject submitted journal entries',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.journal.post',
    name: 'Post Journal Entries',
    description: 'Can post approved journal entries',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.journal.reverse',
    name: 'Reverse Journal Entries',
    description: 'Can create reversal entries',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.journal.void',
    name: 'Void Journal Entries',
    description: 'Can void journal entries',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.journal.bulk_create',
    name: 'Bulk Create Journal Entries',
    description: 'Can create multiple journal entries at once',
    category: 'finance.gl',
  },

  // ========== Reconciliation ==========
  {
    key: 'finance.gl.reconciliation.view',
    name: 'View Reconciliations',
    description: 'Can view reconciliation records',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.reconciliation.create',
    name: 'Create Reconciliations',
    description: 'Can create new reconciliations',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.reconciliation.execute',
    name: 'Execute Reconciliation',
    description: 'Can run matching rules and reconcile items',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.reconciliation.approve',
    name: 'Approve Reconciliations',
    description: 'Can approve completed reconciliations',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.reconciliation.reject',
    name: 'Reject Reconciliations',
    description: 'Can reject reconciliations',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.reconciliation.close',
    name: 'Close Reconciliations',
    description: 'Can close approved reconciliations',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.reconciliation.manage_rules',
    name: 'Manage Reconciliation Rules',
    description: 'Can create and edit matching rules',
    category: 'finance.gl',
  },

  // ========== Periods ==========
  {
    key: 'finance.gl.period.view',
    name: 'View Financial Periods',
    description: 'Can view financial periods',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.period.create',
    name: 'Create Financial Periods',
    description: 'Can create new financial periods',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.period.edit',
    name: 'Edit Financial Periods',
    description: 'Can edit financial period details',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.period.delete',
    name: 'Delete Financial Periods',
    description: 'Can delete unused financial periods',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.period.open',
    name: 'Open Financial Periods',
    description: 'Can open periods for posting',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.period.close',
    name: 'Close Financial Periods',
    description: 'Can close periods (no more posting)',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.period.lock',
    name: 'Lock Financial Periods',
    description: 'Can permanently lock periods',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.period.year_end',
    name: 'Process Year End',
    description: 'Can run year-end closing process',
    category: 'finance.gl',
  },

  // ========== Reporting ==========
  {
    key: 'finance.gl.report.view',
    name: 'View Reports',
    description: 'Can view financial reports',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.report.generate',
    name: 'Generate Reports',
    description: 'Can generate financial reports',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.report.export',
    name: 'Export Reports',
    description: 'Can export reports to PDF, Excel, CSV',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.report.create_custom',
    name: 'Create Custom Reports',
    description: 'Can create and save custom report definitions',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.report.schedule',
    name: 'Schedule Reports',
    description: 'Can schedule automated report generation',
    category: 'finance.gl',
  },

  // ========== Audit ==========
  {
    key: 'finance.gl.audit.view',
    name: 'View Audit Trail',
    description: 'Can view audit trail records',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.audit.search',
    name: 'Search Audit Trail',
    description: 'Can search and filter audit trail',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.audit.export',
    name: 'Export Audit Trail',
    description: 'Can export audit trail data',
    category: 'finance.gl',
  },

  // ========== Multi-Currency ==========
  {
    key: 'finance.gl.currency.view',
    name: 'View Currency Settings',
    description: 'Can view currencies and exchange rates',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.currency.manage_rates',
    name: 'Manage Exchange Rates',
    description: 'Can create and edit exchange rates',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.currency.revaluate',
    name: 'Revaluate Currencies',
    description: 'Can run currency revaluation process',
    category: 'finance.gl',
  },

  // ========== Consolidation ==========
  {
    key: 'finance.gl.consolidation.view',
    name: 'View Consolidation',
    description: 'Can view consolidation snapshots and worksheets',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.consolidation.execute',
    name: 'Execute Consolidation',
    description: 'Can run consolidation process',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.consolidation.adjust',
    name: 'Create Consolidation Adjustments',
    description: 'Can create manual consolidation adjustments',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.consolidation.eliminate',
    name: 'Manage Eliminations',
    description: 'Can create and approve intercompany eliminations',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.consolidation.approve',
    name: 'Approve Consolidation',
    description: 'Can approve consolidation snapshots',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.consolidation.reject',
    name: 'Reject Consolidation',
    description: 'Can reject consolidation snapshots',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.consolidation.rollback',
    name: 'Rollback Consolidation',
    description: 'Can rollback consolidation to previous version',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.consolidation.manage_ownership',
    name: 'Manage Ownership Percentages',
    description: 'Can set subaccount ownership percentages',
    category: 'finance.gl',
  },

  // ========== Settings ==========
  {
    key: 'finance.gl.settings.view',
    name: 'View GL Settings',
    description: 'Can view GL configuration',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.settings.edit',
    name: 'Edit GL Settings',
    description: 'Can modify GL configuration',
    category: 'finance.gl',
  },

  // ========== Posting Rules ==========
  {
    key: 'finance.gl.posting.view',
    name: 'View Posting Rules',
    description: 'Can view posting rules and templates',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.posting.create',
    name: 'Create Posting Rules',
    description: 'Can create new posting rules',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.posting.edit',
    name: 'Edit Posting Rules',
    description: 'Can edit posting rules',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.posting.delete',
    name: 'Delete Posting Rules',
    description: 'Can delete posting rules',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.posting.activate',
    name: 'Activate Posting Rules',
    description: 'Can activate/deactivate posting rules',
    category: 'finance.gl',
  },
  {
    key: 'finance.gl.posting.execute',
    name: 'Execute Posting Rules',
    description: 'Can manually trigger posting rules',
    category: 'finance.gl',
  },
];
```

### 4.3 Role Templates

```typescript
// Default role permission assignments

export const GL_ROLE_PERMISSIONS = {
  // Agency Owner - Full access
  AGENCY_OWNER: [
    'finance.gl.coa.*',
    'finance.gl.ledger.*',
    'finance.gl.transaction.*',
    'finance.gl.journal.*',
    'finance.gl.reconciliation.*',
    'finance.gl.period.*',
    'finance.gl.report.*',
    'finance.gl.audit.*',
    'finance.gl.currency.*',
    'finance.gl.consolidation.*',
    'finance.gl.settings.*',
    'finance.gl.posting.*',
  ],

  // Agency Admin - All except dangerous operations
  AGENCY_ADMIN: [
    'finance.gl.coa.view',
    'finance.gl.coa.create',
    'finance.gl.coa.edit',
    'finance.gl.coa.manage_hierarchy',
    'finance.gl.ledger.*',
    'finance.gl.transaction.*',
    'finance.gl.journal.*',
    'finance.gl.reconciliation.*',
    'finance.gl.period.view',
    'finance.gl.period.create',
    'finance.gl.period.edit',
    'finance.gl.period.open',
    'finance.gl.period.close',
    'finance.gl.report.*',
    'finance.gl.audit.view',
    'finance.gl.audit.search',
    'finance.gl.currency.*',
    'finance.gl.consolidation.view',
    'finance.gl.consolidation.execute',
    'finance.gl.consolidation.adjust',
    'finance.gl.settings.view',
    'finance.gl.posting.*',
  ],

  // GL Manager - Day-to-day GL operations
  GL_MANAGER: [
    'finance.gl.coa.view',
    'finance.gl.coa.create',
    'finance.gl.coa.edit',
    'finance.gl.ledger.view',
    'finance.gl.transaction.*',
    'finance.gl.journal.*',
    'finance.gl.reconciliation.*',
    'finance.gl.period.view',
    'finance.gl.period.open',
    'finance.gl.period.close',
    'finance.gl.report.*',
    'finance.gl.audit.view',
    'finance.gl.currency.view',
    'finance.gl.currency.manage_rates',
    'finance.gl.posting.view',
    'finance.gl.posting.execute',
  ],

  // GL Accountant - Entry creation and basic operations
  GL_ACCOUNTANT: [
    'finance.gl.coa.view',
    'finance.gl.ledger.view',
    'finance.gl.transaction.view',
    'finance.gl.transaction.create',
    'finance.gl.transaction.edit_draft',
    'finance.gl.transaction.submit',
    'finance.gl.journal.view',
    'finance.gl.journal.create',
    'finance.gl.journal.edit_draft',
    'finance.gl.journal.submit',
    'finance.gl.reconciliation.view',
    'finance.gl.reconciliation.create',
    'finance.gl.reconciliation.execute',
    'finance.gl.period.view',
    'finance.gl.report.view',
    'finance.gl.report.generate',
    'finance.gl.audit.view',
    'finance.gl.currency.view',
  ],

  // GL Viewer - Read-only access
  GL_VIEWER: [
    'finance.gl.coa.view',
    'finance.gl.ledger.view',
    'finance.gl.transaction.view',
    'finance.gl.journal.view',
    'finance.gl.reconciliation.view',
    'finance.gl.period.view',
    'finance.gl.report.view',
    'finance.gl.currency.view',
  ],

  // SubAccount Admin - Full access within subaccount
  SUBACCOUNT_ADMIN: [
    'finance.gl.coa.view',
    'finance.gl.coa.create',
    'finance.gl.coa.edit',
    'finance.gl.ledger.*',
    'finance.gl.transaction.*',
    'finance.gl.journal.*',
    'finance.gl.reconciliation.*',
    'finance.gl.period.view',
    'finance.gl.period.create',
    'finance.gl.period.edit',
    'finance.gl.period.open',
    'finance.gl.period.close',
    'finance.gl.report.*',
    'finance.gl.audit.view',
    'finance.gl.currency.view',
    'finance.gl.currency.manage_rates',
    'finance.gl.posting.*',
  ],

  // SubAccount User - Limited operations
  SUBACCOUNT_USER: [
    'finance.gl.coa.view',
    'finance.gl.ledger.view',
    'finance.gl.transaction.view',
    'finance.gl.transaction.create',
    'finance.gl.transaction.edit_draft',
    'finance.gl.transaction.submit',
    'finance.gl.journal.view',
    'finance.gl.journal.create',
    'finance.gl.journal.edit_draft',
    'finance.gl.journal.submit',
    'finance.gl.reconciliation.view',
    'finance.gl.period.view',
    'finance.gl.report.view',
    'finance.gl.report.generate',
    'finance.gl.currency.view',
  ],
};
```

---

## 5. Validation Schemas

### 5.1 Chart of Accounts Schema

```typescript
// src/lib/schemas/finance/gl/chart-of-accounts.ts

import { z } from 'zod';

// Account code validation regex (configurable format)
const accountCodeRegex = /^[A-Z0-9]{1,4}(-[A-Z0-9]{1,4})*$/;

export const createAccountSchema = z.object({
  code: z
    .string()
    .min(1, 'Account code is required')
    .max(20, 'Account code must be 20 characters or less')
    .regex(accountCodeRegex, 'Invalid account code format'),
  
  name: z
    .string()
    .min(1, 'Account name is required')
    .max(100, 'Account name must be 100 characters or less'),
  
  description: z.string().max(500).optional(),
  
  parentAccountId: z.string().uuid().optional().nullable(),
  
  accountType: z.enum([
    'ASSET',
    'LIABILITY',
    'EQUITY',
    'REVENUE',
    'EXPENSE',
  ]),
  
  category: z.enum([
    'CURRENT_ASSET',
    'FIXED_ASSET',
    'OTHER_ASSET',
    'CURRENT_LIABILITY',
    'LONG_TERM_LIABILITY',
    'CAPITAL',
    'RETAINED_EARNINGS_CAT',
    'OPERATING_REVENUE',
    'OTHER_REVENUE',
    'COST_OF_GOODS_SOLD',
    'OPERATING_EXPENSE',
    'OTHER_EXPENSE',
  ]).optional(),
  
  subcategory: z.string().max(50).optional(),
  
  // Control account settings
  isControlAccount: z.boolean().default(false),
  subledgerType: z.enum([
    'NONE',
    'ACCOUNTS_RECEIVABLE',
    'ACCOUNTS_PAYABLE',
    'INVENTORY',
    'FIXED_ASSETS',
    'PAYROLL',
    'BANK',
  ]).default('NONE'),
  controlAccountId: z.string().uuid().optional().nullable(),
  
  // Posting behavior
  allowManualPosting: z.boolean().default(true),
  requireApproval: z.boolean().default(false),
  isPostingAccount: z.boolean().default(true),
  
  // Consolidation
  isConsolidationEnabled: z.boolean().default(false),
  consolidationAccountCode: z.string().max(20).optional(),
  
  // Currency
  currencyCode: z.string().length(3).optional(),
  isMultiCurrency: z.boolean().default(false),
  
  // Normal balance
  normalBalance: z.enum(['DEBIT', 'CREDIT']).default('DEBIT'),
  
  sortOrder: z.number().int().min(0).default(0),
});

export const updateAccountSchema = createAccountSchema.partial().extend({
  id: z.string().uuid(),
});

export const accountHierarchyMoveSchema = z.object({
  accountId: z.string().uuid(),
  newParentId: z.string().uuid().optional().nullable(),
  newSortOrder: z.number().int().min(0),
});

export const consolidationMappingSchema = z.object({
  subAccountId: z.string().uuid(),
  subAccountCOACode: z.string().min(1),
  groupCOAId: z.string().uuid(),
  mappingPercentage: z.number().min(0).max(100).default(100),
  isElimination: z.boolean().default(false),
  eliminationPairId: z.string().uuid().optional(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type AccountHierarchyMoveInput = z.infer<typeof accountHierarchyMoveSchema>;
export type ConsolidationMappingInput = z.infer<typeof consolidationMappingSchema>;
```

### 5.2 Journal Entry Schema

```typescript
// src/lib/schemas/finance/gl/journal-entry.ts

import { z } from 'zod';

// Custom validator for double-entry balance
const validateDoubleEntry = (lines: JournalEntryLineInput[]) => {
  const totalDebit = lines.reduce((sum, line) => sum + (line.debitAmount || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + (line.creditAmount || 0), 0);
  
  // Allow small rounding difference (0.01)
  return Math.abs(totalDebit - totalCredit) < 0.01;
};

export const journalEntryLineSchema = z.object({
  lineNumber: z.number().int().min(1),
  accountId: z.string().uuid(),
  description: z.string().max(500).optional(),
  debitAmount: z.number().min(0).default(0),
  creditAmount: z.number().min(0).default(0),
  exchangeRate: z.number().positive().optional(),
  subledgerType: z.enum([
    'NONE',
    'ACCOUNTS_RECEIVABLE',
    'ACCOUNTS_PAYABLE',
    'INVENTORY',
    'FIXED_ASSETS',
    'PAYROLL',
    'BANK',
  ]).default('NONE'),
  subledgerReference: z.string().max(100).optional(),
  taxCode: z.string().max(20).optional(),
  taxAmount: z.number().optional(),
  dimension1: z.string().max(50).optional(), // Cost center
  dimension2: z.string().max(50).optional(), // Department
  dimension3: z.string().max(50).optional(), // Project
  dimension4: z.string().max(50).optional(), // Custom
  isIntercompany: z.boolean().default(false),
  intercompanySubAccountId: z.string().uuid().optional(),
}).refine(
  (data) => data.debitAmount > 0 || data.creditAmount > 0,
  { message: 'Each line must have either a debit or credit amount' }
).refine(
  (data) => !(data.debitAmount > 0 && data.creditAmount > 0),
  { message: 'A line cannot have both debit and credit amounts' }
);

export const createJournalEntrySchema = z.object({
  periodId: z.string().uuid(),
  entryDate: z.coerce.date(),
  
  entryType: z.enum([
    'NORMAL',
    'OPENING',
    'CLOSING',
    'CARRY_FORWARD',
    'BROUGHT_FORWARD',
    'YEAR_END_CLOSING',
    'ADJUSTMENT',
    'REVERSAL',
    'CONSOLIDATION',
    'ELIMINATION',
  ]).default('NORMAL'),
  
  sourceModule: z.enum([
    'MANUAL',
    'INVOICE',
    'PAYMENT',
    'EXPENSE',
    'PAYROLL',
    'ASSET',
    'INVENTORY',
    'BANK',
    'ADJUSTMENT',
    'CONSOLIDATION',
    'INTERCOMPANY',
    'REVERSAL',
    'YEAR_END',
    'OPENING_BALANCE',
  ]).default('MANUAL'),
  
  sourceId: z.string().uuid().optional(),
  sourceReference: z.string().max(100).optional(),
  
  description: z.string().min(1, 'Description is required').max(1000),
  notes: z.string().max(2000).optional(),
  
  currencyCode: z.string().length(3).default('USD'),
  exchangeRate: z.number().positive().default(1),
  
  lines: z
    .array(journalEntryLineSchema)
    .min(2, 'At least 2 lines are required for double-entry')
    .max(100, 'Maximum 100 lines per entry'),
    
}).refine(
  (data) => validateDoubleEntry(data.lines),
  { message: 'Total debits must equal total credits (double-entry)' }
);

export const updateJournalEntrySchema = createJournalEntrySchema.partial().extend({
  id: z.string().uuid(),
});

export const submitJournalEntrySchema = z.object({
  id: z.string().uuid(),
});

export const approveJournalEntrySchema = z.object({
  id: z.string().uuid(),
  notes: z.string().max(500).optional(),
});

export const rejectJournalEntrySchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(1, 'Rejection reason is required').max(500),
});

export const postJournalEntrySchema = z.object({
  id: z.string().uuid(),
});

export const reverseJournalEntrySchema = z.object({
  id: z.string().uuid(),
  reversalDate: z.coerce.date(),
  reason: z.string().min(1, 'Reversal reason is required').max(500),
});

export const voidJournalEntrySchema = z.object({
  id: z.string().uuid(),
  reason: z.string().min(1, 'Void reason is required').max(500),
});

export type JournalEntryLineInput = z.infer<typeof journalEntryLineSchema>;
export type CreateJournalEntryInput = z.infer<typeof createJournalEntrySchema>;
export type UpdateJournalEntryInput = z.infer<typeof updateJournalEntrySchema>;
```

### 5.3 Financial Period Schema

```typescript
// src/lib/schemas/finance/gl/period.ts

import { z } from 'zod';

export const createPeriodSchema = z.object({
  name: z.string().min(1).max(100),
  shortName: z.string().max(20).optional(),
  
  periodType: z.enum([
    'MONTH',
    'QUARTER',
    'HALF_YEAR',
    'YEAR',
    'CUSTOM',
  ]),
  
  fiscalYear: z.number().int().min(2000).max(2100),
  fiscalPeriod: z.number().int().min(1).max(12),
  
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  
  isYearEnd: z.boolean().default(false),
  notes: z.string().max(1000).optional(),
}).refine(
  (data) => data.endDate > data.startDate,
  { message: 'End date must be after start date' }
);

export const updatePeriodSchema = createPeriodSchema.partial().extend({
  id: z.string().uuid(),
});

export const openPeriodSchema = z.object({
  id: z.string().uuid(),
});

export const closePeriodSchema = z.object({
  id: z.string().uuid(),
  notes: z.string().max(500).optional(),
});

export const lockPeriodSchema = z.object({
  id: z.string().uuid(),
  notes: z.string().max(500).optional(),
});

export const yearEndProcessingSchema = z.object({
  periodId: z.string().uuid(),
  retainedEarningsAccountId: z.string().uuid(),
  createBroughtForward: z.boolean().default(true),
  notes: z.string().max(1000).optional(),
});

export type CreatePeriodInput = z.infer<typeof createPeriodSchema>;
export type UpdatePeriodInput = z.infer<typeof updatePeriodSchema>;
export type YearEndProcessingInput = z.infer<typeof yearEndProcessingSchema>;
```

### 5.4 Multi-Currency Schema

```typescript
// src/lib/schemas/finance/gl/currency.ts

import { z } from 'zod';

export const createCurrencySchema = z.object({
  code: z.string().length(3).toUpperCase(),
  name: z.string().min(1).max(100),
  symbol: z.string().min(1).max(5),
  decimalPlaces: z.number().int().min(0).max(18).default(2),
  isActive: z.boolean().default(true),
});

export const createExchangeRateSchema = z.object({
  fromCurrencyCode: z.string().length(3),
  toCurrencyCode: z.string().length(3),
  rate: z.number().positive(),
  effectiveDate: z.coerce.date(),
  expiryDate: z.coerce.date().optional(),
  rateType: z.enum(['SPOT', 'AVERAGE', 'BUDGET']).default('SPOT'),
  source: z.string().max(100).optional(),
}).refine(
  (data) => data.fromCurrencyCode !== data.toCurrencyCode,
  { message: 'From and To currencies must be different' }
);

export const currencyRevaluationSchema = z.object({
  periodId: z.string().uuid(),
  currencyCode: z.string().length(3),
  revaluationDate: z.coerce.date(),
  exchangeRate: z.number().positive(),
  notes: z.string().max(500).optional(),
});

export const convertAmountSchema = z.object({
  amount: z.number(),
  fromCurrencyCode: z.string().length(3),
  toCurrencyCode: z.string().length(3),
  effectiveDate: z.coerce.date().optional(),
  rateType: z.enum(['SPOT', 'AVERAGE', 'BUDGET']).default('SPOT'),
});

export type CreateCurrencyInput = z.infer<typeof createCurrencySchema>;
export type CreateExchangeRateInput = z.infer<typeof createExchangeRateSchema>;
export type CurrencyRevaluationInput = z.infer<typeof currencyRevaluationSchema>;
export type ConvertAmountInput = z.infer<typeof convertAmountSchema>;
```

### 5.5 Reconciliation Schema

```typescript
// src/lib/schemas/finance/gl/reconciliation.ts

import { z } from 'zod';

export const createReconciliationSchema = z.object({
  accountId: z.string().uuid(),
  periodId: z.string().uuid(),
  description: z.string().max(500).optional(),
  statementBalance: z.number(),
  notes: z.string().max(1000).optional(),
});

export const reconciliationItemSchema = z.object({
  itemType: z.enum(['BOOK', 'STATEMENT', 'ADJUSTMENT']),
  transactionDate: z.coerce.date(),
  reference: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  amount: z.number(),
  notes: z.string().max(500).optional(),
});

export const matchItemsSchema = z.object({
  reconciliationId: z.string().uuid(),
  itemIds: z.array(z.string().uuid()).min(2),
});

export const unmatchItemSchema = z.object({
  itemId: z.string().uuid(),
});

export const reconciliationRuleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  ruleDefinition: z.object({
    matchBy: z.array(z.enum(['reference', 'amount', 'date', 'description'])),
    tolerance: z.number().min(0).max(100).optional(), // Percentage tolerance
    dateToleranceDays: z.number().int().min(0).max(30).optional(),
  }),
  priority: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type CreateReconciliationInput = z.infer<typeof createReconciliationSchema>;
export type ReconciliationItemInput = z.infer<typeof reconciliationItemSchema>;
export type ReconciliationRuleInput = z.infer<typeof reconciliationRuleSchema>;
```

### 5.6 Consolidation Schema

```typescript
// src/lib/schemas/finance/gl/consolidation.ts

import { z } from 'zod';

export const createConsolidationSnapshotSchema = z.object({
  periodId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  subAccountIds: z.array(z.string().uuid()).min(1),
  consolidationMethod: z.enum(['FULL', 'PROPORTIONAL', 'EQUITY']).default('FULL'),
  notes: z.string().max(1000).optional(),
});

export const executeConsolidationSchema = z.object({
  snapshotId: z.string().uuid(),
});

export const consolidationAdjustmentSchema = z.object({
  snapshotId: z.string().uuid(),
  description: z.string().min(1).max(500),
  debitAccountCode: z.string().min(1),
  creditAccountCode: z.string().min(1),
  amount: z.number().positive(),
  adjustmentType: z.enum([
    'MANUAL',
    'MINORITY_INTEREST',
    'GOODWILL',
    'OTHER',
  ]),
  notes: z.string().max(1000).optional(),
});

export const intercompanyEliminationSchema = z.object({
  snapshotId: z.string().uuid(),
  description: z.string().min(1).max(500),
  subAccountId1: z.string().uuid(),
  subAccountId2: z.string().uuid(),
  accountCode1: z.string().min(1),
  accountCode2: z.string().min(1),
  amount: z.number().positive(),
  eliminationType: z.enum([
    'REVENUE_EXPENSE',
    'RECEIVABLE_PAYABLE',
    'INVENTORY_PROFIT',
    'OTHER',
  ]),
  notes: z.string().max(1000).optional(),
});

export const subAccountOwnershipSchema = z.object({
  subAccountId: z.string().uuid(),
  ownershipPercentage: z.number().min(0).max(100),
  consolidationMethod: z.enum(['FULL', 'PROPORTIONAL', 'EQUITY']),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().optional(),
  minorityInterestAccountCode: z.string().optional(),
});

export type CreateConsolidationSnapshotInput = z.infer<typeof createConsolidationSnapshotSchema>;
export type ConsolidationAdjustmentInput = z.infer<typeof consolidationAdjustmentSchema>;
export type IntercompanyEliminationInput = z.infer<typeof intercompanyEliminationSchema>;
export type SubAccountOwnershipInput = z.infer<typeof subAccountOwnershipSchema>;
```

### 5.7 Report Schema

```typescript
// src/lib/schemas/finance/gl/report.ts

import { z } from 'zod';

export const generateReportSchema = z.object({
  reportType: z.enum([
    'BALANCE_SHEET',
    'INCOME_STATEMENT',
    'CASH_FLOW',
    'TRIAL_BALANCE',
    'GENERAL_LEDGER',
    'SUBSIDIARY_LEDGER',
    'ACCOUNT_BALANCE',
    'CONSOLIDATED_BALANCE_SHEET',
    'CONSOLIDATED_INCOME_STATEMENT',
    'CONSOLIDATED_CASH_FLOW',
    'INTERCOMPANY_REPORT',
    'CUSTOM',
  ]),
  
  // Time range
  periodId: z.string().uuid().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  
  // Filters
  accountIds: z.array(z.string().uuid()).optional(),
  accountTypes: z.array(z.enum([
    'ASSET',
    'LIABILITY',
    'EQUITY',
    'REVENUE',
    'EXPENSE',
  ])).optional(),
  
  // For consolidation reports
  subAccountIds: z.array(z.string().uuid()).optional(),
  consolidationSnapshotId: z.string().uuid().optional(),
  
  // Options
  includeZeroBalances: z.boolean().default(false),
  showAccountDetails: z.boolean().default(true),
  comparePeriodId: z.string().uuid().optional(), // For comparative reports
  
  // Export format
  format: z.enum(['PDF', 'EXCEL', 'CSV', 'JSON']).default('PDF'),
});

export const saveReportSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  reportType: z.enum([
    'BALANCE_SHEET',
    'INCOME_STATEMENT',
    'CASH_FLOW',
    'TRIAL_BALANCE',
    'GENERAL_LEDGER',
    'SUBSIDIARY_LEDGER',
    'ACCOUNT_BALANCE',
    'CONSOLIDATED_BALANCE_SHEET',
    'CONSOLIDATED_INCOME_STATEMENT',
    'CONSOLIDATED_CASH_FLOW',
    'INTERCOMPANY_REPORT',
    'CUSTOM',
  ]),
  parameters: z.record(z.unknown()),
  isScheduled: z.boolean().default(false),
  schedule: z.string().optional(), // Cron expression
});

export type GenerateReportInput = z.infer<typeof generateReportSchema>;
export type SaveReportInput = z.infer<typeof saveReportSchema>;
```

### 5.8 GL Configuration Schema

```typescript
// src/lib/schemas/finance/gl/configuration.ts

import { z } from 'zod';

export const glConfigurationSchema = z.object({
  // General settings
  baseCurrency: z.string().length(3).default('USD'),
  fiscalYearEnd: z.string().regex(/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/).default('12-31'),
  fiscalYearStart: z.string().regex(/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/).default('01-01'),
  useControlAccounts: z.boolean().default(true),
  
  // Posting settings
  requireApproval: z.boolean().default(true),
  approvalThreshold: z.number().positive().optional(),
  autoPostingEnabled: z.boolean().default(false),
  allowFuturePeriodPost: z.boolean().default(false),
  allowClosedPeriodPost: z.boolean().default(false),
  
  // Consolidation settings
  consolidationEnabled: z.boolean().default(false),
  consolidationMethod: z.enum(['FULL', 'PROPORTIONAL', 'EQUITY']).default('FULL'),
  eliminateIntercompany: z.boolean().default(true),
  
  // Period settings
  autoCreatePeriods: z.boolean().default(true),
  periodLockDays: z.number().int().min(0).max(365).default(5),
  
  // Number formats
  accountCodeFormat: z.string().max(20).default('####-####'),
  accountCodeLength: z.number().int().min(4).max(20).default(8),
  accountCodeSeparator: z.string().max(1).default('-'),
  
  // Audit retention
  retainAuditDays: z.number().int().min(365).max(3650).default(2555),
});

export const updateGLConfigurationSchema = glConfigurationSchema.partial();

export type GLConfigurationInput = z.infer<typeof glConfigurationSchema>;
export type UpdateGLConfigurationInput = z.infer<typeof updateGLConfigurationSchema>;
```

---

*Continue to Part 3: Server Actions...*
