import { Injectable } from '@nestjs/common';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const PUBLIC_FIELDS = {
  id: true,
  fullName: true,
  email: true,
  role: true,
  isSubscribed: true,
  subscriptionStatus: true,
  subscriptionPlan: true,
  subscriptionEndDate: true,
  createdAt: true,
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  me(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: PUBLIC_FIELDS,
    });
  }

  list() {
    return this.prisma.user.findMany({
      select: PUBLIC_FIELDS,
      orderBy: { createdAt: 'desc' },
    });
  }

  updateSubscription(userId: string, isSubscribed: boolean) {
    // A manual admin grant unlocks all tiers (GOLD); revoking resets to FREE.
    // The plan must be set here — access control gates on subscriptionPlan,
    // so toggling isSubscribed alone would grant nothing.
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isSubscribed,
        subscriptionStatus: isSubscribed
          ? SubscriptionStatus.APPROVED
          : SubscriptionStatus.NONE,
        subscriptionPlan: isSubscribed
          ? SubscriptionPlan.GOLD
          : SubscriptionPlan.FREE,
        subscriptionEndDate: null,
      },
      select: PUBLIC_FIELDS,
    });
  }

  async stats() {
    const [users, books, pendingPayments] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.book.count(),
      this.prisma.paymentRequest.count({ where: { status: 'PENDING' } }),
    ]);
    return { users, books, pendingPayments };
  }
}
