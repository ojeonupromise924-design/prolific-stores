import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';

interface InitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface VerifyResponse {
  status: boolean;
  message: string;
  data: {
    status: 'success' | 'failed' | 'abandoned';
    reference: string;
    amount: number;
    gateway_response: string;
  };
}

interface TransferRecipientResponse {
  status: boolean;
  message: string;
  data: { id: number; type: string; code: string; name: string };
}

interface BulkTransferResponse {
  status: boolean;
  message: string;
  data: {
    batch: { id: number; status: string; reference: string };
    transfers: Array<{
      id: number;
      reference: string;
      status: string;
      amount: number;
      recipient: { name: string };
    }>;
  };
}

/**
 * The shape of a transfer fetched by its own reference. This is the
 * endpoint that tells us what Paystack actually did with a transfer —
 * including the fee it charged.
 */
interface VerifyTransferResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    reference: string;
    transfer_code: string;
    status: string;
    amount: number;
    currency: string;
    reason: string | null;
    /** The fee Paystack charged, in subunits (kobo). */
    fee_charged: number;
    fees_breakdown: unknown;
    failures: { reason: string; message: string } | null;
    recipient: {
      id: number;
      name: string;
      recipient_code: string;
      details: { account_number: string; bank_name: string };
    };
    source: string;
    source_details: { balance: number };
    transferred_at: string | null;
    createdAt: string;
  };
}

interface TimelineResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: string;
    amount: number;
    fees: number;
    net_amount: number;
    currency: string;
    paid_at: string | null;
    settled: boolean;
    settlement_date: string | null;
  };
}

@Injectable()
export class PaystackService {
  private readonly baseUrl = 'https://api.paystack.co';
  private readonly secretKey = process.env.PAYSTACK_SECRET_KEY;
  private readonly logger = new Logger(PaystackService.name);

  /** Paystack caps a single bulk transfer request at 100 items. */
  static readonly BULK_TRANSFER_MAX = 100;

  /** Milliseconds to wait between bulk transfer chunks to avoid HTTP 429. */
  static readonly BULK_TRANSFER_INTERVAL_MS = 5000;

  /**
   * Paystack's Nigerian transfer fees are FLAT per transfer, banded by the
   * amount being sent — not a percentage. This is charged ON TOP of the
   * transfer: a ₦100,000 transfer costs ₦100,050 of balance.
   *
   * Source: https://paystack.com/pricing and
   * https://support.paystack.com/en/articles/2132866
   */
  static readonly TRANSFER_FEE_TIERS: ReadonlyArray<{
    maxAmount: Decimal | null;
    fee: Decimal;
  }> = [
    { maxAmount: new Decimal('5000'), fee: new Decimal('10') },
    { maxAmount: new Decimal('50000'), fee: new Decimal('25') },
    { maxAmount: null, fee: new Decimal('50') },
  ];

  /**
   * A flat ₦50 stamp duty applies to transfers of ₦10,000 or more, charged
   * on top of the Paystack transfer fee.
   *
   * Source: https://support.paystack.com/en/articles/7573314
   */
  static readonly STAMP_DUTY_THRESHOLD = new Decimal('10000');
  static readonly STAMP_DUTY_FEE = new Decimal('50');

