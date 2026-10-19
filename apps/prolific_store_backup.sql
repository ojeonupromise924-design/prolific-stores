--
-- PostgreSQL database dump
--

\restrict L8lgCYNa8BFWFeBq6RPm2wM2UtCgzhyuY7g2myYcdunKmMfQg8iYg9fygEBfVyu

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: CartStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CartStatus" AS ENUM (
    'ACTIVE',
    'CONVERTED',
    'ABANDONED'
);


ALTER TYPE public."CartStatus" OWNER TO postgres;

--
-- Name: FinancialAccountOwnerType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."FinancialAccountOwnerType" AS ENUM (
    'PLATFORM',
    'SYSTEM',
    'CUSTOMER'
);


ALTER TYPE public."FinancialAccountOwnerType" OWNER TO postgres;

--
-- Name: FinancialAccountType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."FinancialAccountType" AS ENUM (
    'ASSET',
    'LIABILITY',
    'EQUITY',
    'REVENUE',
    'EXPENSE'
);


ALTER TYPE public."FinancialAccountType" OWNER TO postgres;

--
-- Name: FinancialTransactionStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."FinancialTransactionStatus" AS ENUM (
    'PENDING',
    'POSTED',
    'CANCELLED'
);


ALTER TYPE public."FinancialTransactionStatus" OWNER TO postgres;

--
-- Name: FinancialTransactionType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."FinancialTransactionType" AS ENUM (
    'PAYMENT_CAPTURE',
    'TRANSFER',
    'ADJUSTMENT',
    'REVERSAL'
);


ALTER TYPE public."FinancialTransactionType" OWNER TO postgres;

--
-- Name: GiftReservationStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."GiftReservationStatus" AS ENUM (
    'RESERVED',
    'COMPLETED',
    'EXPIRED',
    'CANCELLED'
);


ALTER TYPE public."GiftReservationStatus" OWNER TO postgres;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'PAID',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'FAILED'
);


ALTER TYPE public."OrderStatus" OWNER TO postgres;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'SUCCESS',
    'FAILED',
    'CANCELLED',
    'REFUNDED',
    'PARTIALLY_REFUNDED'
);


ALTER TYPE public."PaymentStatus" OWNER TO postgres;

--
-- Name: PayoutStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PayoutStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'PROCESSING',
    'COMPLETED',
    'FAILED',
    'REVERSED'
);


ALTER TYPE public."PayoutStatus" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'CUSTOMER',
    'ADMIN',
    'SUPER_ADMIN'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- Name: SettlementCycle; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SettlementCycle" AS ENUM (
    'DAILY',
    'WEEKLY',
    'BIWEEKLY',
    'MONTHLY'
);


ALTER TYPE public."SettlementCycle" OWNER TO postgres;

--
-- Name: SettlementStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SettlementStatus" AS ENUM (
    'PENDING',
    'ELIGIBLE',
    'PROCESSING',
    'COMPLETED',
    'FAILED',
    'ON_HOLD',
    'REVERSED'
);


ALTER TYPE public."SettlementStatus" OWNER TO postgres;

--
-- Name: WalletTransactionType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."WalletTransactionType" AS ENUM (
    'TOPUP',
    'PAYMENT',
    'REFUND',
    'ADJUSTMENT',
    'TRANSFER_IN',
    'TRANSFER_OUT'
);


ALTER TYPE public."WalletTransactionType" OWNER TO postgres;

--
-- Name: WishlistItemStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."WishlistItemStatus" AS ENUM (
    'AVAILABLE',
    'RESERVED',
    'GIFTED'
);


ALTER TYPE public."WishlistItemStatus" OWNER TO postgres;

--
-- Name: WishlistOccasion; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."WishlistOccasion" AS ENUM (
    'GENERAL',
    'BIRTHDAY',
    'WEDDING',
    'ANNIVERSARY',
    'OTHER'
);


ALTER TYPE public."WishlistOccasion" OWNER TO postgres;

--
-- Name: WishlistType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."WishlistType" AS ENUM (
    'PRIVATE',
    'SHARED'
);


ALTER TYPE public."WishlistType" OWNER TO postgres;

--
-- Name: WishlistVisibility; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."WishlistVisibility" AS ENUM (
    'PRIVATE',
    'LINK_ONLY'
);


ALTER TYPE public."WishlistVisibility" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Cart; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Cart" (
    id text NOT NULL,
    "userId" text,
    status public."CartStatus" DEFAULT 'ACTIVE'::public."CartStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "guestToken" text
);


ALTER TABLE public."Cart" OWNER TO postgres;

--
-- Name: CartItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CartItem" (
    id text NOT NULL,
    "cartId" text NOT NULL,
    "variantId" text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "giftReservationId" text
);


ALTER TABLE public."CartItem" OWNER TO postgres;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    image text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."Category" OWNER TO postgres;

--
-- Name: FinancialAccount; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FinancialAccount" (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    type public."FinancialAccountType" NOT NULL,
    "ownerType" public."FinancialAccountOwnerType" DEFAULT 'PLATFORM'::public."FinancialAccountOwnerType" NOT NULL,
    "ownerId" text,
    currency text DEFAULT 'NGN'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    description text
);


ALTER TABLE public."FinancialAccount" OWNER TO postgres;

--
-- Name: FinancialTransaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FinancialTransaction" (
    id text NOT NULL,
    reference text NOT NULL,
    type public."FinancialTransactionType" NOT NULL,
    status public."FinancialTransactionStatus" DEFAULT 'PENDING'::public."FinancialTransactionStatus" NOT NULL,
    description text,
    "orderId" text,
    "idempotencyKey" text,
    "createdByUserId" text,
    "reversesTransactionId" text,
    "postedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."FinancialTransaction" OWNER TO postgres;

--
-- Name: GiftReservation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."GiftReservation" (
    id text NOT NULL,
    "wishlistItemId" text NOT NULL,
    "buyerId" text,
    "orderId" text,
    status public."GiftReservationStatus" DEFAULT 'RESERVED'::public."GiftReservationStatus" NOT NULL,
    "reservedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "completedAt" timestamp(3) without time zone
);


ALTER TABLE public."GiftReservation" OWNER TO postgres;

--
-- Name: LedgerEntry; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."LedgerEntry" (
    id text NOT NULL,
    "financialTransactionId" text NOT NULL,
    "financialAccountId" text NOT NULL,
    debit numeric(18,2) DEFAULT 0 NOT NULL,
    credit numeric(18,2) DEFAULT 0 NOT NULL,
    memo text,
    "lineNumber" integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "LedgerEntry_credit_non_negative" CHECK ((credit >= (0)::numeric)),
    CONSTRAINT "LedgerEntry_debit_non_negative" CHECK ((debit >= (0)::numeric)),
    CONSTRAINT "LedgerEntry_one_sided_amount" CHECK ((((debit > (0)::numeric) AND (credit = (0)::numeric)) OR ((credit > (0)::numeric) AND (debit = (0)::numeric))))
);


ALTER TABLE public."LedgerEntry" OWNER TO postgres;

--
-- Name: Order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "userId" text NOT NULL,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    "shippingFee" numeric(10,2) NOT NULL,
    total numeric(10,2) NOT NULL,
    "fullName" text NOT NULL,
    phone text NOT NULL,
    "addressLine1" text NOT NULL,
    "addressLine2" text,
    city text NOT NULL,
    state text NOT NULL,
    "postalCode" text,
    "paystackRef" text,
    "paidAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Order" OWNER TO postgres;

--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OrderItem" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "variantId" text NOT NULL,
    "productName" text NOT NULL,
    "variantName" text NOT NULL,
    quantity integer NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "giftReservationId" text,
    "sellerId" text
);


ALTER TABLE public."OrderItem" OWNER TO postgres;

--
-- Name: Payment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Payment" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "paystackRef" text NOT NULL,
    amount numeric(18,2) NOT NULL,
    currency text DEFAULT 'NGN'::text NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "gatewayResponse" jsonb,
    "paidAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Payment" OWNER TO postgres;

--
-- Name: PaymentAttempt; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PaymentAttempt" (
    id text NOT NULL,
    "paymentId" text NOT NULL,
    "paystackRef" text,
    amount numeric(18,2) NOT NULL,
    status public."PaymentStatus" NOT NULL,
    "failureCode" text,
    "failureMessage" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PaymentAttempt" OWNER TO postgres;

--
-- Name: PayoutBatch; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PayoutBatch" (
    id text NOT NULL,
    reference text NOT NULL,
    "totalAmount" numeric(18,2) NOT NULL,
    "sellerCount" integer NOT NULL,
    "payoutCount" integer NOT NULL,
    status public."PayoutStatus" DEFAULT 'PENDING'::public."PayoutStatus" NOT NULL,
    "approvedById" text,
    "approvedAt" timestamp(3) without time zone,
    "processedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PayoutBatch" OWNER TO postgres;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text NOT NULL,
    "shortDescription" text,
    sku text NOT NULL,
    price numeric(10,2) NOT NULL,
    "comparePrice" numeric(10,2),
    image text,
    brand text,
    "isFeatured" boolean DEFAULT false NOT NULL,
    "isPublished" boolean DEFAULT false NOT NULL,
    "categoryId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "sellerId" text
);


ALTER TABLE public."Product" OWNER TO postgres;

--
-- Name: ProductImage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductImage" (
    id text NOT NULL,
    url text NOT NULL,
    "publicId" text NOT NULL,
    "altText" text,
    "isPrimary" boolean DEFAULT false NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    "productId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProductImage" OWNER TO postgres;

--
-- Name: ProductVariant; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductVariant" (
    id text NOT NULL,
    "productId" text NOT NULL,
    name text NOT NULL,
    sku text NOT NULL,
    price numeric(10,2) NOT NULL,
    "comparePrice" numeric(10,2),
    stock integer DEFAULT 0 NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProductVariant" OWNER TO postgres;

--
-- Name: Review; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Review" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "userId" text NOT NULL,
    rating integer NOT NULL,
    title text,
    comment text NOT NULL,
    "isVerifiedPurchase" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Review" OWNER TO postgres;

--
-- Name: Seller; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Seller" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "businessName" text NOT NULL,
    "businessEmail" text NOT NULL,
    "businessPhone" text NOT NULL,
    "bankName" text NOT NULL,
    "accountNumber" text NOT NULL,
    "accountName" text NOT NULL,
    "commissionRate" numeric(5,4) DEFAULT 0.10 NOT NULL,
    "settlementCycle" public."SettlementCycle" DEFAULT 'WEEKLY'::public."SettlementCycle" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Seller" OWNER TO postgres;

--
-- Name: SellerBalance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SellerBalance" (
    id text NOT NULL,
    "sellerId" text NOT NULL,
    "pendingAmount" numeric(18,2) DEFAULT 0 NOT NULL,
    "availableAmount" numeric(18,2) DEFAULT 0 NOT NULL,
    "paidAmount" numeric(18,2) DEFAULT 0 NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SellerBalance" OWNER TO postgres;

--
-- Name: SellerPayout; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SellerPayout" (
    id text NOT NULL,
    "sellerId" text NOT NULL,
    "batchId" text,
    amount numeric(18,2) NOT NULL,
    status public."PayoutStatus" DEFAULT 'PENDING'::public."PayoutStatus" NOT NULL,
    provider text,
    "providerReference" text,
    "failureReason" text,
    "requestedAt" timestamp(3) without time zone,
    "processedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SellerPayout" OWNER TO postgres;

--
-- Name: SellerSettlement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SellerSettlement" (
    id text NOT NULL,
    "sellerId" text NOT NULL,
    "orderId" text,
    "grossAmount" numeric(18,2) NOT NULL,
    commission numeric(18,2) DEFAULT 0 NOT NULL,
    "platformFee" numeric(18,2) DEFAULT 0 NOT NULL,
    refunds numeric(18,2) DEFAULT 0 NOT NULL,
    adjustments numeric(18,2) DEFAULT 0 NOT NULL,
    "netAmount" numeric(18,2) NOT NULL,
    status public."SettlementStatus" DEFAULT 'PENDING'::public."SettlementStatus" NOT NULL,
    "eligibleAt" timestamp(3) without time zone,
    "settledAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SellerSettlement" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    email text NOT NULL,
    password text,
    role public."Role" DEFAULT 'CUSTOMER'::public."Role" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "emailVerified" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "lastLogin" timestamp(3) without time zone,
    "refreshToken" text,
    "avatarPublicId" text,
    "avatarUrl" text,
    "googleId" text,
    "resetToken" text,
    "resetTokenExpiry" timestamp(3) without time zone
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: Wallet; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Wallet" (
    id text NOT NULL,
    "userId" text NOT NULL,
    balance numeric(18,2) DEFAULT 0 NOT NULL,
    currency text DEFAULT 'NGN'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Wallet" OWNER TO postgres;

--
-- Name: WalletTransaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WalletTransaction" (
    id text NOT NULL,
    "walletId" text NOT NULL,
    type public."WalletTransactionType" NOT NULL,
    amount numeric(18,2) NOT NULL,
    "balanceAfter" numeric(18,2) NOT NULL,
    reference text NOT NULL,
    description text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."WalletTransaction" OWNER TO postgres;

--
-- Name: Wishlist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Wishlist" (
    id text NOT NULL,
    "customerId" text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    type public."WishlistType" DEFAULT 'PRIVATE'::public."WishlistType" NOT NULL,
    visibility public."WishlistVisibility" DEFAULT 'PRIVATE'::public."WishlistVisibility" NOT NULL,
    occasion public."WishlistOccasion" DEFAULT 'GENERAL'::public."WishlistOccasion" NOT NULL,
    "shareToken" text,
    "expiresAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Wishlist" OWNER TO postgres;

--
-- Name: WishlistItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WishlistItem" (
    id text NOT NULL,
    "productId" text NOT NULL,
    "addedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes text,
    priority integer DEFAULT 0 NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    status public."WishlistItemStatus" DEFAULT 'AVAILABLE'::public."WishlistItemStatus" NOT NULL,
    "variantId" text,
    "wishlistId" text NOT NULL
);


ALTER TABLE public."WishlistItem" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: Cart; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Cart" (id, "userId", status, "createdAt", "updatedAt", "guestToken") FROM stdin;
1aee0431-e648-4f6f-a34b-fc8ab89269cb	\N	CONVERTED	2026-09-07 21:48:29.102	2026-09-07 21:49:02.288	\N
940e7b23-fe04-4baa-a01d-63d1a2651163	\N	CONVERTED	2026-09-08 15:54:38.615	2026-09-08 15:56:56.914	\N
77c824a7-26fa-4d08-b4cc-d050552eaa15	\N	CONVERTED	2026-09-08 17:59:55.787	2026-09-08 18:00:50.681	\N
13044b5e-7e2a-49b5-b389-1e6abf9d5f50	f4d1888f-32ef-41a0-9f75-9ad57390495f	ACTIVE	2026-09-10 03:35:39.626	2026-09-10 03:35:39.626	\N
2dc7cfc9-108b-4767-a92c-c04ebc8edf26	1e9f2a20-b428-45ad-bf16-c3e427a0a5ef	ACTIVE	2026-09-10 18:46:17.55	2026-09-10 18:46:17.55	\N
4df42282-6a98-4168-9e24-638bd59af1ea	c59c3c2e-e6c3-4a65-a4c9-cef577edffdb	ACTIVE	2026-09-13 00:09:32.009	2026-09-13 00:09:32.009	\N
adeb55b5-b2f9-4490-9d3b-24219900ce97	\N	CONVERTED	2026-09-13 00:08:45.619	2026-09-13 00:09:32.024	\N
679fe552-b1bf-4678-877d-df4658aafed3	\N	CONVERTED	2026-09-13 15:20:10.637	2026-09-13 15:20:32.968	\N
8ab82d33-f503-4261-b7b3-7d6b2a676c9e	2b6b1553-6d92-4558-bd40-5ae40f153aa1	ACTIVE	2026-09-16 19:42:30.141	2026-09-16 19:42:30.141	\N
3c6209bc-00e6-498e-b4c2-edc20e928db4	\N	CONVERTED	2026-09-19 20:10:08.33	2026-09-19 20:23:04.854	\N
8a119c59-ff0a-4557-8f5a-ea25971aaa74	987aba3b-4018-4fc7-a810-b4c0e9ab58dd	ACTIVE	2026-09-22 13:52:51.037	2026-09-22 13:52:51.037	\N
0d0ad4f5-7ce0-4b70-b77f-a0be3817dc2c	d064c748-cd8b-4d6c-84de-4af2153257e2	ABANDONED	2026-08-28 08:32:55.897	2026-09-29 09:37:20.229	\N
a7ad668b-50e2-46db-8d99-d5cf3a04a2cc	cf4d2016-3415-466b-8ba1-3dbc65ca852e	ABANDONED	2026-08-28 08:38:53.517	2026-09-29 09:37:20.229	\N
c0ae25ad-d895-427a-a5a9-74da662f18a4	cf4d2016-3415-466b-8ba1-3dbc65ca852e	CONVERTED	2026-09-29 09:55:25.379	2026-09-29 23:46:29.854	\N
0c344d8d-ee50-4ec3-bf82-898566113077	cf4d2016-3415-466b-8ba1-3dbc65ca852e	ACTIVE	2026-09-29 23:59:44.591	2026-09-29 23:59:44.591	\N
1babe021-85f1-4ff6-83bc-f84357b719bc	8d6d1ec3-95b8-40a9-b293-503b850a89d0	ACTIVE	2026-09-30 22:06:19.959	2026-09-30 22:06:19.959	\N
fa2640c6-5c38-458f-8d71-39eded245502	378969e1-0f15-4969-bfc4-1e79b4e825a8	ACTIVE	2026-10-01 17:10:43.671	2026-10-01 17:10:43.671	\N
63b161b3-71b3-4ace-817b-26567c99043c	\N	CONVERTED	2026-10-16 23:45:19.428	2026-10-16 23:45:38.899	\N
23149751-0360-4027-838e-a6286846aa70	\N	CONVERTED	2026-08-28 07:47:27.104	2026-08-28 08:32:55.943	\N
08d612e7-1ca9-4fc6-a740-a387f06f42dd	\N	CONVERTED	2026-08-28 08:38:19.242	2026-08-28 08:38:53.535	\N
0b76a2e8-dead-47ff-8fc5-83778ef44cc6	\N	CONVERTED	2026-08-28 10:43:55.361	2026-08-28 10:44:22.029	\N
7e41bb17-b75a-4043-b6d0-9afae04ac4c3	\N	CONVERTED	2026-09-01 00:10:55.849	2026-09-01 00:11:26.682	\N
bbef238e-f80a-4fcd-abf2-8c28e2624abd	\N	CONVERTED	2026-09-01 15:38:03.981	2026-09-01 20:02:59.091	\N
f389bbd8-5ef0-4df6-bd4d-616b37049e24	\N	CONVERTED	2026-09-02 14:07:52.859	2026-09-03 19:30:48.809	\N
7e2a167c-c73b-4d0c-8476-5e4c6a18407c	\N	CONVERTED	2026-09-03 20:37:56.557	2026-09-04 23:24:20.599	\N
cf4abb9d-4e64-4421-9fe4-a31d82dd7e71	\N	CONVERTED	2026-09-05 05:00:49.692	2026-09-05 05:04:11.054	\N
82b5ae02-f276-4bdc-8283-c11e98589509	\N	CONVERTED	2026-09-05 09:55:46.095	2026-09-05 10:11:09.824	\N
97e93a50-4ef4-432b-8c4d-b670854deb1e	\N	CONVERTED	2026-09-05 15:11:12.78	2026-09-05 15:11:36.15	\N
667865eb-a173-4a99-9c78-33b2f4f1c1f3	938d475a-f0ac-4c82-8e73-e2157160f587	ACTIVE	2026-09-05 15:15:41.731	2026-09-05 15:15:41.731	\N
f71ee6da-87a1-4cbc-8aa2-fe1846342326	\N	CONVERTED	2026-09-05 15:13:50.066	2026-09-05 15:15:41.751	\N
3be29afc-42c5-45f3-93a9-79a36b641f6d	\N	CONVERTED	2026-09-05 15:16:22.51	2026-09-05 15:17:03.676	\N
\.


