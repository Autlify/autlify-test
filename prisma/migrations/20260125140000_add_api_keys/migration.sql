-- CreateEnum
CREATE TYPE "ApiKeyKind" AS ENUM ('USER', 'AGENCY', 'SUBACCOUNT');

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "kind" "ApiKeyKind" NOT NULL DEFAULT 'USER',
    "name" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "secretHash" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "agencyId" TEXT,
    "subAccountId" TEXT,
    "permissionKeys" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "allowedSubAccountIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_prefix_key" ON "ApiKey"("prefix");

-- CreateIndex
CREATE INDEX "ApiKey_ownerUserId_idx" ON "ApiKey"("ownerUserId");

-- CreateIndex
CREATE INDEX "ApiKey_agencyId_idx" ON "ApiKey"("agencyId");

-- CreateIndex
CREATE INDEX "ApiKey_subAccountId_idx" ON "ApiKey"("subAccountId");

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "SubAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
