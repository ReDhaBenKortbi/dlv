import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from './payments.service';

const CHARGILY_API = 'https://pay.chargily.net/api/v2';
const AMOUNT = 500;

@Injectable()
export class ChargilyService {
  constructor(
    private prisma: PrismaService,
    private paymentsService: PaymentsService,
  ) {}

  async createCheckout(userId: string, fullName: string): Promise<{ checkoutUrl: string }> {
    const apiKey = process.env.CHARGILY_API_KEY;
    if (!apiKey) throw new InternalServerErrorException('Chargily not configured');

    const response = await fetch(`${CHARGILY_API}/checkouts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: AMOUNT,
        currency: 'dzd',
        success_url: process.env.CHARGILY_SUCCESS_URL,
        failure_url: process.env.CHARGILY_FAILURE_URL,
        metadata: { userId },
      }),
    });

    if (!response.ok) {
      throw new InternalServerErrorException('Failed to create Chargily checkout');
    }

    const data = (await response.json()) as { id: string; checkout_url: string };

    await this.prisma.paymentRequest.create({
      data: {
        userId,
        fullName,
        amount: String(AMOUNT),
        paymentMethod: 'CHARGILY',
        chargilyCheckoutId: data.id,
      },
    });

    return { checkoutUrl: data.checkout_url };
  }

  verifySignature(signature: string, rawBody: Buffer): boolean {
    const secret = process.env.CHARGILY_SECRET;
    if (!secret) throw new InternalServerErrorException('Chargily not configured');
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
    return signature === expected;
  }

  async handleWebhookEvent(signature: string, rawBody: Buffer, event: { type: string; data?: { id: string } }): Promise<void> {
    if (!this.verifySignature(signature, rawBody)) {
      throw new UnauthorizedException('Invalid signature');
    }

    if (event.type !== 'checkout.paid' || !event.data?.id) return;

    const paymentRequest = await this.prisma.paymentRequest.findUnique({
      where: { chargilyCheckoutId: event.data.id },
    });

    if (!paymentRequest || paymentRequest.status !== 'PENDING') return;

    await this.paymentsService.approve(paymentRequest.id);
  }
}