--
-- Data for Name: CartItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CartItem" (id, "cartId", "variantId", quantity, "unitPrice", "createdAt", "updatedAt", "giftReservationId") FROM stdin;
16ec1637-6241-43e6-8900-1e87d6f5ba88	cf4abb9d-4e64-4421-9fe4-a31d82dd7e71	73138993-9f7a-4745-8920-4d3ff06174a1	10	10500.00	2026-09-05 05:00:49.704	2026-09-05 05:02:18.986	\N
2649e60e-72e2-4781-850d-c40f616efeca	940e7b23-fe04-4baa-a01d-63d1a2651163	73138993-9f7a-4745-8920-4d3ff06174a1	1	10500.00	2026-09-08 15:54:38.824	2026-09-08 15:54:38.824	\N
8687b09a-e63c-4d63-9642-fef2c619d263	cf4abb9d-4e64-4421-9fe4-a31d82dd7e71	9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	10	13500.00	2026-09-05 05:00:58.25	2026-09-05 05:02:24.413	\N
9360880e-705f-4d89-a4ac-f3165ced9456	0b76a2e8-dead-47ff-8fc5-83778ef44cc6	4dbf2d8d-dede-48f3-884a-c61554fccce0	3	8500.00	2026-08-28 10:43:55.373	2026-08-28 10:43:58.673	\N
922bca85-24cd-421f-8ec5-efa20ce9fa72	63b161b3-71b3-4ace-817b-26567c99043c	9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	1	13500.00	2026-10-16 23:45:19.526	2026-10-16 23:45:19.526	\N
42c4fce2-80b5-480c-8313-a13c1507ef5d	adeb55b5-b2f9-4490-9d3b-24219900ce97	73138993-9f7a-4745-8920-4d3ff06174a1	1	10500.00	2026-09-13 00:08:45.667	2026-09-13 00:08:45.667	\N
9a16f7e5-56fd-4d33-b76b-2bb548b0de47	679fe552-b1bf-4678-877d-df4658aafed3	51d3437d-b3e0-4216-862e-8f80144e0207	2	50000.00	2026-09-13 15:20:10.774	2026-09-13 15:20:14.391	\N
582179bc-05a1-42cc-99dc-2e362fd51691	adeb55b5-b2f9-4490-9d3b-24219900ce97	9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	1	13500.00	2026-09-13 00:09:01.971	2026-09-13 00:09:01.971	\N
dc1b63b4-1c5a-4708-8091-4ec1bca8d1db	7e41bb17-b75a-4043-b6d0-9afae04ac4c3	73138993-9f7a-4745-8920-4d3ff06174a1	1	10500.00	2026-09-01 00:10:55.878	2026-09-01 00:10:55.878	\N
10eef1e7-1d05-4904-8750-0ba49437b768	bbef238e-f80a-4fcd-abf2-8c28e2624abd	358c9512-170a-4648-a3ce-698d3a62ec2b	2	15500.00	2026-09-01 15:38:45.251	2026-09-01 15:38:57.882	\N
86c802d0-36a5-4e00-9bd9-52c712e078fb	7e2a167c-c73b-4d0c-8476-5e4c6a18407c	23d08d10-805a-4355-9a88-1597f281c8ba	1	8500.00	2026-09-04 23:21:38.661	2026-09-04 23:21:38.661	\N
88b3daeb-173f-467d-98dd-255e3d128072	7e2a167c-c73b-4d0c-8476-5e4c6a18407c	358c9512-170a-4648-a3ce-698d3a62ec2b	1	15500.00	2026-09-04 23:21:50.47	2026-09-04 23:21:50.47	\N
f21a7e90-a05c-4c64-aa76-5d346d8a68e5	7e2a167c-c73b-4d0c-8476-5e4c6a18407c	9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	1	13500.00	2026-09-04 23:22:05.258	2026-09-04 23:22:05.258	\N
4f283da8-7dd1-4186-a2a8-3922ffe4dc92	23149751-0360-4027-838e-a6286846aa70	73138993-9f7a-4745-8920-4d3ff06174a1	3	10500.00	2026-08-28 07:47:27.119	2026-08-28 07:49:57.588	\N
1aed1959-601c-41da-a8e8-ba4638c4ed8c	8ab82d33-f503-4261-b7b3-7d6b2a676c9e	23d08d10-805a-4355-9a88-1597f281c8ba	1	8500.00	2026-09-19 13:07:10.803	2026-09-19 13:07:10.803	26839998-5469-424e-a801-f58dcca3e219
a637b180-4b2b-488c-8a1b-325d0e46a6d4	940e7b23-fe04-4baa-a01d-63d1a2651163	9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	1	13500.00	2026-09-08 15:56:41.148	2026-09-08 15:56:41.148	\N
0b5d31bb-9a68-4e2b-a0e5-e56bd0f34021	3c6209bc-00e6-498e-b4c2-edc20e928db4	4dbf2d8d-dede-48f3-884a-c61554fccce0	1	8500.00	2026-09-19 20:10:08.383	2026-09-19 20:10:08.383	\N
3be8a9c5-27e7-432d-bf0c-7d2a3403d571	f389bbd8-5ef0-4df6-bd4d-616b37049e24	73138993-9f7a-4745-8920-4d3ff06174a1	8	10500.00	2026-09-02 14:07:52.879	2026-09-02 14:27:45.958	\N
b03a79c4-f9e9-4294-abba-0e3b7a129f8f	82b5ae02-f276-4bdc-8283-c11e98589509	73138993-9f7a-4745-8920-4d3ff06174a1	3	10500.00	2026-09-05 09:55:46.121	2026-09-05 10:09:08.738	\N
778136a3-2361-427b-8b95-3f7ade8089cf	23149751-0360-4027-838e-a6286846aa70	4dbf2d8d-dede-48f3-884a-c61554fccce0	3	8500.00	2026-08-28 07:52:47.466	2026-08-28 08:27:19.415	\N
6237971c-40d9-4526-ad22-f5a281aa70ef	97e93a50-4ef4-432b-8c4d-b670854deb1e	9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	1	13500.00	2026-09-05 15:11:12.812	2026-09-05 15:11:12.812	\N
8f5cdbc2-3854-41d7-ba7e-2d218ed73a6f	08d612e7-1ca9-4fc6-a740-a387f06f42dd	4dbf2d8d-dede-48f3-884a-c61554fccce0	1	8500.00	2026-08-28 08:38:19.258	2026-08-28 08:38:19.258	\N
048c60fa-030a-49df-b68f-1840c41236a5	f71ee6da-87a1-4cbc-8aa2-fe1846342326	73138993-9f7a-4745-8920-4d3ff06174a1	1	10500.00	2026-09-05 15:13:50.083	2026-09-05 15:13:50.083	\N
70fe031d-10fe-4a8b-875e-759f8ee6d447	667865eb-a173-4a99-9c78-33b2f4f1c1f3	73138993-9f7a-4745-8920-4d3ff06174a1	1	10500.00	2026-09-05 15:15:41.744	2026-09-05 15:15:41.744	\N
a07bb96d-2b22-446e-a9a9-54be5caf9f36	3be29afc-42c5-45f3-93a9-79a36b641f6d	23d08d10-805a-4355-9a88-1597f281c8ba	1	8500.00	2026-09-05 15:16:22.535	2026-09-05 15:16:22.535	\N
a7c44c00-01e2-4e81-9341-b7634a180bf7	667865eb-a173-4a99-9c78-33b2f4f1c1f3	23d08d10-805a-4355-9a88-1597f281c8ba	1	8500.00	2026-09-05 15:17:03.67	2026-09-05 15:17:03.67	\N
26991a7e-ba5a-42d3-99ce-e6de8993d780	77c824a7-26fa-4d08-b4cc-d050552eaa15	23d08d10-805a-4355-9a88-1597f281c8ba	1	8500.00	2026-09-08 17:59:55.818	2026-09-08 17:59:55.818	\N
1428d4b8-7025-4c53-9abe-12ec6ca8a7e8	77c824a7-26fa-4d08-b4cc-d050552eaa15	9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	1	13500.00	2026-09-08 18:00:03.847	2026-09-08 18:00:03.847	\N
2f8c733f-7dfe-4ecb-ae99-b78d5c00b1db	cf4abb9d-4e64-4421-9fe4-a31d82dd7e71	23d08d10-805a-4355-9a88-1597f281c8ba	10	8500.00	2026-09-05 05:01:06.319	2026-09-05 05:01:09.927	\N
3765b396-a914-44e9-8b74-9f9e59929791	cf4abb9d-4e64-4421-9fe4-a31d82dd7e71	358c9512-170a-4648-a3ce-698d3a62ec2b	10	15500.00	2026-09-05 05:01:13.277	2026-09-05 05:02:00.84	\N
0e46800e-f967-47ba-98e9-1edb64286158	1aee0431-e648-4f6f-a34b-fc8ab89269cb	4dbf2d8d-dede-48f3-884a-c61554fccce0	1	8500.00	2026-09-07 21:48:29.2	2026-09-07 21:48:29.2	\N
743f820d-a542-4023-98ef-0a05a84e568e	c0ae25ad-d895-427a-a5a9-74da662f18a4	358c9512-170a-4648-a3ce-698d3a62ec2b	1	15500.00	2026-09-29 22:32:12.856	2026-09-29 22:32:12.856	\N
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Category" (id, name, slug, image, "createdAt", "updatedAt", description, "isActive") FROM stdin;
63353fef-4dae-40ef-ab96-eb8f86248a2c	Body Creams	lotions	\N	2026-07-05 22:00:56.245	2026-07-12 04:21:58.333	Premium moisturizing creams	t
7c927032-ae10-4d14-940d-f43bc524f289	Hand Creams	hand-creams	\N	2026-07-12 04:39:44.51	2026-07-12 04:39:44.51	Premium moisturizing creams	t
3c895b12-88b2-4a03-a3a1-c40807ebe963	Soap	soap	\N	2026-07-12 05:15:28.719	2026-07-12 05:15:28.719	Soap products	t
4f14a887-1440-459c-8c9f-11e660f7c05f	Cleansers	Cleansers	\N	2026-07-16 04:55:54.561	2026-07-16 04:55:54.561	Face Cleansers	t
32829123-27d1-499b-b9b3-9c4c62c0a6ca	Moisturizers	Moisturizers	\N	2026-07-16 04:57:04.951	2026-07-16 04:57:04.951	Body Moisturizers	t
d93c2f78-3e92-4427-ae74-19945905c7ef	Serums	Serums	\N	2026-07-16 04:59:27.817	2026-07-16 04:59:27.817	Face Serums	t
7e52aecb-4ed0-4f8f-b2c3-452c4601a7df	Essences	Essences	\N	2026-07-16 05:01:06.955	2026-07-16 05:01:06.955	SKin tone	t
50cffa31-e485-45f3-b646-1260ad6de42f	Body Lotions	Body Lotions	\N	2026-07-16 05:02:41.634	2026-07-16 05:02:41.634	Body creame	t
0d5dab61-21c6-4d4f-8d33-0190a26c45ff	Lotions	Lotions	\N	2026-07-16 05:03:01.669	2026-07-16 05:03:01.669	Body creame	t
66dcacac-c2b2-4a56-be2d-e731f3da38b4	Oil	oil	\N	2026-09-12 17:39:31.719	2026-09-12 17:39:31.719	Baby oil	t
\.


--
-- Data for Name: FinancialAccount; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FinancialAccount" (id, code, name, type, "ownerType", "ownerId", currency, "isActive", "createdAt", "updatedAt", description) FROM stdin;
9a4e8577-e1f3-4568-8bc9-fb5d0b71a8fc	5000	Payment Processing Fees	EXPENSE	PLATFORM	\N	NGN	t	2026-09-29 23:43:11.178	2026-10-19 18:43:50.127	\N
71bb726a-b55d-405d-8cf6-ff03ea01a24b	5100	Refunds & Chargebacks	EXPENSE	PLATFORM	\N	NGN	t	2026-09-29 23:43:11.182	2026-10-19 18:43:50.132	\N
51b9247a-a8ae-4a08-976a-10c62791fbed	5200	Rider Payout Expense	EXPENSE	PLATFORM	\N	NGN	f	2026-09-29 23:43:11.186	2026-10-19 18:43:50.137	\N
6c9569e9-9aba-44db-912f-a8e6b87cf9ca	5300	Operational Expenses	EXPENSE	PLATFORM	\N	NGN	f	2026-09-29 23:43:11.192	2026-10-19 18:43:50.142	\N
55c4c390-eb27-483e-8bdc-88a98fb26dc6	1000	Payment Gateway Clearing	ASSET	SYSTEM	\N	NGN	t	2026-09-29 23:43:11.021	2026-10-19 18:43:50.005	\N
210fcdf6-ad71-4dce-a25d-83f145b7a427	1100	Prolific Store Operating Bank	ASSET	PLATFORM	\N	NGN	t	2026-09-29 23:43:11.113	2026-10-19 18:43:50.049	\N
c1bb162d-5d1e-4ac2-87a4-467581dc9de4	1200	Customer Wallet Assets (Contra)	ASSET	SYSTEM	\N	NGN	t	2026-09-29 23:43:11.118	2026-10-19 18:43:50.053	\N
3bf1c3cf-5178-46a5-839c-0057d615ce8e	1300	Seller Commission Receivable	ASSET	SYSTEM	\N	NGN	f	2026-09-29 23:43:11.122	2026-10-19 18:43:50.058	\N
65719e07-3bf2-43c4-a564-0d37e0556112	1400	Rider Delivery Fee Receivable	ASSET	SYSTEM	\N	NGN	f	2026-09-29 23:43:11.126	2026-10-19 18:43:50.063	\N
6663f13c-3ae0-4dd9-a0af-c7412b7636c7	2000	Seller Payables	LIABILITY	SYSTEM	\N	NGN	t	2026-09-29 23:43:11.131	2026-10-19 18:43:50.069	\N
ef70c188-2380-489f-891d-c2bace03aecf	2100	Rider Payables	LIABILITY	SYSTEM	\N	NGN	f	2026-09-29 23:43:11.137	2026-10-19 18:43:50.073	\N
a4ac3869-65b1-41c6-868f-1764f44fcd96	2200	Customer Wallet Balances	LIABILITY	SYSTEM	\N	NGN	t	2026-09-29 23:43:11.143	2026-10-19 18:43:50.082	\N
5487da58-00a8-45ad-9de0-ac07574e2c07	2300	Refund Liability	LIABILITY	SYSTEM	\N	NGN	t	2026-09-29 23:43:11.146	2026-10-19 18:43:50.089	\N
b89b69c9-d219-4ad4-a7c9-354afb8fcb0d	2400	VAT Payable	LIABILITY	SYSTEM	\N	NGN	t	2026-09-29 23:43:11.15	2026-10-19 18:43:50.093	\N
3e0928bc-f2ea-40e5-a0ec-95e1fec93699	4000	Commission Revenue	REVENUE	PLATFORM	\N	NGN	t	2026-09-29 23:43:11.155	2026-10-19 18:43:50.098	\N
1ec04715-8f6f-4c81-88c8-b37d3e22efb9	4100	Service Fee Revenue	REVENUE	PLATFORM	\N	NGN	t	2026-09-29 23:43:11.16	2026-10-19 18:43:50.102	\N
b3bffe4f-53cb-48d8-b99b-19862a5df25a	4200	Delivery Revenue (Platform Share)	REVENUE	PLATFORM	\N	NGN	t	2026-09-29 23:43:11.164	2026-10-19 18:43:50.109	\N
859de04c-f9df-4eb4-a6b7-e02175c08dfd	4300	Wallet Transaction Fees	REVENUE	PLATFORM	\N	NGN	f	2026-09-29 23:43:11.169	2026-10-19 18:43:50.114	\N
def9c57d-2f52-4354-bf7f-96b01d5245fb	4400	Product Sales Revenue	REVENUE	PLATFORM	\N	NGN	t	2026-10-19 13:42:51.123	2026-10-19 18:43:50.121	\N
cd69f33d-84ca-4b21-aa69-aa570f1df8da	4500	Shipping Revenue	REVENUE	PLATFORM	\N	NGN	t	2026-10-19 13:42:51.137	2026-10-19 18:43:50.124	\N
\.


--
-- Data for Name: FinancialTransaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FinancialTransaction" (id, reference, type, status, description, "orderId", "idempotencyKey", "createdByUserId", "reversesTransactionId", "postedAt", "createdAt", "updatedAt") FROM stdin;
7488cec9-2cdf-459b-9c3f-b433949243d3	PAY_CAP_84f4c8788b75d33fcd52	PAYMENT_CAPTURE	POSTED	Payment captured for order 420ba8bf-e2ae-45bb-a66e-7284cd1b933c	420ba8bf-e2ae-45bb-a66e-7284cd1b933c	paystack_84f4c8788b75d33fcd52	cf4d2016-3415-466b-8ba1-3dbc65ca852e	\N	2026-09-29 23:46:29.61	2026-09-29 23:46:29.772	2026-09-29 23:46:29.772
102e79c0-884f-4358-9843-d446f7adf26e	PAY_CAP_a7c6a4f9f7624aed1736	PAYMENT_CAPTURE	POSTED	Payment captured for order f7909357-b95c-4d6f-b432-b494d6fb6418	f7909357-b95c-4d6f-b432-b494d6fb6418	paystack_a7c6a4f9f7624aed1736	cf4d2016-3415-466b-8ba1-3dbc65ca852e	\N	2026-09-30 07:29:43.187	2026-09-30 07:29:43.265	2026-09-30 07:29:43.265
0b83d462-a09b-41e3-9014-43cf4777e2ab	PAY_CAP_f8cd4d65079d1bdaa379	PAYMENT_CAPTURE	POSTED	Payment captured for order bbf1a1d4-0288-4b5d-bfae-74ae6ffb8ecc	bbf1a1d4-0288-4b5d-bfae-74ae6ffb8ecc	paystack_f8cd4d65079d1bdaa379	cf4d2016-3415-466b-8ba1-3dbc65ca852e	\N	2026-09-30 07:30:41.375	2026-09-30 07:30:41.377	2026-09-30 07:30:41.377
208e2636-e605-4a07-a6f1-e1edba9a5e39	PAY_CAP_6e117219dfe87e39b134	PAYMENT_CAPTURE	POSTED	Payment captured for order 5bebd81e-b19c-45b3-88ef-718fb17bfb27	5bebd81e-b19c-45b3-88ef-718fb17bfb27	paystack_6e117219dfe87e39b134	8d6d1ec3-95b8-40a9-b293-503b850a89d0	\N	2026-09-30 22:07:03.308	2026-09-30 22:07:03.442	2026-09-30 22:07:03.442
14b9e4be-8c82-406c-b331-fddeea7a841d	PAY_CAP_9a5223d4cd319865c09a	PAYMENT_CAPTURE	POSTED	Payment captured for order 5d23bd70-8e8a-4e56-997f-6ab0cf53cde4	5d23bd70-8e8a-4e56-997f-6ab0cf53cde4	paystack_9a5223d4cd319865c09a	378969e1-0f15-4969-bfc4-1e79b4e825a8	\N	2026-10-01 17:11:56.053	2026-10-01 17:11:56.305	2026-10-01 17:11:56.305
6dba7683-6b2a-49af-bcd2-1e439d6eab84	PAY_CAP_5c988a3a6819b9bdfb73	PAYMENT_CAPTURE	POSTED	Payment captured for order 640f8316-97eb-4407-9ce1-7aaebd507f9e	640f8316-97eb-4407-9ce1-7aaebd507f9e	paystack_5c988a3a6819b9bdfb73	cf4d2016-3415-466b-8ba1-3dbc65ca852e	\N	2026-10-01 17:21:57.339	2026-10-01 17:21:57.341	2026-10-01 17:21:57.341
3ccfa51f-f6a4-42c0-bce5-64022e4d0c24	WALLET_TOPUP_TOPUP_TEST_001	TRANSFER	POSTED	Wallet top-up for user d064c748-cd8b-4d6c-84de-4af2153257e2	\N	wallet_topup_TOPUP_TEST_001	\N	\N	2026-10-01 17:35:15.012	2026-10-01 17:35:15.125	2026-10-01 17:35:15.125
bd5d9beb-d53a-4094-8327-27d15d719ff8	WALLET_PAY_PAY_TEST_001	TRANSFER	POSTED	Wallet payment by user d064c748-cd8b-4d6c-84de-4af2153257e2	\N	wallet_pay_PAY_TEST_001	\N	\N	2026-10-01 17:41:19.028	2026-10-01 17:41:19.03	2026-10-01 17:41:19.03
c04cb8ce-e258-4a07-87d1-92913531f0fa	WALLET_TOPUP_REFUND_TEST_001	TRANSFER	POSTED	Wallet top-up for user d064c748-cd8b-4d6c-84de-4af2153257e2	\N	wallet_topup_REFUND_TEST_001	\N	\N	2026-10-01 17:55:31.203	2026-10-01 17:55:31.278	2026-10-01 17:55:31.278
03cb84a2-1d78-4543-a273-e6647459b0a3	PAY_CAP_6aaf48a561ed6b7fdb34	PAYMENT_CAPTURE	POSTED	Payment captured for order ecc5a9f8-ab39-4a81-ac6f-c7563391aadd	ecc5a9f8-ab39-4a81-ac6f-c7563391aadd	paystack_6aaf48a561ed6b7fdb34	cf4d2016-3415-466b-8ba1-3dbc65ca852e	\N	2026-10-19 15:04:54.561	2026-10-19 15:04:54.583	2026-10-19 15:04:54.583
18702d2d-3737-4ede-af6b-324aaac87d25	PAY_CAP_72286b21fe1dd8eb1094	PAYMENT_CAPTURE	POSTED	Payment captured for order 873a648f-7dd9-4b7a-b60a-f4a3b482f067	873a648f-7dd9-4b7a-b60a-f4a3b482f067	paystack_72286b21fe1dd8eb1094	f4d1888f-32ef-41a0-9f75-9ad57390495f	\N	2026-10-19 16:01:32.096	2026-10-19 16:01:32.112	2026-10-19 16:01:32.112
dc0a74ec-2544-43a3-89b6-b1509fa285ef	PAY_CAP_492a58e65397eb618bce	PAYMENT_CAPTURE	POSTED	Payment captured for order f87087b3-c85d-4314-bb40-9b732bebf987	f87087b3-c85d-4314-bb40-9b732bebf987	paystack_492a58e65397eb618bce	cf4d2016-3415-466b-8ba1-3dbc65ca852e	\N	2026-10-19 16:09:58.981	2026-10-19 16:09:59.117	2026-10-19 16:09:59.117
\.


--
-- Data for Name: GiftReservation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."GiftReservation" (id, "wishlistItemId", "buyerId", "orderId", status, "reservedAt", "expiresAt", "completedAt") FROM stdin;
abfbf132-910e-454f-8b58-4bcf599fa00e	2b189808-ce4e-487d-ba7d-191d2f5be9a8	f4d1888f-32ef-41a0-9f75-9ad57390495f	8a4345b3-d09a-4966-a8ca-40a28951abb7	COMPLETED	2026-09-19 13:03:21.216	2026-09-20 13:03:21.213	2026-09-19 13:03:52.547
2c11f911-24f5-445d-8d75-c475a7d0b057	65112632-7d99-4657-ba26-649bd9fddc53	f4d1888f-32ef-41a0-9f75-9ad57390495f	84a499e6-10f5-4b9f-8e5e-8f8dc244762d	COMPLETED	2026-09-19 23:46:05.232	2026-09-20 23:46:05.225	2026-09-19 23:46:40.866
37ebb196-d336-4c09-bfa2-da4c053e90c1	927cc0c9-ab67-46c7-b5a1-ccc46b6276c2	f4d1888f-32ef-41a0-9f75-9ad57390495f	e1a1f09e-25c3-4538-9a22-07361dddc643	COMPLETED	2026-09-20 15:08:44.114	2026-09-21 15:08:44.106	2026-09-20 15:09:26.566
b8f2d59f-57f3-4fb3-aa86-eb4e6d6fb319	4bce5791-87e9-4e97-95f1-4195e8234393	f4d1888f-32ef-41a0-9f75-9ad57390495f	e1a1f09e-25c3-4538-9a22-07361dddc643	COMPLETED	2026-09-20 15:08:50.877	2026-09-21 15:08:50.874	2026-09-20 15:09:26.636
26839998-5469-424e-a801-f58dcca3e219	b26c510c-6ef8-46f6-a133-b319672e979f	2b6b1553-6d92-4558-bd40-5ae40f153aa1	\N	EXPIRED	2026-09-19 13:07:10.689	2026-09-20 13:07:10.679	\N
7c128aa1-b339-44a0-bd8e-1dcfe2d52837	33582acf-6f0b-4f81-a720-0b724afa4166	cf4d2016-3415-466b-8ba1-3dbc65ca852e	b98bdec8-17a3-41c2-a199-11c61f00ac2f	COMPLETED	2026-09-19 23:43:35.175	2026-09-20 23:43:35.17	2026-09-21 18:30:03.111
71a7f1b3-9a45-434a-83db-574a658f1060	8c839a48-1583-490e-ad86-f9b6775d3729	cf4d2016-3415-466b-8ba1-3dbc65ca852e	b98bdec8-17a3-41c2-a199-11c61f00ac2f	COMPLETED	2026-09-19 23:43:53.502	2026-09-20 23:43:53.497	2026-09-21 18:30:03.179
e07537b1-6f57-4ab3-8a30-142c29d5b4b6	e20d9b0f-1bc4-4e60-9710-830af97eaeb0	f4d1888f-32ef-41a0-9f75-9ad57390495f	3fde5250-60e9-4736-9016-0db3ff58e2ba	COMPLETED	2026-09-21 18:10:23.692	2026-09-22 18:10:23.677	2026-09-21 18:35:56.487
0511515c-4206-489e-b678-bca27d3419a5	2690f69b-aee9-4935-b0eb-5b2b5443ca66	f4d1888f-32ef-41a0-9f75-9ad57390495f	3fde5250-60e9-4736-9016-0db3ff58e2ba	COMPLETED	2026-09-21 18:34:24.627	2026-09-22 18:34:24.622	2026-09-21 18:35:56.524
7c360906-73b8-4727-a65a-a4ec336e5051	893b7a0d-ce89-4072-9c4c-dc8b492e415f	f4d1888f-32ef-41a0-9f75-9ad57390495f	17b16ff5-95a6-4f4e-b661-c9e6cd3d3cdd	COMPLETED	2026-09-21 18:50:24.522	2026-09-22 18:50:24.507	2026-09-21 18:50:57.947
0e547675-ff0b-4e05-9a6c-dbb32b6f8f9d	a26b2aca-6a96-4d61-8ad8-f52b921f3bd8	cf4d2016-3415-466b-8ba1-3dbc65ca852e	\N	EXPIRED	2026-09-19 23:43:16.276	2026-09-20 23:43:16.267	\N
5f7c263c-eb48-475c-be12-f2fc28a16ddf	7a19c28f-70c6-4721-a0a1-882c95b68c6f	cf4d2016-3415-466b-8ba1-3dbc65ca852e	32f671d6-fcac-4448-bd59-7133fe1d12f1	COMPLETED	2026-09-22 10:15:19.326	2026-09-23 10:15:19.322	2026-09-22 10:16:04.933
892e23ff-2d76-4ef3-993d-ed69de15462d	041d5480-6c39-4f64-b1a4-23604478a824	cf4d2016-3415-466b-8ba1-3dbc65ca852e	32f671d6-fcac-4448-bd59-7133fe1d12f1	COMPLETED	2026-09-22 10:15:26.64	2026-09-23 10:15:26.635	2026-09-22 10:16:04.993
247f529b-992f-44b7-aff5-7d53abff48e7	0d633469-bce4-437a-b2e8-7d452087fc34	987aba3b-4018-4fc7-a810-b4c0e9ab58dd	18adae98-58dd-4dba-abba-9367b0bf93a7	COMPLETED	2026-09-22 13:53:13.896	2026-09-23 13:53:13.882	2026-09-22 13:53:48.21
6984cd1f-92d0-4238-b193-966655ed2bb2	4d966860-f08b-4025-84e2-a425db520c8d	987aba3b-4018-4fc7-a810-b4c0e9ab58dd	18adae98-58dd-4dba-abba-9367b0bf93a7	COMPLETED	2026-09-22 13:52:50.884	2026-09-23 13:52:50.866	2026-09-22 13:53:48.428
79683a28-69a9-49ed-8874-4a5c91a3fe88	8de4250c-ba2c-4081-83c9-2d79b3397e66	987aba3b-4018-4fc7-a810-b4c0e9ab58dd	76a9827f-158e-45c9-b349-fb4d3b091b74	COMPLETED	2026-09-22 13:56:01.562	2026-09-23 13:56:01.557	2026-09-22 13:56:30.053
0d30fb1c-c125-4ce6-9f8a-f917c868b917	78b272cb-3ba0-47b8-a80d-56c7e88ecbcb	987aba3b-4018-4fc7-a810-b4c0e9ab58dd	0e59d4c0-d02c-43ac-88ce-ffde9287898c	COMPLETED	2026-09-22 14:08:38.264	2026-09-23 14:08:38.259	2026-09-22 14:09:06.278
d842088c-fb53-4210-9a36-4f90c8d4b6ec	7f2d1686-6936-411d-8e36-32807a2ce6e8	987aba3b-4018-4fc7-a810-b4c0e9ab58dd	0e59d4c0-d02c-43ac-88ce-ffde9287898c	COMPLETED	2026-09-22 14:08:41.23	2026-09-23 14:08:41.224	2026-09-22 14:09:06.321
384ca33e-37ce-404a-996a-a54bf7e98595	c9f8769d-dc56-4c43-8614-82a0d92b1762	987aba3b-4018-4fc7-a810-b4c0e9ab58dd	0e59d4c0-d02c-43ac-88ce-ffde9287898c	COMPLETED	2026-09-22 14:08:34.643	2026-09-23 14:08:34.633	2026-09-22 14:09:06.355
6fb70e85-84a1-40ef-bd7a-495a56dd7106	dec45747-2242-47f4-882f-666f496681b3	cf4d2016-3415-466b-8ba1-3dbc65ca852e	\N	EXPIRED	2026-09-21 18:11:00.516	2026-09-22 18:11:00.511	\N
a3c78c18-d6da-4875-a403-3926951a77cb	8e5afc4b-6f9d-4b84-a4ac-159597e96f95	f4d1888f-32ef-41a0-9f75-9ad57390495f	\N	EXPIRED	2026-09-21 19:54:11.586	2026-09-22 19:54:11.583	\N
d183cff0-5dfe-478d-a2af-23a0ae4d5b35	0725adde-b8f1-40dd-9dde-7c56191e8c46	f4d1888f-32ef-41a0-9f75-9ad57390495f	\N	EXPIRED	2026-09-21 19:57:21.52	2026-09-22 19:57:21.508	\N
59fb99ee-5f99-4fe6-a788-0c05a8e7cd0f	da5b8636-f4da-4b47-ab10-88c85ec64e80	987aba3b-4018-4fc7-a810-b4c0e9ab58dd	\N	EXPIRED	2026-09-22 14:08:24.754	2026-09-23 14:08:24.748	\N
27e6e0ee-7de5-4cfd-b84a-13a424f81eba	e073353e-6b38-4246-9861-62177f152e20	cf4d2016-3415-466b-8ba1-3dbc65ca852e	640f8316-97eb-4407-9ce1-7aaebd507f9e	COMPLETED	2026-10-01 17:21:29.035	2026-10-02 17:21:29.03	2026-10-01 17:21:57.426
01450662-ad84-4956-921c-2140993241ea	b1d71096-e730-49e6-adbb-1b8aa55a3e7e	cf4d2016-3415-466b-8ba1-3dbc65ca852e	\N	EXPIRED	2026-10-01 17:21:22.037	2026-10-02 17:21:22.033	\N
789890e5-edbd-42ef-bcad-c1ae4e84f9cc	d2ec6dc9-ba8b-4618-9677-155a6da8a16b	f4d1888f-32ef-41a0-9f75-9ad57390495f	\N	RESERVED	2026-10-19 15:57:32.391	2026-10-20 15:57:32.386	\N
c82e9085-6ad5-40cd-82d2-371ccaccd13a	5d14d4ed-968d-4878-b70e-7e8ea61e9ace	f4d1888f-32ef-41a0-9f75-9ad57390495f	873a648f-7dd9-4b7a-b60a-f4a3b482f067	COMPLETED	2026-10-19 15:59:56.172	2026-10-20 15:59:56.168	2026-10-19 16:01:32.185
deeaada0-ddb6-459a-9704-1cc79b912d7f	4a15cc7c-4fd6-4464-9f94-f5b45aa5ae41	f4d1888f-32ef-41a0-9f75-9ad57390495f	873a648f-7dd9-4b7a-b60a-f4a3b482f067	COMPLETED	2026-09-21 19:56:24.375	2026-09-22 19:56:24.372	2026-10-19 16:01:32.245
44a258d9-92f4-41dd-9dae-b003775aa3d9	1f2e009f-fd89-4346-8d64-91dd5ce3ce72	f4d1888f-32ef-41a0-9f75-9ad57390495f	873a648f-7dd9-4b7a-b60a-f4a3b482f067	COMPLETED	2026-09-21 19:58:14.055	2026-09-22 19:58:14.048	2026-10-19 16:01:32.269
ef3eb5f7-508d-402e-b71e-4728416f0e4f	bfca96ad-ec98-4734-b41c-02ab1f9798d6	f4d1888f-32ef-41a0-9f75-9ad57390495f	873a648f-7dd9-4b7a-b60a-f4a3b482f067	COMPLETED	2026-09-22 18:46:24.573	2026-09-23 18:46:24.568	2026-10-19 16:01:32.291
\.


