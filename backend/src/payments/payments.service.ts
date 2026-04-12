import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentStatus, SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentAction, ProcessPaymentDto } from './dto/process-payment.dto';
import { SubmitPaymentDto } from './dto/submit-payment.dto';
import { computeSubscriptionEndDate } from './subscription.utils';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  getPending() {
    return this.prisma.paymentRequest.findMany({
      where: { status: PaymentStatus.PENDING },
      orderBy: { createdAt: 'desc' },
    });
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
      await this.prisma.$transaction([
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
    } else {
      await this.prisma.$transaction([
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
    }
  }
}
