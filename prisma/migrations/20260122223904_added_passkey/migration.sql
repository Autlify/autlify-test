-- CreateEnum
CREATE TYPE "MFAMethodType" AS ENUM ('TOTP', 'SMS', 'EMAIL', 'BACKUP_CODES', 'PASSKEY');

-- CreateEnum
CREATE TYPE "SSOProvider" AS ENUM ('OIDC', 'SAML', 'GOOGLE_WORKSPACE', 'MICROSOFT_ENTRA', 'OKTA', 'PING_IDENTITY', 'AUTH0');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING', 'FAILED');

-- CreateEnum
CREATE TYPE "SSOEventType" AS ENUM ('LOGIN_SUCCESS', 'LOGIN_FAILED', 'USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'USER_SUSPENDED', 'TOKEN_REFRESH', 'CONNECTION_TESTED', 'CONNECTION_UPDATED');

-- CreateTable
CREATE TABLE "Passkey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL DEFAULT 'Passkey',
    "deviceName" TEXT,
    "authenticatorType" TEXT,
    "backupEligible" BOOLEAN NOT NULL DEFAULT false,
    "backupState" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "Passkey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MFAChallenge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "codeType" "MFAMethodType" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "sessionToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MFAChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MFAMethod" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "MFAMethodType" NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "secret" TEXT,
    "phoneNumber" TEXT,
    "backupCodes" TEXT,
    "backupCodesUsed" TEXT,
    "trustedDevices" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MFAMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SSOConnection" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "provider" "SSOProvider" NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "authorizationUrl" TEXT,
    "tokenUrl" TEXT,
    "userinfoUrl" TEXT,
    "jwksUrl" TEXT,
    "entityId" TEXT,
    "acsUrl" TEXT,
    "ssoUrl" TEXT,
    "sloUrl" TEXT,
    "x509Certificate" TEXT,
    "allowedDomains" TEXT NOT NULL,
    "autoProvisionUsers" BOOLEAN NOT NULL DEFAULT true,
    "autoProvisionRole" TEXT,
    "requireSSO" BOOLEAN NOT NULL DEFAULT false,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "testedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SSOConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SSOUserMapping" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ssoConnectionId" TEXT NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "providerEmail" TEXT NOT NULL,
    "providerName" TEXT,
    "providerPicture" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SSOUserMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SSOAuditLog" (
    "id" TEXT NOT NULL,
    "ssoConnectionId" TEXT NOT NULL,
    "eventType" "SSOEventType" NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SSOAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Passkey_credentialId_key" ON "Passkey"("credentialId");

-- CreateIndex
CREATE INDEX "Passkey_userId_idx" ON "Passkey"("userId");

-- CreateIndex
CREATE INDEX "MFAChallenge_userId_expiresAt_idx" ON "MFAChallenge"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "MFAChallenge_code_idx" ON "MFAChallenge"("code");

-- CreateIndex
CREATE INDEX "MFAMethod_userId_idx" ON "MFAMethod"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MFAMethod_userId_type_key" ON "MFAMethod"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "SSOConnection_agencyId_key" ON "SSOConnection"("agencyId");

-- CreateIndex
CREATE INDEX "SSOConnection_provider_idx" ON "SSOConnection"("provider");

-- CreateIndex
CREATE INDEX "SSOUserMapping_userId_idx" ON "SSOUserMapping"("userId");

-- CreateIndex
CREATE INDEX "SSOUserMapping_ssoConnectionId_idx" ON "SSOUserMapping"("ssoConnectionId");

-- CreateIndex
CREATE UNIQUE INDEX "SSOUserMapping_ssoConnectionId_providerUserId_key" ON "SSOUserMapping"("ssoConnectionId", "providerUserId");

-- CreateIndex
CREATE INDEX "SSOAuditLog_ssoConnectionId_createdAt_idx" ON "SSOAuditLog"("ssoConnectionId", "createdAt");

-- CreateIndex
CREATE INDEX "SSOAuditLog_email_idx" ON "SSOAuditLog"("email");

-- AddForeignKey
ALTER TABLE "Passkey" ADD CONSTRAINT "Passkey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MFAChallenge" ADD CONSTRAINT "MFAChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MFAMethod" ADD CONSTRAINT "MFAMethod_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SSOConnection" ADD CONSTRAINT "SSOConnection_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SSOUserMapping" ADD CONSTRAINT "SSOUserMapping_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SSOUserMapping" ADD CONSTRAINT "SSOUserMapping_ssoConnectionId_fkey" FOREIGN KEY ("ssoConnectionId") REFERENCES "SSOConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SSOAuditLog" ADD CONSTRAINT "SSOAuditLog_ssoConnectionId_fkey" FOREIGN KEY ("ssoConnectionId") REFERENCES "SSOConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