--
-- Data for Name: LedgerEntry; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."LedgerEntry" (id, "financialTransactionId", "financialAccountId", debit, credit, memo, "lineNumber", "createdAt") FROM stdin;
5f5be08b-f8d6-44d5-856b-99168ac0cebe	7488cec9-2cdf-459b-9c3f-b433949243d3	55c4c390-eb27-483e-8bdc-88a98fb26dc6	18500.00	0.00	Paystack capture 84f4c8788b75d33fcd52	1	2026-09-29 23:46:29.772
ccf58266-2253-4d24-95bd-dda43d7a72cf	7488cec9-2cdf-459b-9c3f-b433949243d3	6663f13c-3ae0-4dd9-a0af-c7412b7636c7	0.00	16372.50	Seller net for order 420ba8bf-e2ae-45bb-a66e-7284cd1b933c	2	2026-09-29 23:46:29.772
1a13125f-90cd-462d-a97c-762c8b9fc367	7488cec9-2cdf-459b-9c3f-b433949243d3	3e0928bc-f2ea-40e5-a0ec-95e1fec93699	0.00	1850.00	Commission order 420ba8bf-e2ae-45bb-a66e-7284cd1b933c	3	2026-09-29 23:46:29.772
0b5138e1-5f38-4e27-b9b4-bc8d63556410	7488cec9-2cdf-459b-9c3f-b433949243d3	9a4e8577-e1f3-4568-8bc9-fb5d0b71a8fc	0.00	277.50	Paystack fee 84f4c8788b75d33fcd52	4	2026-09-29 23:46:29.772
5eeba72e-1117-43e6-a108-85cfbcf1cf1c	102e79c0-884f-4358-9843-d446f7adf26e	55c4c390-eb27-483e-8bdc-88a98fb26dc6	68950.00	0.00	Paystack net settlement a7c6a4f9f7624aed1736	1	2026-09-30 07:29:43.265
0244fc29-6f28-4fc9-b42c-b9ca92da7a21	102e79c0-884f-4358-9843-d446f7adf26e	9a4e8577-e1f3-4568-8bc9-fb5d0b71a8fc	1050.00	0.00	Paystack fee a7c6a4f9f7624aed1736	2	2026-09-30 07:29:43.265
7a9ff42f-11b8-4e08-bdbd-bddb14335083	102e79c0-884f-4358-9843-d446f7adf26e	6663f13c-3ae0-4dd9-a0af-c7412b7636c7	0.00	63000.00	Seller net for order f7909357-b95c-4d6f-b432-b494d6fb6418	3	2026-09-30 07:29:43.265
659930b3-d112-4a94-9589-5ec075c15942	102e79c0-884f-4358-9843-d446f7adf26e	3e0928bc-f2ea-40e5-a0ec-95e1fec93699	0.00	7000.00	Commission order f7909357-b95c-4d6f-b432-b494d6fb6418	4	2026-09-30 07:29:43.265
af8f9f68-d7ab-4f1d-87c2-12ca7e6548e9	0b83d462-a09b-41e3-9014-43cf4777e2ab	55c4c390-eb27-483e-8bdc-88a98fb26dc6	16252.50	0.00	Paystack net settlement f8cd4d65079d1bdaa379	1	2026-09-30 07:30:41.377
15e83012-c377-475e-81fe-14e02425352d	0b83d462-a09b-41e3-9014-43cf4777e2ab	9a4e8577-e1f3-4568-8bc9-fb5d0b71a8fc	247.50	0.00	Paystack fee f8cd4d65079d1bdaa379	2	2026-09-30 07:30:41.377
4d5bbe62-4e99-4b9d-b77d-f4766811b6a1	0b83d462-a09b-41e3-9014-43cf4777e2ab	6663f13c-3ae0-4dd9-a0af-c7412b7636c7	0.00	14850.00	Seller net for order bbf1a1d4-0288-4b5d-bfae-74ae6ffb8ecc	3	2026-09-30 07:30:41.377
623cf9b8-798c-4694-9685-05681a433ff6	0b83d462-a09b-41e3-9014-43cf4777e2ab	3e0928bc-f2ea-40e5-a0ec-95e1fec93699	0.00	1650.00	Commission order bbf1a1d4-0288-4b5d-bfae-74ae6ffb8ecc	4	2026-09-30 07:30:41.377
7a8cb44f-38ac-4a9f-9c18-a310535af9bf	208e2636-e605-4a07-a6f1-e1edba9a5e39	55c4c390-eb27-483e-8bdc-88a98fb26dc6	47280.00	0.00	Paystack net settlement 6e117219dfe87e39b134	1	2026-09-30 22:07:03.442
eff87207-b674-4958-92da-e513ae6f2981	208e2636-e605-4a07-a6f1-e1edba9a5e39	9a4e8577-e1f3-4568-8bc9-fb5d0b71a8fc	720.00	0.00	Paystack fee 6e117219dfe87e39b134	2	2026-09-30 22:07:03.442
01a8a403-7a0a-444b-8b9b-eb273080a998	208e2636-e605-4a07-a6f1-e1edba9a5e39	6663f13c-3ae0-4dd9-a0af-c7412b7636c7	0.00	43200.00	Seller net for order 5bebd81e-b19c-45b3-88ef-718fb17bfb27	3	2026-09-30 22:07:03.442
c824be0f-0797-4650-ba0e-6a2c8edfa74f	208e2636-e605-4a07-a6f1-e1edba9a5e39	3e0928bc-f2ea-40e5-a0ec-95e1fec93699	0.00	4800.00	Commission order 5bebd81e-b19c-45b3-88ef-718fb17bfb27	4	2026-09-30 22:07:03.442
38b8d543-633f-4030-bc7d-ba05ed1aabdf	14b9e4be-8c82-406c-b331-fddeea7a841d	55c4c390-eb27-483e-8bdc-88a98fb26dc6	36937.50	0.00	Paystack net settlement 9a5223d4cd319865c09a	1	2026-10-01 17:11:56.305
3cda56f1-837f-4f12-bbab-584f16019f00	14b9e4be-8c82-406c-b331-fddeea7a841d	9a4e8577-e1f3-4568-8bc9-fb5d0b71a8fc	562.50	0.00	Paystack fee 9a5223d4cd319865c09a	2	2026-10-01 17:11:56.305
753b5baa-30ba-4523-87ed-0f38326ac2b8	14b9e4be-8c82-406c-b331-fddeea7a841d	6663f13c-3ae0-4dd9-a0af-c7412b7636c7	0.00	33750.00	Seller net for order 5d23bd70-8e8a-4e56-997f-6ab0cf53cde4	3	2026-10-01 17:11:56.305
8b3f8419-c916-4b9e-847f-be30a0f5ca00	14b9e4be-8c82-406c-b331-fddeea7a841d	3e0928bc-f2ea-40e5-a0ec-95e1fec93699	0.00	3750.00	Commission order 5d23bd70-8e8a-4e56-997f-6ab0cf53cde4	4	2026-10-01 17:11:56.305
46d2ac87-924e-4c0c-bc8a-918301d04497	6dba7683-6b2a-49af-bcd2-1e439d6eab84	55c4c390-eb27-483e-8bdc-88a98fb26dc6	11327.50	0.00	Paystack net settlement 5c988a3a6819b9bdfb73	1	2026-10-01 17:21:57.341
e89a017f-1bde-4b77-a23b-db9a0984a0b4	6dba7683-6b2a-49af-bcd2-1e439d6eab84	9a4e8577-e1f3-4568-8bc9-fb5d0b71a8fc	172.50	0.00	Paystack fee 5c988a3a6819b9bdfb73	2	2026-10-01 17:21:57.341
79f8de94-c354-435b-919b-f2ddc1aa9c47	6dba7683-6b2a-49af-bcd2-1e439d6eab84	6663f13c-3ae0-4dd9-a0af-c7412b7636c7	0.00	10350.00	Seller net for order 640f8316-97eb-4407-9ce1-7aaebd507f9e	3	2026-10-01 17:21:57.341
ed8650cb-786b-4c48-8d8e-071244a5d763	6dba7683-6b2a-49af-bcd2-1e439d6eab84	3e0928bc-f2ea-40e5-a0ec-95e1fec93699	0.00	1150.00	Commission order 640f8316-97eb-4407-9ce1-7aaebd507f9e	4	2026-10-01 17:21:57.341
210beb5a-3187-4b0d-affe-b9e0554a9dfb	3ccfa51f-f6a4-42c0-bce5-64022e4d0c24	c1bb162d-5d1e-4ac2-87a4-467581dc9de4	5000.00	0.00	Top-up TOPUP_TEST_001	1	2026-10-01 17:35:15.125
d2ac9051-8ef2-4001-9873-e592a62f9f10	3ccfa51f-f6a4-42c0-bce5-64022e4d0c24	a4ac3869-65b1-41c6-868f-1764f44fcd96	0.00	5000.00	Liability TOPUP_TEST_001	2	2026-10-01 17:35:15.125
c06faca7-63c4-436d-8d57-5086fe369f89	bd5d9beb-d53a-4094-8327-27d15d719ff8	a4ac3869-65b1-41c6-868f-1764f44fcd96	2000.00	0.00	Payment PAY_TEST_001	1	2026-10-01 17:41:19.03
2a08ed93-f71f-4fd4-a37a-089170f1cf7e	bd5d9beb-d53a-4094-8327-27d15d719ff8	c1bb162d-5d1e-4ac2-87a4-467581dc9de4	0.00	2000.00	Asset reduction PAY_TEST_001	2	2026-10-01 17:41:19.03
5bc899f8-1bd2-4143-898d-5fc4f6bd34a0	c04cb8ce-e258-4a07-87d1-92913531f0fa	c1bb162d-5d1e-4ac2-87a4-467581dc9de4	1000.00	0.00	Top-up REFUND_TEST_001	1	2026-10-01 17:55:31.278
29fe9ae2-444e-483b-8756-e078d5e8f805	c04cb8ce-e258-4a07-87d1-92913531f0fa	a4ac3869-65b1-41c6-868f-1764f44fcd96	0.00	1000.00	Liability REFUND_TEST_001	2	2026-10-01 17:55:31.278
83830220-7eea-4a49-a824-b932531a69bd	03cb84a2-1d78-4543-a273-e6647459b0a3	55c4c390-eb27-483e-8bdc-88a98fb26dc6	16252.50	0.00	Paystack net settlement 6aaf48a561ed6b7fdb34	1	2026-10-19 15:04:54.583
8836cfc8-c350-4a5d-9157-e3d1ac9cab85	03cb84a2-1d78-4543-a273-e6647459b0a3	9a4e8577-e1f3-4568-8bc9-fb5d0b71a8fc	247.50	0.00	Paystack fee 6aaf48a561ed6b7fdb34	2	2026-10-19 15:04:54.583
ea91df1d-e6f7-46c7-8d05-f38420d5d20f	03cb84a2-1d78-4543-a273-e6647459b0a3	def9c57d-2f52-4354-bf7f-96b01d5245fb	0.00	13500.00	Platform product sales order ecc5a9f8-ab39-4a81-ac6f-c7563391aadd	3	2026-10-19 15:04:54.583
3bf5b8d3-95c0-4535-b4b6-93eb67a5585c	03cb84a2-1d78-4543-a273-e6647459b0a3	cd69f33d-84ca-4b21-aa69-aa570f1df8da	0.00	3000.00	Shipping order ecc5a9f8-ab39-4a81-ac6f-c7563391aadd	4	2026-10-19 15:04:54.583
716ba0dd-1ad9-4b33-b38f-64ee6f64f03d	18702d2d-3737-4ede-af6b-324aaac87d25	55c4c390-eb27-483e-8bdc-88a98fb26dc6	68950.00	0.00	Paystack net settlement 72286b21fe1dd8eb1094	1	2026-10-19 16:01:32.112
8796256f-c584-4252-a31e-fd2569e8ac9e	18702d2d-3737-4ede-af6b-324aaac87d25	9a4e8577-e1f3-4568-8bc9-fb5d0b71a8fc	1050.00	0.00	Paystack fee 72286b21fe1dd8eb1094	2	2026-10-19 16:01:32.112
90764e86-3627-4e6e-8dbd-1f4a8e3cad0c	18702d2d-3737-4ede-af6b-324aaac87d25	def9c57d-2f52-4354-bf7f-96b01d5245fb	0.00	70000.00	Platform product sales order 873a648f-7dd9-4b7a-b60a-f4a3b482f067	3	2026-10-19 16:01:32.112
9d097bb6-69ad-4d62-9c39-fac7fd1cfca2	dc0a74ec-2544-43a3-89b6-b1509fa285ef	55c4c390-eb27-483e-8bdc-88a98fb26dc6	16252.50	0.00	Paystack net settlement 492a58e65397eb618bce	1	2026-10-19 16:09:59.117
5f54d782-81bd-4778-9659-a831e139efde	dc0a74ec-2544-43a3-89b6-b1509fa285ef	9a4e8577-e1f3-4568-8bc9-fb5d0b71a8fc	247.50	0.00	Paystack fee 492a58e65397eb618bce	2	2026-10-19 16:09:59.117
1d0de3e6-5d25-4355-bd5a-37f983f61e4d	dc0a74ec-2544-43a3-89b6-b1509fa285ef	def9c57d-2f52-4354-bf7f-96b01d5245fb	0.00	13500.00	Platform product sales order f87087b3-c85d-4314-bb40-9b732bebf987	3	2026-10-19 16:09:59.117
400e8c67-a8ca-4ab5-a410-ffdd86099008	dc0a74ec-2544-43a3-89b6-b1509fa285ef	cd69f33d-84ca-4b21-aa69-aa570f1df8da	0.00	3000.00	Shipping order f87087b3-c85d-4314-bb40-9b732bebf987	4	2026-10-19 16:09:59.117
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Order" (id, "userId", status, subtotal, "shippingFee", total, "fullName", phone, "addressLine1", "addressLine2", city, state, "postalCode", "paystackRef", "paidAt", "createdAt", "updatedAt") FROM stdin;
25feaae0-5f94-4182-9322-1fd205d74e2d	cf4d2016-3415-466b-8ba1-3dbc65ca852e	PAID	10500.00	3000.00	13500.00	Ojeonu Promise	08103818938	49, St finbars College road		Bariga	Lagos	101284	a0cfbd1efeebd0baa613	2026-09-04 23:17:58.451	2026-09-04 23:15:44.943	2026-09-04 23:17:58.457
affe3d0d-f761-47fb-b999-20e94d6b2f20	cf4d2016-3415-466b-8ba1-3dbc65ca852e	PAID	37500.00	0.00	37500.00	Ojeonu Promise	55555555555	49, St finbars College road		Bariga	Lagos	101284	014662d3073ac63367a7	2026-09-04 23:49:01.197	2026-09-04 23:48:13.263	2026-09-04 23:49:01.203
a008d4d0-c868-42a6-9540-1e8286ff5673	cf4d2016-3415-466b-8ba1-3dbc65ca852e	PAID	480000.00	0.00	480000.00	Test Customer	9u97856	49, St finbars College road		Bariga	Lagos	101284	51bbce578e88c2f8b019	2026-09-05 05:07:35.4	2026-09-05 05:06:09.552	2026-09-05 05:07:35.403
04c1576f-95a6-4148-92e3-af8bc9035f2a	cf4d2016-3415-466b-8ba1-3dbc65ca852e	PAID	480000.00	0.00	480000.00	Test Customer	u7t678798	49, St finbars College road		Bariga	Lagos	101284	699b3de88cc0325c9bc2	2026-09-05 05:17:33.285	2026-09-05 05:17:16.279	2026-09-05 05:17:33.287
f655e830-6c35-41ae-b82d-6fa270e2ea70	cf4d2016-3415-466b-8ba1-3dbc65ca852e	CANCELLED	10500.00	2000.00	12500.00	Test Customer	08103818938	49, St finbars College road		Bariga	Lagos	101284	63b57554f900b617c9e1	\N	2026-09-04 23:11:07.685	2026-09-05 16:02:10.061
1d6a6039-155a-4d20-b6dc-575d7fd46a95	cf4d2016-3415-466b-8ba1-3dbc65ca852e	CANCELLED	53500.00	0.00	53500.00	Tests1 Customer	67r7e58	49, St finbars College road		Bariga	Lagos	101284	fca14ebeca514136cfb1	\N	2026-09-05 15:12:28.834	2026-09-05 22:51:47.034
7c259319-d48b-4d4d-816b-76e7a8b8ce1e	cf4d2016-3415-466b-8ba1-3dbc65ca852e	PAID	10500.00	3000.00	13500.00	Tests1 Customer	jhguhio	49, St finbarrs college road		Bariga	Lagos	100223	9deee3282d56a9b4f672	2026-09-12 00:42:27.551	2026-09-12 00:40:10.68	2026-09-12 00:42:27.553
48d30997-f19f-4950-9263-4bb194f46888	cf4d2016-3415-466b-8ba1-3dbc65ca852e	PENDING	296500.00	0.00	296500.00	Tests1 Customer	08103818938	49, St finbarrs college road		Bariga	Lagos	100223	de5a08b4bc9e750eae4c	\N	2026-09-12 17:23:19.608	2026-09-12 17:23:19.608
fd69d72a-7871-4ea5-a193-ea4eef2db4da	cf4d2016-3415-466b-8ba1-3dbc65ca852e	PAID	24000.00	3000.00	27000.00	Tests1 Customer	08199736	49, St finbarrs college road		Bariga	Lagos	100223	2bf8afc96e15a05ef388	2026-09-08 15:58:20.643	2026-09-08 15:57:41.508	2026-09-08 15:58:20.667
92630876-87ad-4901-8a38-971882e77dab	cf4d2016-3415-466b-8ba1-3dbc65ca852e	PAID	22000.00	3000.00	25000.00	Tests1 Customer	08103818938	49, St finbarrs college road		Bariga	Lagos	100223	e2786946ce12109b15ec	2026-09-08 21:26:39.357	2026-09-08 21:22:52.596	2026-09-08 21:26:39.359
57bd0446-275a-446c-a07f-1f479354d740	f4d1888f-32ef-41a0-9f75-9ad57390495f	PAID	48000.00	0.00	48000.00	Gloria  Iyesele	08103818938	49, St finbarrs college road		Bariga	Lagos	100223	2091e8d3addda6296270	2026-09-10 03:36:53.929	2026-09-10 03:36:32.818	2026-09-10 03:36:53.937
150e76ce-8edb-4ebc-93cc-992bce245ebe	cf4d2016-3415-466b-8ba1-3dbc65ca852e	PAID	10500.00	2000.00	12500.00	Promise Ojeonu	08103818938	10 mowowale street 		Bariga	Lagos	101284	9a51d96b37d5c928de6a	2026-09-10 15:38:53.522	2026-09-04 23:12:37.335	2026-09-10 15:38:53.525
bcc079b7-86b5-40e4-a6b9-be938a30997e	1e9f2a20-b428-45ad-bf16-c3e427a0a5ef	PAID	29000.00	0.00	29000.00	Chris  Kelvin	09876543	gcjhkhkloi9u	mhjhukgyikhukyty	Bariga	Lagos	100223	2cac9ce54824ca304bd6	2026-09-10 18:47:40.331	2026-09-10 18:47:10.37	2026-09-10 18:47:40.335
1ee49be9-2122-4794-a73f-79b8a9c5c239	cf4d2016-3415-466b-8ba1-3dbc65ca852e	PAID	15500.00	3000.00	18500.00	Tests1 Customer	34567	49, St finbarrs college road		Bariga	Lagos	100223	65f9250ef21b452beef9	2026-09-11 06:54:11.087	2026-09-11 06:51:45.477	2026-09-11 06:54:11.09
a6994a1d-086a-4f07-8c78-145066055f56	cf4d2016-3415-466b-8ba1-3dbc65ca852e	PENDING	10500.00	3000.00	13500.00	Tests1 Customer	jhguhio	49, St finbarrs college road		Bariga	Lagos	100223	26e240497105b0cf8355	\N	2026-09-12 00:37:23.42	2026-09-12 00:37:23.42
6c5ce208-166f-49fe-94eb-9f19ef39655d	cf4d2016-3415-466b-8ba1-3dbc65ca852e	PENDING	10500.00	3000.00	13500.00	Tests1 Customer	jhguhio	49, St finbarrs college road		Bariga	Lagos	100223	19194b858cc2c05cee11	\N	2026-09-12 00:37:31.581	2026-09-12 00:37:31.581
8f21b0cf-1ec3-4be2-860e-3cd3b2ec0d04	cf4d2016-3415-466b-8ba1-3dbc65ca852e	PENDING	296500.00	0.00	296500.00	Tests1 Customer	08103818938	49, St finbarrs college road		Bariga	Lagos	100223	003989283cf3850a4dcc	\N	2026-09-12 17:23:23.639	2026-09-12 17:23:23.639
f80453cc-2ceb-4dc8-9918-08c085f885c1	cf4d2016-3415-466b-8ba1-3dbc65ca852e	PAID	296500.00	0.00	296500.00	Tests1 Customer	08103818938	49, St finbarrs college road		Bariga	Lagos	100223	273828a6010d39253876	2026-09-12 17:24:46.598	2026-09-12 17:24:20.2	2026-09-12 17:24:46.602
80be5eb4-2a12-4d9b-a9cf-d866cf18ab7d	c59c3c2e-e6c3-4a65-a4c9-cef577edffdb	PAID	24000.00	3000.00	27000.00	kelvin Ojeonu	08103818938	49, St finbarrs college road		Bariga	Lagos	100223	f07caebe2a531157c91a	2026-09-13 00:09:58.359	2026-09-13 00:09:43.393	2026-09-13 00:09:58.366
bae88b4b-4b3b-404f-84dd-fddfe93e6fbc	c59c3c2e-e6c3-4a65-a4c9-cef577edffdb	PAID	192500.00	0.00	192500.00	kelvin Ojeonu	08103818938	49, St finbarrs college road		Bariga	Lagos	100223	f00232d596f46a86294d	2026-09-13 01:30:17.579	2026-09-13 01:30:04.917	2026-09-13 01:30:17.584
ccbdda68-c695-45d9-8b15-a472a689feb4	cf4d2016-3415-466b-8ba1-3dbc65ca852e	PAID	100000.00	0.00	100000.00	Tests1 Customer	08103818938	49, St finbarrs college road		Bariga	Lagos	100223	b64d5dfc31a8e1138365	2026-09-13 15:20:59.29	2026-09-13 15:20:42.639	2026-09-13 15:20:59.302
a410d8ae-f817-4b30-bff6-3f75ce770ec8	2b6b1553-6d92-4558-bd40-5ae40f153aa1	PAID	8500.00	3000.00	11500.00	Ojeonu Promise	08103818938	10 Mowowale street		Bariga	Lagos		99e4cf7b54578a0ebadc	2026-09-16 19:43:46.737	2026-09-16 19:43:26.619	2026-09-16 19:43:46.74
8a4345b3-d09a-4966-a8ca-40a28951abb7	f4d1888f-32ef-41a0-9f75-9ad57390495f	PAID	13500.00	3000.00	16500.00	Gloria  Iyesele	08103818938	49, St finbarrs college road		Bariga	Lagos	100223	1090ed570214aa7495d6	2026-09-19 13:03:52.523	2026-09-19 13:03:36.801	2026-09-19 13:03:52.524
cd0fcc83-9787-47f9-97d7-191e1fec98d5	f4d1888f-32ef-41a0-9f75-9ad57390495f	PENDING	8500.00	3000.00	11500.00	Gloria  Iyesele	08103818938	49, St finbarrs college road		Bariga	Lagos	100223	cc9059a259222f1ff946	\N	2026-09-19 13:30:51.576	2026-09-19 13:30:51.576
84a499e6-10f5-4b9f-8e5e-8f8dc244762d	f4d1888f-32ef-41a0-9f75-9ad57390495f	PAID	24000.00	3000.00	27000.00	Gloria  Iyesele	08103818938	49, St finbarrs college road		Bariga	Lagos	100223	2369eaa3f383e0531823	2026-09-19 23:46:40.839	2026-09-19 23:46:23.579	2026-09-19 23:46:40.841
f8e71891-cc1a-49cf-8f19-b1a75e299a1a	f4d1888f-32ef-41a0-9f75-9ad57390495f	CANCELLED	8500.00	3000.00	11500.00	Gloria  Iyesele	08103818938	49, St finbarrs college road		Bariga	Lagos	100223	067229ca5b41866479c2	\N	2026-09-19 13:30:53.99	2026-09-19 23:47:25.047
e1a1f09e-25c3-4538-9a22-07361dddc643	f4d1888f-32ef-41a0-9f75-9ad57390495f	PAID	22000.00	3000.00	25000.00	Gloria  Iyesele	08103818938	49, St finbarrs college road		Bariga	Lagos	100223	f0650fafa8c775993c7c	2026-09-20 15:09:26.469	2026-09-20 15:09:09.712	2026-09-20 15:09:26.47
856152ab-f10d-4377-ba46-55ae88cafecd	f4d1888f-32ef-41a0-9f75-9ad57390495f	PAID	13500.00	3000.00	16500.00	Gloria  Iyesele	08103818938	49, St finbarrs college road		Bariga	Lagos	100223	629ea2d96127843e9a64	2026-09-20 15:55:45.572	2026-09-20 15:54:58.536	2026-09-20 15:55:45.574
b98bdec8-17a3-41c2-a199-11c61f00ac2f	cf4d2016-3415-466b-8ba1-3dbc65ca852e	PAID	39000.00	0.00	39000.00	Mr P Customer	08103818938	49, St finbarrs college road		Bariga	Lagos	100223	fff1842a5e28304a707a	2026-09-21 18:30:03.091	2026-09-21 18:29:41.406	2026-09-21 18:30:03.094
3fde5250-60e9-4736-9016-0db3ff58e2ba	f4d1888f-32ef-41a0-9f75-9ad57390495f	PAID	32500.00	0.00	32500.00	Gloria  Iyesele	08103818938	49, St finbarrs college road		Bariga	Lagos	100223	22ed968f93a20f3f8330	2026-09-21 18:35:56.441	2026-09-21 18:34:44.403	2026-09-21 18:35:56.444
17b16ff5-95a6-4f4e-b661-c9e6cd3d3cdd	f4d1888f-32ef-41a0-9f75-9ad57390495f	PAID	8500.00	3000.00	11500.00	Gloria  Iyesele	08103818938	49, St finbarrs college road		Bariga	Lagos	100223	fb1e100908054fc28de8	2026-09-21 18:50:57.919	2026-09-21 18:50:44.806	2026-09-21 18:50:57.92
32f671d6-fcac-4448-bd59-7133fe1d12f1	cf4d2016-3415-466b-8ba1-3dbc65ca852e	PAID	54500.00	0.00	54500.00	Mr P Customer	08103818938	49, St finbarrs college road		Bariga	Lagos	100223	3498bce71220936db093	2026-09-22 10:16:04.843	2026-09-22 10:15:46.939	2026-09-22 10:16:04.846
18adae98-58dd-4dba-abba-9367b0bf93a7	987aba3b-4018-4fc7-a810-b4c0e9ab58dd	PAID	73000.00	0.00	73000.00	Ikenna Henry	08103818938	49, St finbarrs college road		Bariga	Lagos	100223	e5f7c1fd9948eb0a69bf	2026-09-22 13:53:48.095	2026-09-22 13:53:30.478	2026-09-22 13:53:48.105
76a9827f-158e-45c9-b349-fb4d3b091b74	987aba3b-4018-4fc7-a810-b4c0e9ab58dd	PAID	8500.00	3000.00	11500.00	Ikenna Henry	08103818938	49, St finbarrs college road		Bariga	Lagos	100223	2bbd7ca2db6d7b7d80dd	2026-09-22 13:56:29.99	2026-09-22 13:56:11.006	2026-09-22 13:56:29.994
0e59d4c0-d02c-43ac-88ce-ffde9287898c	987aba3b-4018-4fc7-a810-b4c0e9ab58dd	PAID	37500.00	0.00	37500.00	Ikenna Henry	08103818938	49, St finbarrs college road		Bariga	Lagos	100223	05af9fe0d68414a4a3ee	2026-09-22 14:09:06.196	2026-09-22 14:08:50.349	2026-09-22 14:09:06.198
c74d36f2-b26b-4da5-bade-3633cbaa0653	cf4d2016-3415-466b-8ba1-3dbc65ca852e	PAID	13500.00	3000.00	16500.00	Mr P Customer	08103818938	49, St finbarrs college road		Bariga	Lagos	100223	f60c39f5dc52c33bf1c9	2026-09-24 20:32:16.52	2026-09-24 20:31:59.012	2026-09-24 20:32:16.522
571347e6-417a-484f-977f-3bef94f6489b	cf4d2016-3415-466b-8ba1-3dbc65ca852e	PAID	10500.00	3000.00	13500.00	Mr P Customer	08103818938	49, St finbarrs college road		Bariga	Lagos	100223	7cc58b69fb7a14efd4cd	2026-09-28 18:56:03.493	2026-09-28 18:55:47.939	2026-09-28 18:56:03.497
c31b0154-0e2f-4a4d-9846-80436f275b72	cf4d2016-3415-466b-8ba1-3dbc65ca852e	PAID	8500.00	3000.00	11500.00	Mr P Customer	08103818938	49, St finbarrs college road		Bariga	Lagos	100223	c8d4294fc8df0e7942e4	2026-09-29 09:55:59.446	2026-09-29 09:55:43.791	2026-09-29 09:55:59.45
5bebd81e-b19c-45b3-88ef-718fb17bfb27	8d6d1ec3-95b8-40a9-b293-503b850a89d0	PAID	48000.00	0.00	48000.00	Meshack  Osakwe 	08103818938	49, St finbarrs college road		ertyugf	Lagos	100223	6e117219dfe87e39b134	2026-09-30 22:07:03.504	2026-09-30 22:06:46.459	2026-09-30 22:07:03.505
420ba8bf-e2ae-45bb-a66e-7284cd1b933c	cf4d2016-3415-466b-8ba1-3dbc65ca852e	PAID	15500.00	3000.00	18500.00	Mr P Customer	08103818938	49, St finbarrs college road		ghvyjbukn	Lagos	100223	84f4c8788b75d33fcd52	2026-09-29 23:46:29.547	2026-09-29 22:32:24.958	2026-09-29 23:46:29.556
33378e31-8f63-4f73-aea5-cb44990dc496	cf4d2016-3415-466b-8ba1-3dbc65ca852e	CANCELLED	27000.00	0.00	27000.00	Mr P Customer	08103818938	49, St finbarrs college road		xvcvj	Lagos	100223	d3f490b53ec4e1d52233	\N	2026-09-30 00:00:01.242	2026-09-30 00:40:36.029
4fdb16ab-c513-4905-a1b5-a361f4dd7163	cf4d2016-3415-466b-8ba1-3dbc65ca852e	PENDING	61500.00	0.00	61500.00	Mr P Customer	08103818938	49, St finbarrs college road		fgghj	Lagos	100223	0d6f837f657d7d0837ac	\N	2026-09-30 00:41:59.6	2026-09-30 00:41:59.6
f7909357-b95c-4d6f-b432-b494d6fb6418	cf4d2016-3415-466b-8ba1-3dbc65ca852e	PAID	70000.00	0.00	70000.00	Mr P Customer	08103818938	49, St finbarrs college road		dfrtyui	Lagos	100223	a7c6a4f9f7624aed1736	2026-09-30 07:29:43.314	2026-09-30 07:28:04.512	2026-09-30 07:29:43.315
bbf1a1d4-0288-4b5d-bfae-74ae6ffb8ecc	cf4d2016-3415-466b-8ba1-3dbc65ca852e	PAID	13500.00	3000.00	16500.00	Mr P Customer	08103818938	49, St finbarrs college road		fghjk	Lagos	100223	f8cd4d65079d1bdaa379	2026-09-30 07:30:41.406	2026-09-30 07:30:31.882	2026-09-30 07:30:41.407
5d23bd70-8e8a-4e56-997f-6ab0cf53cde4	378969e1-0f15-4969-bfc4-1e79b4e825a8	PAID	37500.00	0.00	37500.00	Prince  Ocheme	09136307650	10 dendeke martins  college road		Bariga	Lagos	100223	9a5223d4cd319865c09a	2026-10-01 17:11:56.414	2026-10-01 17:11:41.579	2026-10-01 17:11:56.417
640f8316-97eb-4407-9ce1-7aaebd507f9e	cf4d2016-3415-466b-8ba1-3dbc65ca852e	PAID	8500.00	3000.00	11500.00	Mr P Customer	08103818938	49, St finbarrs college road		sdfhj	Lagos	100223	5c988a3a6819b9bdfb73	2026-10-01 17:21:57.408	2026-10-01 17:21:41.891	2026-10-01 17:21:57.409
ecc5a9f8-ab39-4a81-ac6f-c7563391aadd	cf4d2016-3415-466b-8ba1-3dbc65ca852e	PAID	13500.00	3000.00	16500.00	Mr P Customer	08103818938	49, St finbarrs college road		Bariga	Lagos	100223	6aaf48a561ed6b7fdb34	2026-10-19 15:04:54.487	2026-10-19 15:04:32.449	2026-10-19 15:04:54.488
873a648f-7dd9-4b7a-b60a-f4a3b482f067	f4d1888f-32ef-41a0-9f75-9ad57390495f	PAID	70000.00	0.00	70000.00	Gloria  Iyesele	08103818938	49, St finbarrs college road		Bariga	Lagos	100223	72286b21fe1dd8eb1094	2026-10-19 16:01:32.054	2026-10-19 16:01:18.141	2026-10-19 16:01:32.055
f87087b3-c85d-4314-bb40-9b732bebf987	cf4d2016-3415-466b-8ba1-3dbc65ca852e	PAID	13500.00	3000.00	16500.00	Mr P Customer	08103818938	49, St finbarrs college road		Bariga	Lagos	100223	492a58e65397eb618bce	2026-10-19 16:09:58.932	2026-10-16 23:45:47.749	2026-10-19 16:09:58.933
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrderItem" (id, "orderId", "variantId", "productName", "variantName", quantity, "unitPrice", "createdAt", "giftReservationId", "sellerId") FROM stdin;
62cd920a-c1f6-4066-86d6-1b90c50b7ca0	f655e830-6c35-41ae-b82d-6fa270e2ea70	73138993-9f7a-4745-8920-4d3ff06174a1	CeraVe Hydrating Cleanser	150ml	1	10500.00	2026-09-04 23:11:07.712	\N	\N
eaacac36-44ef-4a40-b018-94770b12f119	150e76ce-8edb-4ebc-93cc-992bce245ebe	73138993-9f7a-4745-8920-4d3ff06174a1	CeraVe Hydrating Cleanser	150ml	1	10500.00	2026-09-04 23:12:37.348	\N	\N
4349ffe4-7a79-46ba-8085-9ae42aa7ed16	25feaae0-5f94-4182-9322-1fd205d74e2d	73138993-9f7a-4745-8920-4d3ff06174a1	CeraVe Hydrating Cleanser	150ml	1	10500.00	2026-09-04 23:15:44.952	\N	\N
11b1b299-4e5c-4c9b-b80a-ac44284ebc74	affe3d0d-f761-47fb-b999-20e94d6b2f20	23d08d10-805a-4355-9a88-1597f281c8ba	E45 Daily Lotion	150ml	1	8500.00	2026-09-04 23:48:13.272	\N	\N
f5b3c5de-95b7-41a2-b227-2378a4c6bef8	affe3d0d-f761-47fb-b999-20e94d6b2f20	358c9512-170a-4648-a3ce-698d3a62ec2b	Bioderma Sensibio H2O Micellar Water	150ml	1	15500.00	2026-09-04 23:48:13.272	\N	\N
eff07e9a-aef7-46c7-993f-168984374543	affe3d0d-f761-47fb-b999-20e94d6b2f20	9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	Aveeno Daily Moisturizing Lotion	150ml	1	13500.00	2026-09-04 23:48:13.272	\N	\N
610e529e-7a0b-4f86-979a-0e9d17a0f9c2	a008d4d0-c868-42a6-9540-1e8286ff5673	73138993-9f7a-4745-8920-4d3ff06174a1	CeraVe Hydrating Cleanser	150ml	10	10500.00	2026-09-05 05:06:09.556	\N	\N
682727e5-0ebe-44b1-ba30-4824d1093818	a008d4d0-c868-42a6-9540-1e8286ff5673	9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	Aveeno Daily Moisturizing Lotion	150ml	10	13500.00	2026-09-05 05:06:09.556	\N	\N
90dc6b14-1d6f-46ac-93ae-7ebe78fba688	a008d4d0-c868-42a6-9540-1e8286ff5673	23d08d10-805a-4355-9a88-1597f281c8ba	E45 Daily Lotion	150ml	10	8500.00	2026-09-05 05:06:09.556	\N	\N
840bcbe0-318b-42d5-8787-e687aaf2029b	a008d4d0-c868-42a6-9540-1e8286ff5673	358c9512-170a-4648-a3ce-698d3a62ec2b	Bioderma Sensibio H2O Micellar Water	150ml	10	15500.00	2026-09-05 05:06:09.556	\N	\N
4457a70b-019a-4e8f-97b1-bcd3479374c9	04c1576f-95a6-4148-92e3-af8bc9035f2a	9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	Aveeno Daily Moisturizing Lotion	150ml	10	13500.00	2026-09-05 05:17:16.285	\N	\N
5a8c5267-37a5-49e0-89c3-b500bc3bfaa3	04c1576f-95a6-4148-92e3-af8bc9035f2a	73138993-9f7a-4745-8920-4d3ff06174a1	CeraVe Hydrating Cleanser	150ml	10	10500.00	2026-09-05 05:17:16.285	\N	\N
ab820468-a659-48fb-8bee-fde056d1fe65	04c1576f-95a6-4148-92e3-af8bc9035f2a	23d08d10-805a-4355-9a88-1597f281c8ba	E45 Daily Lotion	150ml	10	8500.00	2026-09-05 05:17:16.285	\N	\N
c2ae028c-5b6b-4834-9b98-da0d4afbe6b7	04c1576f-95a6-4148-92e3-af8bc9035f2a	358c9512-170a-4648-a3ce-698d3a62ec2b	Bioderma Sensibio H2O Micellar Water	150ml	10	15500.00	2026-09-05 05:17:16.285	\N	\N
f4ad6d06-04d9-49ad-9a11-01b9a2c0ff4b	1d6a6039-155a-4d20-b6dc-575d7fd46a95	73138993-9f7a-4745-8920-4d3ff06174a1	CeraVe Hydrating Cleanser	150ml	3	10500.00	2026-09-05 15:12:28.851	\N	\N
ef813d88-5d99-41e5-9109-137c78700c56	1d6a6039-155a-4d20-b6dc-575d7fd46a95	9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	Aveeno Daily Moisturizing Lotion	150ml	1	13500.00	2026-09-05 15:12:28.851	\N	\N
0a4b7fb7-a822-49fd-b099-9037c36aef1a	1d6a6039-155a-4d20-b6dc-575d7fd46a95	23d08d10-805a-4355-9a88-1597f281c8ba	E45 Daily Lotion	150ml	1	8500.00	2026-09-05 15:12:28.851	\N	\N
6cf2ad24-3d78-4ebd-b8f6-78ff3ecba8e6	fd69d72a-7871-4ea5-a193-ea4eef2db4da	73138993-9f7a-4745-8920-4d3ff06174a1	CeraVe Hydrating Cleanser	150ml	1	10500.00	2026-09-08 15:57:41.537	\N	\N
84c8166d-fbda-4a5b-813c-d977d487058a	fd69d72a-7871-4ea5-a193-ea4eef2db4da	9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	Aveeno Daily Moisturizing Lotion	150ml	1	13500.00	2026-09-08 15:57:41.537	\N	\N
4f29ac9a-cb53-4614-9977-890e3007208f	92630876-87ad-4901-8a38-971882e77dab	23d08d10-805a-4355-9a88-1597f281c8ba	E45 Daily Lotion	150ml	1	8500.00	2026-09-08 21:22:52.649	\N	\N
738fda9c-975e-4755-bbce-f3a0008a1ca5	92630876-87ad-4901-8a38-971882e77dab	9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	Aveeno Daily Moisturizing Lotion	150ml	1	13500.00	2026-09-08 21:22:52.649	\N	\N
337b9f19-b561-490b-9b02-d74524f74e53	57bd0446-275a-446c-a07f-1f479354d740	73138993-9f7a-4745-8920-4d3ff06174a1	CeraVe Hydrating Cleanser	150ml	1	10500.00	2026-09-10 03:36:32.844	\N	\N
f7c2ef8a-43e1-4a8d-9ee3-1505e4dba242	57bd0446-275a-446c-a07f-1f479354d740	9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	Aveeno Daily Moisturizing Lotion	150ml	1	13500.00	2026-09-10 03:36:32.844	\N	\N
84c4aa1c-3ab9-4a5b-88cf-069a1b8fed00	57bd0446-275a-446c-a07f-1f479354d740	358c9512-170a-4648-a3ce-698d3a62ec2b	Bioderma Sensibio H2O Micellar Water	150ml	1	15500.00	2026-09-10 03:36:32.844	\N	\N
1b170ae2-0721-4ab6-9b96-408d81dbb24e	57bd0446-275a-446c-a07f-1f479354d740	23d08d10-805a-4355-9a88-1597f281c8ba	E45 Daily Lotion	150ml	1	8500.00	2026-09-10 03:36:32.844	\N	\N
b087ace0-33dd-4355-9a3d-e94a958ce1a8	bcc079b7-86b5-40e4-a6b9-be938a30997e	9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	Aveeno Daily Moisturizing Lotion	150ml	1	13500.00	2026-09-10 18:47:10.377	\N	\N
ccd9d483-8544-462c-993b-a32c9cebafc1	bcc079b7-86b5-40e4-a6b9-be938a30997e	358c9512-170a-4648-a3ce-698d3a62ec2b	Bioderma Sensibio H2O Micellar Water	150ml	1	15500.00	2026-09-10 18:47:10.377	\N	\N
6732224a-311c-4dbf-8947-aad19e34ee3f	1ee49be9-2122-4794-a73f-79b8a9c5c239	358c9512-170a-4648-a3ce-698d3a62ec2b	Bioderma Sensibio H2O Micellar Water	150ml	1	15500.00	2026-09-11 06:51:45.5	\N	\N
2c0b55cb-a8ea-4fd9-bc82-79d772cbadcd	a6994a1d-086a-4f07-8c78-145066055f56	73138993-9f7a-4745-8920-4d3ff06174a1	CeraVe Hydrating Cleanser	150ml	1	10500.00	2026-09-12 00:37:23.438	\N	\N
6fc82ff8-f2f5-499a-bff3-0f053db791d3	6c5ce208-166f-49fe-94eb-9f19ef39655d	73138993-9f7a-4745-8920-4d3ff06174a1	CeraVe Hydrating Cleanser	150ml	1	10500.00	2026-09-12 00:37:31.59	\N	\N
e1baf9f4-0e4e-4eb1-a89d-74cec119dffa	7c259319-d48b-4d4d-816b-76e7a8b8ce1e	73138993-9f7a-4745-8920-4d3ff06174a1	CeraVe Hydrating Cleanser	150ml	1	10500.00	2026-09-12 00:40:10.689	\N	\N
f517f2a1-9548-4ba4-826a-cf61725d107b	48d30997-f19f-4950-9263-4bb194f46888	73138993-9f7a-4745-8920-4d3ff06174a1	CeraVe Hydrating Cleanser	150ml	5	10500.00	2026-09-12 17:23:19.615	\N	\N
3b72684e-e5d6-4bf3-a7ad-f557975da32f	48d30997-f19f-4950-9263-4bb194f46888	358c9512-170a-4648-a3ce-698d3a62ec2b	Bioderma Sensibio H2O Micellar Water	150ml	7	15500.00	2026-09-12 17:23:19.615	\N	\N
67ece712-e235-4daa-814d-5db99f0f7b1e	48d30997-f19f-4950-9263-4bb194f46888	23d08d10-805a-4355-9a88-1597f281c8ba	E45 Daily Lotion	150ml	8	8500.00	2026-09-12 17:23:19.615	\N	\N
2413b2db-72b2-4372-b02f-bc8ea866dd0d	48d30997-f19f-4950-9263-4bb194f46888	9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	Aveeno Daily Moisturizing Lotion	150ml	5	13500.00	2026-09-12 17:23:19.615	\N	\N
22987db4-eeb2-4446-8a65-253efc8f983c	8f21b0cf-1ec3-4be2-860e-3cd3b2ec0d04	73138993-9f7a-4745-8920-4d3ff06174a1	CeraVe Hydrating Cleanser	150ml	5	10500.00	2026-09-12 17:23:23.641	\N	\N
ec0b4cb9-70c2-4ee8-a018-c92b9c03ebee	8f21b0cf-1ec3-4be2-860e-3cd3b2ec0d04	358c9512-170a-4648-a3ce-698d3a62ec2b	Bioderma Sensibio H2O Micellar Water	150ml	7	15500.00	2026-09-12 17:23:23.641	\N	\N
2f043fcd-ca5d-405a-8c2b-c6db14e15032	8f21b0cf-1ec3-4be2-860e-3cd3b2ec0d04	23d08d10-805a-4355-9a88-1597f281c8ba	E45 Daily Lotion	150ml	8	8500.00	2026-09-12 17:23:23.641	\N	\N
11fcc0c8-0341-4b1e-8e7a-f02107a255ea	8f21b0cf-1ec3-4be2-860e-3cd3b2ec0d04	9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	Aveeno Daily Moisturizing Lotion	150ml	5	13500.00	2026-09-12 17:23:23.641	\N	\N
c96a7d30-67fb-4c08-bc53-7590e5d8e005	f80453cc-2ceb-4dc8-9918-08c085f885c1	73138993-9f7a-4745-8920-4d3ff06174a1	CeraVe Hydrating Cleanser	150ml	5	10500.00	2026-09-12 17:24:20.203	\N	\N
957f91f2-0728-486b-875f-f242d2089e3e	f80453cc-2ceb-4dc8-9918-08c085f885c1	358c9512-170a-4648-a3ce-698d3a62ec2b	Bioderma Sensibio H2O Micellar Water	150ml	7	15500.00	2026-09-12 17:24:20.203	\N	\N
09c65659-6e5f-4fcc-abb1-9bb5e7db3c6b	f80453cc-2ceb-4dc8-9918-08c085f885c1	23d08d10-805a-4355-9a88-1597f281c8ba	E45 Daily Lotion	150ml	8	8500.00	2026-09-12 17:24:20.203	\N	\N
41822c2d-13fa-41d0-b5f4-89ed00025f16	f80453cc-2ceb-4dc8-9918-08c085f885c1	9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	Aveeno Daily Moisturizing Lotion	150ml	5	13500.00	2026-09-12 17:24:20.203	\N	\N
5d253fc2-1ab1-49f4-aa37-b7af43fc2e9c	80be5eb4-2a12-4d9b-a9cf-d866cf18ab7d	73138993-9f7a-4745-8920-4d3ff06174a1	CeraVe Hydrating Cleanser	150ml	1	10500.00	2026-09-13 00:09:43.405	\N	\N
08eb483b-64b6-4953-87ff-547b6d40ce04	80be5eb4-2a12-4d9b-a9cf-d866cf18ab7d	9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	Aveeno Daily Moisturizing Lotion	150ml	1	13500.00	2026-09-13 00:09:43.405	\N	\N
d2108302-0ad7-4e6a-a5e8-804b8c29c758	bae88b4b-4b3b-404f-84dd-fddfe93e6fbc	51d3437d-b3e0-4216-862e-8f80144e0207	Fx chart	90 ml	3	50000.00	2026-09-13 01:30:04.93	\N	\N
6f5f56cb-b6bf-47dc-a46f-0d59635108d9	bae88b4b-4b3b-404f-84dd-fddfe93e6fbc	4dbf2d8d-dede-48f3-884a-c61554fccce0	CeraVe Hydrating Cleanser	50ml	5	8500.00	2026-09-13 01:30:04.93	\N	\N
666154a2-5133-4690-94d7-91e9eb5699ce	ccbdda68-c695-45d9-8b15-a472a689feb4	51d3437d-b3e0-4216-862e-8f80144e0207	Fx chart	90 ml	2	50000.00	2026-09-13 15:20:42.653	\N	\N
7e713989-8d3c-407e-9311-3de605c1d2d0	a410d8ae-f817-4b30-bff6-3f75ce770ec8	4dbf2d8d-dede-48f3-884a-c61554fccce0	CeraVe Hydrating Cleanser	50ml	1	8500.00	2026-09-16 19:43:26.627	\N	\N
19d2a3e5-f424-46f4-a632-e2a789ce8396	8a4345b3-d09a-4966-a8ca-40a28951abb7	9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	Aveeno Daily Moisturizing Lotion	150ml	1	13500.00	2026-09-19 13:03:36.832	abfbf132-910e-454f-8b58-4bcf599fa00e	\N
d64c3442-aa46-4dfc-8c4a-ea2f35bd881d	84a499e6-10f5-4b9f-8e5e-8f8dc244762d	358c9512-170a-4648-a3ce-698d3a62ec2b	Bioderma Sensibio H2O Micellar Water	150ml	1	15500.00	2026-09-19 23:46:23.599	2c11f911-24f5-445d-8d75-c475a7d0b057	\N
4ed62899-b825-4a99-b66e-78ffd04b22a5	e1a1f09e-25c3-4538-9a22-07361dddc643	4dbf2d8d-dede-48f3-884a-c61554fccce0	CeraVe Hydrating Cleanser	50ml	1	8500.00	2026-09-20 15:09:09.72	37ebb196-d336-4c09-bfa2-da4c053e90c1	\N
dbcacd69-18ab-4fc4-a3d6-183a98e10b1e	e1a1f09e-25c3-4538-9a22-07361dddc643	9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	Aveeno Daily Moisturizing Lotion	150ml	1	13500.00	2026-09-20 15:09:09.72	b8f2d59f-57f3-4fb3-aa86-eb4e6d6fb319	\N
3d28bce1-3b76-468b-aa26-7a1dee4f49b0	856152ab-f10d-4377-ba46-55ae88cafecd	9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	Aveeno Daily Moisturizing Lotion	150ml	1	13500.00	2026-09-20 15:54:58.552	\N	\N
544c9c16-86c1-4c13-9020-7c95184fea57	b98bdec8-17a3-41c2-a199-11c61f00ac2f	4dbf2d8d-dede-48f3-884a-c61554fccce0	CeraVe Hydrating Cleanser	50ml	2	8500.00	2026-09-21 18:29:41.425	\N	\N
54aa1e23-a987-4db9-887d-93dbe3ea455e	b98bdec8-17a3-41c2-a199-11c61f00ac2f	9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	Aveeno Daily Moisturizing Lotion	150ml	1	13500.00	2026-09-21 18:29:41.425	7c128aa1-b339-44a0-bd8e-1dcfe2d52837	\N
c106f243-f74f-4210-9d7a-e675c93454ac	b98bdec8-17a3-41c2-a199-11c61f00ac2f	23d08d10-805a-4355-9a88-1597f281c8ba	E45 Daily Lotion	150ml	1	8500.00	2026-09-21 18:29:41.425	71a7f1b3-9a45-434a-83db-574a658f1060	\N
2d55fdf3-ab13-4362-8892-493c76ed0eaf	3fde5250-60e9-4736-9016-0db3ff58e2ba	358c9512-170a-4648-a3ce-698d3a62ec2b	Bioderma Sensibio H2O Micellar Water	150ml	1	15500.00	2026-09-21 18:34:44.407	\N	\N
947abdee-291d-4689-bdda-c2bc05fddc7f	3fde5250-60e9-4736-9016-0db3ff58e2ba	23d08d10-805a-4355-9a88-1597f281c8ba	E45 Daily Lotion	150ml	1	8500.00	2026-09-21 18:34:44.407	e07537b1-6f57-4ab3-8a30-142c29d5b4b6	\N
4028f2a1-e9d1-4eea-918a-7cfad9f07507	3fde5250-60e9-4736-9016-0db3ff58e2ba	4dbf2d8d-dede-48f3-884a-c61554fccce0	CeraVe Hydrating Cleanser	50ml	1	8500.00	2026-09-21 18:34:44.407	0511515c-4206-489e-b678-bca27d3419a5	\N
a6e2e755-5c1a-45ec-89e3-a37f02e94afc	cd0fcc83-9787-47f9-97d7-191e1fec98d5	4dbf2d8d-dede-48f3-884a-c61554fccce0	CeraVe Hydrating Cleanser	50ml	1	8500.00	2026-09-19 13:30:51.594	\N	\N
aa4049a9-fb62-45b6-8c9b-0d676474203f	f8e71891-cc1a-49cf-8f19-b1a75e299a1a	4dbf2d8d-dede-48f3-884a-c61554fccce0	CeraVe Hydrating Cleanser	50ml	1	8500.00	2026-09-19 13:30:54	\N	\N
4e792d97-cd06-4084-afae-aae0e28675e5	84a499e6-10f5-4b9f-8e5e-8f8dc244762d	4dbf2d8d-dede-48f3-884a-c61554fccce0	CeraVe Hydrating Cleanser	50ml	1	8500.00	2026-09-19 23:46:23.599	\N	\N
68dff5d7-441a-40ab-a9cf-a00a920b8896	17b16ff5-95a6-4f4e-b661-c9e6cd3d3cdd	4dbf2d8d-dede-48f3-884a-c61554fccce0	CeraVe Hydrating Cleanser	50ml	1	8500.00	2026-09-21 18:50:44.816	7c360906-73b8-4727-a65a-a4ec336e5051	\N
89cdc457-a18d-404b-8af0-37f81b2ad1d9	32f671d6-fcac-4448-bd59-7133fe1d12f1	6e5908db-910e-46bc-b8c9-d9be38e37437	CeraVe Moisturizing Cream	150ml	1	15500.00	2026-09-22 10:15:46.95	\N	\N
a5ed8553-e5ac-48ac-ba17-59d7155caa60	32f671d6-fcac-4448-bd59-7133fe1d12f1	4dbf2d8d-dede-48f3-884a-c61554fccce0	CeraVe Hydrating Cleanser	50ml	2	8500.00	2026-09-22 10:15:46.95	\N	\N
a726e465-74a7-4947-a50e-858ee3c1f788	32f671d6-fcac-4448-bd59-7133fe1d12f1	4dbf2d8d-dede-48f3-884a-c61554fccce0	CeraVe Hydrating Cleanser	50ml	1	8500.00	2026-09-22 10:15:46.95	5f7c263c-eb48-475c-be12-f2fc28a16ddf	\N
6adf67f7-4d04-41f3-846c-0745d151c107	32f671d6-fcac-4448-bd59-7133fe1d12f1	9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	Aveeno Daily Moisturizing Lotion	150ml	1	13500.00	2026-09-22 10:15:46.95	892e23ff-2d76-4ef3-993d-ed69de15462d	\N
6b517650-7a34-4a56-b1b0-bdd430e41275	18adae98-58dd-4dba-abba-9367b0bf93a7	23d08d10-805a-4355-9a88-1597f281c8ba	E45 Daily Lotion	150ml	2	8500.00	2026-09-22 13:53:30.525	\N	\N
817aa875-ac4e-47f8-a893-eee7fc953438	18adae98-58dd-4dba-abba-9367b0bf93a7	9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	Aveeno Daily Moisturizing Lotion	150ml	1	13500.00	2026-09-22 13:53:30.525	247f529b-992f-44b7-aff5-7d53abff48e7	\N
d1264064-4179-45bd-9aac-ec4c844b1d3d	18adae98-58dd-4dba-abba-9367b0bf93a7	4dbf2d8d-dede-48f3-884a-c61554fccce0	CeraVe Hydrating Cleanser	50ml	5	8500.00	2026-09-22 13:53:30.525	6984cd1f-92d0-4238-b193-966655ed2bb2	\N
7d21fe88-2564-44fb-ac0f-6ea1de8f2b3d	76a9827f-158e-45c9-b349-fb4d3b091b74	23d08d10-805a-4355-9a88-1597f281c8ba	E45 Daily Lotion	150ml	1	8500.00	2026-09-22 13:56:11.011	79683a28-69a9-49ed-8874-4a5c91a3fe88	\N
19cc776b-91d3-4fbf-bbe8-430fe35ecd0d	0e59d4c0-d02c-43ac-88ce-ffde9287898c	23d08d10-805a-4355-9a88-1597f281c8ba	E45 Daily Lotion	150ml	1	8500.00	2026-09-22 14:08:50.363	0d30fb1c-c125-4ce6-9f8a-f917c868b917	\N
87e05483-bc70-4cbf-81c2-1b6dd1f9aa2c	0e59d4c0-d02c-43ac-88ce-ffde9287898c	358c9512-170a-4648-a3ce-698d3a62ec2b	Bioderma Sensibio H2O Micellar Water	150ml	1	15500.00	2026-09-22 14:08:50.363	d842088c-fb53-4210-9a36-4f90c8d4b6ec	\N
2d7d1d80-c91a-4fc9-aceb-fec34bdcef91	0e59d4c0-d02c-43ac-88ce-ffde9287898c	9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	Aveeno Daily Moisturizing Lotion	150ml	1	13500.00	2026-09-22 14:08:50.363	384ca33e-37ce-404a-996a-a54bf7e98595	\N
9d587b9a-10cd-49ea-a379-354cf0565e7d	c74d36f2-b26b-4da5-bade-3633cbaa0653	9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	Aveeno Daily Moisturizing Lotion	150ml	1	13500.00	2026-09-24 20:31:59.137	\N	\N
ab5a0b75-e146-4b99-8da3-e25a41152874	571347e6-417a-484f-977f-3bef94f6489b	73138993-9f7a-4745-8920-4d3ff06174a1	CeraVe Hydrating Cleanser	150ml	1	10500.00	2026-09-28 18:55:48.014	\N	\N
0f19e949-482e-47dc-b767-0002c1a00b07	c31b0154-0e2f-4a4d-9846-80436f275b72	23d08d10-805a-4355-9a88-1597f281c8ba	E45 Daily Lotion	150ml	1	8500.00	2026-09-29 09:55:43.912	\N	\N
21f8bead-ae87-4b6a-bd74-106ecf7c851e	420ba8bf-e2ae-45bb-a66e-7284cd1b933c	358c9512-170a-4648-a3ce-698d3a62ec2b	Bioderma Sensibio H2O Micellar Water	150ml	1	15500.00	2026-09-29 22:32:25.006	\N	\N
1113660f-a70e-48bd-8f7e-67a799b6fe4c	33378e31-8f63-4f73-aea5-cb44990dc496	9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	Aveeno Daily Moisturizing Lotion	150ml	2	13500.00	2026-09-30 00:00:01.249	\N	\N
311140d6-529d-47eb-8b03-64c2aba331b8	4fdb16ab-c513-4905-a1b5-a361f4dd7163	9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	Aveeno Daily Moisturizing Lotion	150ml	2	13500.00	2026-09-30 00:41:59.617	\N	\N
383d6b26-8ce0-415a-becc-8c4fa658f70f	4fdb16ab-c513-4905-a1b5-a361f4dd7163	358c9512-170a-4648-a3ce-698d3a62ec2b	Bioderma Sensibio H2O Micellar Water	150ml	1	15500.00	2026-09-30 00:41:59.617	\N	\N
266d9735-3934-46f4-9aa2-cfeb8e22daf6	4fdb16ab-c513-4905-a1b5-a361f4dd7163	23d08d10-805a-4355-9a88-1597f281c8ba	E45 Daily Lotion	150ml	1	8500.00	2026-09-30 00:41:59.617	\N	\N
bf86ebbc-b6b2-45aa-891e-b02012ffe988	4fdb16ab-c513-4905-a1b5-a361f4dd7163	7cff3298-6e98-416d-8753-855ce7e90a16	CeraVe Hydrating Cleanser	150ml	1	10500.00	2026-09-30 00:41:59.617	\N	\N
e6836f24-2bf8-4989-9f41-14d34ecdef36	f7909357-b95c-4d6f-b432-b494d6fb6418	9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	Aveeno Daily Moisturizing Lotion	150ml	2	13500.00	2026-09-30 07:28:04.548	\N	\N
e09c18a4-5325-464f-bab6-3b21cabcee8a	f7909357-b95c-4d6f-b432-b494d6fb6418	358c9512-170a-4648-a3ce-698d3a62ec2b	Bioderma Sensibio H2O Micellar Water	150ml	1	15500.00	2026-09-30 07:28:04.548	\N	\N
f378374b-e870-4436-a705-20fb2f2b7902	f7909357-b95c-4d6f-b432-b494d6fb6418	7cff3298-6e98-416d-8753-855ce7e90a16	CeraVe Hydrating Cleanser	150ml	1	10500.00	2026-09-30 07:28:04.548	\N	\N
f644ed52-4da3-4d5a-a159-88c22c64024c	f7909357-b95c-4d6f-b432-b494d6fb6418	23d08d10-805a-4355-9a88-1597f281c8ba	E45 Daily Lotion	150ml	2	8500.00	2026-09-30 07:28:04.548	\N	\N
b3852800-ee9d-4b3f-8db3-eb035cac8d3e	bbf1a1d4-0288-4b5d-bfae-74ae6ffb8ecc	9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	Aveeno Daily Moisturizing Lotion	150ml	1	13500.00	2026-09-30 07:30:31.884	\N	\N
0391f58f-e5ca-469a-8e81-74f1f4f59d80	5bebd81e-b19c-45b3-88ef-718fb17bfb27	73138993-9f7a-4745-8920-4d3ff06174a1	CeraVe Hydrating Cleanser	150ml	1	10500.00	2026-09-30 22:06:46.508	\N	\N
9923f05a-e6d7-4277-8111-b7cb80ab4d50	5bebd81e-b19c-45b3-88ef-718fb17bfb27	9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	Aveeno Daily Moisturizing Lotion	150ml	1	13500.00	2026-09-30 22:06:46.508	\N	\N
7327e9f2-2f14-44d6-879a-043b2ec16075	5bebd81e-b19c-45b3-88ef-718fb17bfb27	23d08d10-805a-4355-9a88-1597f281c8ba	E45 Daily Lotion	150ml	1	8500.00	2026-09-30 22:06:46.508	\N	\N
86b31ac3-e67f-4d51-8d2f-50ff64c44dc9	5bebd81e-b19c-45b3-88ef-718fb17bfb27	358c9512-170a-4648-a3ce-698d3a62ec2b	Bioderma Sensibio H2O Micellar Water	150ml	1	15500.00	2026-09-30 22:06:46.508	\N	\N
a2090b3e-11a8-4840-aef0-cc0f74546f0a	5d23bd70-8e8a-4e56-997f-6ab0cf53cde4	23d08d10-805a-4355-9a88-1597f281c8ba	E45 Daily Lotion	150ml	1	8500.00	2026-10-01 17:11:41.651	\N	\N
aa026921-bf36-4153-b0fc-560385612e85	5d23bd70-8e8a-4e56-997f-6ab0cf53cde4	9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	Aveeno Daily Moisturizing Lotion	150ml	1	13500.00	2026-10-01 17:11:41.651	\N	\N
d75b5f87-fc1c-4a1c-b7ba-c6d380381def	5d23bd70-8e8a-4e56-997f-6ab0cf53cde4	358c9512-170a-4648-a3ce-698d3a62ec2b	Bioderma Sensibio H2O Micellar Water	150ml	1	15500.00	2026-10-01 17:11:41.651	\N	\N
21c8e377-1b1d-4456-98cf-23e28b5f6c5b	640f8316-97eb-4407-9ce1-7aaebd507f9e	23d08d10-805a-4355-9a88-1597f281c8ba	E45 Daily Lotion	150ml	1	8500.00	2026-10-01 17:21:41.899	27e6e0ee-7de5-4cfd-b84a-13a424f81eba	\N
cbd6bc76-f971-4aa7-8439-d003e3e521cc	f87087b3-c85d-4314-bb40-9b732bebf987	9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	Aveeno Daily Moisturizing Lotion	150ml	1	13500.00	2026-10-16 23:45:47.793	\N	\N
e0e28181-32c4-41dc-81a3-199ef9f19bba	ecc5a9f8-ab39-4a81-ac6f-c7563391aadd	9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	Aveeno Daily Moisturizing Lotion	150ml	1	13500.00	2026-10-19 15:04:32.514	\N	\N
ebed16ff-acc1-4cdc-bac3-ba81936f5e4a	873a648f-7dd9-4b7a-b60a-f4a3b482f067	23d08d10-805a-4355-9a88-1597f281c8ba	E45 Daily Lotion	150ml	1	8500.00	2026-10-19 16:01:18.149	c82e9085-6ad5-40cd-82d2-371ccaccd13a	\N
47a1f939-e273-437a-9bc7-6fada637f450	873a648f-7dd9-4b7a-b60a-f4a3b482f067	9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	Aveeno Daily Moisturizing Lotion	150ml	1	13500.00	2026-10-19 16:01:18.149	deeaada0-ddb6-459a-9704-1cc79b912d7f	\N
a8936713-4c1d-4ae4-b719-886a5445d4f1	873a648f-7dd9-4b7a-b60a-f4a3b482f067	23d08d10-805a-4355-9a88-1597f281c8ba	E45 Daily Lotion	150ml	1	8500.00	2026-10-19 16:01:18.149	44a258d9-92f4-41dd-9dae-b003775aa3d9	\N
52639c76-3e63-4bfc-9a1c-a7206cbd1847	873a648f-7dd9-4b7a-b60a-f4a3b482f067	358c9512-170a-4648-a3ce-698d3a62ec2b	Bioderma Sensibio H2O Micellar Water	150ml	2	15500.00	2026-10-19 16:01:18.149	\N	\N
e32fd491-fbeb-4b6b-84a4-da12cbefca3d	873a648f-7dd9-4b7a-b60a-f4a3b482f067	23d08d10-805a-4355-9a88-1597f281c8ba	E45 Daily Lotion	150ml	1	8500.00	2026-10-19 16:01:18.149	ef3eb5f7-508d-402e-b71e-4728416f0e4f	\N
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Payment" (id, "orderId", "paystackRef", amount, currency, status, "gatewayResponse", "paidAt", "createdAt", "updatedAt") FROM stdin;
617f21fa-81c1-4675-9cbe-d41ac9657992	420ba8bf-e2ae-45bb-a66e-7284cd1b933c	84f4c8788b75d33fcd52	18500.00	NGN	SUCCESS	{"id": 6608786411, "log": {"input": [], "errors": 0, "mobile": false, "history": [{"time": 7, "type": "action", "message": "Attempted to pay with card"}, {"time": 7, "type": "success", "message": "Successfully paid with card"}], "success": true, "attempts": 1, "start_time": 1790725578, "time_spent": 7}, "fees": 37750, "plan": null, "split": {}, "amount": 1850000, "domain": "test", "paidAt": "2026-09-29T23:46:24.000Z", "source": null, "status": "success", "channel": "card", "connect": null, "message": null, "paid_at": "2026-09-29T23:46:24.000Z", "currency": "NGN", "customer": {"id": 396650632, "email": "ojeonupromise924@gmail.com", "phone": null, "metadata": null, "last_name": null, "first_name": null, "risk_action": "default", "customer_code": "CUS_8m6iwkceu1hw294", "international_format_phone": null}, "metadata": {"referrer": "http://localhost:3000/"}, "order_id": null, "createdAt": "2026-09-29T23:46:11.000Z", "reference": "84f4c8788b75d33fcd52", "created_at": "2026-09-29T23:46:11.000Z", "fees_split": null, "ip_address": "102.89.83.115", "subaccount": {}, "plan_object": {}, "authorization": {"bin": "408408", "bank": "TEST BANK", "brand": "visa", "last4": "4081", "channel": "card", "exp_year": "2030", "reusable": true, "card_type": "visa ", "exp_month": "12", "signature": "SIG_a4BZScBS9LmxKd3ANW2k", "account_name": null, "country_code": "NG", "receiver_bank": null, "authorization_code": "AUTH_p8pt9dr7fm", "receiver_bank_account_number": null}, "response_code": "00", "fees_breakdown": null, "receipt_number": null, "gateway_response": "Successful", "requested_amount": 1850000, "transaction_date": "2026-09-29T23:46:11.000Z", "pos_transaction_data": null, "gateway_response_code": "approved"}	2026-09-29 23:46:29.547	2026-09-29 23:46:29.556	2026-09-29 23:46:29.556
5e761de9-d701-4f0a-8b61-b1faece27171	f7909357-b95c-4d6f-b432-b494d6fb6418	a7c6a4f9f7624aed1736	70000.00	NGN	SUCCESS	{"id": 6609427775, "log": {"input": [], "errors": 0, "mobile": false, "history": [{"time": 91, "type": "action", "message": "Attempted to pay with card"}, {"time": 91, "type": "success", "message": "Successfully paid with card"}], "success": true, "attempts": 1, "start_time": 1790753289, "time_spent": 91}, "fees": 115000, "plan": null, "split": {}, "amount": 7000000, "domain": "test", "paidAt": "2026-09-30T07:29:38.000Z", "source": null, "status": "success", "channel": "card", "connect": null, "message": null, "paid_at": "2026-09-30T07:29:38.000Z", "currency": "NGN", "customer": {"id": 396650632, "email": "ojeonupromise924@gmail.com", "phone": null, "metadata": null, "last_name": null, "first_name": null, "risk_action": "default", "customer_code": "CUS_8m6iwkceu1hw294", "international_format_phone": null}, "metadata": {"referrer": "http://localhost:3000/"}, "order_id": null, "createdAt": "2026-09-30T07:28:05.000Z", "reference": "a7c6a4f9f7624aed1736", "created_at": "2026-09-30T07:28:05.000Z", "fees_split": null, "ip_address": "105.127.6.40", "subaccount": {}, "plan_object": {}, "authorization": {"bin": "408408", "bank": "TEST BANK", "brand": "visa", "last4": "4081", "channel": "card", "exp_year": "2030", "reusable": true, "card_type": "visa ", "exp_month": "12", "signature": "SIG_a4BZScBS9LmxKd3ANW2k", "account_name": null, "country_code": "NG", "receiver_bank": null, "authorization_code": "AUTH_s1lxswy5gu", "receiver_bank_account_number": null}, "response_code": "00", "fees_breakdown": null, "receipt_number": null, "gateway_response": "Successful", "requested_amount": 7000000, "transaction_date": "2026-09-30T07:28:05.000Z", "pos_transaction_data": null, "gateway_response_code": "approved"}	2026-09-30 07:29:43.154	2026-09-30 07:29:43.157	2026-09-30 07:29:43.157
53653746-6270-44c8-a0bd-b0c9ef88afb3	bbf1a1d4-0288-4b5d-bfae-74ae6ffb8ecc	f8cd4d65079d1bdaa379	16500.00	NGN	SUCCESS	{"id": 6609433192, "log": {"input": [], "errors": 0, "mobile": false, "history": [{"time": 5, "type": "action", "message": "Attempted to pay with card"}, {"time": 5, "type": "success", "message": "Successfully paid with card"}], "success": true, "attempts": 1, "start_time": 1790753434, "time_spent": 5}, "fees": 34750, "plan": null, "split": {}, "amount": 1650000, "domain": "test", "paidAt": "2026-09-30T07:30:37.000Z", "source": null, "status": "success", "channel": "card", "connect": null, "message": null, "paid_at": "2026-09-30T07:30:37.000Z", "currency": "NGN", "customer": {"id": 396650632, "email": "ojeonupromise924@gmail.com", "phone": null, "metadata": null, "last_name": null, "first_name": null, "risk_action": "default", "customer_code": "CUS_8m6iwkceu1hw294", "international_format_phone": null}, "metadata": {"referrer": "http://localhost:3000/"}, "order_id": null, "createdAt": "2026-09-30T07:30:31.000Z", "reference": "f8cd4d65079d1bdaa379", "created_at": "2026-09-30T07:30:31.000Z", "fees_split": null, "ip_address": "105.127.6.40", "subaccount": {}, "plan_object": {}, "authorization": {"bin": "408408", "bank": "TEST BANK", "brand": "visa", "last4": "4081", "channel": "card", "exp_year": "2030", "reusable": true, "card_type": "visa ", "exp_month": "12", "signature": "SIG_a4BZScBS9LmxKd3ANW2k", "account_name": null, "country_code": "NG", "receiver_bank": null, "authorization_code": "AUTH_zg2sj0biyk", "receiver_bank_account_number": null}, "response_code": "00", "fees_breakdown": null, "receipt_number": null, "gateway_response": "Successful", "requested_amount": 1650000, "transaction_date": "2026-09-30T07:30:31.000Z", "pos_transaction_data": null, "gateway_response_code": "approved"}	2026-09-30 07:30:41.359	2026-09-30 07:30:41.363	2026-09-30 07:30:41.363
bcbce3a6-46ee-42f7-a815-d41283c307fb	5bebd81e-b19c-45b3-88ef-718fb17bfb27	6e117219dfe87e39b134	48000.00	NGN	SUCCESS	{"id": 6612009232, "log": {"input": [], "errors": 0, "mobile": false, "history": [{"time": 7, "type": "action", "message": "Attempted to pay with card"}, {"time": 7, "type": "success", "message": "Successfully paid with card"}], "success": true, "attempts": 1, "start_time": 1790806012, "time_spent": 7}, "fees": 82000, "plan": null, "split": {}, "amount": 4800000, "domain": "test", "paidAt": "2026-09-30T22:06:58.000Z", "source": null, "status": "success", "channel": "card", "connect": null, "message": null, "paid_at": "2026-09-30T22:06:58.000Z", "currency": "NGN", "customer": {"id": 404691843, "email": "meshackosakweb@gmail.com", "phone": null, "metadata": null, "last_name": null, "first_name": null, "risk_action": "default", "customer_code": "CUS_4vr8lh00c7ftq45", "international_format_phone": null}, "metadata": {"referrer": "http://localhost:3000/"}, "order_id": null, "createdAt": "2026-09-30T22:06:47.000Z", "reference": "6e117219dfe87e39b134", "created_at": "2026-09-30T22:06:47.000Z", "fees_split": null, "ip_address": "102.88.114.140", "subaccount": {}, "plan_object": {}, "authorization": {"bin": "408408", "bank": "TEST BANK", "brand": "visa", "last4": "4081", "channel": "card", "exp_year": "2030", "reusable": true, "card_type": "visa ", "exp_month": "12", "signature": "SIG_a4BZScBS9LmxKd3ANW2k", "account_name": null, "country_code": "NG", "receiver_bank": null, "authorization_code": "AUTH_wb1ose7jhx", "receiver_bank_account_number": null}, "response_code": "00", "fees_breakdown": null, "receipt_number": null, "gateway_response": "Successful", "requested_amount": 4800000, "transaction_date": "2026-09-30T22:06:47.000Z", "pos_transaction_data": null, "gateway_response_code": "approved"}	2026-09-30 22:07:03.265	2026-09-30 22:07:03.268	2026-09-30 22:07:03.268
ee7e3fbb-a498-4d4d-b900-7082b4249025	5d23bd70-8e8a-4e56-997f-6ab0cf53cde4	9a5223d4cd319865c09a	37500.00	NGN	SUCCESS	{"id": 6614580708, "log": {"input": [], "errors": 0, "mobile": false, "history": [{"time": 5, "type": "action", "message": "Attempted to pay with card"}, {"time": 5, "type": "success", "message": "Successfully paid with card"}], "success": true, "attempts": 1, "start_time": 1790874707, "time_spent": 5}, "fees": 66250, "plan": null, "split": {}, "amount": 3750000, "domain": "test", "paidAt": "2026-10-01T17:11:51.000Z", "source": null, "status": "success", "channel": "card", "connect": null, "message": null, "paid_at": "2026-10-01T17:11:51.000Z", "currency": "NGN", "customer": {"id": 404915958, "email": "ochemeprince86@gmail.com", "phone": null, "metadata": null, "last_name": null, "first_name": null, "risk_action": "default", "customer_code": "CUS_kmyezyxtt40z0nw", "international_format_phone": null}, "metadata": {"referrer": "http://localhost:3000/"}, "order_id": null, "createdAt": "2026-10-01T17:11:42.000Z", "reference": "9a5223d4cd319865c09a", "created_at": "2026-10-01T17:11:42.000Z", "fees_split": null, "ip_address": "102.89.23.200", "subaccount": {}, "plan_object": {}, "authorization": {"bin": "408408", "bank": "TEST BANK", "brand": "visa", "last4": "4081", "channel": "card", "exp_year": "2030", "reusable": true, "card_type": "visa ", "exp_month": "12", "signature": "SIG_a4BZScBS9LmxKd3ANW2k", "account_name": null, "country_code": "NG", "receiver_bank": null, "authorization_code": "AUTH_a4w8v4oqsz", "receiver_bank_account_number": null}, "response_code": "00", "fees_breakdown": null, "receipt_number": null, "gateway_response": "Successful", "requested_amount": 3750000, "transaction_date": "2026-10-01T17:11:42.000Z", "pos_transaction_data": null, "gateway_response_code": "approved"}	2026-10-01 17:11:55.977	2026-10-01 17:11:55.981	2026-10-01 17:11:55.981
c6641518-5062-4fa4-8d0f-564dd69e9b60	640f8316-97eb-4407-9ce1-7aaebd507f9e	5c988a3a6819b9bdfb73	11500.00	NGN	SUCCESS	{"id": 6614609576, "log": {"input": [], "errors": 0, "mobile": false, "history": [{"time": 4, "type": "action", "message": "Attempted to pay with card"}, {"time": 4, "type": "success", "message": "Successfully paid with card"}], "success": true, "attempts": 1, "start_time": 1790875309, "time_spent": 4}, "fees": 27250, "plan": null, "split": {}, "amount": 1150000, "domain": "test", "paidAt": "2026-10-01T17:21:52.000Z", "source": null, "status": "success", "channel": "card", "connect": null, "message": null, "paid_at": "2026-10-01T17:21:52.000Z", "currency": "NGN", "customer": {"id": 396650632, "email": "ojeonupromise924@gmail.com", "phone": null, "metadata": null, "last_name": null, "first_name": null, "risk_action": "default", "customer_code": "CUS_8m6iwkceu1hw294", "international_format_phone": null}, "metadata": {"referrer": "http://localhost:3000/"}, "order_id": null, "createdAt": "2026-10-01T17:21:42.000Z", "reference": "5c988a3a6819b9bdfb73", "created_at": "2026-10-01T17:21:42.000Z", "fees_split": null, "ip_address": "102.89.23.200", "subaccount": {}, "plan_object": {}, "authorization": {"bin": "408408", "bank": "TEST BANK", "brand": "visa", "last4": "4081", "channel": "card", "exp_year": "2030", "reusable": true, "card_type": "visa ", "exp_month": "12", "signature": "SIG_a4BZScBS9LmxKd3ANW2k", "account_name": null, "country_code": "NG", "receiver_bank": null, "authorization_code": "AUTH_sfkqxphn97", "receiver_bank_account_number": null}, "response_code": "00", "fees_breakdown": null, "receipt_number": null, "gateway_response": "Successful", "requested_amount": 1150000, "transaction_date": "2026-10-01T17:21:42.000Z", "pos_transaction_data": null, "gateway_response_code": "approved"}	2026-10-01 17:21:57.101	2026-10-01 17:21:57.107	2026-10-01 17:21:57.107
4bf0a528-c5ea-4fd9-8376-900ee366a8c8	ecc5a9f8-ab39-4a81-ac6f-c7563391aadd	6aaf48a561ed6b7fdb34	16500.00	NGN	SUCCESS	{"id": 6674560527, "log": {"input": [], "errors": 0, "mobile": false, "history": [{"time": 10, "type": "action", "message": "Attempted to pay with card"}, {"time": 12, "type": "success", "message": "Successfully paid with card"}], "success": true, "attempts": 1, "start_time": 1792422278, "time_spent": 12}, "fees": 34750, "plan": null, "split": {}, "amount": 1650000, "domain": "test", "paidAt": "2026-10-19T15:04:50.000Z", "source": null, "status": "success", "channel": "card", "connect": null, "message": null, "paid_at": "2026-10-19T15:04:50.000Z", "currency": "NGN", "customer": {"id": 396650632, "email": "ojeonupromise924@gmail.com", "phone": null, "metadata": null, "last_name": null, "first_name": null, "risk_action": "default", "customer_code": "CUS_8m6iwkceu1hw294", "international_format_phone": null}, "metadata": {"referrer": "http://localhost:3000/"}, "order_id": null, "createdAt": "2026-10-19T15:04:34.000Z", "reference": "6aaf48a561ed6b7fdb34", "created_at": "2026-10-19T15:04:34.000Z", "fees_split": null, "ip_address": "105.127.9.156", "subaccount": {}, "plan_object": {}, "authorization": {"bin": "408408", "bank": "TEST BANK", "brand": "visa", "last4": "4081", "channel": "card", "exp_year": "2030", "reusable": true, "card_type": "visa ", "exp_month": "12", "signature": "SIG_a4BZScBS9LmxKd3ANW2k", "account_name": null, "country_code": "NG", "receiver_bank": null, "authorization_code": "AUTH_vqhze99zer", "receiver_bank_account_number": null}, "response_code": "00", "fees_breakdown": null, "receipt_number": null, "gateway_response": "Successful", "requested_amount": 1650000, "transaction_date": "2026-10-19T15:04:34.000Z", "pos_transaction_data": null, "gateway_response_code": "approved"}	2026-10-19 15:04:54.503	2026-10-19 15:04:54.506	2026-10-19 15:04:54.506
59e81f66-03f2-4957-81bf-cf69500a5ff6	873a648f-7dd9-4b7a-b60a-f4a3b482f067	72286b21fe1dd8eb1094	70000.00	NGN	SUCCESS	{"id": 6674717307, "log": {"input": [], "errors": 0, "mobile": false, "history": [{"time": 5, "type": "action", "message": "Attempted to pay with card"}, {"time": 6, "type": "success", "message": "Successfully paid with card"}], "success": true, "attempts": 1, "start_time": 1792425683, "time_spent": 6}, "fees": 115000, "plan": null, "split": {}, "amount": 7000000, "domain": "test", "paidAt": "2026-10-19T16:01:30.000Z", "source": null, "status": "success", "channel": "card", "connect": null, "message": null, "paid_at": "2026-10-19T16:01:30.000Z", "currency": "NGN", "customer": {"id": 398140445, "email": "ifygloria888@gmail.com", "phone": null, "metadata": null, "last_name": null, "first_name": null, "risk_action": "default", "customer_code": "CUS_zh1gohcr9aetm2l", "international_format_phone": null}, "metadata": {"referrer": "http://localhost:3000/"}, "order_id": null, "createdAt": "2026-10-19T16:01:20.000Z", "reference": "72286b21fe1dd8eb1094", "created_at": "2026-10-19T16:01:20.000Z", "fees_split": null, "ip_address": "105.127.9.156", "subaccount": {}, "plan_object": {}, "authorization": {"bin": "408408", "bank": "TEST BANK", "brand": "visa", "last4": "4081", "channel": "card", "exp_year": "2030", "reusable": true, "card_type": "visa ", "exp_month": "12", "signature": "SIG_a4BZScBS9LmxKd3ANW2k", "account_name": null, "country_code": "NG", "receiver_bank": null, "authorization_code": "AUTH_q9qzfuvv8w", "receiver_bank_account_number": null}, "response_code": "00", "fees_breakdown": null, "receipt_number": null, "gateway_response": "Successful", "requested_amount": 7000000, "transaction_date": "2026-10-19T16:01:20.000Z", "pos_transaction_data": null, "gateway_response_code": "approved"}	2026-10-19 16:01:32.078	2026-10-19 16:01:32.08	2026-10-19 16:01:32.08
88fd7b8d-e9b3-4579-a46d-830601b497ea	f87087b3-c85d-4314-bb40-9b732bebf987	492a58e65397eb618bce	16500.00	NGN	SUCCESS	{"id": 6665816157, "log": {"input": [], "errors": 0, "mobile": false, "history": [{"time": 5, "type": "action", "message": "Attempted to pay with card"}, {"time": 6, "type": "success", "message": "Successfully paid with card"}], "success": true, "attempts": 1, "start_time": 1792194353, "time_spent": 6}, "fees": 34750, "plan": null, "split": {}, "amount": 1650000, "domain": "test", "paidAt": "2026-10-16T23:45:59.000Z", "source": null, "status": "success", "channel": "card", "connect": null, "message": null, "paid_at": "2026-10-16T23:45:59.000Z", "currency": "NGN", "customer": {"id": 396650632, "email": "ojeonupromise924@gmail.com", "phone": null, "metadata": null, "last_name": null, "first_name": null, "risk_action": "default", "customer_code": "CUS_8m6iwkceu1hw294", "international_format_phone": null}, "metadata": {"referrer": "http://localhost:3000/"}, "order_id": null, "createdAt": "2026-10-16T23:45:49.000Z", "reference": "492a58e65397eb618bce", "created_at": "2026-10-16T23:45:49.000Z", "fees_split": null, "ip_address": "102.88.104.44", "subaccount": {}, "plan_object": {}, "authorization": {"bin": "408408", "bank": "TEST BANK", "brand": "visa", "last4": "4081", "channel": "card", "exp_year": "2030", "reusable": true, "card_type": "visa ", "exp_month": "12", "signature": "SIG_a4BZScBS9LmxKd3ANW2k", "account_name": null, "country_code": "NG", "receiver_bank": null, "authorization_code": "AUTH_9tf33xlhe7", "receiver_bank_account_number": null}, "response_code": "00", "fees_breakdown": null, "receipt_number": null, "gateway_response": "Successful", "requested_amount": 1650000, "transaction_date": "2026-10-16T23:45:49.000Z", "pos_transaction_data": null, "gateway_response_code": "approved"}	2026-10-19 16:09:58.949	2026-10-19 16:09:58.952	2026-10-19 16:09:58.952
\.


