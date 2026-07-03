import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketsService } from './tickets.service';

function createPrismaMock() {
  return {
    ticket: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };
}

describe('TicketsService.remove', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let service: TicketsService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new TicketsService(prisma as unknown as PrismaService);
  });

  it('throws NotFound when the ticket does not exist', async () => {
    prisma.ticket.findUnique.mockResolvedValue(null);
    await expect(service.remove('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prisma.ticket.delete).not.toHaveBeenCalled();
  });

  it('deletes an existing ticket', async () => {
    prisma.ticket.findUnique.mockResolvedValue({ id: 't_1' });
    prisma.ticket.delete.mockResolvedValue({ id: 't_1' });
    await service.remove('t_1');
    expect(prisma.ticket.delete).toHaveBeenCalledWith({ where: { id: 't_1' } });
  });
});
