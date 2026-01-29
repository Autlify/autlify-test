-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "finance";

-- CreateEnum
CREATE TYPE "finance"."AccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');

-- CreateEnum
CREATE TYPE "finance"."AccountCategory" AS ENUM ('CURRENT_ASSET', 'FIXED_ASSET', 'OTHER_ASSET', 'CURRENT_LIABILITY', 'LONG_TERM_LIABILITY', 'CAPITAL', 'RETAINED_EARNINGS_CAT', 'OPERATING_REVENUE', 'OTHER_REVENUE', 'COST_OF_GOODS_SOLD', 'OPERATING_EXPENSE', 'OTHER_EXPENSE');

-- CreateEnum
CREATE TYPE "finance"."SubledgerType" AS ENUM ('NONE', 'ACCOUNTS_RECEIVABLE', 'ACCOUNTS_PAYABLE', 'INVENTORY', 'FIXED_ASSETS', 'PAYROLL', 'BANK');

-- CreateEnum
CREATE TYPE "finance"."SystemAccountType" AS ENUM ('RETAINED_EARNINGS', 'OPENING_BALANCE_CONTROL', 'SUSPENSE', 'ROUNDING_DIFFERENCE', 'INTERCOMPANY_CLEARING', 'PAYROLL_CLEARING', 'PAYMENT_CLEARING', 'BANK_RECONCILIATION', 'FOREIGN_EXCHANGE_GAIN', 'FOREIGN_EXCHANGE_LOSS', 'UNREALIZED_FX_GAIN', 'UNREALIZED_FX_LOSS', 'CONSOLIDATION_ADJUSTMENT', 'ELIMINATION_ACCOUNT');

-- CreateEnum
CREATE TYPE "finance"."PeriodType" AS ENUM ('MONTH', 'QUARTER', 'HALF_YEAR', 'YEAR', 'CUSTOM');

-- CreateEnum
CREATE TYPE "finance"."PeriodStatus" AS ENUM ('FUTURE', 'OPEN', 'CLOSED', 'LOCKED');

-- CreateEnum
CREATE TYPE "finance"."JournalEntryStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'POSTED', 'REVERSED', 'VOIDED');

-- CreateEnum
CREATE TYPE "finance"."JournalEntryType" AS ENUM ('NORMAL', 'OPENING', 'CLOSING', 'CARRY_FORWARD', 'BROUGHT_FORWARD', 'YEAR_END_CLOSING', 'ADJUSTMENT', 'REVERSAL', 'CONSOLIDATION', 'ELIMINATION');

-- CreateEnum
CREATE TYPE "finance"."BalanceType" AS ENUM ('NORMAL', 'OPENING', 'CLOSING', 'ADJUSTMENT', 'REVERSAL');

-- CreateEnum
CREATE TYPE "finance"."SourceModule" AS ENUM ('MANUAL', 'INVOICE', 'PAYMENT', 'EXPENSE', 'PAYROLL', 'ASSET', 'INVENTORY', 'BANK', 'ADJUSTMENT', 'CONSOLIDATION', 'INTERCOMPANY', 'REVERSAL', 'YEAR_END', 'OPENING_BALANCE');

