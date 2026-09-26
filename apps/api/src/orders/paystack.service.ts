import { Injectable, BadRequestException } from '@nestjs/common';

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

@Injectable()
export class PaystackService {
  private readonly baseUrl = 'https://api.paystack.co';
  private readonly secretKey = process.env.PAYSTACK_SECRET_KEY;

  async initializeTransaction(params: {
    email: string;
    amountInKobo: number;
    reference: string;
    callbackUrl: string;
  }): Promise<InitializeResponse['data']> {
    const res = await fetch(`${this.baseUrl}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: params.email,
        amount: params.amountInKobo,
        reference: params.reference,
        callback_url: params.callbackUrl,
      }),
    });

    const body = (await res.json()) as InitializeResponse;

    if (!res.ok || !body.status) {
      throw new BadRequestException(
        body.message || 'Failed to initialize payment',
      );
    }

    return body.data;
  }

  async verifyTransaction(reference: string): Promise<VerifyResponse['data']> {
    const res = await fetch(
      `${this.baseUrl}/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      },
    );

    const body = (await res.json()) as VerifyResponse;

    if (!res.ok || !body.status) {
      throw new BadRequestException(body.message || 'Failed to verify payment');
    }

    return body.data;
  }
}
