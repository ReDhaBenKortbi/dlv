import { Controller, Get, UseGuards } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class DashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('metrics')
  async metrics() {
    const [users, books, pendingPayments] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.book.count(),
      this.prisma.paymentRequest.count({ where: { status: PaymentStatus.PENDING } }),
    ]);
    return { users, books, pendingPayments };
  }
}
