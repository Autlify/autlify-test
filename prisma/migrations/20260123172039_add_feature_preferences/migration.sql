/*
  Warnings:

  - You are about to drop the column `trialEligibled` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EntitlementFeature" ADD COLUMN     "defaultEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "helpText" TEXT,
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "isToggleable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requiresRestart" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "trialEligibled",
ADD COLUMN     "trialEligible" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "FeaturePreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "featureKey" TEXT NOT NULL,
    "scope" "MeteringScope" NOT NULL DEFAULT 'AGENCY',
    "agencyId" TEXT,
    "subAccountId" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeaturePreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeaturePreference_userId_idx" ON "FeaturePreference"("userId");

-- CreateIndex
CREATE INDEX "FeaturePreference_featureKey_idx" ON "FeaturePreference"("featureKey");

-- CreateIndex
CREATE INDEX "FeaturePreference_agencyId_idx" ON "FeaturePreference"("agencyId");

-- CreateIndex
CREATE INDEX "FeaturePreference_subAccountId_idx" ON "FeaturePreference"("subAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "FeaturePreference_userId_scope_agencyId_subAccountId_featur_key" ON "FeaturePreference"("userId", "scope", "agencyId", "subAccountId", "featureKey");

-- AddForeignKey
ALTER TABLE "FeaturePreference" ADD CONSTRAINT "FeaturePreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
