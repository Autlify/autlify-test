-- CreateTable
CREATE TABLE "finance"."GLConfigurationSubAccount" (
    "id" TEXT NOT NULL,
    "subAccountId" TEXT NOT NULL,
    "agencyConfigId" TEXT,
    "isIndependent" BOOLEAN NOT NULL DEFAULT false,
    "baseCurrency" TEXT,
    "fiscalYearEnd" TEXT,
    "fiscalYearStart" TEXT,
    "useControlAccounts" BOOLEAN,
    "requireApproval" BOOLEAN,
    "approvalThreshold" DECIMAL(18,6),
    "autoPostingEnabled" BOOLEAN,
    "allowFuturePeriodPost" BOOLEAN,
    "allowClosedPeriodPost" BOOLEAN,
    "autoCreatePeriods" BOOLEAN,
    "periodLockDays" INTEGER,
    "accountCodeFormat" TEXT,
    "accountCodeLength" INTEGER,
    "accountCodeSeparator" TEXT,
    "consolidationAccountMapping" JSONB,
    "retainAuditDays" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "GLConfigurationSubAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GLConfigurationSubAccount_subAccountId_key" ON "finance"."GLConfigurationSubAccount"("subAccountId");

-- CreateIndex
CREATE INDEX "GLConfigurationSubAccount_subAccountId_idx" ON "finance"."GLConfigurationSubAccount"("subAccountId");

-- CreateIndex
CREATE INDEX "GLConfigurationSubAccount_agencyConfigId_idx" ON "finance"."GLConfigurationSubAccount"("agencyConfigId");

-- AddForeignKey
ALTER TABLE "finance"."GLConfigurationSubAccount" ADD CONSTRAINT "GLConfigurationSubAccount_subAccountId_fkey" FOREIGN KEY ("subAccountId") REFERENCES "SubAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance"."GLConfigurationSubAccount" ADD CONSTRAINT "GLConfigurationSubAccount_agencyConfigId_fkey" FOREIGN KEY ("agencyConfigId") REFERENCES "finance"."GLConfiguration"("id") ON DELETE SET NULL ON UPDATE CASCADE;
