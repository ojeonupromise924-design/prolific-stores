-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."CartStatus" AS ENUM ('ACTIVE', 'CONVERTED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "public"."FinancialAccountOwnerType" AS ENUM ('PLATFORM', 'SYSTEM', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "public"."FinancialAccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');

-- CreateEnum
CREATE TYPE "public"."FinancialTransactionStatus" AS ENUM ('PENDING', 'POSTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."FinancialTransactionType" AS ENUM ('PAYMENT_CAPTURE', 'TRANSFER', 'ADJUSTMENT', 'REVERSAL');

-- CreateEnum
CREATE TYPE "public"."GiftReservationStatus" AS ENUM ('RESERVED', 'COMPLETED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "public"."PayoutStatus" AS ENUM ('PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED', 'FAILED', 'REVERSED');

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('CUSTOMER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "public"."SettlementCycle" AS ENUM ('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "public"."SettlementStatus" AS ENUM ('PENDING', 'ELIGIBLE', 'PROCESSING', 'COMPLETED', 'FAILED', 'ON_HOLD', 'REVERSED');

-- CreateEnum
CREATE TYPE "public"."WalletTransactionType" AS ENUM ('TOPUP', 'PAYMENT', 'REFUND', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT');

-- CreateEnum
CREATE TYPE "public"."WishlistItemStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'GIFTED');

-- CreateEnum
CREATE TYPE "public"."WishlistOccasion" AS ENUM ('GENERAL', 'BIRTHDAY', 'WEDDING', 'ANNIVERSARY', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."WishlistType" AS ENUM ('PRIVATE', 'SHARED');

-- CreateEnum
CREATE TYPE "public"."WishlistVisibility" AS ENUM ('PRIVATE', 'LINK_ONLY');

-- CreateTable
CREATE TABLE "public"."Cart" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "status" "public"."CartStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "guestToken" TEXT,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CartItem" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "giftReservationId" TEXT,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FinancialAccount" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."FinancialAccountType" NOT NULL,
    "ownerType" "public"."FinancialAccountOwnerType" NOT NULL DEFAULT 'PLATFORM',
    "ownerId" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT,

    CONSTRAINT "FinancialAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FinancialTransaction" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "type" "public"."FinancialTransactionType" NOT NULL,
    "status" "public"."FinancialTransactionStatus" NOT NULL DEFAULT 'PENDING',
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
CREATE TABLE "public"."GiftReservation" (
    "id" TEXT NOT NULL,
    "wishlistItemId" TEXT NOT NULL,
    "buyerId" TEXT,
    "orderId" TEXT,
    "status" "public"."GiftReservationStatus" NOT NULL DEFAULT 'RESERVED',
    "reservedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "GiftReservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LedgerEntry" (
    "id" TEXT NOT NULL,
    "financialTransactionId" TEXT NOT NULL,
    "financialAccountId" TEXT NOT NULL,
    "debit" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "credit" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "memo" TEXT,
    "lineNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal" DECIMAL(10,2) NOT NULL,
    "shippingFee" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT,
    "paystackRef" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "variantName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "giftReservationId" TEXT,
    "sellerId" TEXT,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "paystackRef" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "gatewayResponse" JSONB,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PaymentAttempt" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "paystackRef" TEXT,
    "amount" DECIMAL(18,2) NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL,
    "failureCode" TEXT,
    "failureMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PayoutBatch" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "totalAmount" DECIMAL(18,2) NOT NULL,
    "sellerCount" INTEGER NOT NULL,
    "payoutCount" INTEGER NOT NULL,
    "status" "public"."PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayoutBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT,
    "sku" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "comparePrice" DECIMAL(10,2),
    "image" TEXT,
    "brand" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sellerId" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "altText" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "comparePrice" DECIMAL(10,2),
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Review" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT NOT NULL,
    "isVerifiedPurchase" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Seller" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "businessEmail" TEXT NOT NULL,
    "businessPhone" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "commissionRate" DECIMAL(5,4) NOT NULL DEFAULT 0.10,
    "settlementCycle" "public"."SettlementCycle" NOT NULL DEFAULT 'WEEKLY',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Seller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SellerBalance" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "pendingAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "availableAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "paidAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SellerPayout" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "batchId" TEXT,
    "amount" DECIMAL(18,2) NOT NULL,
    "status" "public"."PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT,
    "providerReference" TEXT,
    "failureReason" TEXT,
    "requestedAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerPayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SellerSettlement" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "orderId" TEXT,
    "grossAmount" DECIMAL(18,2) NOT NULL,
    "commission" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "platformFee" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "refunds" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "adjustments" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "netAmount" DECIMAL(18,2) NOT NULL,
    "status" "public"."SettlementStatus" NOT NULL DEFAULT 'PENDING',
    "eligibleAt" TIMESTAMP(3),
    "settledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerSettlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "refreshToken" TEXT,
    "avatarPublicId" TEXT,
    "avatarUrl" TEXT,
    "googleId" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WalletTransaction" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" "public"."WalletTransactionType" NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "balanceAfter" DECIMAL(18,2) NOT NULL,
    "reference" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Wishlist" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."WishlistType" NOT NULL DEFAULT 'PRIVATE',
    "visibility" "public"."WishlistVisibility" NOT NULL DEFAULT 'PRIVATE',
    "occasion" "public"."WishlistOccasion" NOT NULL DEFAULT 'GENERAL',
    "shareToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WishlistItem" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "status" "public"."WishlistItemStatus" NOT NULL DEFAULT 'AVAILABLE',
    "variantId" TEXT,
    "wishlistId" TEXT NOT NULL,

    CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cart_guestToken_key" ON "public"."Cart"("guestToken" ASC);

-- CreateIndex
CREATE INDEX "Cart_status_idx" ON "public"."Cart"("status" ASC);

-- CreateIndex
CREATE INDEX "Cart_userId_idx" ON "public"."Cart"("userId" ASC);

-- CreateIndex
CREATE INDEX "Cart_userId_status_idx" ON "public"."Cart"("userId" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "CartItem_cartId_idx" ON "public"."CartItem"("cartId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_variantId_giftReservationId_key" ON "public"."CartItem"("cartId" ASC, "variantId" ASC, "giftReservationId" ASC);

-- CreateIndex
CREATE INDEX "CartItem_variantId_idx" ON "public"."CartItem"("variantId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "public"."Category"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "FinancialAccount_code_key" ON "public"."FinancialAccount"("code" ASC);

-- CreateIndex
CREATE INDEX "FinancialAccount_isActive_idx" ON "public"."FinancialAccount"("isActive" ASC);

-- CreateIndex
CREATE INDEX "FinancialAccount_ownerType_ownerId_idx" ON "public"."FinancialAccount"("ownerType" ASC, "ownerId" ASC);

-- CreateIndex
CREATE INDEX "FinancialAccount_type_idx" ON "public"."FinancialAccount"("type" ASC);

-- CreateIndex
CREATE INDEX "FinancialTransaction_createdAt_idx" ON "public"."FinancialTransaction"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "FinancialTransaction_createdByUserId_idx" ON "public"."FinancialTransaction"("createdByUserId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "FinancialTransaction_idempotencyKey_key" ON "public"."FinancialTransaction"("idempotencyKey" ASC);

-- CreateIndex
CREATE INDEX "FinancialTransaction_orderId_idx" ON "public"."FinancialTransaction"("orderId" ASC);

-- CreateIndex
CREATE INDEX "FinancialTransaction_postedAt_idx" ON "public"."FinancialTransaction"("postedAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "FinancialTransaction_reference_key" ON "public"."FinancialTransaction"("reference" ASC);

-- CreateIndex
CREATE INDEX "FinancialTransaction_reversesTransactionId_idx" ON "public"."FinancialTransaction"("reversesTransactionId" ASC);

-- CreateIndex
CREATE INDEX "FinancialTransaction_status_idx" ON "public"."FinancialTransaction"("status" ASC);

-- CreateIndex
CREATE INDEX "FinancialTransaction_type_idx" ON "public"."FinancialTransaction"("type" ASC);

-- CreateIndex
CREATE INDEX "GiftReservation_status_idx" ON "public"."GiftReservation"("status" ASC);

-- CreateIndex
CREATE INDEX "GiftReservation_wishlistItemId_idx" ON "public"."GiftReservation"("wishlistItemId" ASC);

-- CreateIndex
CREATE INDEX "LedgerEntry_createdAt_idx" ON "public"."LedgerEntry"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "LedgerEntry_financialAccountId_idx" ON "public"."LedgerEntry"("financialAccountId" ASC);

-- CreateIndex
CREATE INDEX "LedgerEntry_financialTransactionId_idx" ON "public"."LedgerEntry"("financialTransactionId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "LedgerEntry_financialTransactionId_lineNumber_key" ON "public"."LedgerEntry"("financialTransactionId" ASC, "lineNumber" ASC);

-- CreateIndex
CREATE INDEX "Order_paystackRef_idx" ON "public"."Order"("paystackRef" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Order_paystackRef_key" ON "public"."Order"("paystackRef" ASC);

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "public"."Order"("status" ASC);

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "public"."Order"("userId" ASC);

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "public"."OrderItem"("orderId" ASC);

-- CreateIndex
CREATE INDEX "OrderItem_sellerId_idx" ON "public"."OrderItem"("sellerId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderId_key" ON "public"."Payment"("orderId" ASC);

-- CreateIndex
CREATE INDEX "Payment_paidAt_idx" ON "public"."Payment"("paidAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paystackRef_key" ON "public"."Payment"("paystackRef" ASC);

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "public"."Payment"("status" ASC);

-- CreateIndex
CREATE INDEX "PaymentAttempt_paymentId_idx" ON "public"."PaymentAttempt"("paymentId" ASC);

-- CreateIndex
CREATE INDEX "PaymentAttempt_paystackRef_idx" ON "public"."PaymentAttempt"("paystackRef" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAttempt_paystackRef_key" ON "public"."PaymentAttempt"("paystackRef" ASC);

-- CreateIndex
CREATE INDEX "PayoutBatch_createdAt_idx" ON "public"."PayoutBatch"("createdAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "PayoutBatch_reference_key" ON "public"."PayoutBatch"("reference" ASC);

-- CreateIndex
CREATE INDEX "PayoutBatch_status_idx" ON "public"."PayoutBatch"("status" ASC);

-- CreateIndex
CREATE INDEX "Product_sellerId_idx" ON "public"."Product"("sellerId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "public"."Product"("sku" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "public"."Product"("slug" ASC);

-- CreateIndex
CREATE INDEX "ProductVariant_productId_idx" ON "public"."ProductVariant"("productId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "public"."ProductVariant"("sku" ASC);

-- CreateIndex
CREATE INDEX "Review_productId_idx" ON "public"."Review"("productId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Review_productId_userId_key" ON "public"."Review"("productId" ASC, "userId" ASC);

-- CreateIndex
CREATE INDEX "Seller_isActive_idx" ON "public"."Seller"("isActive" ASC);

-- CreateIndex
CREATE INDEX "Seller_isVerified_idx" ON "public"."Seller"("isVerified" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Seller_userId_key" ON "public"."Seller"("userId" ASC);

-- CreateIndex
CREATE INDEX "SellerBalance_sellerId_idx" ON "public"."SellerBalance"("sellerId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "SellerBalance_sellerId_key" ON "public"."SellerBalance"("sellerId" ASC);

-- CreateIndex
CREATE INDEX "SellerPayout_batchId_idx" ON "public"."SellerPayout"("batchId" ASC);

-- CreateIndex
CREATE INDEX "SellerPayout_sellerId_idx" ON "public"."SellerPayout"("sellerId" ASC);

-- CreateIndex
CREATE INDEX "SellerPayout_status_idx" ON "public"."SellerPayout"("status" ASC);

-- CreateIndex
CREATE INDEX "SellerSettlement_eligibleAt_idx" ON "public"."SellerSettlement"("eligibleAt" ASC);

-- CreateIndex
CREATE INDEX "SellerSettlement_orderId_idx" ON "public"."SellerSettlement"("orderId" ASC);

-- CreateIndex
CREATE INDEX "SellerSettlement_sellerId_idx" ON "public"."SellerSettlement"("sellerId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "SellerSettlement_sellerId_orderId_key" ON "public"."SellerSettlement"("sellerId" ASC, "orderId" ASC);

-- CreateIndex
CREATE INDEX "SellerSettlement_status_idx" ON "public"."SellerSettlement"("status" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "public"."User"("googleId" ASC);

-- CreateIndex
CREATE INDEX "Wallet_userId_idx" ON "public"."Wallet"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "public"."Wallet"("userId" ASC);

-- CreateIndex
CREATE INDEX "WalletTransaction_createdAt_idx" ON "public"."WalletTransaction"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "WalletTransaction_reference_idx" ON "public"."WalletTransaction"("reference" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "WalletTransaction_reference_key" ON "public"."WalletTransaction"("reference" ASC);

-- CreateIndex
CREATE INDEX "WalletTransaction_type_idx" ON "public"."WalletTransaction"("type" ASC);

-- CreateIndex
CREATE INDEX "WalletTransaction_walletId_idx" ON "public"."WalletTransaction"("walletId" ASC);

-- CreateIndex
CREATE INDEX "Wishlist_customerId_idx" ON "public"."Wishlist"("customerId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_shareToken_key" ON "public"."Wishlist"("shareToken" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_slug_key" ON "public"."Wishlist"("slug" ASC);

-- CreateIndex
CREATE INDEX "WishlistItem_wishlistId_idx" ON "public"."WishlistItem"("wishlistId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "WishlistItem_wishlistId_productId_variantId_key" ON "public"."WishlistItem"("wishlistId" ASC, "productId" ASC, "variantId" ASC);

-- AddForeignKey
ALTER TABLE "public"."Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "public"."Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CartItem" ADD CONSTRAINT "CartItem_giftReservationId_fkey" FOREIGN KEY ("giftReservationId") REFERENCES "public"."GiftReservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CartItem" ADD CONSTRAINT "CartItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "public"."ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FinancialTransaction" ADD CONSTRAINT "FinancialTransaction_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FinancialTransaction" ADD CONSTRAINT "FinancialTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FinancialTransaction" ADD CONSTRAINT "FinancialTransaction_reversesTransactionId_fkey" FOREIGN KEY ("reversesTransactionId") REFERENCES "public"."FinancialTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GiftReservation" ADD CONSTRAINT "GiftReservation_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GiftReservation" ADD CONSTRAINT "GiftReservation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GiftReservation" ADD CONSTRAINT "GiftReservation_wishlistItemId_fkey" FOREIGN KEY ("wishlistItemId") REFERENCES "public"."WishlistItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LedgerEntry" ADD CONSTRAINT "LedgerEntry_financialAccountId_fkey" FOREIGN KEY ("financialAccountId") REFERENCES "public"."FinancialAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LedgerEntry" ADD CONSTRAINT "LedgerEntry_financialTransactionId_fkey" FOREIGN KEY ("financialTransactionId") REFERENCES "public"."FinancialTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_giftReservationId_fkey" FOREIGN KEY ("giftReservationId") REFERENCES "public"."GiftReservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "public"."ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."Seller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Seller" ADD CONSTRAINT "Seller_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SellerBalance" ADD CONSTRAINT "SellerBalance_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."Seller"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SellerPayout" ADD CONSTRAINT "SellerPayout_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."PayoutBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SellerPayout" ADD CONSTRAINT "SellerPayout_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."Seller"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SellerSettlement" ADD CONSTRAINT "SellerSettlement_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SellerSettlement" ADD CONSTRAINT "SellerSettlement_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."Seller"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WalletTransaction" ADD CONSTRAINT "WalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "public"."Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Wishlist" ADD CONSTRAINT "Wishlist_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WishlistItem" ADD CONSTRAINT "WishlistItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WishlistItem" ADD CONSTRAINT "WishlistItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "public"."ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WishlistItem" ADD CONSTRAINT "WishlistItem_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES "public"."Wishlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Custom Rules: enforce exactly one positive value for debit or credit per row.
-- Prisma cannot model CHECK constraints, so these are preserved by hand.
-- Re-append them whenever this baseline is regenerated.
ALTER TABLE "public"."LedgerEntry" ADD CONSTRAINT "LedgerEntry_debit_non_negative" CHECK ("debit" >= 0);
ALTER TABLE "public"."LedgerEntry" ADD CONSTRAINT "LedgerEntry_credit_non_negative" CHECK ("credit" >= 0);
ALTER TABLE "public"."LedgerEntry" ADD CONSTRAINT "LedgerEntry_one_sided_amount" CHECK (
  ("debit" > 0 AND "credit" = 0) OR ("credit" > 0 AND "debit" = 0)
);
