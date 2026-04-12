import { Injectable } from '@nestjs/common';
import { SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isSubscribed: true,
        subscriptionStatus: true,
        subscriptionEndDate: true,
        createdAt: true,
      },
    });
  }

  async toggleSubscription(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isSubscribed: !user.isSubscribed,
        subscriptionStatus: !user.isSubscribed
          ? SubscriptionStatus.APPROVED
          : SubscriptionStatus.NONE,
      },
    });
  }

  metrics() {
    return this.prisma.user.count();
  }
}
