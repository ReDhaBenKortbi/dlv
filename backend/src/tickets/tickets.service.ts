import { Injectable, NotFoundException } from '@nestjs/common';
import { TicketStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.ticket.findMany({ orderBy: { createdAt: 'desc' } });
  }

  create(userId: string, userEmail: string, dto: CreateTicketDto) {
    return this.prisma.ticket.create({
      data: { userId, userEmail, subject: dto.subject, message: dto.message },
    });
  }

  async resolve(id: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return this.prisma.ticket.update({
      where: { id },
      data: { status: TicketStatus.RESOLVED },
    });
  }

  async remove(id: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    await this.prisma.ticket.delete({ where: { id } });
  }
}