-- CreateEnum
CREATE TYPE "finance"."ReconciliationStatus" AS ENUM ('IN_PROGRESS', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "finance"."ReconciliationItemStatus" AS ENUM ('UNMATCHED', 'MATCHED', 'EXCLUDED', 'DISCREPANCY');

-- CreateEnum
CREATE TYPE "finance"."ConsolidationMethod" AS ENUM ('FULL', 'PROPORTIONAL', 'EQUITY');

-- CreateEnum
CREATE TYPE "finance"."ConsolidationStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "finance"."Industry" AS ENUM ('RETAIL', 'MANUFACTURING', 'SAAS', 'ECOMMERCE', 'CONSULTING', 'REAL_ESTATE', 'HOSPITALITY', 'HEALTHCARE', 'CONSTRUCTION', 'NON_PROFIT', 'EDUCATION', 'AGRICULTURE', 'GENERIC');

-- CreateEnum
CREATE TYPE "finance"."ReportType" AS ENUM ('BALANCE_SHEET', 'INCOME_STATEMENT', 'CASH_FLOW', 'TRIAL_BALANCE', 'GENERAL_LEDGER', 'SUBSIDIARY_LEDGER', 'ACCOUNT_BALANCE', 'CONSOLIDATED_BALANCE_SHEET', 'CONSOLIDATED_INCOME_STATEMENT', 'CONSOLIDATED_CASH_FLOW', 'INTERCOMPANY_REPORT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "finance"."ReportFormat" AS ENUM ('PDF', 'EXCEL', 'CSV', 'JSON');

-- CreateEnum
CREATE TYPE "finance"."AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'SUBMIT', 'APPROVE', 'REJECT', 'POST', 'REVERSE', 'VOID', 'CLOSE', 'LOCK', 'CONSOLIDATE', 'ELIMINATE');

-- CreateTable
CREATE TABLE "finance"."GLConfiguration" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "baseCurrency" TEXT NOT NULL DEFAULT 'USD',
    "fiscalYearEnd" TEXT NOT NULL DEFAULT '12-31',
    "fiscalYearStart" TEXT NOT NULL DEFAULT '01-01',
    "useControlAccounts" BOOLEAN NOT NULL DEFAULT true,
    "requireApproval" BOOLEAN NOT NULL DEFAULT true,
    "approvalThreshold" DECIMAL(18,6),
    "autoPostingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "allowFuturePeriodPost" BOOLEAN NOT NULL DEFAULT false,
    "allowClosedPeriodPost" BOOLEAN NOT NULL DEFAULT false,
    "consolidationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "consolidationMethod" "finance"."ConsolidationMethod" NOT NULL DEFAULT 'FULL',
    "eliminateIntercompany" BOOLEAN NOT NULL DEFAULT true,
    "autoCreatePeriods" BOOLEAN NOT NULL DEFAULT true,
    "periodLockDays" INTEGER NOT NULL DEFAULT 5,
    "accountCodeFormat" TEXT NOT NULL DEFAULT '####-####',
    "accountCodeLength" INTEGER NOT NULL DEFAULT 8,
    "accountCodeSeparator" TEXT NOT NULL DEFAULT '-',
    "erpIntegrationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "erpSystemType" TEXT,
    "erpApiUrl" TEXT,
    "erpApiKey" TEXT,
    "retainAuditDays" INTEGER NOT NULL DEFAULT 2555,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "GLConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."ChartOfAccount" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT,
    "subAccountId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentAccountId" TEXT,
    "path" TEXT NOT NULL DEFAULT '/',
    "level" INTEGER NOT NULL DEFAULT 0,
    "accountType" "finance"."AccountType" NOT NULL,
    "category" "finance"."AccountCategory",
    "subcategory" TEXT,
    "isControlAccount" BOOLEAN NOT NULL DEFAULT false,
    "subledgerType" "finance"."SubledgerType" NOT NULL DEFAULT 'NONE',
    "controlAccountId" TEXT,
    "isSystemAccount" BOOLEAN NOT NULL DEFAULT false,
    "isSystemManaged" BOOLEAN NOT NULL DEFAULT false,
    "systemAccountType" "finance"."SystemAccountType",
    "isClearingAccount" BOOLEAN NOT NULL DEFAULT false,
    "isSuspenseAccount" BOOLEAN NOT NULL DEFAULT false,
    "isRetainedEarnings" BOOLEAN NOT NULL DEFAULT false,
    "isOpeningBalControl" BOOLEAN NOT NULL DEFAULT false,
    "allowManualPosting" BOOLEAN NOT NULL DEFAULT true,
    "requireApproval" BOOLEAN NOT NULL DEFAULT false,
    "isPostingAccount" BOOLEAN NOT NULL DEFAULT true,
    "isConsolidationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "consolidationAccountCode" TEXT,
    "currencyCode" TEXT,
    "isMultiCurrency" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "archivedBy" TEXT,
    "normalBalance" TEXT NOT NULL DEFAULT 'DEBIT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "ChartOfAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."AgencyGroupCOA" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "accountType" "finance"."AccountType" NOT NULL,
    "category" "finance"."AccountCategory",
    "parentId" TEXT,
    "path" TEXT NOT NULL DEFAULT '/',
    "level" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "AgencyGroupCOA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."ConsolidationMapping" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "subAccountId" TEXT NOT NULL,
    "subAccountCOACode" TEXT NOT NULL,
    "groupCOAId" TEXT NOT NULL,
    "mappingPercentage" DECIMAL(5,2) NOT NULL DEFAULT 100,
    "isElimination" BOOLEAN NOT NULL DEFAULT false,
    "eliminationPairId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "ConsolidationMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."FinancialPeriod" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT,
    "subAccountId" TEXT,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "periodType" "finance"."PeriodType" NOT NULL,
    "fiscalYear" INTEGER NOT NULL,
    "fiscalPeriod" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "finance"."PeriodStatus" NOT NULL DEFAULT 'FUTURE',
    "openedAt" TIMESTAMP(3),
    "openedBy" TEXT,
    "closedAt" TIMESTAMP(3),
    "closedBy" TEXT,
    "lockedAt" TIMESTAMP(3),
    "lockedBy" TEXT,
    "openingBalances" JSONB,
    "closingBalances" JSONB,
    "isYearEnd" BOOLEAN NOT NULL DEFAULT false,
    "yearEndProcessedAt" TIMESTAMP(3),
    "yearEndProcessedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "FinancialPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."JournalEntry" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT,
    "subAccountId" TEXT,
    "entryNumber" TEXT NOT NULL,
    "reference" TEXT,
    "periodId" TEXT NOT NULL,
    "entryDate" TIMESTAMP(3) NOT NULL,
    "entryType" "finance"."JournalEntryType" NOT NULL DEFAULT 'NORMAL',
    "sourceModule" "finance"."SourceModule" NOT NULL DEFAULT 'MANUAL',
    "sourceId" TEXT,
    "sourceReference" TEXT,
    "postingRuleId" TEXT,
    "description" TEXT NOT NULL,
    "notes" TEXT,
    "currencyCode" TEXT NOT NULL DEFAULT 'USD',
    "exchangeRate" DECIMAL(12,6) NOT NULL DEFAULT 1,
    "totalDebit" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "totalCredit" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "totalDebitBase" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "totalCreditBase" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "status" "finance"."JournalEntryStatus" NOT NULL DEFAULT 'DRAFT',
    "isCarryForward" BOOLEAN NOT NULL DEFAULT false,
    "isBroughtForward" BOOLEAN NOT NULL DEFAULT false,
    "carryForwardFromId" TEXT,
    "isReversal" BOOLEAN NOT NULL DEFAULT false,
    "reversalOfId" TEXT,
    "submittedAt" TIMESTAMP(3),
    "submittedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectedBy" TEXT,
    "rejectionReason" TEXT,
    "postedAt" TIMESTAMP(3),
    "postedBy" TEXT,
    "reversedAt" TIMESTAMP(3),
    "reversedByUser" TEXT,
    "reversalReason" TEXT,
    "voidedAt" TIMESTAMP(3),
    "voidedBy" TEXT,
    "voidReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."JournalEntryLine" (
    "id" TEXT NOT NULL,
    "journalEntryId" TEXT NOT NULL,
    "lineNumber" INTEGER NOT NULL,
    "accountId" TEXT NOT NULL,
    "description" TEXT,
    "debitAmount" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "creditAmount" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "debitAmountBase" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "creditAmountBase" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "exchangeRate" DECIMAL(12,6),
    "subledgerType" "finance"."SubledgerType" NOT NULL DEFAULT 'NONE',
    "subledgerReference" TEXT,
    "taxCode" TEXT,
    "taxAmount" DECIMAL(18,6),
    "dimension1" TEXT,
    "dimension2" TEXT,
    "dimension3" TEXT,
    "dimension4" TEXT,
    "isIntercompany" BOOLEAN NOT NULL DEFAULT false,
    "intercompanySubAccountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalEntryLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."AccountBalance" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT,
    "subAccountId" TEXT,
    "accountId" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "currencyCode" TEXT NOT NULL DEFAULT 'USD',
    "openingBalance" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "debitMovement" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "creditMovement" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "closingBalance" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "openingBalanceBase" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "debitMovementBase" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "creditMovementBase" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "closingBalanceBase" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "balanceType" "finance"."BalanceType" NOT NULL DEFAULT 'NORMAL',
    "transactionCount" INTEGER NOT NULL DEFAULT 0,
    "lastRecalculatedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."Currency" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "decimalPlaces" INTEGER NOT NULL DEFAULT 2,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isBaseCurrency" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."ExchangeRate" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "fromCurrencyCode" TEXT NOT NULL,
    "toCurrencyCode" TEXT NOT NULL,
    "rate" DECIMAL(12,6) NOT NULL,
    "inverseRate" DECIMAL(12,6) NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "rateType" TEXT NOT NULL DEFAULT 'SPOT',
    "source" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."CurrencyRevaluation" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT,
    "subAccountId" TEXT,
    "periodId" TEXT NOT NULL,
    "currencyCode" TEXT NOT NULL,
    "revaluationDate" TIMESTAMP(3) NOT NULL,
    "exchangeRate" DECIMAL(12,6) NOT NULL,
    "previousRate" DECIMAL(12,6) NOT NULL,
    "unrealizedGain" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "unrealizedLoss" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "netGainLoss" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "journalEntryId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "postedAt" TIMESTAMP(3),
    "postedBy" TEXT,

    CONSTRAINT "CurrencyRevaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."PostingRule" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT,
    "subAccountId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sourceModule" "finance"."SourceModule" NOT NULL,
    "debitAccountId" TEXT NOT NULL,
    "creditAccountId" TEXT NOT NULL,
    "amountType" TEXT NOT NULL DEFAULT 'FULL',
    "percentage" DECIMAL(5,4),
    "fixedAmount" DECIMAL(18,6),
    "conditions" JSONB,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "autoPost" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "activatedAt" TIMESTAMP(3),
    "activatedBy" TEXT,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedBy" TEXT,

    CONSTRAINT "PostingRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."PostingTemplate" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "template" JSONB NOT NULL,
    "defaultDescription" TEXT,
    "defaultCurrency" TEXT NOT NULL DEFAULT 'USD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostingTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."Reconciliation" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT,
    "subAccountId" TEXT,
    "accountId" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "reconciliationNumber" TEXT NOT NULL,
    "description" TEXT,
    "bookBalance" DECIMAL(18,6) NOT NULL,
    "statementBalance" DECIMAL(18,6) NOT NULL,
    "adjustedBookBalance" DECIMAL(18,6) NOT NULL,
    "difference" DECIMAL(18,6) NOT NULL,
    "status" "finance"."ReconciliationStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "submittedAt" TIMESTAMP(3),
    "submittedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectedBy" TEXT,
    "rejectionReason" TEXT,
    "closedAt" TIMESTAMP(3),
    "closedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "Reconciliation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."ReconciliationItem" (
    "id" TEXT NOT NULL,
    "reconciliationId" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "reference" TEXT,
    "description" TEXT,
    "amount" DECIMAL(18,6) NOT NULL,
    "status" "finance"."ReconciliationItemStatus" NOT NULL DEFAULT 'UNMATCHED',
    "matchedItemId" TEXT,
    "matchedAt" TIMESTAMP(3),
    "matchedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReconciliationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."ReconciliationRule" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ruleDefinition" JSONB NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReconciliationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."IntercompanyReconciliation" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "subAccountId1" TEXT NOT NULL,
    "subAccountId2" TEXT NOT NULL,
    "accountCode1" TEXT NOT NULL,
    "accountCode2" TEXT NOT NULL,
    "balance1" DECIMAL(18,6) NOT NULL,
    "balance2" DECIMAL(18,6) NOT NULL,
    "difference" DECIMAL(18,6) NOT NULL,
    "status" "finance"."ReconciliationStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntercompanyReconciliation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."ConsolidationSnapshot" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "snapshotNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "subAccountIds" TEXT[],
    "consolidationMethod" "finance"."ConsolidationMethod" NOT NULL,
    "consolidatedBalances" JSONB NOT NULL,
    "balanceSheet" JSONB NOT NULL,
    "incomeStatement" JSONB NOT NULL,
    "cashFlowStatement" JSONB NOT NULL,
    "eliminationEntries" JSONB NOT NULL,
    "adjustmentEntries" JSONB NOT NULL,
    "totalEliminations" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "totalAdjustments" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "ownershipPercentages" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "previousVersionId" TEXT,
    "status" "finance"."ConsolidationStatus" NOT NULL DEFAULT 'DRAFT',
    "validationResults" JSONB,
    "isValid" BOOLEAN NOT NULL DEFAULT false,
    "consolidatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consolidatedBy" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "submittedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectedBy" TEXT,
    "rejectionReason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsolidationSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."ConsolidationWorksheetLine" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "groupCOAId" TEXT NOT NULL,
    "accountCode" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "subAccountBalances" JSONB NOT NULL,
    "totalBeforeAdj" DECIMAL(18,6) NOT NULL,
    "eliminations" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "adjustments" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "consolidatedBalance" DECIMAL(18,6) NOT NULL,

    CONSTRAINT "ConsolidationWorksheetLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."ConsolidatedBalance" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "groupCOAId" TEXT NOT NULL,
    "balance" DECIMAL(18,6) NOT NULL,

    CONSTRAINT "ConsolidatedBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."ConsolidationAdjustment" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "adjustmentNumber" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "debitAccountCode" TEXT NOT NULL,
    "creditAccountCode" TEXT NOT NULL,
    "amount" DECIMAL(18,6) NOT NULL,
    "adjustmentType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsolidationAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."IntercompanyElimination" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "eliminationNumber" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "subAccountId1" TEXT NOT NULL,
    "subAccountId2" TEXT NOT NULL,
    "accountCode1" TEXT NOT NULL,
    "accountCode2" TEXT NOT NULL,
    "amount" DECIMAL(18,6) NOT NULL,
    "eliminationType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "isAutoGenerated" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "IntercompanyElimination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."SubAccountOwnership" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "subAccountId" TEXT NOT NULL,
    "ownershipPercentage" DECIMAL(5,2) NOT NULL,
    "consolidationMethod" "finance"."ConsolidationMethod" NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "minorityInterestAccountCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubAccountOwnership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."SavedReport" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT,
    "subAccountId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "reportType" "finance"."ReportType" NOT NULL,
    "parameters" JSONB NOT NULL,
    "isScheduled" BOOLEAN NOT NULL DEFAULT false,
    "schedule" TEXT,
    "lastGeneratedAt" TIMESTAMP(3),
    "lastGeneratedBy" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."ReportTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "reportType" "finance"."ReportType" NOT NULL,
    "templateDefinition" JSONB NOT NULL,
    "defaultParameters" JSONB,
    "isSystem" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."COATemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" "finance"."Industry" NOT NULL,
    "description" TEXT NOT NULL,
    "region" TEXT NOT NULL DEFAULT 'US',
    "accountingStandard" TEXT NOT NULL DEFAULT 'GAAP',
    "template" JSONB NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "COATemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."GLAuditTrail" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT,
    "subAccountId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" "finance"."AuditAction" NOT NULL,
    "userId" TEXT NOT NULL,
    "userEmail" TEXT,
    "userName" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "previousValues" JSONB,
    "newValues" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "sessionId" TEXT,
    "reason" TEXT,

    CONSTRAINT "GLAuditTrail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GLConfiguration_agencyId_key" ON "finance"."GLConfiguration"("agencyId");

-- CreateIndex
CREATE INDEX "GLConfiguration_agencyId_idx" ON "finance"."GLConfiguration"("agencyId");

-- CreateIndex
CREATE INDEX "ChartOfAccount_agencyId_accountType_idx" ON "finance"."ChartOfAccount"("agencyId", "accountType");

-- CreateIndex
CREATE INDEX "ChartOfAccount_agencyId_isActive_idx" ON "finance"."ChartOfAccount"("agencyId", "isActive");

-- CreateIndex
CREATE INDEX "ChartOfAccount_agencyId_path_idx" ON "finance"."ChartOfAccount"("agencyId", "path");

-- CreateIndex
CREATE INDEX "ChartOfAccount_agencyId_level_idx" ON "finance"."ChartOfAccount"("agencyId", "level");

-- CreateIndex
CREATE INDEX "ChartOfAccount_subAccountId_accountType_idx" ON "finance"."ChartOfAccount"("subAccountId", "accountType");

-- CreateIndex
CREATE INDEX "ChartOfAccount_subAccountId_isActive_idx" ON "finance"."ChartOfAccount"("subAccountId", "isActive");

-- CreateIndex
CREATE INDEX "ChartOfAccount_subAccountId_path_idx" ON "finance"."ChartOfAccount"("subAccountId", "path");

-- CreateIndex
CREATE INDEX "ChartOfAccount_parentAccountId_idx" ON "finance"."ChartOfAccount"("parentAccountId");

-- CreateIndex
CREATE INDEX "ChartOfAccount_controlAccountId_idx" ON "finance"."ChartOfAccount"("controlAccountId");

-- CreateIndex
CREATE INDEX "ChartOfAccount_isControlAccount_idx" ON "finance"."ChartOfAccount"("isControlAccount");

-- CreateIndex
CREATE INDEX "ChartOfAccount_isSystemAccount_idx" ON "finance"."ChartOfAccount"("isSystemAccount");

-- CreateIndex
CREATE INDEX "ChartOfAccount_isConsolidationEnabled_idx" ON "finance"."ChartOfAccount"("isConsolidationEnabled");

-- CreateIndex
CREATE UNIQUE INDEX "ChartOfAccount_agencyId_code_key" ON "finance"."ChartOfAccount"("agencyId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "ChartOfAccount_subAccountId_code_key" ON "finance"."ChartOfAccount"("subAccountId", "code");

-- CreateIndex
CREATE INDEX "AgencyGroupCOA_agencyId_accountType_idx" ON "finance"."AgencyGroupCOA"("agencyId", "accountType");

-- CreateIndex
CREATE INDEX "AgencyGroupCOA_agencyId_isActive_idx" ON "finance"."AgencyGroupCOA"("agencyId", "isActive");

-- CreateIndex
CREATE INDEX "AgencyGroupCOA_parentId_idx" ON "finance"."AgencyGroupCOA"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "AgencyGroupCOA_agencyId_code_key" ON "finance"."AgencyGroupCOA"("agencyId", "code");

-- CreateIndex
CREATE INDEX "ConsolidationMapping_agencyId_idx" ON "finance"."ConsolidationMapping"("agencyId");

-- CreateIndex
CREATE INDEX "ConsolidationMapping_subAccountId_idx" ON "finance"."ConsolidationMapping"("subAccountId");

-- CreateIndex
CREATE INDEX "ConsolidationMapping_groupCOAId_idx" ON "finance"."ConsolidationMapping"("groupCOAId");

-- CreateIndex
CREATE INDEX "ConsolidationMapping_isElimination_idx" ON "finance"."ConsolidationMapping"("isElimination");

-- CreateIndex
CREATE UNIQUE INDEX "ConsolidationMapping_agencyId_subAccountId_subAccountCOACod_key" ON "finance"."ConsolidationMapping"("agencyId", "subAccountId", "subAccountCOACode");

-- CreateIndex
CREATE INDEX "FinancialPeriod_agencyId_status_idx" ON "finance"."FinancialPeriod"("agencyId", "status");

-- CreateIndex
CREATE INDEX "FinancialPeriod_agencyId_fiscalYear_idx" ON "finance"."FinancialPeriod"("agencyId", "fiscalYear");

-- CreateIndex
CREATE INDEX "FinancialPeriod_subAccountId_status_idx" ON "finance"."FinancialPeriod"("subAccountId", "status");

-- CreateIndex
CREATE INDEX "FinancialPeriod_subAccountId_fiscalYear_idx" ON "finance"."FinancialPeriod"("subAccountId", "fiscalYear");

-- CreateIndex
CREATE INDEX "FinancialPeriod_startDate_endDate_idx" ON "finance"."FinancialPeriod"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "FinancialPeriod_status_idx" ON "finance"."FinancialPeriod"("status");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialPeriod_agencyId_fiscalYear_periodType_fiscalPeriod_key" ON "finance"."FinancialPeriod"("agencyId", "fiscalYear", "periodType", "fiscalPeriod");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialPeriod_subAccountId_fiscalYear_periodType_fiscalPe_key" ON "finance"."FinancialPeriod"("subAccountId", "fiscalYear", "periodType", "fiscalPeriod");

-- CreateIndex
CREATE INDEX "JournalEntry_agencyId_status_idx" ON "finance"."JournalEntry"("agencyId", "status");

-- CreateIndex
CREATE INDEX "JournalEntry_agencyId_periodId_idx" ON "finance"."JournalEntry"("agencyId", "periodId");

-- CreateIndex
CREATE INDEX "JournalEntry_agencyId_entryDate_idx" ON "finance"."JournalEntry"("agencyId", "entryDate");

-- CreateIndex
CREATE INDEX "JournalEntry_agencyId_entryType_idx" ON "finance"."JournalEntry"("agencyId", "entryType");

-- CreateIndex
CREATE INDEX "JournalEntry_subAccountId_status_idx" ON "finance"."JournalEntry"("subAccountId", "status");

-- CreateIndex
CREATE INDEX "JournalEntry_subAccountId_periodId_idx" ON "finance"."JournalEntry"("subAccountId", "periodId");

-- CreateIndex
CREATE INDEX "JournalEntry_subAccountId_entryDate_idx" ON "finance"."JournalEntry"("subAccountId", "entryDate");

-- CreateIndex
CREATE INDEX "JournalEntry_sourceModule_sourceId_idx" ON "finance"."JournalEntry"("sourceModule", "sourceId");

-- CreateIndex
CREATE INDEX "JournalEntry_postingRuleId_idx" ON "finance"."JournalEntry"("postingRuleId");

-- CreateIndex
CREATE INDEX "JournalEntry_status_idx" ON "finance"."JournalEntry"("status");

-- CreateIndex
CREATE INDEX "JournalEntry_createdBy_idx" ON "finance"."JournalEntry"("createdBy");

-- CreateIndex
CREATE INDEX "JournalEntry_approvedBy_idx" ON "finance"."JournalEntry"("approvedBy");

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntry_agencyId_entryNumber_key" ON "finance"."JournalEntry"("agencyId", "entryNumber");

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntry_subAccountId_entryNumber_key" ON "finance"."JournalEntry"("subAccountId", "entryNumber");

-- CreateIndex
CREATE INDEX "JournalEntryLine_journalEntryId_idx" ON "finance"."JournalEntryLine"("journalEntryId");

-- CreateIndex
CREATE INDEX "JournalEntryLine_accountId_idx" ON "finance"."JournalEntryLine"("accountId");

-- CreateIndex
CREATE INDEX "JournalEntryLine_subledgerType_subledgerReference_idx" ON "finance"."JournalEntryLine"("subledgerType", "subledgerReference");

-- CreateIndex
CREATE INDEX "JournalEntryLine_isIntercompany_idx" ON "finance"."JournalEntryLine"("isIntercompany");

-- CreateIndex
CREATE INDEX "AccountBalance_agencyId_periodId_idx" ON "finance"."AccountBalance"("agencyId", "periodId");

-- CreateIndex
CREATE INDEX "AccountBalance_subAccountId_periodId_idx" ON "finance"."AccountBalance"("subAccountId", "periodId");

-- CreateIndex
CREATE INDEX "AccountBalance_accountId_idx" ON "finance"."AccountBalance"("accountId");

-- CreateIndex
CREATE INDEX "AccountBalance_periodId_idx" ON "finance"."AccountBalance"("periodId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountBalance_accountId_periodId_currencyCode_key" ON "finance"."AccountBalance"("accountId", "periodId", "currencyCode");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_code_key" ON "finance"."Currency"("code");

-- CreateIndex
CREATE INDEX "Currency_isActive_idx" ON "finance"."Currency"("isActive");

-- CreateIndex
CREATE INDEX "Currency_code_idx" ON "finance"."Currency"("code");

-- CreateIndex
CREATE INDEX "ExchangeRate_agencyId_effectiveDate_idx" ON "finance"."ExchangeRate"("agencyId", "effectiveDate");

-- CreateIndex
CREATE INDEX "ExchangeRate_fromCurrencyCode_toCurrencyCode_idx" ON "finance"."ExchangeRate"("fromCurrencyCode", "toCurrencyCode");

-- CreateIndex
CREATE INDEX "ExchangeRate_effectiveDate_idx" ON "finance"."ExchangeRate"("effectiveDate");

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeRate_agencyId_fromCurrencyCode_toCurrencyCode_effec_key" ON "finance"."ExchangeRate"("agencyId", "fromCurrencyCode", "toCurrencyCode", "effectiveDate", "rateType");

-- CreateIndex
CREATE INDEX "CurrencyRevaluation_agencyId_periodId_idx" ON "finance"."CurrencyRevaluation"("agencyId", "periodId");

-- CreateIndex
CREATE INDEX "CurrencyRevaluation_subAccountId_periodId_idx" ON "finance"."CurrencyRevaluation"("subAccountId", "periodId");

-- CreateIndex
CREATE INDEX "CurrencyRevaluation_currencyCode_idx" ON "finance"."CurrencyRevaluation"("currencyCode");

-- CreateIndex
CREATE INDEX "PostingRule_agencyId_sourceModule_isActive_idx" ON "finance"."PostingRule"("agencyId", "sourceModule", "isActive");

-- CreateIndex
CREATE INDEX "PostingRule_subAccountId_sourceModule_isActive_idx" ON "finance"."PostingRule"("subAccountId", "sourceModule", "isActive");

-- CreateIndex
CREATE INDEX "PostingRule_sourceModule_idx" ON "finance"."PostingRule"("sourceModule");

-- CreateIndex
CREATE INDEX "PostingRule_isActive_idx" ON "finance"."PostingRule"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PostingRule_agencyId_code_key" ON "finance"."PostingRule"("agencyId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "PostingRule_subAccountId_code_key" ON "finance"."PostingRule"("subAccountId", "code");

-- CreateIndex
CREATE INDEX "PostingTemplate_agencyId_isActive_idx" ON "finance"."PostingTemplate"("agencyId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PostingTemplate_agencyId_name_key" ON "finance"."PostingTemplate"("agencyId", "name");

-- CreateIndex
CREATE INDEX "Reconciliation_agencyId_status_idx" ON "finance"."Reconciliation"("agencyId", "status");

-- CreateIndex
CREATE INDEX "Reconciliation_subAccountId_status_idx" ON "finance"."Reconciliation"("subAccountId", "status");

-- CreateIndex
CREATE INDEX "Reconciliation_accountId_periodId_idx" ON "finance"."Reconciliation"("accountId", "periodId");

-- CreateIndex
CREATE INDEX "Reconciliation_status_idx" ON "finance"."Reconciliation"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Reconciliation_agencyId_reconciliationNumber_key" ON "finance"."Reconciliation"("agencyId", "reconciliationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Reconciliation_subAccountId_reconciliationNumber_key" ON "finance"."Reconciliation"("subAccountId", "reconciliationNumber");

-- CreateIndex
CREATE INDEX "ReconciliationItem_reconciliationId_idx" ON "finance"."ReconciliationItem"("reconciliationId");

-- CreateIndex
CREATE INDEX "ReconciliationItem_status_idx" ON "finance"."ReconciliationItem"("status");

-- CreateIndex
CREATE INDEX "ReconciliationItem_matchedItemId_idx" ON "finance"."ReconciliationItem"("matchedItemId");

-- CreateIndex
CREATE INDEX "ReconciliationRule_agencyId_isActive_idx" ON "finance"."ReconciliationRule"("agencyId", "isActive");

-- CreateIndex
CREATE INDEX "IntercompanyReconciliation_agencyId_periodId_idx" ON "finance"."IntercompanyReconciliation"("agencyId", "periodId");

-- CreateIndex
CREATE INDEX "IntercompanyReconciliation_subAccountId1_idx" ON "finance"."IntercompanyReconciliation"("subAccountId1");

-- CreateIndex
CREATE INDEX "IntercompanyReconciliation_subAccountId2_idx" ON "finance"."IntercompanyReconciliation"("subAccountId2");

-- CreateIndex
CREATE INDEX "ConsolidationSnapshot_agencyId_periodId_status_idx" ON "finance"."ConsolidationSnapshot"("agencyId", "periodId", "status");

-- CreateIndex
CREATE INDEX "ConsolidationSnapshot_agencyId_status_idx" ON "finance"."ConsolidationSnapshot"("agencyId", "status");

-- CreateIndex
CREATE INDEX "ConsolidationSnapshot_periodId_idx" ON "finance"."ConsolidationSnapshot"("periodId");

-- CreateIndex
CREATE UNIQUE INDEX "ConsolidationSnapshot_agencyId_periodId_version_key" ON "finance"."ConsolidationSnapshot"("agencyId", "periodId", "version");

-- CreateIndex
CREATE INDEX "ConsolidationWorksheetLine_snapshotId_idx" ON "finance"."ConsolidationWorksheetLine"("snapshotId");

-- CreateIndex
CREATE INDEX "ConsolidationWorksheetLine_groupCOAId_idx" ON "finance"."ConsolidationWorksheetLine"("groupCOAId");

-- CreateIndex
CREATE UNIQUE INDEX "ConsolidationWorksheetLine_snapshotId_accountCode_key" ON "finance"."ConsolidationWorksheetLine"("snapshotId", "accountCode");

-- CreateIndex
CREATE INDEX "ConsolidatedBalance_snapshotId_idx" ON "finance"."ConsolidatedBalance"("snapshotId");

-- CreateIndex
CREATE UNIQUE INDEX "ConsolidatedBalance_snapshotId_groupCOAId_key" ON "finance"."ConsolidatedBalance"("snapshotId", "groupCOAId");

-- CreateIndex
CREATE INDEX "ConsolidationAdjustment_snapshotId_idx" ON "finance"."ConsolidationAdjustment"("snapshotId");

-- CreateIndex
CREATE INDEX "IntercompanyElimination_snapshotId_idx" ON "finance"."IntercompanyElimination"("snapshotId");

-- CreateIndex
CREATE INDEX "IntercompanyElimination_subAccountId1_subAccountId2_idx" ON "finance"."IntercompanyElimination"("subAccountId1", "subAccountId2");

-- CreateIndex
CREATE INDEX "SubAccountOwnership_agencyId_isActive_idx" ON "finance"."SubAccountOwnership"("agencyId", "isActive");

-- CreateIndex
CREATE INDEX "SubAccountOwnership_subAccountId_idx" ON "finance"."SubAccountOwnership"("subAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "SubAccountOwnership_agencyId_subAccountId_effectiveFrom_key" ON "finance"."SubAccountOwnership"("agencyId", "subAccountId", "effectiveFrom");

-- CreateIndex
CREATE INDEX "SavedReport_agencyId_reportType_idx" ON "finance"."SavedReport"("agencyId", "reportType");

-- CreateIndex
CREATE INDEX "SavedReport_subAccountId_reportType_idx" ON "finance"."SavedReport"("subAccountId", "reportType");

-- CreateIndex
CREATE UNIQUE INDEX "ReportTemplate_name_key" ON "finance"."ReportTemplate"("name");

-- CreateIndex
CREATE INDEX "ReportTemplate_reportType_isActive_idx" ON "finance"."ReportTemplate"("reportType", "isActive");

-- CreateIndex
CREATE INDEX "COATemplate_industry_isActive_idx" ON "finance"."COATemplate"("industry", "isActive");

-- CreateIndex
CREATE INDEX "COATemplate_region_accountingStandard_idx" ON "finance"."COATemplate"("region", "accountingStandard");

-- CreateIndex
CREATE INDEX "GLAuditTrail_agencyId_entityType_entityId_idx" ON "finance"."GLAuditTrail"("agencyId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "GLAuditTrail_subAccountId_entityType_entityId_idx" ON "finance"."GLAuditTrail"("subAccountId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "GLAuditTrail_agencyId_timestamp_idx" ON "finance"."GLAuditTrail"("agencyId", "timestamp");

-- CreateIndex
CREATE INDEX "GLAuditTrail_subAccountId_timestamp_idx" ON "finance"."GLAuditTrail"("subAccountId", "timestamp");

-- CreateIndex
CREATE INDEX "GLAuditTrail_userId_idx" ON "finance"."GLAuditTrail"("userId");

-- CreateIndex
CREATE INDEX "GLAuditTrail_entityType_entityId_idx" ON "finance"."GLAuditTrail"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "GLAuditTrail_timestamp_idx" ON "finance"."GLAuditTrail"("timestamp");

-- CreateIndex
CREATE INDEX "GLAuditTrail_action_idx" ON "finance"."GLAuditTrail"("action");

-- AddForeignKey
ALTER TABLE "finance"."GLConfiguration" ADD CONSTRAINT "GLConfiguration_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."ChartOfAccount" ADD CONSTRAINT "ChartOfAccount_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."ChartOfAccount" ADD CONSTRAINT "ChartOfAccount_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "SubAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."ChartOfAccount" ADD CONSTRAINT "ChartOfAccount_parentAccountId_fkey" FOREIGN KEY ("parentAccountId") REFERENCES "finance"."ChartOfAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."ChartOfAccount" ADD CONSTRAINT "ChartOfAccount_controlAccountId_fkey" FOREIGN KEY ("controlAccountId") REFERENCES "finance"."ChartOfAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."AgencyGroupCOA" ADD CONSTRAINT "AgencyGroupCOA_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."AgencyGroupCOA" ADD CONSTRAINT "AgencyGroupCOA_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "finance"."AgencyGroupCOA"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."ConsolidationMapping" ADD CONSTRAINT "ConsolidationMapping_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."ConsolidationMapping" ADD CONSTRAINT "ConsolidationMapping_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "SubAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."ConsolidationMapping" ADD CONSTRAINT "ConsolidationMapping_groupCOAId_fkey" FOREIGN KEY ("groupCOAId") REFERENCES "finance"."AgencyGroupCOA"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."FinancialPeriod" ADD CONSTRAINT "FinancialPeriod_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."FinancialPeriod" ADD CONSTRAINT "FinancialPeriod_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "SubAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."JournalEntry" ADD CONSTRAINT "JournalEntry_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."JournalEntry" ADD CONSTRAINT "JournalEntry_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "SubAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."JournalEntry" ADD CONSTRAINT "JournalEntry_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "finance"."FinancialPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."JournalEntry" ADD CONSTRAINT "JournalEntry_postingRuleId_fkey" FOREIGN KEY ("postingRuleId") REFERENCES "finance"."PostingRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."JournalEntry" ADD CONSTRAINT "JournalEntry_carryForwardFromId_fkey" FOREIGN KEY ("carryForwardFromId") REFERENCES "finance"."JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."JournalEntry" ADD CONSTRAINT "JournalEntry_reversalOfId_fkey" FOREIGN KEY ("reversalOfId") REFERENCES "finance"."JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "finance"."JournalEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "finance"."ChartOfAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."AccountBalance" ADD CONSTRAINT "AccountBalance_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "finance"."ChartOfAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."AccountBalance" ADD CONSTRAINT "AccountBalance_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "finance"."FinancialPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."ExchangeRate" ADD CONSTRAINT "ExchangeRate_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."ExchangeRate" ADD CONSTRAINT "ExchangeRate_fromCurrencyCode_fkey" FOREIGN KEY ("fromCurrencyCode") REFERENCES "finance"."Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."ExchangeRate" ADD CONSTRAINT "ExchangeRate_toCurrencyCode_fkey" FOREIGN KEY ("toCurrencyCode") REFERENCES "finance"."Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."CurrencyRevaluation" ADD CONSTRAINT "CurrencyRevaluation_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."CurrencyRevaluation" ADD CONSTRAINT "CurrencyRevaluation_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "SubAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."CurrencyRevaluation" ADD CONSTRAINT "CurrencyRevaluation_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "finance"."Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."PostingRule" ADD CONSTRAINT "PostingRule_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."PostingRule" ADD CONSTRAINT "PostingRule_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "SubAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."PostingRule" ADD CONSTRAINT "PostingRule_debitAccountId_fkey" FOREIGN KEY ("debitAccountId") REFERENCES "finance"."ChartOfAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."PostingRule" ADD CONSTRAINT "PostingRule_creditAccountId_fkey" FOREIGN KEY ("creditAccountId") REFERENCES "finance"."ChartOfAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."PostingTemplate" ADD CONSTRAINT "PostingTemplate_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."Reconciliation" ADD CONSTRAINT "Reconciliation_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."Reconciliation" ADD CONSTRAINT "Reconciliation_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "SubAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."Reconciliation" ADD CONSTRAINT "Reconciliation_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "finance"."ChartOfAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."Reconciliation" ADD CONSTRAINT "Reconciliation_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "finance"."FinancialPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."ReconciliationItem" ADD CONSTRAINT "ReconciliationItem_reconciliationId_fkey" FOREIGN KEY ("reconciliationId") REFERENCES "finance"."Reconciliation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."ReconciliationRule" ADD CONSTRAINT "ReconciliationRule_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."IntercompanyReconciliation" ADD CONSTRAINT "IntercompanyReconciliation_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."IntercompanyReconciliation" ADD CONSTRAINT "IntercompanyReconciliation_subAccountId1_fkey" FOREIGN KEY ("subAccountId1") REFERENCES "SubAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."IntercompanyReconciliation" ADD CONSTRAINT "IntercompanyReconciliation_subAccountId2_fkey" FOREIGN KEY ("subAccountId2") REFERENCES "SubAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."ConsolidationSnapshot" ADD CONSTRAINT "ConsolidationSnapshot_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."ConsolidationSnapshot" ADD CONSTRAINT "ConsolidationSnapshot_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "finance"."FinancialPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."ConsolidationWorksheetLine" ADD CONSTRAINT "ConsolidationWorksheetLine_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "finance"."ConsolidationSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."ConsolidationWorksheetLine" ADD CONSTRAINT "ConsolidationWorksheetLine_groupCOAId_fkey" FOREIGN KEY ("groupCOAId") REFERENCES "finance"."AgencyGroupCOA"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."ConsolidatedBalance" ADD CONSTRAINT "ConsolidatedBalance_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "finance"."ConsolidationSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."ConsolidatedBalance" ADD CONSTRAINT "ConsolidatedBalance_groupCOAId_fkey" FOREIGN KEY ("groupCOAId") REFERENCES "finance"."AgencyGroupCOA"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."ConsolidationAdjustment" ADD CONSTRAINT "ConsolidationAdjustment_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "finance"."ConsolidationSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."IntercompanyElimination" ADD CONSTRAINT "IntercompanyElimination_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "finance"."ConsolidationSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."SubAccountOwnership" ADD CONSTRAINT "SubAccountOwnership_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."SubAccountOwnership" ADD CONSTRAINT "SubAccountOwnership_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "SubAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."SavedReport" ADD CONSTRAINT "SavedReport_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."SavedReport" ADD CONSTRAINT "SavedReport_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "SubAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
