-- Finance engine: payout <-> settlement wiring, refund ledger link,
-- PaymentAttempt for disbursements, and a dedicated recipient code slot.
--
-- Purely additive: no table is dropped and no existing column is removed.
-- SellerPayout.reference is a new NOT NULL UNIQUE column, safe because the
-- table is empty at the time this migration is applied.

-- AlterEnum
ALTER TYPE "FinancialTransactionType" ADD VALUE 'REFUND';
ALTER TYPE "FinancialTransactionType" ADD VALUE 'PAYOUT';
ALTER TYPE "FinancialTransactionType" ADD VALUE 'SETTLEMENT';

-- AlterEnum
ALTER TYPE "RefundStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "PaymentAttempt" ADD COLUMN     "payoutId" TEXT,
ALTER COLUMN "paymentId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Refund" ADD COLUMN     "financialTransactionId" TEXT;

-- AlterTable
ALTER TABLE "Seller" ADD COLUMN     "recipientCode" TEXT;

-- AlterTable
ALTER TABLE "SellerPayout" ADD COLUMN     "reference" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "SellerPayoutSettlement" (
    "payoutId" TEXT NOT NULL,
    "settlementId" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "SellerPayoutSettlement_pkey" PRIMARY KEY ("payoutId","settlementId")
);

-- CreateIndex
CREATE INDEX "SellerPayoutSettlement_settlementId_idx" ON "SellerPayoutSettlement"("settlementId");

-- CreateIndex
CREATE INDEX "PaymentAttempt_payoutId_idx" ON "PaymentAttempt"("payoutId");

-- CreateIndex
CREATE INDEX "Refund_financialTransactionId_idx" ON "Refund"("financialTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "SellerPayout_reference_key" ON "SellerPayout"("reference");

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_financialTransactionId_fkey" FOREIGN KEY ("financialTransactionId") REFERENCES "FinancialTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "SellerPayout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerPayoutSettlement" ADD CONSTRAINT "SellerPayoutSettlement_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "SellerPayout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerPayoutSettlement" ADD CONSTRAINT "SellerPayoutSettlement_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "SellerSettlement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
