import { Injectable, NotFoundException } from '@nestjs/common';
import { TicketStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, dto: CreateTicketDto) {
    return this.prisma.ticket.create({ data: { ...dto, userId } });
  }

  mine(userId: string) {
    return this.prisma.ticket.findMany({
      where: { userId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  }

  async listAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [tickets, total] = await Promise.all([
      this.prisma.ticket.findMany({
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        include: { user: { select: { id: true, email: true } } },
        skip,
        take: limit,
      }),
      this.prisma.ticket.count(),
    ]);
    return { data: tickets, meta: { total, page, limit } };
  }

  async updateStatus(id: string, status: TicketStatus) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return this.prisma.ticket.update({ where: { id }, data: { status } });
  }

  async remove(id: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    await this.prisma.ticket.delete({ where: { id } });
  }
}
