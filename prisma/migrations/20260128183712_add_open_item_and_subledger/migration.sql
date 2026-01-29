/*
  Warnings:

  - Added the required column `updatedAt` to the `ConsolidatedBalance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ConsolidationWorksheetLine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `IntercompanyElimination` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `JournalEntryLine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ReconciliationItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "finance"."PartnerType" AS ENUM ('CUSTOMER', 'VENDOR', 'EMPLOYEE', 'BANK', 'INTERCOMPANY', 'OTHER');

-- CreateEnum
CREATE TYPE "finance"."ClearingDocumentType" AS ENUM ('PAYMENT', 'RECEIPT', 'CREDIT_NOTE', 'DEBIT_NOTE', 'ADJUSTMENT', 'WRITE_OFF', 'TRANSFER', 'MANUAL');

-- CreateEnum
CREATE TYPE "finance"."OpenItemStatus" AS ENUM ('OPEN', 'PARTIALLY_CLEARED', 'CLEARED', 'WRITTEN_OFF');

-- CreateEnum
CREATE TYPE "AppScopeKind" AS ENUM ('AGENCY', 'SUBACCOUNT');

-- CreateEnum
CREATE TYPE "AppInstallationStatus" AS ENUM ('INSTALLED', 'AVAILABLE', 'EXPIRED', 'DISABLED');

-- AlterTable
ALTER TABLE "finance"."AccountBalance" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "finance"."ConsolidatedBalance" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "finance"."ConsolidationWorksheetLine" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "finance"."GLConfiguration" ADD COLUMN     "adjustingEntryPrefix" TEXT,
ADD COLUMN     "closingEntryPrefix" TEXT,
ADD COLUMN     "consolidationPrefix" TEXT,
ADD COLUMN     "creditNoteFormat" TEXT,
ADD COLUMN     "debitNoteFormat" TEXT,
ADD COLUMN     "docNumAssetStart" INTEGER NOT NULL DEFAULT 100000000,
ADD COLUMN     "docNumClearingStart" INTEGER NOT NULL DEFAULT 10000000,
ADD COLUMN     "docNumEquityStart" INTEGER NOT NULL DEFAULT 300000000,
ADD COLUMN     "docNumExpenseStart" INTEGER NOT NULL DEFAULT 500000000,
ADD COLUMN     "docNumLiabilityStart" INTEGER NOT NULL DEFAULT 200000000,
ADD COLUMN     "docNumRevenueStart" INTEGER NOT NULL DEFAULT 400000000,
ADD COLUMN     "documentNumberResetRule" TEXT NOT NULL DEFAULT 'YEARLY',
ADD COLUMN     "invoiceFormat" TEXT,
ADD COLUMN     "journalEntryPrefix" TEXT,
ADD COLUMN     "paymentFormat" TEXT,
ADD COLUMN     "receiptFormat" TEXT,
ADD COLUMN     "reconciliationPrefix" TEXT,
ADD COLUMN     "revaluationPrefix" TEXT,
ADD COLUMN     "reversalEntryPrefix" TEXT;

-- AlterTable
ALTER TABLE "finance"."GLConfigurationSubAccount" ADD COLUMN     "adjustingEntryPrefix" TEXT,
ADD COLUMN     "closingEntryPrefix" TEXT,
ADD COLUMN     "consolidationPrefix" TEXT,
ADD COLUMN     "creditNoteFormat" TEXT,
ADD COLUMN     "debitNoteFormat" TEXT,
ADD COLUMN     "invoiceFormat" TEXT,
ADD COLUMN     "journalEntryPrefix" TEXT,
ADD COLUMN     "paymentFormat" TEXT,
ADD COLUMN     "receiptFormat" TEXT,
ADD COLUMN     "reconciliationPrefix" TEXT,
ADD COLUMN     "revaluationPrefix" TEXT,
ADD COLUMN     "reversalEntryPrefix" TEXT;

-- AlterTable
ALTER TABLE "finance"."IntercompanyElimination" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "finance"."JournalEntryLine" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "finance"."ReconciliationItem" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "finance"."SubLedger" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "subAccountId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "finance"."SubledgerType" NOT NULL,
    "controlAccountId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "SubLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."Vendor" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "subAccountId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "taxId" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" JSONB,
    "subLedgerId" TEXT,
    "paymentTermDays" INTEGER NOT NULL DEFAULT 30,
    "currency" TEXT NOT NULL DEFAULT 'MYR',
    "creditLimit" DECIMAL(18,6),
    "bankName" TEXT,
    "bankAccount" TEXT,
    "bankSwiftCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."Customer" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "subAccountId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "taxId" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" JSONB,
    "subLedgerId" TEXT,
    "paymentTermDays" INTEGER NOT NULL DEFAULT 30,
    "currency" TEXT NOT NULL DEFAULT 'MYR',
    "creditLimit" DECIMAL(18,6),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."GLConfigurationLock" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT,
    "subAccountId" TEXT,
    "settingKey" TEXT NOT NULL,
    "lockedValue" TEXT NOT NULL,
    "lockedReason" TEXT NOT NULL,
    "lockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedBy" TEXT NOT NULL,
    "unlockConditions" JSONB,
    "isPermanent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GLConfigurationLock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."OpenItem" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT,
    "subAccountId" TEXT,
    "accountId" TEXT NOT NULL,
    "journalEntryId" TEXT,
    "journalLineId" TEXT,
    "sourceModule" "finance"."SourceModule" NOT NULL,
    "sourceId" TEXT,
    "sourceReference" TEXT,
    "reference" TEXT,
    "assignment" TEXT,
    "text" TEXT,
    "itemDate" TIMESTAMP(3) NOT NULL,
    "itemType" TEXT,
    "dueDate" TIMESTAMP(3),
    "localCurrencyCode" TEXT NOT NULL DEFAULT 'MYR',
    "localAmount" DECIMAL(18,6) NOT NULL,
    "localRemainingAmount" DECIMAL(18,6) NOT NULL,
    "documentCurrencyCode" TEXT NOT NULL DEFAULT 'MYR',
    "documentAmount" DECIMAL(18,6) NOT NULL,
    "documentRemainingAmount" DECIMAL(18,6) NOT NULL,
    "documentNumber" TEXT,
    "documentDate" TIMESTAMP(3),
    "exchangeRate" DECIMAL(12,6) NOT NULL DEFAULT 1,
    "partnerType" "finance"."PartnerType",
    "customerId" TEXT,
    "vendorId" TEXT,
    "status" "finance"."OpenItemStatus" NOT NULL DEFAULT 'OPEN',
    "clearingDate" TIMESTAMP(3),
    "clearingDocumentId" TEXT,
    "clearingReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "enteredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postedAt" TIMESTAMP(3),
    "clearedAt" TIMESTAMP(3),
    "clearedBy" TEXT,

    CONSTRAINT "OpenItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."OpenItemAllocation" (
    "id" TEXT NOT NULL,
    "openItemId" TEXT NOT NULL,
    "clearedById" TEXT NOT NULL,
    "clearedByType" "finance"."ClearingDocumentType" NOT NULL,
    "clearedByRef" TEXT,
    "localAmount" DECIMAL(18,6) NOT NULL,
    "documentAmount" DECIMAL(18,6) NOT NULL,
    "exchangeDifference" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "allocatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "allocatedBy" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "OpenItemAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationApiKey" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "agencyId" TEXT,
    "subAccountId" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "IntegrationApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationConnection" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DISCONNECTED',
    "agencyId" TEXT,
    "subAccountId" TEXT,
    "credentials" JSONB,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "IntegrationConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationWebhookSubscription" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secretHash" TEXT,
    "secretEnc" TEXT,
    "events" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationWebhookSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationProviderEvent" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "externalEventId" TEXT,
    "headers" JSONB,
    "payload" JSONB,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "IntegrationProviderEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationWebhookDelivery" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "providerEventId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationWebhookDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationWebhookDeliveryAttempt" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "statusCode" INTEGER,
    "responseBody" TEXT,
    "error" TEXT,
    "durationMs" INTEGER,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntegrationWebhookDeliveryAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppInstallation" (
    "id" TEXT NOT NULL,
    "appKey" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "subAccountId" TEXT,
    "status" "AppInstallationStatus" NOT NULL DEFAULT 'INSTALLED',
    "installedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uninstalledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppInstallation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubLedger_agencyId_type_idx" ON "finance"."SubLedger"("agencyId", "type");

-- CreateIndex
CREATE INDEX "SubLedger_subAccountId_type_idx" ON "finance"."SubLedger"("subAccountId", "type");

-- CreateIndex
CREATE INDEX "SubLedger_controlAccountId_idx" ON "finance"."SubLedger"("controlAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "SubLedger_agencyId_code_key" ON "finance"."SubLedger"("agencyId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "SubLedger_subAccountId_code_key" ON "finance"."SubLedger"("subAccountId", "code");

-- CreateIndex
CREATE INDEX "Vendor_agencyId_isActive_idx" ON "finance"."Vendor"("agencyId", "isActive");

-- CreateIndex
CREATE INDEX "Vendor_subAccountId_isActive_idx" ON "finance"."Vendor"("subAccountId", "isActive");

-- CreateIndex
CREATE INDEX "Vendor_subLedgerId_idx" ON "finance"."Vendor"("subLedgerId");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_agencyId_code_key" ON "finance"."Vendor"("agencyId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_subAccountId_code_key" ON "finance"."Vendor"("subAccountId", "code");

-- CreateIndex
CREATE INDEX "Customer_agencyId_isActive_idx" ON "finance"."Customer"("agencyId", "isActive");

-- CreateIndex
CREATE INDEX "Customer_subAccountId_isActive_idx" ON "finance"."Customer"("subAccountId", "isActive");

-- CreateIndex
CREATE INDEX "Customer_subLedgerId_idx" ON "finance"."Customer"("subLedgerId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_agencyId_code_key" ON "finance"."Customer"("agencyId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_subAccountId_code_key" ON "finance"."Customer"("subAccountId", "code");

-- CreateIndex
CREATE INDEX "GLConfigurationLock_agencyId_idx" ON "finance"."GLConfigurationLock"("agencyId");

-- CreateIndex
CREATE INDEX "GLConfigurationLock_subAccountId_idx" ON "finance"."GLConfigurationLock"("subAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "GLConfigurationLock_agencyId_settingKey_key" ON "finance"."GLConfigurationLock"("agencyId", "settingKey");

-- CreateIndex
CREATE UNIQUE INDEX "GLConfigurationLock_subAccountId_settingKey_key" ON "finance"."GLConfigurationLock"("subAccountId", "settingKey");

-- CreateIndex
CREATE INDEX "OpenItem_agencyId_accountId_status_idx" ON "finance"."OpenItem"("agencyId", "accountId", "status");

-- CreateIndex
CREATE INDEX "OpenItem_subAccountId_accountId_status_idx" ON "finance"."OpenItem"("subAccountId", "accountId", "status");

-- CreateIndex
CREATE INDEX "OpenItem_customerId_status_idx" ON "finance"."OpenItem"("customerId", "status");

-- CreateIndex
CREATE INDEX "OpenItem_vendorId_status_idx" ON "finance"."OpenItem"("vendorId", "status");

-- CreateIndex
CREATE INDEX "OpenItem_clearingDate_idx" ON "finance"."OpenItem"("clearingDate");

-- CreateIndex
CREATE INDEX "OpenItem_sourceModule_sourceId_idx" ON "finance"."OpenItem"("sourceModule", "sourceId");

-- CreateIndex
CREATE INDEX "OpenItem_reference_idx" ON "finance"."OpenItem"("reference");

-- CreateIndex
CREATE INDEX "OpenItemAllocation_openItemId_idx" ON "finance"."OpenItemAllocation"("openItemId");

-- CreateIndex
CREATE INDEX "OpenItemAllocation_clearedById_idx" ON "finance"."OpenItemAllocation"("clearedById");

-- CreateIndex
CREATE INDEX "OpenItemAllocation_allocatedAt_idx" ON "finance"."OpenItemAllocation"("allocatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationApiKey_keyPrefix_key" ON "IntegrationApiKey"("keyPrefix");

-- CreateIndex
CREATE INDEX "IntegrationApiKey_agencyId_idx" ON "IntegrationApiKey"("agencyId");

-- CreateIndex
CREATE INDEX "IntegrationApiKey_subAccountId_idx" ON "IntegrationApiKey"("subAccountId");

-- CreateIndex
CREATE INDEX "IntegrationApiKey_createdByUserId_idx" ON "IntegrationApiKey"("createdByUserId");

-- CreateIndex
CREATE INDEX "IntegrationConnection_provider_idx" ON "IntegrationConnection"("provider");

-- CreateIndex
CREATE INDEX "IntegrationConnection_agencyId_idx" ON "IntegrationConnection"("agencyId");

-- CreateIndex
CREATE INDEX "IntegrationConnection_subAccountId_idx" ON "IntegrationConnection"("subAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationConnection_provider_agencyId_subAccountId_key" ON "IntegrationConnection"("provider", "agencyId", "subAccountId");

-- CreateIndex
CREATE INDEX "IntegrationWebhookSubscription_connectionId_idx" ON "IntegrationWebhookSubscription"("connectionId");

-- CreateIndex
CREATE INDEX "IntegrationWebhookSubscription_isActive_idx" ON "IntegrationWebhookSubscription"("isActive");

-- CreateIndex
CREATE INDEX "IntegrationProviderEvent_provider_idx" ON "IntegrationProviderEvent"("provider");

-- CreateIndex
CREATE INDEX "IntegrationProviderEvent_connectionId_idx" ON "IntegrationProviderEvent"("connectionId");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationProviderEvent_connectionId_externalEventId_key" ON "IntegrationProviderEvent"("connectionId", "externalEventId");

-- CreateIndex
CREATE INDEX "IntegrationWebhookDelivery_subscriptionId_idx" ON "IntegrationWebhookDelivery"("subscriptionId");

-- CreateIndex
CREATE INDEX "IntegrationWebhookDelivery_status_idx" ON "IntegrationWebhookDelivery"("status");

-- CreateIndex
CREATE INDEX "IntegrationWebhookDelivery_nextAttemptAt_idx" ON "IntegrationWebhookDelivery"("nextAttemptAt");

-- CreateIndex
CREATE INDEX "IntegrationWebhookDeliveryAttempt_deliveryId_idx" ON "IntegrationWebhookDeliveryAttempt"("deliveryId");

-- CreateIndex
CREATE INDEX "IntegrationWebhookDeliveryAttempt_attemptedAt_idx" ON "IntegrationWebhookDeliveryAttempt"("attemptedAt");

-- CreateIndex
CREATE INDEX "AppInstallation_appKey_idx" ON "AppInstallation"("appKey");

-- CreateIndex
CREATE INDEX "AppInstallation_agencyId_idx" ON "AppInstallation"("agencyId");

-- CreateIndex
CREATE INDEX "AppInstallation_subAccountId_idx" ON "AppInstallation"("subAccountId");

-- AddForeignKey
ALTER TABLE "finance"."AccountBalance" ADD CONSTRAINT "AccountBalance_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."AccountBalance" ADD CONSTRAINT "AccountBalance_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "SubAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."SubLedger" ADD CONSTRAINT "SubLedger_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."SubLedger" ADD CONSTRAINT "SubLedger_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "SubAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."SubLedger" ADD CONSTRAINT "SubLedger_controlAccountId_fkey" FOREIGN KEY ("controlAccountId") REFERENCES "finance"."ChartOfAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."Vendor" ADD CONSTRAINT "Vendor_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."Vendor" ADD CONSTRAINT "Vendor_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "SubAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."Vendor" ADD CONSTRAINT "Vendor_subLedgerId_fkey" FOREIGN KEY ("subLedgerId") REFERENCES "finance"."SubLedger"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."Customer" ADD CONSTRAINT "Customer_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."Customer" ADD CONSTRAINT "Customer_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "SubAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."Customer" ADD CONSTRAINT "Customer_subLedgerId_fkey" FOREIGN KEY ("subLedgerId") REFERENCES "finance"."SubLedger"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."GLConfigurationLock" ADD CONSTRAINT "GLConfigurationLock_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."GLConfigurationLock" ADD CONSTRAINT "GLConfigurationLock_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "SubAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."OpenItem" ADD CONSTRAINT "OpenItem_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."OpenItem" ADD CONSTRAINT "OpenItem_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "SubAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."OpenItem" ADD CONSTRAINT "OpenItem_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "finance"."ChartOfAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."OpenItem" ADD CONSTRAINT "OpenItem_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "finance"."Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."OpenItem" ADD CONSTRAINT "OpenItem_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "finance"."Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."OpenItemAllocation" ADD CONSTRAINT "OpenItemAllocation_openItemId_fkey" FOREIGN KEY ("openItemId") REFERENCES "finance"."OpenItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationApiKey" ADD CONSTRAINT "IntegrationApiKey_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationApiKey" ADD CONSTRAINT "IntegrationApiKey_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "SubAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationApiKey" ADD CONSTRAINT "IntegrationApiKey_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationConnection" ADD CONSTRAINT "IntegrationConnection_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationConnection" ADD CONSTRAINT "IntegrationConnection_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "SubAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationWebhookSubscription" ADD CONSTRAINT "IntegrationWebhookSubscription_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "IntegrationConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationProviderEvent" ADD CONSTRAINT "IntegrationProviderEvent_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "IntegrationConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationWebhookDelivery" ADD CONSTRAINT "IntegrationWebhookDelivery_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "IntegrationWebhookSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationWebhookDelivery" ADD CONSTRAINT "IntegrationWebhookDelivery_providerEventId_fkey" FOREIGN KEY ("providerEventId") REFERENCES "IntegrationProviderEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationWebhookDeliveryAttempt" ADD CONSTRAINT "IntegrationWebhookDeliveryAttempt_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "IntegrationWebhookDelivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppInstallation" ADD CONSTRAINT "AppInstallation_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppInstallation" ADD CONSTRAINT "AppInstallation_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "SubAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
