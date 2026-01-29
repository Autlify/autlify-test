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
