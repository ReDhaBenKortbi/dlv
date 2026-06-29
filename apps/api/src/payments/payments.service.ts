import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, dto: CreatePaymentDto) {
    return this.prisma.paymentRequest.create({
      data: { ...dto, userId },
    });
  }

  mine(userId: string) {
    return this.prisma.paymentRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  listAll() {
    return this.prisma.paymentRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, email: true } } },
    });
  }

  async approve(id: string) {
    const request = await this.prisma.paymentRequest.findUnique({
      where: { id },
    });
    if (!request) throw new NotFoundException('Payment request not found');
    if (request.status !== 'PENDING')
      throw new BadRequestException('Already processed');

    const subscriptionEndDate = new Date();
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

    await this.prisma.$transaction([
      this.prisma.paymentRequest.update({
        where: { id },
        data: { status: 'APPROVED', processedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: request.userId },
        data: {
          isSubscribed: true,
          subscriptionStatus: SubscriptionStatus.APPROVED,
          subscriptionEndDate,
        },
      }),
    ]);
  }

  async reject(id: string) {
    const request = await this.prisma.paymentRequest.findUnique({
      where: { id },
    });
    if (!request) throw new NotFoundException('Payment request not found');
    if (request.status !== 'PENDING')
      throw new BadRequestException('Already processed');

    await this.prisma.$transaction([
      this.prisma.paymentRequest.update({
        where: { id },
        data: { status: 'REJECTED', processedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: request.userId },
        data: {
          isSubscribed: false,
          subscriptionStatus: SubscriptionStatus.REJECTED,
        },
      }),
    ]);
  }
}