  /**
   * The fee Paystack charges for a transfer of this size, in Naira.
   *
   * This is an ESTIMATE used to reserve funds before a batch goes out. The
   * authoritative figure is `fee_charged` on the transfer, which is read
   * back after the transfer completes.
   */
  static estimateTransferFee(amount: Decimal | number | string): Decimal {
    const value = new Decimal(amount);

    for (const tier of PaystackService.TRANSFER_FEE_TIERS) {
      if (tier.maxAmount === null || value.lessThanOrEqualTo(tier.maxAmount)) {
        const duty = value.greaterThanOrEqualTo(
          PaystackService.STAMP_DUTY_THRESHOLD,
        )
          ? PaystackService.STAMP_DUTY_FEE
          : new Decimal(0);

        return tier.fee.plus(duty);
      }
    }

    return new Decimal(0);
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });

    const body = (await res.json()) as { status: boolean; message: string };

    if (!res.ok || !body.status) {
      throw new BadRequestException(
        body.message || `Paystack request failed: ${path}`,
      );
    }

    return body as T;
  }

  async initializeTransaction(params: {
    email: string;
    amountInKobo: number;
    reference: string;
    callbackUrl: string;
  }): Promise<InitializeResponse['data']> {
    const body = await this.request<InitializeResponse>(
      '/transaction/initialize',
      {
        method: 'POST',
        body: JSON.stringify({
          email: params.email,
          amount: params.amountInKobo,
          reference: params.reference,
          callback_url: params.callbackUrl,
        }),
      },
    );

    return body.data;
  }

  async verifyTransaction(reference: string): Promise<VerifyResponse['data']> {
    const body = await this.request<VerifyResponse>(
      `/transaction/verify/${encodeURIComponent(reference)}`,
    );
    return body.data;
  }

  /**
   * Transaction timeline — the authoritative view of what Paystack actually
   * charged and when it settled. This is what reconciliation compares the
   * ledger against.
   */
  async transactionTimeline(
    reference: string,
  ): Promise<TimelineResponse['data']> {
    const body = await this.request<TimelineResponse>(
      `/transaction/timeline/${encodeURIComponent(reference)}`,
    );
    return body.data;
  }

  /**
   * Creates (or reuses) a transfer recipient for a seller. Paystack rejects a
   * duplicate account number, so the same code is returned for an existing
   * recipient — which makes this safe to call on every batch build.
   */
  async createTransferRecipient(params: {
    name: string;
    accountNumber: string;
    bankCode: string;
  }): Promise<string> {
    const body = await this.request<TransferRecipientResponse>(
      '/transferrecipient',
      {
        method: 'POST',
        body: JSON.stringify({
          type: 'nuban',
          name: params.name,
          account_number: params.accountNumber,
          bank_code: params.bankCode,
          currency: 'NGN',
        }),
      },
    );

    return body.data.code;
  }

  /**
   * Lists existing transfer recipients. Used to recover a recipient code when
   * creation is rejected because the account number is already registered.
   */
  async listTransferRecipients(params: {
    accountNumber?: string;
    perPage?: number;
  }): Promise<Array<{ code: string; name: string; accountNumber: string }>> {
    const query = new URLSearchParams();
    if (params.accountNumber) query.set('account_number', params.accountNumber);
    query.set('perPage', String(params.perPage ?? 100));

    const body = await this.request<{
      data: Array<{
        code: string;
        name: string;
        details: { account_number: string };
      }>;
    }>(`/transferrecipient?${query.toString()}`);

    return body.data.map((r) => ({
      code: r.code,
      name: r.name,
      accountNumber: r.details?.account_number ?? '',
    }));
  }

  /**
   * Sends a batch of transfers. Paystack caps a bulk request at 100 items and
   * throttles at roughly 5 requests/second, so callers chunk the list.
   *
   * Amounts are in kobo.
   */
  async bulkTransfer(params: {
    transfers: Array<{
      amountInKobo: number;
      recipientCode: string;
      reference: string;
      reason: string;
    }>;
  }): Promise<BulkTransferResponse['data']> {
    const body = await this.request<BulkTransferResponse>('/transfer/bulk', {
      method: 'POST',
      body: JSON.stringify({
        source: 'balance',
        currency: 'NGN',
        transfers: params.transfers.map((t) => ({
          amount: t.amountInKobo,
          recipient: t.recipientCode,
          reference: t.reference,
          reason: t.reason,
        })),
      }),
    });

    return body.data;
  }

  async listBanks(): Promise<Array<{ name: string; code: string }>> {
    const body = await this.request<{
      data: Array<{ name: string; code: string }>;
    }>('/bank?currency=NGN');
    return body.data.map((b) => ({ name: b.name, code: b.code }));
  }

  /**
   * Looks up a transfer by the reference WE supplied.
   *
   * This is the only endpoint that takes a reference (the fetch endpoint
   * takes a numeric id or a `TRF_...` transfer code), and it returns the
   * `fee_charged` — the fee Paystack actually applied, which is what
   * reconciliation compares the ledger against.
   */
  async verifyTransfer(
    reference: string,
  ): Promise<VerifyTransferResponse['data']> {
    const body = await this.request<VerifyTransferResponse>(
      `/transfer/verify/${encodeURIComponent(reference)}`,
    );
    return body.data;
  }

  /**
   * Lists recent transfers so a batch can be reconciled after the fact.
   *
   * Paystack's list endpoint has no `reference` filter — only recipient and
   * date range — so callers filter the result themselves.
   */
  async listTransfers(
    params: {
      fromDatetime?: string;
      toDatetime?: string;
      perPage?: number;
      page?: number;
    } = {},
  ): Promise<
    Array<{
      id: number;
      reference: string | null;
      status: string;
      amount: number;
      transfer_code: string;
      recipient: { id: number; name: string; recipient_code: string };
      createdAt: string;
    }>
  > {
    const query = new URLSearchParams();
    if (params.fromDatetime) query.set('fromDatetime', params.fromDatetime);
    if (params.toDatetime) query.set('toDatetime', params.toDatetime);
    query.set('perPage', String(params.perPage ?? 100));
    query.set('page', String(params.page ?? 1));

    const body = await this.request<{
      data: Array<{
        id: number;
        reference?: string | null;
        status: string;
        amount: number;
        transfer_code: string;
        recipient: { id: number; name: string; recipient_code: string };
        createdAt: string;
      }>;
    }>(`/transfer?${query.toString()}`);

    return body.data.map((t) => ({
      id: t.id,
      reference: t.reference ?? null,
      status: t.status,
      amount: t.amount,
      transfer_code: t.transfer_code,
      recipient: t.recipient,
      createdAt: t.createdAt,
    }));
  }
}
