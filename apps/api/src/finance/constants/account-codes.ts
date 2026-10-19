export const AccountCode = {
  PAYMENT_CLEARING: '1000',
  PROLIFIC_BANK: '1100',
  CUSTOMER_WALLET_ASSET: '1200',
  SELLER_RECEIVABLE: '1300',
  RIDER_RECEIVABLE: '1400',

  SELLER_PAYABLE: '2000',
  RIDER_PAYABLE: '2100',
  CUSTOMER_WALLET_LIABILITY: '2200',
  REFUND_LIABILITY: '2300',
  TAX_PAYABLE: '2400',

  COMMISSION_REVENUE: '4000',
  SERVICE_FEE_REVENUE: '4100',
  DELIVERY_REVENUE: '4200',
  WALLET_FEE_REVENUE: '4300',
  PRODUCT_SALES_REVENUE: '4400',
  SHIPPING_REVENUE: '4500',

  PAYMENT_PROCESSING_EXPENSE: '5000',
  REFUND_EXPENSE: '5100',
  RIDER_PAYOUT_EXPENSE: '5200',
  OPERATIONAL_EXPENSE: '5300',
} as const;

export type AccountCode = (typeof AccountCode)[keyof typeof AccountCode];

export const ALL_ACCOUNT_CODES = Object.values(AccountCode);

export function getAccountTypeFromCode(
  code: AccountCode,
): 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE' {
  const num = parseInt(code, 10);

  if (num >= 1000 && num <= 1999) return 'ASSET';
  if (num >= 2000 && num <= 2999) return 'LIABILITY';
  if (num >= 3000 && num <= 3999) return 'EQUITY';
  if (num >= 4000 && num <= 4999) return 'REVENUE';
  if (num >= 5000 && num <= 5999) return 'EXPENSE';

  throw new Error(`Unknown account code: ${code}`);
}
