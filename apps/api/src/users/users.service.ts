import { Injectable } from '@nestjs/common';
import { Role, SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsersFilterDto } from './dto/users-filter.dto';

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
  updatedAt: true,
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

  async list(filter: UsersFilterDto) {
    const { search, page = 1, limit = 20 } = filter;
    const skip = (page - 1) * limit;

    const where = {
      role: { not: Role.ADMIN },
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { fullName: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: PUBLIC_FIELDS,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: users, meta: { total, page, limit } };
  }

  updateSubscription(userId: string, plan: SubscriptionPlan) {
    // Manual admin override — bypasses the billing cycle entirely, so the
    // end date is always cleared. Only the Chargily webhook sets a real
    // subscriptionEndDate.
    const isSubscribed = plan !== SubscriptionPlan.FREE;
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isSubscribed,
        subscriptionStatus: isSubscribed
          ? SubscriptionStatus.APPROVED
          : SubscriptionStatus.NONE,
        subscriptionPlan: plan,
        subscriptionEndDate: null,
      },
      select: PUBLIC_FIELDS,
    });
  }

  async stats() {
    const [users, books, activeSubscribers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.book.count(),
      this.prisma.user.count({ where: { isSubscribed: true } }),
    ]);
    return { users, books, activeSubscribers };
  }
}
