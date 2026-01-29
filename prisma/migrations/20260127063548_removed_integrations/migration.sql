/*
  Warnings:

  - You are about to drop the `IntegrationApiKey` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IntegrationConnection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IntegrationProviderEvent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IntegrationWebhookDelivery` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IntegrationWebhookDeliveryAttempt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IntegrationWebhookSubscription` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "IntegrationApiKey" DROP CONSTRAINT "IntegrationApiKey_agencyId_fkey";

-- DropForeignKey
ALTER TABLE "IntegrationApiKey" DROP CONSTRAINT "IntegrationApiKey_createdByUserId_fkey";

-- DropForeignKey
ALTER TABLE "IntegrationApiKey" DROP CONSTRAINT "IntegrationApiKey_subAccountId_fkey";

-- DropForeignKey
ALTER TABLE "IntegrationConnection" DROP CONSTRAINT "IntegrationConnection_agencyId_fkey";

-- DropForeignKey
ALTER TABLE "IntegrationConnection" DROP CONSTRAINT "IntegrationConnection_subAccountId_fkey";

-- DropForeignKey
ALTER TABLE "IntegrationProviderEvent" DROP CONSTRAINT "IntegrationProviderEvent_connectionId_fkey";

-- DropForeignKey
ALTER TABLE "IntegrationWebhookDelivery" DROP CONSTRAINT "IntegrationWebhookDelivery_providerEventId_fkey";

-- DropForeignKey
ALTER TABLE "IntegrationWebhookDelivery" DROP CONSTRAINT "IntegrationWebhookDelivery_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "IntegrationWebhookDeliveryAttempt" DROP CONSTRAINT "IntegrationWebhookDeliveryAttempt_deliveryId_fkey";

-- DropForeignKey
ALTER TABLE "IntegrationWebhookSubscription" DROP CONSTRAINT "IntegrationWebhookSubscription_connectionId_fkey";

-- DropTable
DROP TABLE "IntegrationApiKey";

-- DropTable
DROP TABLE "IntegrationConnection";

-- DropTable
DROP TABLE "IntegrationProviderEvent";

-- DropTable
DROP TABLE "IntegrationWebhookDelivery";

-- DropTable
DROP TABLE "IntegrationWebhookDeliveryAttempt";

-- DropTable
DROP TABLE "IntegrationWebhookSubscription";
