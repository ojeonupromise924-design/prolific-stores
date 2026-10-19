import { AccountCode, ALL_ACCOUNT_CODES } from '../constants/account-codes';
import type {
  FinancialAccountOwnerType,
  FinancialAccountType,
} from '@prisma/client';

export interface ChartAccountDefinition {
  code: AccountCode;
  name: string;
  type: FinancialAccountType;
  ownerType: FinancialAccountOwnerType;
  description: string;
  currency: string;
  isActive: boolean;
  tags: string[];
}

export const CHART_OF_ACCOUNTS: ChartAccountDefinition[] = [
  {
    code: AccountCode.PAYMENT_CLEARING,
    name: 'Payment Gateway Clearing',
    type: 'ASSET',
    ownerType: 'SYSTEM',
    description: 'Funds captured by Paystack pending settlement.',
    currency: 'NGN',
    isActive: true,
    tags: ['clearing', 'paystack'],
  },
  {
    code: AccountCode.PROLIFIC_BANK,
    name: 'Prolific Store Operating Bank',
    type: 'ASSET',
    ownerType: 'PLATFORM',
    description: 'Settled funds in corporate bank account.',
    currency: 'NGN',
    isActive: true,
    tags: ['bank', 'settled'],
  },
  {
    code: AccountCode.CUSTOMER_WALLET_ASSET,
    name: 'Customer Wallet Assets (Contra)',
    type: 'ASSET',
    ownerType: 'SYSTEM',
    description: 'Contra-asset view of customer wallet holdings.',
    currency: 'NGN',
    isActive: true,
    tags: ['wallet', 'contra'],
  },
  {
    code: AccountCode.SELLER_RECEIVABLE,
    name: 'Seller Commission Receivable',
    type: 'ASSET',
    ownerType: 'SYSTEM',
    description: 'Commissions owed to platform by sellers.',
    currency: 'NGN',
    isActive: false,
    tags: ['seller', 'future'],
  },
  {
    code: AccountCode.RIDER_RECEIVABLE,
    name: 'Rider Delivery Fee Receivable',
    type: 'ASSET',
    ownerType: 'SYSTEM',
    description: 'Delivery fees owed to platform by riders.',
    currency: 'NGN',
    isActive: false,
    tags: ['rider', 'future'],
  },
  {
    code: AccountCode.SELLER_PAYABLE,
    name: 'Seller Payables',
    type: 'LIABILITY',
    ownerType: 'SYSTEM',
    description: 'Net amount owed to sellers.',
    currency: 'NGN',
    isActive: true,
    tags: ['seller', 'payout'],
  },
  {
    code: AccountCode.RIDER_PAYABLE,
    name: 'Rider Payables',
    type: 'LIABILITY',
    ownerType: 'SYSTEM',
    description: 'Net amount owed to delivery riders.',
    currency: 'NGN',
    isActive: false,
    tags: ['rider', 'future'],
  },
  {
    code: AccountCode.CUSTOMER_WALLET_LIABILITY,
    name: 'Customer Wallet Balances',
    type: 'LIABILITY',
    ownerType: 'SYSTEM',
    description: 'Stored value liability.',
    currency: 'NGN',
    isActive: true,
    tags: ['wallet', 'customer'],
  },
  {
    code: AccountCode.REFUND_LIABILITY,
    name: 'Refund Liability',
    type: 'LIABILITY',
    ownerType: 'SYSTEM',
    description: 'Approved refunds awaiting payout.',
    currency: 'NGN',
    isActive: true,
    tags: ['refund'],
  },
  {
    code: AccountCode.TAX_PAYABLE,
    name: 'VAT Payable',
    type: 'LIABILITY',
    ownerType: 'SYSTEM',
    description: 'VAT collected pending remittance.',
    currency: 'NGN',
    isActive: true,
    tags: ['tax', 'vat'],
  },
  {
    code: AccountCode.COMMISSION_REVENUE,
    name: 'Commission Revenue',
    type: 'REVENUE',
    ownerType: 'PLATFORM',
    description: 'Platform commission on completed orders.',
    currency: 'NGN',
    isActive: true,
    tags: ['commission', 'core'],
  },
  {
    code: AccountCode.SERVICE_FEE_REVENUE,
    name: 'Service Fee Revenue',
    type: 'REVENUE',
    ownerType: 'PLATFORM',
    description: 'Listing/subscription/feature fees.',
    currency: 'NGN',
    isActive: true,
    tags: ['service-fee'],
  },
  {
    code: AccountCode.DELIVERY_REVENUE,
    name: 'Delivery Revenue (Platform Share)',
    type: 'REVENUE',
    ownerType: 'PLATFORM',
    description: 'Platform portion of delivery fees.',
    currency: 'NGN',
    isActive: true,
    tags: ['delivery'],
  },
  {
    code: AccountCode.WALLET_FEE_REVENUE,
    name: 'Wallet Transaction Fees',
    type: 'REVENUE',
    ownerType: 'PLATFORM',
    description: 'Fees on wallet top-ups/withdrawals.',
    currency: 'NGN',
    isActive: false,
    tags: ['wallet', 'future'],
  },
  {
    code: AccountCode.PRODUCT_SALES_REVENUE,
    name: 'Product Sales Revenue',
    type: 'REVENUE',
    ownerType: 'PLATFORM',
    description: 'Revenue from sales of platform-owned products.',
    currency: 'NGN',
    isActive: true,
    tags: ['product-sales', 'core'],
  },
  {
    code: AccountCode.SHIPPING_REVENUE,
    name: 'Shipping Revenue',
    type: 'REVENUE',
    ownerType: 'PLATFORM',
    description: 'Shipping fees collected for platform-owned product orders.',
    currency: 'NGN',
    isActive: true,
    tags: ['shipping', 'core'],
  },
  {
    code: AccountCode.PAYMENT_PROCESSING_EXPENSE,
    name: 'Payment Processing Fees',
    type: 'EXPENSE',
    ownerType: 'PLATFORM',
    description: 'Paystack/Stripe transaction fees.',
    currency: 'NGN',
    isActive: true,
    tags: ['paystack', 'fees'],
  },
  {
    code: AccountCode.REFUND_EXPENSE,
    name: 'Refunds & Chargebacks',
    type: 'EXPENSE',
    ownerType: 'PLATFORM',
    description: 'Cost of refunds/chargebacks.',
    currency: 'NGN',
    isActive: true,
    tags: ['refund', 'risk'],
  },
  {
    code: AccountCode.RIDER_PAYOUT_EXPENSE,
    name: 'Rider Payout Expense',
    type: 'EXPENSE',
    ownerType: 'PLATFORM',
    description: 'Amounts paid to riders.',
    currency: 'NGN',
    isActive: false,
    tags: ['rider', 'future'],
  },
  {
    code: AccountCode.OPERATIONAL_EXPENSE,
    name: 'Operational Expenses',
    type: 'EXPENSE',
    ownerType: 'PLATFORM',
    description: 'General platform operational costs.',
    currency: 'NGN',
    isActive: false,
    tags: ['opex', 'future'],
  },
];

const codes = CHART_OF_ACCOUNTS.map((a) => a.code);

if (new Set(codes).size !== codes.length) {
  throw new Error('Duplicate codes in CHART_OF_ACCOUNTS');
}

const missing = ALL_ACCOUNT_CODES.filter(
  (c) => !CHART_OF_ACCOUNTS.some((a) => a.code === c),
);

if (missing.length) {
  throw new Error(`Missing definitions: ${missing.join(', ')}`);
}
