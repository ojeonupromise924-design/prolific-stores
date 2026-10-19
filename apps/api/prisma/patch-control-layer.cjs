/**
 * One-shot patch: re-adds the finance control layer to prisma/schema.prisma.
 *
 * The control-layer models were lost when `prisma db pull` rewrote the schema
 * from the live database. This script re-applies them idempotently, anchored
 * on exact strings that must exist in the target file.
 *
 * Run:  node prisma/patch-control-layer.cjs
 * Then: git diff prisma/schema.prisma   (review!)
 *       npx prisma format && npx prisma validate
 */
const fs = require('fs');
const path = require('path');

const SCHEMA = path.join(__dirname, 'schema.prisma');
let src = fs.readFileSync(SCHEMA, 'utf8');

/** Replace `find` with `repl`; throw if `find` is missing or ambiguous. */
function sub(find, repl, label) {
  const first = src.indexOf(find);
  if (first === -1) throw new Error(`ANCHOR NOT FOUND [${label}]: ${find.slice(0, 70)}`);
  if (src.indexOf(find, first + 1) !== -1)
    throw new Error(`ANCHOR AMBIGUOUS [${label}]: ${find.slice(0, 70)}`);
  src = src.slice(0, first) + repl + src.slice(first + find.length);
  console.log(`  patched: ${label}`);
}

// ---------------------------------------------------------------------------
// 1. FinancialAccountOwnerType — add SELLER / RIDER
// ---------------------------------------------------------------------------
sub(
  `enum FinancialAccountOwnerType {
  PLATFORM
  SYSTEM
  CUSTOMER
}`,
  `enum FinancialAccountOwnerType {
  PLATFORM
  SYSTEM
  CUSTOMER
  SELLER
  RIDER
}`,
  'FinancialAccountOwnerType',
);

// ---------------------------------------------------------------------------
// 2. New enums — inserted right after FinancialAccountOwnerType
// ---------------------------------------------------------------------------
const NEW_ENUMS = `
/// Business classification of a money movement — used for reporting,
/// complementary to FinancialTransactionType (how it moved through the ledger).
enum TransactionType {
  CUSTOMER_PAYMENT
  COMMISSION
  SERVICE_FEE
  DELIVERY_FEE
  PROCESSING_FEE
  REFUND
  SELLER_SETTLEMENT
  RIDER_EARNING
  ADJUSTMENT
  WALLET_CREDIT
  WALLET_DEBIT
}

/// Lifecycle of a business-level financial record (commission, fee, adjustment).
/// COMPLETED means it has been posted to the ledger.
enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
  REVERSED
  CANCELLED
}

enum RefundStatus {
  REQUESTED
  REVIEWING
  APPROVED
  PROCESSING
  COMPLETED
  FAILED
  REJECTED
}

enum ReconciliationStatus {
  UNMATCHED
  MATCHED
  PARTIAL
  EXCEPTION
  RESOLVED
}
`;

