import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface ZarinpalRequestResponse {
  data: {
    code: number;
    message: string;
    authority: string;
    fee_type: string;
    fee: number;
  };
  errors: any[];
}

interface ZarinpalVerifyResponse {
  data: {
    code: number;
    message: string;
    card_hash: string;
    card_pan: string;
    ref_id: number;
    fee_type: string;
    fee: number;
  };
  errors: any[];
}

@Injectable()
export class ZarinpalService {
  private readonly merchantId: string;
  private readonly sandbox: boolean;
  private readonly baseUrl: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.merchantId = this.configService.get('ZARINPAL_MERCHANT_ID')!;
    this.sandbox = this.configService.get('ZARINPAL_SANDBOX', 'true') === 'true';
    this.baseUrl = this.sandbox
      ? 'https://sandbox.zarinpal.com/pg/v4/payment'
      : 'https://api.zarinpal.com/pg/v4/payment';
  }

  // Request payment
  async requestPayment(
    amount: number,
    description: string,
    callbackUrl: string,
    email?: string,
    mobile?: string,
  ): Promise<{ authority: string; paymentUrl: string }> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<ZarinpalRequestResponse>(`${this.baseUrl}/request.json`, {
          merchant_id: this.merchantId,
          amount: amount * 10, // Convert Toman to Rial
          description,
          callback_url: callbackUrl,
          metadata: {
            email,
            mobile,
          },
        }),
      );

      if ((response as any).data.data.code === 100) {
        const authority = (response as any).data.data.authority;
        const paymentUrl = this.sandbox
          ? `https://sandbox.zarinpal.com/pg/StartPay/${authority}`
          : `https://www.zarinpal.com/pg/StartPay/${authority}`;

        return { authority, paymentUrl };
      }

      throw new BadRequestException(
        `خطا در ارتباط با درگاه پرداخت: ${(response as any).data.data.message}`,
      );
    } catch (error) {
      throw new BadRequestException('خطا در ارتباط با درگاه پرداخت زرین‌پال');
    }
  }

  // Verify payment
  async verifyPayment(
    authority: string,
    amount: number,
  ): Promise<{ success: boolean; refId?: string; cardNumber?: string }> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<ZarinpalVerifyResponse>(`${this.baseUrl}/verify.json`, {
          merchant_id: this.merchantId,
          amount: amount * 10, // Convert Toman to Rial
          authority,
        }),
      );

      const code = (response as any).data.data.code;

      // 100 = success, 101 = already verified
      if (code === 100 || code === 101) {
        return {
          success: true,
          refId: (response as any).data.data.ref_id.toString(),
          cardNumber: (response as any).data.data.card_pan,
        };
      }

      return { success: false };
    } catch (error) {
      return { success: false };
    }
  }

  // Get payment gateway URL
  getGatewayUrl(authority: string): string {
    return this.sandbox
      ? `https://sandbox.zarinpal.com/pg/StartPay/${authority}`
      : `https://www.zarinpal.com/pg/StartPay/${authority}`;
  }
}