--
-- Data for Name: PaymentAttempt; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PaymentAttempt" (id, "paymentId", "paystackRef", amount, status, "failureCode", "failureMessage", metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: PayoutBatch; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PayoutBatch" (id, reference, "totalAmount", "sellerCount", "payoutCount", status, "approvedById", "approvedAt", "processedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Product" (id, name, slug, description, "shortDescription", sku, price, "comparePrice", image, brand, "isFeatured", "isPublished", "categoryId", "createdAt", "updatedAt", "sellerId") FROM stdin;
066bffe5-0dd6-4295-bcc7-2a829fc4bff7	CeraVe Moisturizing Cream	cerave-moisturizing-cream	Rich moisturizing cream with ceramides and hyaluronic acid that restores the skin barrier and provides long-lasting hydration.	Deep hydration for dry skin.	CER-MC-001	18500.00	21000.00	\N	CeraVe	f	t	50cffa31-e485-45f3-b646-1260ad6de42f	2026-07-16 05:09:08.165	2026-09-05 04:55:56.245	\N
27b6f2e0-7794-466e-8ce4-44300ff14812	Aveeno Daily Moisturizing Lotion	aveeno-daily-moisturizing-lotion	Oat-based daily moisturizer clinically proven to improve dry skin.	24-hour moisturization.	AVE-DML-001	15000.00	17000.00	\N	Aveeno	f	t	0d5dab61-21c6-4d4f-8d33-0190a26c45ff	2026-07-16 05:23:52.308	2026-09-05 04:55:56.245	\N
98121df5-bc30-455f-b7ba-475f5fbf59d6	COSRX Advanced Snail 96 Mucin Essence	cosrx-snail-mucin-essence	Lightweight repairing essence that hydrates and improves skin texture.	Repair and hydrate.	COS-SNAIL-001	16500.00	19000.00	\N	COSRX	f	t	7e52aecb-4ed0-4f8f-b2c3-452c4601a7df	2026-07-16 05:16:11.871	2026-08-31 22:33:13.443	\N
4d04b01f-a6a7-46f3-a0ec-25473286e924	Bioderma Sensibio H2O Micellar Water	bioderma-sensibio-h2o	Micellar cleansing water designed for sensitive skin to remove makeup and impurities.	Micellar cleansing water.	BIO-H2O-001	13500.00	15000.00	\N	Bioderma	f	t	4f14a887-1440-459c-8c9f-11e660f7c05f	2026-07-16 05:21:48.813	2026-08-31 22:33:13.443	\N
4a328899-2160-4a4d-b92f-717c2022f70e	Eucerin Advanced Repair Lotion	eucerin-advanced-repair-lotion	Daily body lotion that repairs dry skin and locks in moisture for up to 48 hours.	Repair dry skin.	EUC-ARL-001	17500.00	19500.00	\N	Eucerin	f	t	50cffa31-e485-45f3-b646-1260ad6de42f	2026-07-16 05:20:31.481	2026-09-05 04:55:56.245	\N
5a9d9c39-ddc6-4c3a-bfc3-8dd38347e12c	Cetaphil Gentle Skin Cleanser	cetaphil-gentle-cleanser	Soap-free cleanser that removes dirt while maintaining the skin's natural moisture barrier.	Gentle daily cleanser.	CET-GSC-001	14000.00	16000.00	\N	Cetaphil	f	t	4f14a887-1440-459c-8c9f-11e660f7c05f	2026-07-16 05:17:30.938	2026-09-05 04:55:56.245	\N
8a58b510-1f11-46c5-a2ea-5f79053ecd6d	La Roche-Posay Effaclar Cleanser	la-roche-posay-effaclar-cleanser	Purifying foaming cleanser specially formulated for oily and acne-prone skin.	Gentle cleanser for oily skin.	LRP-EC-001	21000.00	23500.00	\N	La Roche-Posay	f	t	4f14a887-1440-459c-8c9f-11e660f7c05f	2026-07-16 05:11:53.381	2026-09-05 04:55:56.245	\N
9f40050b-3f0c-4d8f-a825-f9743aa438fd	E45 Daily Lotion	e45-daily-lotion	Lightweight moisturizing lotion suitable for dry and sensitive skin.	Everyday hydration.	E45-DL-001	8500.00	9800.00	\N	E45	f	t	0d5dab61-21c6-4d4f-8d33-0190a26c45ff	2026-07-16 05:23:00.588	2026-09-05 04:55:56.245	\N
ac200c40-f172-4c95-816d-37c65f708787	CeraVe Hydrating Cleanser	cerave-hydrating-cleanser-test	A gentle hydrating cleanser for normal to dry skin.	Gentle cleanser for normal to dry skin.	CERAVE-TEST-001	15000.00	18000.00	\N	CeraVe	t	t	3c895b12-88b2-4a03-a3a1-c40807ebe963	2026-07-27 19:53:21.471	2026-09-13 01:06:29.743	\N
ffe49baf-b561-4d18-9887-f4b47d65b63c	Neutrogena Hydro Boost Water Gel	neutrogena-hydro-boost-water-gel	Oil-free gel moisturizer enriched with hyaluronic acid for intense hydration.	Refreshing hydration.	NEU-HBG-001	15500.00	18000.00	\N	Neutrogena	f	t	32829123-27d1-499b-b9b3-9c4c62c0a6ca	2026-07-16 05:18:27.186	2026-09-05 04:55:56.245	\N
cad976d4-db28-45c8-b137-fcff747e86c2	The Ordinary Niacinamide 10% + Zinc 1%	ordinary-niacinamide-zinc	A high-strength vitamin and mineral blemish formula that reduces the appearance of blemishes and congestion.	Brightens and controls oil.	ORD-NIA-001	12500.00	14500.00	\N	The Ordinary	f	t	0d5dab61-21c6-4d4f-8d33-0190a26c45ff	2026-07-16 05:13:35.634	2026-09-05 05:14:10.054	\N
4bafac08-626c-4853-ab8f-04b871ea8c26	Fx chart	fx-chart	forex charting 	eur usd	Fx001	50000.00	70000.00	\N		t	f	66dcacac-c2b2-4a56-be2d-e731f3da38b4	2026-09-13 01:23:07.723	2026-09-13 15:37:51.068	\N
\.


--
-- Data for Name: ProductImage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductImage" (id, url, "publicId", "altText", "isPrimary", "position", "productId", "createdAt", "updatedAt") FROM stdin;
8f5263a2-4b57-4a0e-ad35-85bc4b7fe4ef	https://res.cloudinary.com/x76ffjai/image/upload/v1788219036/prolific-store/products/4d04b01f-a6a7-46f3-a0ec-25473286e924/rmn3aqvtz3ou45ihm4sp.jpg	prolific-store/products/4d04b01f-a6a7-46f3-a0ec-25473286e924/rmn3aqvtz3ou45ihm4sp	Bioderma Sensibio H2O Micellar Water	t	0	4d04b01f-a6a7-46f3-a0ec-25473286e924	2026-08-31 23:30:37.505	2026-08-31 23:30:37.505
35c0bdfb-22cd-4b76-8bbd-040de4008787	https://res.cloudinary.com/x76ffjai/image/upload/v1789314809/prolific-store/products/ac200c40-f172-4c95-816d-37c65f708787/ksoq2kzzf0pgfpz0gbpk.jpg	prolific-store/products/ac200c40-f172-4c95-816d-37c65f708787/ksoq2kzzf0pgfpz0gbpk	\N	t	0	ac200c40-f172-4c95-816d-37c65f708787	2026-09-13 15:53:29.415	2026-09-14 11:15:42.657
f4a66b4f-fa0e-4a20-a69d-17d6fe0509ef	https://res.cloudinary.com/x76ffjai/image/upload/v1786053124/prolific-store/products/ac200c40-f172-4c95-816d-37c65f708787/b48txs3d9h8csayi5flg.jpg	prolific-store/products/ac200c40-f172-4c95-816d-37c65f708787/b48txs3d9h8csayi5flg	CeraVe Hydrating Cleanser front view	t	1	ac200c40-f172-4c95-816d-37c65f708787	2026-08-06 21:52:06.396	2026-09-14 11:15:42.657
5ea9dfdf-458c-40a8-9f35-4181800e20aa	https://res.cloudinary.com/x76ffjai/image/upload/v1784354070/prolific-store/products/9f40050b-3f0c-4d8f-a825-f9743aa438fd/t6qgojbb867xfpovw7vo.jpg	prolific-store/products/9f40050b-3f0c-4d8f-a825-f9743aa438fd/t6qgojbb867xfpovw7vo	E45 moisturising cream	t	0	9f40050b-3f0c-4d8f-a825-f9743aa438fd	2026-07-18 05:54:31.712	2026-07-27 18:52:57
3303a2e7-032b-4c19-90ef-afdfff650a73	https://res.cloudinary.com/x76ffjai/image/upload/v1788219260/prolific-store/products/27b6f2e0-7794-466e-8ce4-44300ff14812/tao1hdgqbxzzawzbzald.jpg	prolific-store/products/27b6f2e0-7794-466e-8ce4-44300ff14812/tao1hdgqbxzzawzbzald	ALOEVERA	t	0	27b6f2e0-7794-466e-8ce4-44300ff14812	2026-08-31 23:34:21.427	2026-09-13 01:13:55.879
8487c6e1-9c4f-4050-83ab-28c6aef1067f	https://res.cloudinary.com/x76ffjai/image/upload/v1786053257/prolific-store/products/ac200c40-f172-4c95-816d-37c65f708787/r4jk7qfwwv3b453iscia.jpg	prolific-store/products/ac200c40-f172-4c95-816d-37c65f708787/r4jk7qfwwv3b453iscia	CeraVe Hydrating Cleanser front view	f	2	ac200c40-f172-4c95-816d-37c65f708787	2026-08-06 21:54:18.981	2026-09-14 11:15:42.657
f1a1c120-0433-44a6-94cd-84c184e93de5	https://res.cloudinary.com/x76ffjai/image/upload/v1789262772/prolific-store/products/4bafac08-626c-4853-ab8f-04b871ea8c26/eefsimfmst8wz3wxl79z.png	prolific-store/products/4bafac08-626c-4853-ab8f-04b871ea8c26/eefsimfmst8wz3wxl79z	\N	t	0	4bafac08-626c-4853-ab8f-04b871ea8c26	2026-09-13 01:26:12.653	2026-09-13 01:26:12.653
\.


--
-- Data for Name: ProductVariant; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductVariant" (id, "productId", name, sku, price, "comparePrice", stock, "isDefault", "isActive", "createdAt", "updatedAt") FROM stdin;
7cff3298-6e98-416d-8753-855ce7e90a16	ac200c40-f172-4c95-816d-37c65f708787	150ml	 HFC-50ML	10500.00	\N	30	f	t	2026-09-18 21:05:09.643	2026-09-30 07:29:43.152
73138993-9f7a-4745-8920-4d3ff06174a1	ac200c40-f172-4c95-816d-37c65f708787	150ml	HFC-150ML	10500.00	20000.00	42	f	t	2026-08-09 21:46:20.927	2026-09-30 22:07:03.251
6e5908db-910e-46bc-b8c9-d9be38e37437	066bffe5-0dd6-4295-bcc7-2a829fc4bff7	150ml	CER-MC-001	15500.00	17000.00	19	t	t	2026-09-01 15:14:33.259	2026-09-22 10:16:04.813
358c9512-170a-4648-a3ce-698d3a62ec2b	4d04b01f-a6a7-46f3-a0ec-25473286e924	150ml	BIO-H2O-001	15500.00	17000.00	36	t	t	2026-09-01 15:10:47.014	2026-10-19 16:01:32.074
23d08d10-805a-4355-9a88-1597f281c8ba	9f40050b-3f0c-4d8f-a825-f9743aa438fd	150ml	E45-DL-001	8500.00	9800.00	29	t	t	2026-09-01 15:17:27.158	2026-10-19 16:01:32.076
4dbf2d8d-dede-48f3-884a-c61554fccce0	ac200c40-f172-4c95-816d-37c65f708787	50ml	HFC-50ML	8500.00	10000.00	0	f	t	2026-08-09 21:45:15.755	2026-09-22 13:53:48.098
9dd1bca6-8e9a-4d52-9c35-7b2fe9cdf43b	27b6f2e0-7794-466e-8ce4-44300ff14812	150ml	AVE-DML-001	13500.00	15000.00	28	t	t	2026-09-03 20:12:30.41	2026-10-19 16:09:58.938
51d3437d-b3e0-4216-862e-8f80144e0207	4bafac08-626c-4853-ab8f-04b871ea8c26	90 ml	fx001	50000.00	\N	5	t	t	2026-09-13 01:27:21.842	2026-09-13 15:20:59.297
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Review" (id, "productId", "userId", rating, title, comment, "isVerifiedPurchase", "createdAt", "updatedAt") FROM stdin;
a9feee78-19f4-4cc5-9c5a-7776b5c581e2	ac200c40-f172-4c95-816d-37c65f708787	cf4d2016-3415-466b-8ba1-3dbc65ca852e	3	\N	the product is awesome 	t	2026-09-24 20:27:24.378	2026-09-24 20:27:24.378
e7240dff-0a40-413e-b620-6914bf3b570b	ac200c40-f172-4c95-816d-37c65f708787	f4d1888f-32ef-41a0-9f75-9ad57390495f	5	\N	my face was ultra smooth\n	t	2026-09-24 20:29:55.394	2026-09-24 20:29:55.394
5126c10e-7e9a-4cae-a511-fcfda1e93970	27b6f2e0-7794-466e-8ce4-44300ff14812	378969e1-0f15-4969-bfc4-1e79b4e825a8	4	\N	This product is so real i love it	t	2026-10-01 17:17:42.541	2026-10-01 17:17:42.541
\.


--
-- Data for Name: Seller; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Seller" (id, "userId", "businessName", "businessEmail", "businessPhone", "bankName", "accountNumber", "accountName", "commissionRate", "settlementCycle", "isActive", "isVerified", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SellerBalance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SellerBalance" (id, "sellerId", "pendingAmount", "availableAmount", "paidAmount", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SellerPayout; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SellerPayout" (id, "sellerId", "batchId", amount, status, provider, "providerReference", "failureReason", "requestedAt", "processedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SellerSettlement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SellerSettlement" (id, "sellerId", "orderId", "grossAmount", commission, "platformFee", refunds, adjustments, "netAmount", status, "eligibleAt", "settledAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, "firstName", "lastName", email, password, role, "createdAt", "updatedAt", "emailVerified", "isActive", "lastLogin", "refreshToken", "avatarPublicId", "avatarUrl", "googleId", "resetToken", "resetTokenExpiry") FROM stdin;
7cea8560-6c69-4d5c-af4e-c26fb224e223	Promise	Admin	admin@test.com	$2b$10$nJLQmFnrTXJ5hjHlTc4m1OqOrMNPljfkIHs.XHvFHtmVU8dl0.97y	ADMIN	2026-07-05 21:46:19.504	2026-07-05 21:54:31.916	f	t	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3Y2VhODU2MC02YzY5LTRkNWMtYWY0ZS1jMjZmYjIyNGUyMjMiLCJpYXQiOjE3ODMyODg0NzEsImV4cCI6MTc4NTg4MDQ3MX0.iCkhBDAb6SU3SF5N0I46_4slsVi7u4cXIDuDIZOgu38	\N	\N	\N	\N	\N
8162b10d-dfa6-4a60-bf74-095eeaa7ef9f	Hope	Ojumah	Hope1234@gmaail.com	$2b$10$qbvFEsfeCvEM8YzY5je4V.G1jm18IvlJR.E.958yfn52vbl.IUuNK	CUSTOMER	2026-08-30 15:08:43.033	2026-08-30 15:12:11.2	f	t	\N	\N	\N	\N	\N	\N	\N
2b6b1553-6d92-4558-bd40-5ae40f153aa1	Ojeonu	Promise	virtualpaws.924@gmail.com	\N	CUSTOMER	2026-09-16 19:41:44.256	2026-09-20 16:09:15.477	t	t	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYjZiMTU1My02ZDkyLTQ1NTgtYmQ0MC01YWU0MGYxNTNhYTEiLCJpYXQiOjE3ODk5MjA1NTUsImV4cCI6MTc5MjUxMjU1NX0.11BEFl65j0DXDV72-VVXD5M-K-VhdBLCr4j4IHnRjYU	\N	\N	102947664997501176395	\N	\N
b79d659d-d638-4885-82e9-3be90dbefc44	Promise	O	promise@test.com	$2b$10$9XxTQMM4ABNJtCjZhQGVGOeUfhzqay/JBWPEjkB9D1zjWSGlm0kZ2	ADMIN	2026-06-29 21:28:38.329	2026-07-02 18:44:24.867	f	t	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiNzlkNjU5ZC1kNjM4LTQ4ODUtODJlOS0zYmU5MGRiZWZjNDQiLCJpYXQiOjE3ODMwMTc4NjQsImV4cCI6MTc4NTYwOTg2NH0.BT_9p0YuaXCH2E10bUgAI4b8IekmGOTv9cwErgCTIVw	\N	\N	\N	\N	\N
cf4d2016-3415-466b-8ba1-3dbc65ca852e	Mr P	Customer	ojeonupromise924@gmail.com	$2b$10$mteTmDdTK7ABu.ZfCD4HLuVwsOPcL99jF3/FwL3gk1HL9nyHwD/9W	CUSTOMER	2026-08-15 22:28:07.886	2026-10-19 15:04:01.029	f	t	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjZjRkMjAxNi0zNDE1LTQ2NmItOGJhMS0zZGJjNjVjYTg1MmUiLCJpYXQiOjE3OTI0MjIyNDEsImV4cCI6MTc5NTAxNDI0MX0.858zVqMny7SaRcisxZL1lgWSApgzG6jOi1Ap6EplVhM	prolific-store/avatars/kudjx8bhwinnnyw2g024	https://res.cloudinary.com/x76ffjai/image/upload/v1789764995/prolific-store/avatars/kudjx8bhwinnnyw2g024.jpg	113624494415435812652	66eea3b0cad82b01893e98c434eda2b5000fbe609275a3b92a031ff95450b645	2026-09-19 19:47:08.452
1e9f2a20-b428-45ad-bf16-c3e427a0a5ef	Chris 	Kelvin	okhianc111@gmail.com	$2b$10$vHn5ar2Y0udhAWr4eDy2n.QxlC2UJZ5pzZUKWKMWdZcQ8our9xtyK	CUSTOMER	2026-09-10 18:44:56.663	2026-09-12 19:41:48.18	f	t	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxZTlmMmEyMC1iNDI4LTQ1YWQtYmYxNi1jM2U0MjdhMGE1ZWYiLCJpYXQiOjE3ODkyNDIxMDgsImV4cCI6MTc5MTgzNDEwOH0.BoLTQSI30d9UWgPH3Z1tGMcZmvRZNc_bQsvbKmGLmaU	\N	\N	\N	\N	\N
c59c3c2e-e6c3-4a65-a4c9-cef577edffdb	kelvin	Ojeonu	Promise22924@gmail.com	$2b$10$W7lnSTevMOfAFWLHw2eUTum6JEGQhkmQcB3jb6tKsrIQTsoDJwbBS	CUSTOMER	2026-09-12 23:23:07.141	2026-09-13 12:51:25.613	f	t	\N	\N	\N	\N	\N	\N	\N
f4d1888f-32ef-41a0-9f75-9ad57390495f	Gloria 	Iyesele	ifygloria888@gmail.com	$2b$10$KqE98IMOzGI5al9CqQIOeueGbYka/nIm.g2p8stcrJP5ROLUjrtoS	CUSTOMER	2026-09-10 03:34:01.529	2026-10-19 15:57:19.757	f	t	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNGQxODg4Zi0zMmVmLTQxYTAtOWY3NS05YWQ1NzM5MDQ5NWYiLCJpYXQiOjE3OTI0MjU0MzksImV4cCI6MTc5NTAxNzQzOX0.ZSDW_fgDFTejbCVWp1M48bZfS9Ct2UlIUQ5bcAbFWIw	\N	\N	\N	\N	\N
d064c748-cd8b-4d6c-84de-4af2153257e2	Promise	Admin	promise1@test.com	$2b$10$yX28LUBtF1jfr1pucrLVd.w5/mM3Uk489j7H49quG5kiHwqw0/Ase	ADMIN	2026-07-07 10:26:27.213	2026-10-19 16:09:39.478	f	t	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkMDY0Yzc0OC1jZDhiLTRkNmMtODRkZS00YWYyMTUzMjU3ZTIiLCJpYXQiOjE3OTI0MjYxNzksImV4cCI6MTc5NTAxODE3OX0.4oTBB8_bABdpDgE592XP9Tus6kZI6YavcdHvmjgPjnw	\N	\N	\N	\N	\N
987aba3b-4018-4fc7-a810-b4c0e9ab58dd	Ikenna	Henry	hnikenna@yahoo.com	$2b$10$Htf9mF8EDb2CEraqttBsJO9aqcVYROF.F.7NzMozAsMxwbrz/x5mS	CUSTOMER	2026-09-22 13:50:39.526	2026-09-22 14:07:33.34	f	t	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5ODdhYmEzYi00MDE4LTRmYzctYTgxMC1iNGMwZTlhYjU4ZGQiLCJpYXQiOjE3OTAwODYwNTMsImV4cCI6MTc5MjY3ODA1M30.lV1pYxRl9HxI09OBQMUiAv8HkyoZDwqaaSZUrE63Uvg	\N	\N	\N	\N	\N
378969e1-0f15-4969-bfc4-1e79b4e825a8	Prince 	Ocheme	ochemeprince86@gmail.com	$2b$10$qwHE9Jt0rEMgvHhzmRulnOvWISpMTFz8AyWVWo30HbzGiNMd7z5fm	CUSTOMER	2026-10-01 17:09:35.949	2026-10-16 23:30:59.082	f	t	\N	\N	\N	\N	\N	\N	\N
8d6d1ec3-95b8-40a9-b293-503b850a89d0	Meshack 	Osakwe 	meshackosakweb@gmail.com	$2b$10$N7I9mdRpXz6XwUvRi8MM3eq5IrFkXeOqaIfkD5dqzzEj3sm6LJYVS	CUSTOMER	2026-09-30 22:04:28.209	2026-10-01 17:04:03.4	f	t	\N	\N	\N	\N	\N	\N	\N
938d475a-f0ac-4c82-8e73-e2157160f587	prince 	ocheme	ochemeprince@gmail.com	$2b$10$HLRyujaePW3VIb/l/zh.5./Qto2Yl1ETPA.WDL/5uthdjHOB54MFe	CUSTOMER	2026-09-05 15:15:07.193	2026-10-01 17:05:03.626	f	t	\N	\N	\N	\N	\N	dd14a6ee8ae76d9d9b84fcdd23e0b8bfed68995ff25a3f435e16433ab1a97be9	2026-10-01 18:05:03.625
\.


--
-- Data for Name: Wallet; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Wallet" (id, "userId", balance, currency, "isActive", "createdAt", "updatedAt") FROM stdin;
78ad680b-db78-4de7-86c8-44e9ce0b8b6d	d064c748-cd8b-4d6c-84de-4af2153257e2	4000.00	NGN	t	2026-10-01 17:34:21.095	2026-10-01 17:55:31.115
\.


--
-- Data for Name: WalletTransaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WalletTransaction" (id, "walletId", type, amount, "balanceAfter", reference, description, metadata, "createdAt") FROM stdin;
368d2ebc-459b-4669-925b-48c4417112f5	78ad680b-db78-4de7-86c8-44e9ce0b8b6d	TOPUP	5000.00	5000.00	TOPUP_TEST_001	Test topup	\N	2026-10-01 17:35:14.834
93ecb983-b457-4666-9c54-74363d28d645	78ad680b-db78-4de7-86c8-44e9ce0b8b6d	PAYMENT	2000.00	3000.00	PAY_TEST_001	Test payment	\N	2026-10-01 17:41:18.967
4d346fa3-bf0a-4a46-b48e-6211e8d0a610	78ad680b-db78-4de7-86c8-44e9ce0b8b6d	TOPUP	1000.00	4000.00	REFUND_TEST_001	Test refund	\N	2026-10-01 17:55:31.133
\.


--
-- Data for Name: Wishlist; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Wishlist" (id, "customerId", name, slug, description, type, visibility, occasion, "shareToken", "expiresAt", "createdAt", "updatedAt") FROM stdin;
0ef5400d-a059-46de-a60b-cb0564493f2c	cf4d2016-3415-466b-8ba1-3dbc65ca852e	My Wishlist	my-wishlist-98011c	\N	SHARED	LINK_ONLY	GENERAL	84b7e93a7a1bb2e4ea86603a9fa15abc	\N	2026-09-18 20:43:27.814	2026-09-18 21:12:59.634
f9a41750-9eb4-460b-abcd-1c7990bc4c8e	2b6b1553-6d92-4558-bd40-5ae40f153aa1	My Wishlist	my-wishlist-6faa5b	\N	PRIVATE	PRIVATE	GENERAL	\N	\N	2026-09-19 13:02:27.194	2026-09-19 13:02:27.194
f2afef43-e150-4040-9798-1438dac76f68	cf4d2016-3415-466b-8ba1-3dbc65ca852e	My Wishlist	my-wishlist-29bc16	\N	SHARED	LINK_ONLY	GENERAL	509e5971b04200b5afadec1c4e805e74	\N	2026-09-19 13:04:44.081	2026-09-19 13:25:12.673
a225e296-37e4-499a-a0ad-18912f96de34	cf4d2016-3415-466b-8ba1-3dbc65ca852e	My Wishlist	my-wishlist-8e5cda	\N	SHARED	LINK_ONLY	GENERAL	0449e78f9d18bb7b375e4bc5bf99ade3	\N	2026-09-19 13:25:33.345	2026-09-19 13:26:47.342
eb8017f9-bd26-4d67-954b-943ecad16175	cf4d2016-3415-466b-8ba1-3dbc65ca852e	My Wishlist	my-wishlist-c8b264	\N	SHARED	LINK_ONLY	GENERAL	cf3f9a8600a453986b9ac59d604d8363	\N	2026-09-19 13:27:32.381	2026-09-19 20:12:32.328
ef325e74-df2e-451b-9c28-c5c25ae5c186	cf4d2016-3415-466b-8ba1-3dbc65ca852e	My Wishlist	my-wishlist-6ed24d	\N	SHARED	LINK_ONLY	GENERAL	945a4d3bd6a4732bba7a73b05cbabd01	\N	2026-09-19 20:12:47.315	2026-09-19 23:40:21.124
65997072-9445-40eb-9ebe-a7c1928a26c0	cf4d2016-3415-466b-8ba1-3dbc65ca852e	My Wishlist	my-wishlist-6b7126	\N	SHARED	LINK_ONLY	GENERAL	76261567ee44505ff58864850768db6c	\N	2026-09-19 23:40:33.408	2026-09-20 15:05:30.024
f711f997-9ec0-4f07-bfea-4c746ac86182	f4d1888f-32ef-41a0-9f75-9ad57390495f	My birthday	my-birthday-36b0e1	\N	PRIVATE	PRIVATE	BIRTHDAY	\N	\N	2026-09-21 18:08:26.454	2026-09-21 18:08:26.454
78061c59-d52b-40b4-a55e-584796c5d5c2	f4d1888f-32ef-41a0-9f75-9ad57390495f	My Wishlist	my-wishlist-e4ef67	\N	SHARED	LINK_ONLY	GENERAL	4557fd22ae4146ba658414369f06e52d	\N	2026-09-19 13:29:52.482	2026-09-21 18:09:34.544
d17a381c-e8d4-4192-b47a-99cd9f590f77	cf4d2016-3415-466b-8ba1-3dbc65ca852e	My Wishlist	my-wishlist-215094	\N	SHARED	LINK_ONLY	GENERAL	c752d4c0f28dd8aa0b334af43b05b605	\N	2026-09-20 15:05:43.738	2026-09-21 18:32:45.674
06a4ed7e-f951-4657-8583-efbd58eddd7c	cf4d2016-3415-466b-8ba1-3dbc65ca852e	My Wishlist	my-wishlist-9d13e9	\N	SHARED	LINK_ONLY	GENERAL	2159b19fa9a3865f3c830cfa32fb8040	\N	2026-09-21 18:32:55.285	2026-09-21 18:49:38.736
3b50222c-67dc-43cf-91c4-9971802fa393	cf4d2016-3415-466b-8ba1-3dbc65ca852e	My Wishlist	my-wishlist-df6277	\N	SHARED	LINK_ONLY	GENERAL	1b40247ca58290b4e5c7c7c17c95c005	\N	2026-09-18 21:13:16.636	2026-09-21 18:55:01.157
e580794a-7d08-4796-a2e5-6697425f87a6	cf4d2016-3415-466b-8ba1-3dbc65ca852e	My Wishlist	my-wishlist-c6ca28	\N	SHARED	LINK_ONLY	GENERAL	1e289072b79858bb11937f4b6c188876	\N	2026-09-21 18:53:53.079	2026-09-21 19:53:02.092
b0d92117-7305-45e1-a654-82b9aa7ad5fd	cf4d2016-3415-466b-8ba1-3dbc65ca852e	My Wishlist	my-wishlist-f9f02b	\N	SHARED	LINK_ONLY	GENERAL	613fa69ffa1a174d93de54a29c026726	\N	2026-09-21 19:55:24.832	2026-09-21 19:56:00.645
0087b578-5ead-4c21-a471-60656b7a99d2	f4d1888f-32ef-41a0-9f75-9ad57390495f	My Wishlist	my-wishlist-145911	\N	SHARED	LINK_ONLY	GENERAL	88a97a40cacfbae37fda59f92937fc2a	\N	2026-09-21 18:10:00.313	2026-09-22 10:09:44.415
723ebac2-3811-409e-9698-067c52ed0830	f4d1888f-32ef-41a0-9f75-9ad57390495f	My Wishlist	my-wishlist-a0ce2d	\N	PRIVATE	PRIVATE	GENERAL	\N	\N	2026-09-22 10:20:02.313	2026-09-22 10:20:02.313
b3e97473-ee0a-40f1-8ff6-fb299124c624	cf4d2016-3415-466b-8ba1-3dbc65ca852e	My Wishlist	my-wishlist-5300bf	\N	SHARED	LINK_ONLY	GENERAL	95b009546812a7293d1408eaa09462ca	\N	2026-09-22 05:20:54.208	2026-09-22 13:47:30.351
69ec0192-ee1a-4585-8eb5-04a6342df4e3	987aba3b-4018-4fc7-a810-b4c0e9ab58dd	My Wishlist	my-wishlist-f4d09b	\N	PRIVATE	PRIVATE	GENERAL	\N	\N	2026-09-22 13:51:28.954	2026-09-22 13:51:28.954
5ec1df65-d744-4350-ae22-96270548e892	cf4d2016-3415-466b-8ba1-3dbc65ca852e	My Wishlist	my-wishlist-2e3e7f	\N	SHARED	LINK_ONLY	GENERAL	3311c22eedd72ab1b8617b6a60449b99	\N	2026-09-22 13:58:29.496	2026-09-22 14:05:23.751
fda65f8b-09bb-47a2-bd04-2e5fe455902d	cf4d2016-3415-466b-8ba1-3dbc65ca852e	My Wishlist	my-wishlist-5da05b	\N	SHARED	LINK_ONLY	GENERAL	ac40675f71a9c2d9330440f1003c799d	\N	2026-09-22 16:34:13.827	2026-09-22 18:44:36.064
ae53174f-0452-43c0-bd5b-1e50bc1e7821	8d6d1ec3-95b8-40a9-b293-503b850a89d0	My Wishlist	my-wishlist-459563	\N	PRIVATE	PRIVATE	GENERAL	\N	\N	2026-09-30 22:07:02.091	2026-09-30 22:07:02.091
b76cd768-3c6a-4f12-8da5-b1a386950213	378969e1-0f15-4969-bfc4-1e79b4e825a8	My Wishlist	my-wishlist-746cd0	\N	SHARED	LINK_ONLY	GENERAL	fbd77d99f0476c91acdb213c26d8b0ae	\N	2026-10-01 17:11:55.206	2026-10-01 17:18:51.586
9eae2ff2-2ec6-4126-bd5b-1b8ad43dbd5f	378969e1-0f15-4969-bfc4-1e79b4e825a8	My Wishlist	my-wishlist-3abe86	\N	PRIVATE	PRIVATE	GENERAL	\N	\N	2026-10-01 17:19:46.152	2026-10-01 17:19:46.152
a29b49f7-7bcd-443b-bd4e-d0d08d7e0046	cf4d2016-3415-466b-8ba1-3dbc65ca852e	My Wishlist	my-wishlist-74072a	\N	SHARED	LINK_ONLY	GENERAL	faff53cd56b3dbdba6d8b3bb7f506d75	\N	2026-09-22 19:03:26.65	2026-10-19 15:54:57.492
7a34dd50-a5d0-4e38-a20d-709e353bb2ff	cf4d2016-3415-466b-8ba1-3dbc65ca852e	My Wishlist	my-wishlist-70a68e	\N	SHARED	LINK_ONLY	GENERAL	5d8bb89314ff39b506d8dacd2e0dadc4	\N	2026-10-19 15:58:36.459	2026-10-19 15:58:48.519
9e031ca9-8415-46ee-9b7b-381aea7096f9	cf4d2016-3415-466b-8ba1-3dbc65ca852e	My Wishlist	my-wishlist-8c9332	\N	PRIVATE	PRIVATE	GENERAL	\N	\N	2026-10-19 15:59:24.937	2026-10-19 15:59:24.937
\.


--
-- Data for Name: WishlistItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WishlistItem" (id, "productId", "addedAt", notes, priority, quantity, status, "variantId", "wishlistId") FROM stdin;
e2f9f9ab-b3c7-4b49-80a5-66d109d64fbd	ac200c40-f172-4c95-816d-37c65f708787	2026-09-18 21:08:00.459	\N	0	1	AVAILABLE	\N	0ef5400d-a059-46de-a60b-cb0564493f2c
8a929069-8576-4d1d-a571-024430ee474b	27b6f2e0-7794-466e-8ce4-44300ff14812	2026-09-18 21:11:33.906	\N	0	1	AVAILABLE	\N	0ef5400d-a059-46de-a60b-cb0564493f2c
2b189808-ce4e-487d-ba7d-191d2f5be9a8	27b6f2e0-7794-466e-8ce4-44300ff14812	2026-09-19 12:54:54.763	\N	0	1	GIFTED	\N	3b50222c-67dc-43cf-91c4-9971802fa393
51c7ff23-d06e-4e71-b6a3-4b6a06be34f7	27b6f2e0-7794-466e-8ce4-44300ff14812	2026-09-19 13:23:53.368	\N	0	1	AVAILABLE	\N	f2afef43-e150-4040-9798-1438dac76f68
9bbb69de-0e04-47b1-bbbc-b7761ab01722	ac200c40-f172-4c95-816d-37c65f708787	2026-09-19 20:12:19.573	\N	0	1	AVAILABLE	\N	eb8017f9-bd26-4d67-954b-943ecad16175
0725adde-b8f1-40dd-9dde-7c56191e8c46	ac200c40-f172-4c95-816d-37c65f708787	2026-09-21 19:55:40	\N	0	1	AVAILABLE	\N	b0d92117-7305-45e1-a654-82b9aa7ad5fd
da5b8636-f4da-4b47-ab10-88c85ec64e80	ac200c40-f172-4c95-816d-37c65f708787	2026-09-22 14:04:57.661	\N	0	1	AVAILABLE	\N	5ec1df65-d744-4350-ae22-96270548e892
65112632-7d99-4657-ba26-649bd9fddc53	4d04b01f-a6a7-46f3-a0ec-25473286e924	2026-09-19 23:40:07.426	\N	0	1	GIFTED	\N	ef325e74-df2e-451b-9c28-c5c25ae5c186
0c7f1a24-07ef-4cb6-a343-3d6e4d7b92af	9f40050b-3f0c-4d8f-a825-f9743aa438fd	2026-09-20 15:05:08.098	\N	0	1	AVAILABLE	\N	65997072-9445-40eb-9ebe-a7c1928a26c0
c59feba3-c62c-4793-aaaf-20970a09491f	4d04b01f-a6a7-46f3-a0ec-25473286e924	2026-09-20 15:05:09.146	\N	0	1	AVAILABLE	\N	65997072-9445-40eb-9ebe-a7c1928a26c0
8e5afc4b-6f9d-4b84-a4ac-159597e96f95	ac200c40-f172-4c95-816d-37c65f708787	2026-09-21 19:52:31.646	\N	0	1	AVAILABLE	\N	e580794a-7d08-4796-a2e5-6697425f87a6
98e2d9bb-7a46-44d2-92a1-9297d04ef046	9f40050b-3f0c-4d8f-a825-f9743aa438fd	2026-09-22 10:09:34.034	\N	0	1	AVAILABLE	\N	0087b578-5ead-4c21-a471-60656b7a99d2
927cc0c9-ab67-46c7-b5a1-ccc46b6276c2	ac200c40-f172-4c95-816d-37c65f708787	2026-09-20 15:05:05.856	\N	0	1	GIFTED	\N	65997072-9445-40eb-9ebe-a7c1928a26c0
4bce5791-87e9-4e97-95f1-4195e8234393	27b6f2e0-7794-466e-8ce4-44300ff14812	2026-09-20 15:05:06.97	\N	0	1	GIFTED	\N	65997072-9445-40eb-9ebe-a7c1928a26c0
b26c510c-6ef8-46f6-a133-b319672e979f	9f40050b-3f0c-4d8f-a825-f9743aa438fd	2026-09-19 12:55:00.2	\N	0	1	AVAILABLE	\N	3b50222c-67dc-43cf-91c4-9971802fa393
33582acf-6f0b-4f81-a720-0b724afa4166	27b6f2e0-7794-466e-8ce4-44300ff14812	2026-09-19 23:40:03.717	\N	0	1	GIFTED	\N	ef325e74-df2e-451b-9c28-c5c25ae5c186
8c839a48-1583-490e-ad86-f9b6775d3729	9f40050b-3f0c-4d8f-a825-f9743aa438fd	2026-09-19 23:40:05.436	\N	0	1	GIFTED	\N	ef325e74-df2e-451b-9c28-c5c25ae5c186
e76531f7-c702-4e86-80c0-024402aaf6fe	4d04b01f-a6a7-46f3-a0ec-25473286e924	2026-09-22 10:09:36.011	\N	0	1	AVAILABLE	\N	0087b578-5ead-4c21-a471-60656b7a99d2
e20d9b0f-1bc4-4e60-9710-830af97eaeb0	9f40050b-3f0c-4d8f-a825-f9743aa438fd	2026-09-21 18:08:57.483	\N	0	1	GIFTED	\N	78061c59-d52b-40b4-a55e-584796c5d5c2
2690f69b-aee9-4935-b0eb-5b2b5443ca66	ac200c40-f172-4c95-816d-37c65f708787	2026-09-21 18:32:35.929	\N	0	1	GIFTED	\N	d17a381c-e8d4-4192-b47a-99cd9f590f77
0d633469-bce4-437a-b2e8-7d452087fc34	27b6f2e0-7794-466e-8ce4-44300ff14812	2026-09-22 13:46:20.946	\N	0	1	GIFTED	\N	b3e97473-ee0a-40f1-8ff6-fb299124c624
893b7a0d-ce89-4072-9c4c-dc8b492e415f	ac200c40-f172-4c95-816d-37c65f708787	2026-09-21 18:47:23.289	\N	0	1	GIFTED	\N	06a4ed7e-f951-4657-8583-efbd58eddd7c
a26b2aca-6a96-4d61-8ad8-f52b921f3bd8	ac200c40-f172-4c95-816d-37c65f708787	2026-09-19 23:39:57.52	\N	0	1	AVAILABLE	\N	ef325e74-df2e-451b-9c28-c5c25ae5c186
bfca96ad-ec98-4734-b41c-02ab1f9798d6	9f40050b-3f0c-4d8f-a825-f9743aa438fd	2026-09-22 18:42:43.786	\N	0	1	GIFTED	\N	fda65f8b-09bb-47a2-bd04-2e5fe455902d
4d966860-f08b-4025-84e2-a425db520c8d	ac200c40-f172-4c95-816d-37c65f708787	2026-09-22 13:44:51.77	\N	0	1	GIFTED	\N	b3e97473-ee0a-40f1-8ff6-fb299124c624
7a19c28f-70c6-4721-a0a1-882c95b68c6f	ac200c40-f172-4c95-816d-37c65f708787	2026-09-22 10:09:28.447	\N	0	1	GIFTED	\N	0087b578-5ead-4c21-a471-60656b7a99d2
041d5480-6c39-4f64-b1a4-23604478a824	27b6f2e0-7794-466e-8ce4-44300ff14812	2026-09-22 10:09:32.031	\N	0	1	GIFTED	\N	0087b578-5ead-4c21-a471-60656b7a99d2
94065781-5369-4a94-9368-2bccdac7b915	4d04b01f-a6a7-46f3-a0ec-25473286e924	2026-09-22 13:46:26.153	\N	0	1	AVAILABLE	\N	b3e97473-ee0a-40f1-8ff6-fb299124c624
78b272cb-3ba0-47b8-a80d-56c7e88ecbcb	9f40050b-3f0c-4d8f-a825-f9743aa438fd	2026-09-22 14:05:02.063	\N	0	1	GIFTED	\N	5ec1df65-d744-4350-ae22-96270548e892
7f2d1686-6936-411d-8e36-32807a2ce6e8	4d04b01f-a6a7-46f3-a0ec-25473286e924	2026-09-22 14:05:03.823	\N	0	1	GIFTED	\N	5ec1df65-d744-4350-ae22-96270548e892
8de4250c-ba2c-4081-83c9-2d79b3397e66	9f40050b-3f0c-4d8f-a825-f9743aa438fd	2026-09-22 13:46:23.586	\N	0	1	GIFTED	\N	b3e97473-ee0a-40f1-8ff6-fb299124c624
a715f10d-a1b4-4f35-8dfb-ee7fee6af0c6	4d04b01f-a6a7-46f3-a0ec-25473286e924	2026-09-22 18:42:45.902	\N	0	1	AVAILABLE	\N	fda65f8b-09bb-47a2-bd04-2e5fe455902d
c9f8769d-dc56-4c43-8614-82a0d92b1762	27b6f2e0-7794-466e-8ce4-44300ff14812	2026-09-22 14:05:00.361	\N	0	1	GIFTED	\N	5ec1df65-d744-4350-ae22-96270548e892
b8d3394c-472a-49dd-965d-70f9e2aa0122	ac200c40-f172-4c95-816d-37c65f708787	2026-09-22 18:42:39.47	\N	0	1	AVAILABLE	\N	fda65f8b-09bb-47a2-bd04-2e5fe455902d
ded066be-cf63-4f2b-a317-bd41ff5e1911	27b6f2e0-7794-466e-8ce4-44300ff14812	2026-09-22 18:42:41.522	\N	0	1	AVAILABLE	\N	fda65f8b-09bb-47a2-bd04-2e5fe455902d
dec45747-2242-47f4-882f-666f496681b3	27b6f2e0-7794-466e-8ce4-44300ff14812	2026-09-21 18:08:55.359	\N	0	1	AVAILABLE	\N	78061c59-d52b-40b4-a55e-584796c5d5c2
1f2e009f-fd89-4346-8d64-91dd5ce3ce72	9f40050b-3f0c-4d8f-a825-f9743aa438fd	2026-09-21 19:55:42.28	\N	0	1	GIFTED	\N	b0d92117-7305-45e1-a654-82b9aa7ad5fd
b1d71096-e730-49e6-adbb-1b8aa55a3e7e	ac200c40-f172-4c95-816d-37c65f708787	2026-10-01 17:18:31.167	\N	0	1	AVAILABLE	\N	b76cd768-3c6a-4f12-8da5-b1a386950213
e073353e-6b38-4246-9861-62177f152e20	9f40050b-3f0c-4d8f-a825-f9743aa438fd	2026-10-01 17:18:39.729	\N	0	1	GIFTED	\N	b76cd768-3c6a-4f12-8da5-b1a386950213
d2ec6dc9-ba8b-4618-9677-155a6da8a16b	ac200c40-f172-4c95-816d-37c65f708787	2026-10-19 15:49:02.558	\N	0	1	RESERVED	\N	a29b49f7-7bcd-443b-bd4e-d0d08d7e0046
4a15cc7c-4fd6-4464-9f94-f5b45aa5ae41	27b6f2e0-7794-466e-8ce4-44300ff14812	2026-09-21 19:55:37.877	\N	0	1	GIFTED	\N	b0d92117-7305-45e1-a654-82b9aa7ad5fd
5d14d4ed-968d-4878-b70e-7e8ea61e9ace	9f40050b-3f0c-4d8f-a825-f9743aa438fd	2026-10-19 15:58:36.471	\N	0	1	GIFTED	\N	7a34dd50-a5d0-4e38-a20d-709e353bb2ff
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
9984ac52-cb92-4b64-9bb9-fd4f8800c33b	a274d94c854d5240c8a8df416f0cd14daeead9e0f4cf2b5ef7a3acb81b9c891c	2026-06-28 12:14:36.015015-07	20260628191435_init	\N	\N	2026-06-28 12:14:35.983369-07	1
39d36249-099f-4b4c-b641-3dd5f0af9ee2	aa2be7d08ffd2173e1e25e6fa2792e2ab479c082e1b02bfea4c65d95e2dbddae	2026-06-28 13:42:14.051609-07	20260628204213_auth_upgrade	\N	\N	2026-06-28 13:42:13.943981-07	1
9548d791-b547-47f2-9051-33b8f782a9b4	81c5e2eab3db2d021cf341c0ed383e4c810b930a4ed4e539ceacb9562177b2cd	2026-07-03 14:30:48.509893-07	20260703213048_add_products	\N	\N	2026-07-03 14:30:48.251071-07	1
27f46160-c32c-49d3-834f-1aae8ee6a54f	3233eb96130418f76634c8ee69e0808e5828c4eea371f2e5c51f3deabbd6cc48	2026-07-04 15:59:36.30646-07	20260704225936_add_categories	\N	\N	2026-07-04 15:59:36.18865-07	1
a11651ad-0fa6-4c34-84d5-6263e5ff37fb	5963b15ad823f2cf4e5cf62f18e8fac75dba5c419ff006da429c6ec7f43bce31	2026-07-15 20:48:19.760667-07	20260716034819_add_product_images	\N	\N	2026-07-15 20:48:19.545331-07	1
582df867-cc1f-46a6-921b-00b01e952ee4	295732b227244c74c5ff438e3ffcf9c8a3a9f24b9dea3aad1c3e06d5316d648a	2026-09-22 14:04:42.273924-07	20260922140000_add_finance_foundation	\N	\N	2026-09-22 14:04:41.990544-07	1
\.


--
-- Name: CartItem CartItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_pkey" PRIMARY KEY (id);


--
-- Name: Cart Cart_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: FinancialAccount FinancialAccount_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FinancialAccount"
    ADD CONSTRAINT "FinancialAccount_pkey" PRIMARY KEY (id);


--
-- Name: FinancialTransaction FinancialTransaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FinancialTransaction"
    ADD CONSTRAINT "FinancialTransaction_pkey" PRIMARY KEY (id);


--
-- Name: GiftReservation GiftReservation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GiftReservation"
    ADD CONSTRAINT "GiftReservation_pkey" PRIMARY KEY (id);


--
-- Name: LedgerEntry LedgerEntry_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LedgerEntry"
    ADD CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: PaymentAttempt PaymentAttempt_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PaymentAttempt"
    ADD CONSTRAINT "PaymentAttempt_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: PayoutBatch PayoutBatch_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PayoutBatch"
    ADD CONSTRAINT "PayoutBatch_pkey" PRIMARY KEY (id);


--
-- Name: ProductImage ProductImage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductImage"
    ADD CONSTRAINT "ProductImage_pkey" PRIMARY KEY (id);


--
-- Name: ProductVariant ProductVariant_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductVariant"
    ADD CONSTRAINT "ProductVariant_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: Review Review_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);


--
-- Name: SellerBalance SellerBalance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SellerBalance"
    ADD CONSTRAINT "SellerBalance_pkey" PRIMARY KEY (id);


--
-- Name: SellerPayout SellerPayout_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SellerPayout"
    ADD CONSTRAINT "SellerPayout_pkey" PRIMARY KEY (id);


--
-- Name: SellerSettlement SellerSettlement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SellerSettlement"
    ADD CONSTRAINT "SellerSettlement_pkey" PRIMARY KEY (id);


--
-- Name: Seller Seller_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Seller"
    ADD CONSTRAINT "Seller_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: WalletTransaction WalletTransaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WalletTransaction"
    ADD CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY (id);


--
-- Name: Wallet Wallet_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Wallet"
    ADD CONSTRAINT "Wallet_pkey" PRIMARY KEY (id);


--
-- Name: WishlistItem WishlistItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WishlistItem"
    ADD CONSTRAINT "WishlistItem_pkey" PRIMARY KEY (id);


--
-- Name: Wishlist Wishlist_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Wishlist"
    ADD CONSTRAINT "Wishlist_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: CartItem_cartId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CartItem_cartId_idx" ON public."CartItem" USING btree ("cartId");


--
-- Name: CartItem_cartId_variantId_giftReservationId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "CartItem_cartId_variantId_giftReservationId_key" ON public."CartItem" USING btree ("cartId", "variantId", "giftReservationId");


--
-- Name: CartItem_variantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CartItem_variantId_idx" ON public."CartItem" USING btree ("variantId");


--
-- Name: Cart_guestToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Cart_guestToken_key" ON public."Cart" USING btree ("guestToken");


--
-- Name: Cart_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Cart_status_idx" ON public."Cart" USING btree (status);


--
-- Name: Cart_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Cart_userId_idx" ON public."Cart" USING btree ("userId");


--
-- Name: Cart_userId_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Cart_userId_status_idx" ON public."Cart" USING btree ("userId", status);


--
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- Name: FinancialAccount_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "FinancialAccount_code_key" ON public."FinancialAccount" USING btree (code);


--
-- Name: FinancialAccount_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FinancialAccount_isActive_idx" ON public."FinancialAccount" USING btree ("isActive");


--
-- Name: FinancialAccount_ownerType_ownerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FinancialAccount_ownerType_ownerId_idx" ON public."FinancialAccount" USING btree ("ownerType", "ownerId");


--
-- Name: FinancialAccount_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FinancialAccount_type_idx" ON public."FinancialAccount" USING btree (type);


--
-- Name: FinancialTransaction_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FinancialTransaction_createdAt_idx" ON public."FinancialTransaction" USING btree ("createdAt");


--
-- Name: FinancialTransaction_createdByUserId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FinancialTransaction_createdByUserId_idx" ON public."FinancialTransaction" USING btree ("createdByUserId");


--
-- Name: FinancialTransaction_idempotencyKey_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "FinancialTransaction_idempotencyKey_key" ON public."FinancialTransaction" USING btree ("idempotencyKey");


--
-- Name: FinancialTransaction_orderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FinancialTransaction_orderId_idx" ON public."FinancialTransaction" USING btree ("orderId");


--
-- Name: FinancialTransaction_postedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FinancialTransaction_postedAt_idx" ON public."FinancialTransaction" USING btree ("postedAt");


--
-- Name: FinancialTransaction_reference_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "FinancialTransaction_reference_key" ON public."FinancialTransaction" USING btree (reference);


--
-- Name: FinancialTransaction_reversesTransactionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FinancialTransaction_reversesTransactionId_idx" ON public."FinancialTransaction" USING btree ("reversesTransactionId");


--
-- Name: FinancialTransaction_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FinancialTransaction_status_idx" ON public."FinancialTransaction" USING btree (status);


--
-- Name: FinancialTransaction_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FinancialTransaction_type_idx" ON public."FinancialTransaction" USING btree (type);


--
-- Name: GiftReservation_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "GiftReservation_status_idx" ON public."GiftReservation" USING btree (status);


--
-- Name: GiftReservation_wishlistItemId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "GiftReservation_wishlistItemId_idx" ON public."GiftReservation" USING btree ("wishlistItemId");


--
-- Name: LedgerEntry_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "LedgerEntry_createdAt_idx" ON public."LedgerEntry" USING btree ("createdAt");


--
-- Name: LedgerEntry_financialAccountId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "LedgerEntry_financialAccountId_idx" ON public."LedgerEntry" USING btree ("financialAccountId");


--
-- Name: LedgerEntry_financialTransactionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "LedgerEntry_financialTransactionId_idx" ON public."LedgerEntry" USING btree ("financialTransactionId");


--
-- Name: LedgerEntry_financialTransactionId_lineNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "LedgerEntry_financialTransactionId_lineNumber_key" ON public."LedgerEntry" USING btree ("financialTransactionId", "lineNumber");


--
-- Name: OrderItem_orderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OrderItem_orderId_idx" ON public."OrderItem" USING btree ("orderId");


--
-- Name: OrderItem_sellerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "OrderItem_sellerId_idx" ON public."OrderItem" USING btree ("sellerId");


--
-- Name: Order_paystackRef_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Order_paystackRef_idx" ON public."Order" USING btree ("paystackRef");


--
-- Name: Order_paystackRef_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Order_paystackRef_key" ON public."Order" USING btree ("paystackRef");


--
-- Name: Order_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Order_status_idx" ON public."Order" USING btree (status);


--
-- Name: Order_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Order_userId_idx" ON public."Order" USING btree ("userId");


--
-- Name: PaymentAttempt_paymentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PaymentAttempt_paymentId_idx" ON public."PaymentAttempt" USING btree ("paymentId");


--
-- Name: PaymentAttempt_paystackRef_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PaymentAttempt_paystackRef_idx" ON public."PaymentAttempt" USING btree ("paystackRef");


--
-- Name: PaymentAttempt_paystackRef_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PaymentAttempt_paystackRef_key" ON public."PaymentAttempt" USING btree ("paystackRef");


--
-- Name: Payment_orderId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Payment_orderId_key" ON public."Payment" USING btree ("orderId");


--
-- Name: Payment_paidAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Payment_paidAt_idx" ON public."Payment" USING btree ("paidAt");


--
-- Name: Payment_paystackRef_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Payment_paystackRef_key" ON public."Payment" USING btree ("paystackRef");


--
-- Name: Payment_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Payment_status_idx" ON public."Payment" USING btree (status);


--
-- Name: PayoutBatch_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PayoutBatch_createdAt_idx" ON public."PayoutBatch" USING btree ("createdAt");


--
-- Name: PayoutBatch_reference_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PayoutBatch_reference_key" ON public."PayoutBatch" USING btree (reference);


--
-- Name: PayoutBatch_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PayoutBatch_status_idx" ON public."PayoutBatch" USING btree (status);


--
-- Name: ProductVariant_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ProductVariant_productId_idx" ON public."ProductVariant" USING btree ("productId");


--
-- Name: ProductVariant_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ProductVariant_sku_key" ON public."ProductVariant" USING btree (sku);


--
-- Name: Product_sellerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Product_sellerId_idx" ON public."Product" USING btree ("sellerId");


--
-- Name: Product_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Product_sku_key" ON public."Product" USING btree (sku);


--
-- Name: Product_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Product_slug_key" ON public."Product" USING btree (slug);


--
-- Name: Review_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Review_productId_idx" ON public."Review" USING btree ("productId");


--
-- Name: Review_productId_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Review_productId_userId_key" ON public."Review" USING btree ("productId", "userId");


--
-- Name: SellerBalance_sellerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SellerBalance_sellerId_idx" ON public."SellerBalance" USING btree ("sellerId");


--
-- Name: SellerBalance_sellerId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SellerBalance_sellerId_key" ON public."SellerBalance" USING btree ("sellerId");


--
-- Name: SellerPayout_batchId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SellerPayout_batchId_idx" ON public."SellerPayout" USING btree ("batchId");


--
-- Name: SellerPayout_sellerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SellerPayout_sellerId_idx" ON public."SellerPayout" USING btree ("sellerId");


--
-- Name: SellerPayout_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SellerPayout_status_idx" ON public."SellerPayout" USING btree (status);


--
-- Name: SellerSettlement_eligibleAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SellerSettlement_eligibleAt_idx" ON public."SellerSettlement" USING btree ("eligibleAt");


--
-- Name: SellerSettlement_orderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SellerSettlement_orderId_idx" ON public."SellerSettlement" USING btree ("orderId");


--
-- Name: SellerSettlement_sellerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SellerSettlement_sellerId_idx" ON public."SellerSettlement" USING btree ("sellerId");


--
-- Name: SellerSettlement_sellerId_orderId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SellerSettlement_sellerId_orderId_key" ON public."SellerSettlement" USING btree ("sellerId", "orderId");


--
-- Name: SellerSettlement_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SellerSettlement_status_idx" ON public."SellerSettlement" USING btree (status);


--
-- Name: Seller_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Seller_isActive_idx" ON public."Seller" USING btree ("isActive");


--
-- Name: Seller_isVerified_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Seller_isVerified_idx" ON public."Seller" USING btree ("isVerified");


--
-- Name: Seller_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Seller_userId_key" ON public."Seller" USING btree ("userId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_googleId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_googleId_key" ON public."User" USING btree ("googleId");


--
-- Name: WalletTransaction_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "WalletTransaction_createdAt_idx" ON public."WalletTransaction" USING btree ("createdAt");


--
-- Name: WalletTransaction_reference_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "WalletTransaction_reference_idx" ON public."WalletTransaction" USING btree (reference);


--
-- Name: WalletTransaction_reference_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "WalletTransaction_reference_key" ON public."WalletTransaction" USING btree (reference);


--
-- Name: WalletTransaction_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "WalletTransaction_type_idx" ON public."WalletTransaction" USING btree (type);


--
-- Name: WalletTransaction_walletId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "WalletTransaction_walletId_idx" ON public."WalletTransaction" USING btree ("walletId");


--
-- Name: Wallet_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Wallet_userId_idx" ON public."Wallet" USING btree ("userId");


--
-- Name: Wallet_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Wallet_userId_key" ON public."Wallet" USING btree ("userId");


--
-- Name: WishlistItem_wishlistId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "WishlistItem_wishlistId_idx" ON public."WishlistItem" USING btree ("wishlistId");


--
-- Name: WishlistItem_wishlistId_productId_variantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "WishlistItem_wishlistId_productId_variantId_key" ON public."WishlistItem" USING btree ("wishlistId", "productId", "variantId");


--
-- Name: Wishlist_customerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Wishlist_customerId_idx" ON public."Wishlist" USING btree ("customerId");


--
-- Name: Wishlist_shareToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Wishlist_shareToken_key" ON public."Wishlist" USING btree ("shareToken");


--
-- Name: Wishlist_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Wishlist_slug_key" ON public."Wishlist" USING btree (slug);


--
-- Name: CartItem CartItem_cartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES public."Cart"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CartItem CartItem_giftReservationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_giftReservationId_fkey" FOREIGN KEY ("giftReservationId") REFERENCES public."GiftReservation"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CartItem CartItem_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public."ProductVariant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Cart Cart_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FinancialTransaction FinancialTransaction_createdByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FinancialTransaction"
    ADD CONSTRAINT "FinancialTransaction_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: FinancialTransaction FinancialTransaction_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FinancialTransaction"
    ADD CONSTRAINT "FinancialTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: FinancialTransaction FinancialTransaction_reversesTransactionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FinancialTransaction"
    ADD CONSTRAINT "FinancialTransaction_reversesTransactionId_fkey" FOREIGN KEY ("reversesTransactionId") REFERENCES public."FinancialTransaction"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: GiftReservation GiftReservation_buyerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GiftReservation"
    ADD CONSTRAINT "GiftReservation_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: GiftReservation GiftReservation_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GiftReservation"
    ADD CONSTRAINT "GiftReservation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: GiftReservation GiftReservation_wishlistItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GiftReservation"
    ADD CONSTRAINT "GiftReservation_wishlistItemId_fkey" FOREIGN KEY ("wishlistItemId") REFERENCES public."WishlistItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LedgerEntry LedgerEntry_financialAccountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LedgerEntry"
    ADD CONSTRAINT "LedgerEntry_financialAccountId_fkey" FOREIGN KEY ("financialAccountId") REFERENCES public."FinancialAccount"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LedgerEntry LedgerEntry_financialTransactionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LedgerEntry"
    ADD CONSTRAINT "LedgerEntry_financialTransactionId_fkey" FOREIGN KEY ("financialTransactionId") REFERENCES public."FinancialTransaction"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_giftReservationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_giftReservationId_fkey" FOREIGN KEY ("giftReservationId") REFERENCES public."GiftReservation"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: OrderItem OrderItem_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public."ProductVariant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PaymentAttempt PaymentAttempt_paymentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PaymentAttempt"
    ADD CONSTRAINT "PaymentAttempt_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES public."Payment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Payment Payment_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductImage ProductImage_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductImage"
    ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductVariant ProductVariant_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductVariant"
    ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Product Product_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Product Product_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public."Seller"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Review Review_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Review Review_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SellerBalance SellerBalance_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SellerBalance"
    ADD CONSTRAINT "SellerBalance_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public."Seller"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SellerPayout SellerPayout_batchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SellerPayout"
    ADD CONSTRAINT "SellerPayout_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES public."PayoutBatch"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SellerPayout SellerPayout_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SellerPayout"
    ADD CONSTRAINT "SellerPayout_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public."Seller"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SellerSettlement SellerSettlement_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SellerSettlement"
    ADD CONSTRAINT "SellerSettlement_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SellerSettlement SellerSettlement_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SellerSettlement"
    ADD CONSTRAINT "SellerSettlement_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public."Seller"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Seller Seller_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Seller"
    ADD CONSTRAINT "Seller_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WalletTransaction WalletTransaction_walletId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WalletTransaction"
    ADD CONSTRAINT "WalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES public."Wallet"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Wallet Wallet_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Wallet"
    ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WishlistItem WishlistItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WishlistItem"
    ADD CONSTRAINT "WishlistItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WishlistItem WishlistItem_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WishlistItem"
    ADD CONSTRAINT "WishlistItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public."ProductVariant"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WishlistItem WishlistItem_wishlistId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WishlistItem"
    ADD CONSTRAINT "WishlistItem_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES public."Wishlist"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Wishlist Wishlist_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Wishlist"
    ADD CONSTRAINT "Wishlist_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict L8lgCYNa8BFWFeBq6RPm2wM2UtCgzhyuY7g2myYcdunKmMfQg8iYg9fygEBfVyu