// ---------------------------------------------------------------------------
// 3. New models — inserted before "model FinancialAccount {"
// ---------------------------------------------------------------------------
const NEW_MODELS = `
/// A recorded commission charge. The ledger remains the source of truth for
/// money; this is the business-level record of why the charge happened.
model Commission {
  id          String            @id @default(uuid())
  reference   String            @unique
  orderId     String?
  sellerId    String?
  grossAmount Decimal           @db.Decimal(18, 2)
  rate        Decimal           @db.Decimal(5, 4)
  amount      Decimal           @db.Decimal(18, 2)
  status      TransactionStatus @default(COMPLETED)
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  seller Seller? @relation(fields: [sellerId], references: [id])
  order  Order?  @relation(fields: [orderId], references: [id])

  @@index([sellerId])
  @@index([orderId])
  @@index([status])
}

/// A platform fee other than seller commission (service, delivery, processing).
model Fee {
  id          String            @id @default(uuid())
  reference   String            @unique
  type        TransactionType
  orderId     String?
  sellerId    String?
  amount      Decimal           @db.Decimal(18, 2)
  currency    String            @default("NGN")
  status      TransactionStatus @default(COMPLETED)
  description String?
  metadata    Json?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  seller Seller? @relation(fields: [sellerId], references: [id])
  order  Order?  @relation(fields: [orderId], references: [id])

  @@index([sellerId])
  @@index([orderId])
  @@index([type])
  @@index([status])
}

/// Manual correction posted to a single account. Always paired with a
/// REVERSAL transaction in the ledger — never a silent edit.
model Adjustment {
  id          String            @id @default(uuid())
  reference   String            @unique
  accountCode String
  amount      Decimal           @db.Decimal(18, 2)
  type        TransactionType   @default(ADJUSTMENT)
  status      TransactionStatus @default(PENDING)
  reason      String
  createdById String?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  @@index([accountCode])
  @@index([status])
  @@index([createdAt])
}

/// A customer refund request. The ledger effect is posted on approval so an
/// unapproved refund never moves money.
model Refund {
  id                String       @id @default(uuid())
  reference         String       @unique
  orderId           String
  paymentId         String?
  amount            Decimal      @db.Decimal(18, 2)
  reason            String
  status            RefundStatus @default(REQUESTED)
  requestedById     String?
  approvedById      String?
  providerReference String?
  requestedAt       DateTime     @default(now())
  approvedAt        DateTime?
  completedAt       DateTime?
  failureReason     String?
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  order   Order?   @relation(fields: [orderId], references: [id])
  payment Payment? @relation(fields: [paymentId], references: [id])

  @@index([orderId])
  @@index([paymentId])
  @@index([status])
  @@index([createdAt])
}

/// One reconciliation run against a provider's settlement report.
model Reconciliation {
  id                  String               @id @default(uuid())
  provider            String
  reconciliationDate  DateTime
  totalSystemAmount   Decimal              @db.Decimal(18, 2)
  totalProviderAmount Decimal              @db.Decimal(18, 2)
  matchedCount        Int                  @default(0)
  unmatchedCount      Int                  @default(0)
  status              ReconciliationStatus @default(UNMATCHED)
  createdAt           DateTime             @default(now())

  items ReconciliationItem[]

  @@index([provider, reconciliationDate])
  @@index([status])
}

/// A single provider transaction matched against an internal reference.
model ReconciliationItem {
  id                String               @id @default(uuid())
  reconciliationId  String
  internalReference String?
  providerReference String?
  systemAmount      Decimal              @db.Decimal(18, 2)
  providerAmount    Decimal              @db.Decimal(18, 2)
  difference        Decimal              @db.Decimal(18, 2)
  status            ReconciliationStatus
  notes             String?
  createdAt         DateTime             @default(now())

  reconciliation Reconciliation @relation(fields: [reconciliationId], references: [id])

  @@index([reconciliationId])
  @@index([status])
}

/// Immutable trail of financial actions. No updatedAt — entries are never edited.
model AuditLog {
  id         String   @id @default(uuid())
  actorId    String?
  action     String
  entityType String
  entityId   String
  before     Json?
  after      Json?
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime @default(now())

  @@index([actorId])
  @@index([entityType, entityId])
  @@index([createdAt])
}
`;

// Insert enums + models immediately before the FinancialAccount model, keeping
// the finance block together.
sub(
  `model FinancialAccount {`,
  NEW_ENUMS + NEW_MODELS + `model FinancialAccount {`,
  'control-layer enums + models',
);

// ---------------------------------------------------------------------------
// 4. Back-relations required by Prisma
// ---------------------------------------------------------------------------
sub(
  `  sellerSettlements     SellerSettlement[]

  @@index([userId])`,
  `  sellerSettlements     SellerSettlement[]
  refunds                Refund[]
  commissions            Commission[]
  fees                   Fee[]

  @@index([userId])`,
  'Order back-relations',
);

sub(
  `  settlements     SellerSettlement[]

  @@index([isActive])`,
  `  settlements     SellerSettlement[]
  commissions     Commission[]
  fees            Fee[]

  @@index([isActive])`,
  'Seller back-relations',
);

sub(
  `  paymentAttempts PaymentAttempt[]

  @@index([status])`,
  `  paymentAttempts PaymentAttempt[]
  refunds          Refund[]

  @@index([status])`,
  'Payment back-relations',
);

// ---------------------------------------------------------------------------
// 5. Payment / PaymentAttempt — provider dimension + extra columns
// ---------------------------------------------------------------------------
sub(
  `model Payment {
  id              String           @id @default(uuid())
  orderId         String           @unique
  paystackRef     String           @unique`,
  `model Payment {
  id              String           @id @default(uuid())
  orderId         String           @unique
  customerId      String?
  paystackRef     String           @unique
  provider        String           @default("paystack")`,
  'Payment provider + customerId',
);

sub(
  `  status          PaymentStatus    @default(PENDING)
  gatewayResponse Json?
  paidAt          DateTime?`,
  `  status          PaymentStatus    @default(PENDING)
  gatewayResponse Json?
  paidAt          DateTime?
  failedAt        DateTime?`,
  'Payment failedAt',
);

sub(
  `model PaymentAttempt {
  id             String        @id @default(uuid())
  paymentId      String
  paystackRef    String?       @unique`,
  `model PaymentAttempt {
  id             String        @id @default(uuid())
  paymentId      String
  provider       String        @default("paystack")
  paystackRef    String?       @unique`,
  'PaymentAttempt provider',
);

fs.writeFileSync(SCHEMA, src, 'utf8');
console.log('\nOK - schema.prisma patched.');
