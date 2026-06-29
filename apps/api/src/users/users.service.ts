import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const PUBLIC_FIELDS = {
  id: true,
  email: true,
  role: true,
  isSubscribed: true,
  subscriptionStatus: true,
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
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isSubscribed,
        subscriptionStatus: isSubscribed ? 'APPROVED' : 'NONE',
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
