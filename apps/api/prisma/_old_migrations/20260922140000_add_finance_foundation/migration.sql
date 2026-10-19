-- Finance foundation (Phase 1)
-- Double-entry line integrity enforced via CHECKs.
-- Transaction-level balance (sum debit === sum credit) is enforced in application services.

-- CreateEnum
CREATE TYPE "FinancialAccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');

-- CreateEnum
CREATE TYPE "FinancialAccountOwnerType" AS ENUM ('PLATFORM', 'SYSTEM', 'CUSTOMER', 'SELLER', 'RIDER');

-- CreateEnum
CREATE TYPE "FinancialTransactionType" AS ENUM ('PAYMENT_CAPTURE', 'TRANSFER', 'ADJUSTMENT', 'REVERSAL');

-- CreateEnum
CREATE TYPE "FinancialTransactionStatus" AS ENUM ('PENDING', 'POSTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "FinancialAccount" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FinancialAccountType" NOT NULL,
    "ownerType" "FinancialAccountOwnerType" NOT NULL DEFAULT 'PLATFORM',
    "ownerId" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialTransaction" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "type" "FinancialTransactionType" NOT NULL,
    "status" "FinancialTransactionStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "orderId" TEXT,
    "idempotencyKey" TEXT,
    "createdByUserId" TEXT,
    "reversesTransactionId" TEXT,
    "postedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL,
    "financialTransactionId" TEXT NOT NULL,
    "financialAccountId" TEXT NOT NULL,
    "debit" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "credit" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "memo" TEXT,
    "lineNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "LedgerEntry_debit_non_negative" CHECK ("debit" >= 0),
    CONSTRAINT "LedgerEntry_credit_non_negative" CHECK ("credit" >= 0),
    CONSTRAINT "LedgerEntry_one_sided_amount" CHECK (
      ("debit" > 0 AND "credit" = 0) OR ("credit" > 0 AND "debit" = 0)
    )
);

-- CreateIndex
CREATE UNIQUE INDEX "FinancialAccount_code_key" ON "FinancialAccount"("code");

-- CreateIndex
CREATE INDEX "FinancialAccount_ownerType_ownerId_idx" ON "FinancialAccount"("ownerType", "ownerId");

-- CreateIndex
CREATE INDEX "FinancialAccount_type_idx" ON "FinancialAccount"("type");

-- CreateIndex
CREATE INDEX "FinancialAccount_isActive_idx" ON "FinancialAccount"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialTransaction_reference_key" ON "FinancialTransaction"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialTransaction_idempotencyKey_key" ON "FinancialTransaction"("idempotencyKey");

-- CreateIndex
CREATE INDEX "FinancialTransaction_status_idx" ON "FinancialTransaction"("status");

-- CreateIndex
CREATE INDEX "FinancialTransaction_type_idx" ON "FinancialTransaction"("type");

-- CreateIndex
CREATE INDEX "FinancialTransaction_orderId_idx" ON "FinancialTransaction"("orderId");

-- CreateIndex
CREATE INDEX "FinancialTransaction_createdByUserId_idx" ON "FinancialTransaction"("createdByUserId");

-- CreateIndex
CREATE INDEX "FinancialTransaction_reversesTransactionId_idx" ON "FinancialTransaction"("reversesTransactionId");

-- CreateIndex
CREATE INDEX "FinancialTransaction_postedAt_idx" ON "FinancialTransaction"("postedAt");

-- CreateIndex
CREATE INDEX "FinancialTransaction_createdAt_idx" ON "FinancialTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "LedgerEntry_financialTransactionId_idx" ON "LedgerEntry"("financialTransactionId");

-- CreateIndex
CREATE INDEX "LedgerEntry_financialAccountId_idx" ON "LedgerEntry"("financialAccountId");

-- CreateIndex
CREATE INDEX "LedgerEntry_createdAt_idx" ON "LedgerEntry"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LedgerEntry_financialTransactionId_lineNumber_key" ON "LedgerEntry"("financialTransactionId", "lineNumber");

-- AddForeignKey
ALTER TABLE "FinancialTransaction" ADD CONSTRAINT "FinancialTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialTransaction" ADD CONSTRAINT "FinancialTransaction_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialTransaction" ADD CONSTRAINT "FinancialTransaction_reversesTransactionId_fkey" FOREIGN KEY ("reversesTransactionId") REFERENCES "FinancialTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_financialTransactionId_fkey" FOREIGN KEY ("financialTransactionId") REFERENCES "FinancialTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_financialAccountId_fkey" FOREIGN KEY ("financialAccountId") REFERENCES "FinancialAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Custom Rule: Enforce exactly one positive value for debit or credit per row
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "ledger_entry_dc_xor" CHECK (
  ("debit" > 0 AND "credit" = 0) OR ("credit" > 0 AND "debit" = 0)
);
