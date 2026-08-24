import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import {
  PaymentStatus,
  SubscriptionPlan,
  SubscriptionStatus,
} from '@prisma/client';
import { PLAN_PRICING } from './plan-pricing';

const CHARGILY_API =
  process.env.CHARGILY_MODE === 'live'
    ? 'https://pay.chargily.net/api/v2'
    : 'https://pay.chargily.net/test/api/v2';

// Higher rank = more valuable plan; used to detect a same-cycle upgrade.
const PLAN_RANK: Record<SubscriptionPlan, number> = {
  FREE: 0,
  PRO: 1,
  GOLD: 2,
};

@Injectable()
export class ChargilyService {
  constructor(private prisma: PrismaService) {}

  // A user already on an active paid plan who checks out a strictly higher
  // plan is upgrading mid-cycle: they've already paid for their current
  // plan's remaining days, so they should only owe the price difference and
  // keep their existing subscriptionEndDate instead of losing those days.
  private async resolveUpgrade(
    userId: string,
    plan: SubscriptionPlan,
  ): Promise<{ amount: number; isUpgrade: boolean }> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        subscriptionPlan: true,
        isSubscribed: true,
        subscriptionStatus: true,
        subscriptionEndDate: true,
      },
    });

    const isUpgrade =
      user.isSubscribed &&
      user.subscriptionStatus === SubscriptionStatus.APPROVED &&
      !!user.subscriptionEndDate &&
      user.subscriptionEndDate > new Date() &&
      PLAN_RANK[plan] > PLAN_RANK[user.subscriptionPlan];

    const amount = isUpgrade
      ? PLAN_PRICING[plan].price - PLAN_PRICING[user.subscriptionPlan].price
      : PLAN_PRICING[plan].price;

    return { amount, isUpgrade };
  }

  getPlanPricing() {
    return PLAN_PRICING;
  }

  async createCheckout(
    userId: string,
    fullName: string,
    plan: SubscriptionPlan,
  ): Promise<{ checkoutUrl: string }> {
    const apiKey = process.env.CHARGILY_SECRET;
    if (!apiKey)
      throw new InternalServerErrorException('Chargily not configured');

    const { amount, isUpgrade } = await this.resolveUpgrade(userId, plan);

    const response = await fetch(`${CHARGILY_API}/checkouts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'dzd',
        success_url: process.env.CHARGILY_SUCCESS_URL,
        failure_url: process.env.CHARGILY_FAILURE_URL,
        metadata: { userId },
      }),
    });

    if (!response.ok) {
      const errorBody: unknown = await response.json().catch(() => null);
      console.error(
        'Chargily error',
        response.status,
        JSON.stringify(errorBody),
      );
      throw new InternalServerErrorException(
        'Failed to create Chargily checkout',
      );
    }

    const data = (await response.json()) as {
      id: string;
      checkout_url: string;
    };

    await this.prisma.$transaction([
      this.prisma.paymentRequest.create({
        data: {
          userId,
          fullName,
          amount: String(amount),
          plan,
          paymentMethod: 'CHARGILY',
          chargilyCheckoutId: data.id,
          isUpgrade,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { subscriptionStatus: SubscriptionStatus.PENDING },
      }),
    ]);

    return { checkoutUrl: data.checkout_url };
  }

  async cancelPendingSubscription(userId: string): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { subscriptionStatus: true },
    });
    if (user.subscriptionStatus !== SubscriptionStatus.PENDING) return;

    const pendingRequest = await this.prisma.paymentRequest.findFirst({
      where: { userId, status: 'PENDING' },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    await this.prisma.$transaction([
      ...(pendingRequest
        ? [
            this.prisma.paymentRequest.update({
              where: { id: pendingRequest.id },
              data: { status: 'REJECTED', processedAt: new Date() },
            }),
          ]
        : []),
      this.prisma.user.update({
        where: { id: userId },
        data: { subscriptionStatus: SubscriptionStatus.REJECTED },
      }),
    ]);
  }

  verifySignature(signature: string, rawBody: Buffer): boolean {
    const secret = process.env.CHARGILY_SECRET;
    if (!secret)
      throw new InternalServerErrorException('Chargily not configured');
    if (!signature) return false;
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    // timingSafeEqual requires equal-length buffers.
    return sigBuf.length === expBuf.length && timingSafeEqual(sigBuf, expBuf);
  }

  async getPaymentHistory(filters: {
    status?: PaymentStatus;
    plan?: SubscriptionPlan;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.plan ? { plan: filters.plan } : {}),
    };

    const [payments, total] = await Promise.all([
      this.prisma.paymentRequest.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        include: { user: { select: { fullName: true, email: true } } },
        skip,
        take: limit,
      }),
      this.prisma.paymentRequest.count({ where }),
    ]);

    return { data: payments, meta: { total, page, limit } };
  }

  private static readonly FAILURE_EVENTS = new Set([
    'checkout.failed',
    'checkout.canceled',
    'checkout.expired',
  ]);

  async handleWebhookEvent(
    signature: string,
    rawBody: Buffer,
    event: { type: string; data?: { id: string } },
  ): Promise<void> {
    if (!this.verifySignature(signature, rawBody)) {
      throw new UnauthorizedException('Invalid signature');
    }

    const isPaid = event.type === 'checkout.paid';
    const isFailure = ChargilyService.FAILURE_EVENTS.has(event.type);
    if ((!isPaid && !isFailure) || !event.data?.id) return;

    const paymentRequest = await this.prisma.paymentRequest.findUnique({
      where: { chargilyCheckoutId: event.data.id },
    });

    if (!paymentRequest || paymentRequest.status !== 'PENDING') return;

    if (isFailure) {
      await this.prisma.$transaction([
        this.prisma.paymentRequest.update({
          where: { id: paymentRequest.id },
          data: { status: 'REJECTED', processedAt: new Date() },
        }),
        this.prisma.user.update({
          where: { id: paymentRequest.userId },
          data: { subscriptionStatus: SubscriptionStatus.REJECTED },
        }),
      ]);
      return;
    }

    // An upgrade keeps the existing subscriptionEndDate — the user already
    // paid for those remaining days, just at the new (higher) tier.
    let subscriptionEndDate: Date | undefined;
    if (!paymentRequest.isUpgrade) {
      subscriptionEndDate = new Date();
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
    }

    await this.prisma.$transaction([
      this.prisma.paymentRequest.update({
        where: { id: paymentRequest.id },
        data: { status: 'APPROVED', processedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: paymentRequest.userId },
        data: {
          isSubscribed: true,
          subscriptionStatus: SubscriptionStatus.APPROVED,
          subscriptionPlan: paymentRequest.plan,
          ...(subscriptionEndDate ? { subscriptionEndDate } : {}),
        },
      }),
    ]);
  }
}
