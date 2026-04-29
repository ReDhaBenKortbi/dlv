import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentStatus, SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { PaymentAction, ProcessPaymentDto } from './dto/process-payment.dto';
import { SignReceiptDto } from './dto/sign-receipt.dto';
import { SubmitPaymentDto } from './dto/submit-payment.dto';
import { computeSubscriptionEndDate } from './subscription.utils';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  getPending() {
    return this.prisma.paymentRequest.findMany({
      where: { status: PaymentStatus.PENDING },
      orderBy: { createdAt: 'desc' },
    });
  }

  async signReceiptUrl(userId: string, dto: SignReceiptDto) {
    const safeName = dto.fileName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-128);
    const ext = (() => {
      const m = /\.(jpe?g|png|webp)$/i.exec(safeName);
      if (m) return m[0].toLowerCase();
      const t = dto.contentType.split('/')[1];
      return `.${t === 'jpeg' ? 'jpg' : t}`;
    })();
    const uuid =
      globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
    const key = `receipts/${userId}/${uuid}${ext}`;
    const putUrl = await this.storage.signPutUrl(key, dto.contentType);
    return { key, putUrl, publicUrl: this.storage.publicUrl(key) };
  }

  async submit(userId: string, userEmail: string, dto: SubmitPaymentDto) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    const payment = await this.prisma.paymentRequest.create({
      data: {
        userId,
        userEmail,
        fullName: user.fullName,
        amount: dto.amount,
        receiptURL: dto.receiptURL,
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { subscriptionStatus: SubscriptionStatus.PENDING },
    });

    return payment;
  }

  async process(paymentId: string, dto: ProcessPaymentDto) {
    const payment = await this.prisma.paymentRequest.findUnique({
      where: { id: paymentId },
    });
    if (!payment) throw new NotFoundException('Payment request not found');

    const now = new Date();

    if (dto.action === PaymentAction.APPROVED) {
      const subscriptionEndDate = computeSubscriptionEndDate(now);
      const [updated] = await this.prisma.$transaction([
        this.prisma.paymentRequest.update({
          where: { id: paymentId },
          data: { status: PaymentStatus.APPROVED, processedAt: now },
        }),
        this.prisma.user.update({
          where: { id: payment.userId },
          data: {
            isSubscribed: true,
            subscriptionStatus: SubscriptionStatus.APPROVED,
            subscriptionStartDate: now,
            subscriptionEndDate,
          },
        }),
      ]);
      return updated;
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.paymentRequest.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.REJECTED, processedAt: now },
      }),
      this.prisma.user.update({
        where: { id: payment.userId },
        data: {
          subscriptionStatus: SubscriptionStatus.REJECTED,
        },
      }),
    ]);
    return updated;
  }
}
