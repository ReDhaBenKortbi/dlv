import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { BookTier, SubscriptionPlan, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BooksService } from './books.service';

function createPrismaMock() {
  return {
    book: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
  };
}

function makeBook(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'b_1',
    title: 'T',
    author: 'A',
    description: 'D',
    coverURL: 'https://cdn/cover.png',
    indexURL: 'https://cdn/book/index.html',
    bookTier: 'FREE' as BookTier,
    averageRating: 0,
    totalReviews: 0,
    createdAt: new Date(),
    ...overrides,
  };
}

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'u_1',
    role: 'USER',
    subscriptionPlan: 'FREE',
    isSubscribed: false,
    subscriptionStatus: 'NONE',
    fullName: 'U',
    email: 'u@x.com',
    passwordHash: 'x',
    subscriptionEndDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('BooksService', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let service: BooksService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new BooksService(prisma as unknown as PrismaService);
  });

  describe('findAll', () => {
    it('never selects indexURL in the list projection', async () => {
      prisma.book.findMany.mockResolvedValue([]);
      prisma.book.count.mockResolvedValue(0);

      await service.findAll({});

      const calls = prisma.book.findMany.mock.calls as Array<
        [{ select: Record<string, unknown> }]
      >;
      const args = calls[0][0];
      expect(args.select).toBeDefined();
      expect(args.select.indexURL).toBeUndefined();
    });
  });

  describe('findOne', () => {
    it('throws NotFound for a missing book', async () => {
      prisma.book.findUnique.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('returns the full FREE book (incl. indexURL) to anyone', async () => {
      prisma.book.findUnique.mockResolvedValue(makeBook({ bookTier: 'FREE' }));
      const result = await service.findOne('b_1', makeUser());
      expect(result).toHaveProperty('indexURL');
    });

    it('strips indexURL from a PRO book for a FREE user', async () => {
      prisma.book.findUnique.mockResolvedValue(makeBook({ bookTier: 'PRO' }));
      const result = await service.findOne(
        'b_1',
        makeUser({ subscriptionPlan: 'FREE' }),
      );
      expect(result).not.toHaveProperty('indexURL');
    });

    it('keeps indexURL on a PRO book for a PRO user', async () => {
      prisma.book.findUnique.mockResolvedValue(makeBook({ bookTier: 'PRO' }));
      const result = await service.findOne(
        'b_1',
        makeUser({ subscriptionPlan: 'PRO' }),
      );
      expect(result).toHaveProperty('indexURL');
    });

    it('keeps indexURL on a GOLD book for an admin regardless of plan', async () => {
      prisma.book.findUnique.mockResolvedValue(makeBook({ bookTier: 'GOLD' }));
      const result = await service.findOne(
        'b_1',
        makeUser({ role: 'ADMIN', subscriptionPlan: 'FREE' }),
      );
      expect(result).toHaveProperty('indexURL');
    });
  });

  describe('getReaderHtml (tier truth table)', () => {
    const REFERER = 'https://app.example.com';
    const FRONTEND = 'https://app.example.com';

    beforeEach(() => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        text: () =>
          Promise.resolve('<html><head></head><body>book</body></html>'),
      });
    });

    async function read(bookTier: BookTier, plan: SubscriptionPlan) {
      prisma.book.findUnique.mockResolvedValue(makeBook({ bookTier }));
      return service.getReaderHtml(
        'b_1',
        makeUser({ subscriptionPlan: plan }),
        REFERER,
        FRONTEND,
      );
    }

    const allowed: Array<[BookTier, SubscriptionPlan]> = [
      ['FREE', 'FREE'],
      ['PRO', 'PRO'],
      ['PRO', 'GOLD'],
      ['GOLD', 'GOLD'],
    ];
    const denied: Array<[BookTier, SubscriptionPlan]> = [
      ['PRO', 'FREE'],
      ['GOLD', 'FREE'],
      ['GOLD', 'PRO'],
    ];

    it.each(allowed)('allows %s book for %s user', async (tier, plan) => {
      const html = await read(tier, plan);
      expect(html).toContain('<base');
    });

    it.each(denied)('denies %s book for %s user', async (tier, plan) => {
      await expect(read(tier, plan)).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('rejects a request whose referer is not the frontend origin', async () => {
      prisma.book.findUnique.mockResolvedValue(makeBook({ bookTier: 'FREE' }));
      await expect(
        service.getReaderHtml(
          'b_1',
          makeUser(),
          'https://evil.example.com',
          FRONTEND,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('lets an admin read a GOLD book on a FREE plan', async () => {
      prisma.book.findUnique.mockResolvedValue(makeBook({ bookTier: 'GOLD' }));
      const html = await service.getReaderHtml(
        'b_1',
        makeUser({ role: 'ADMIN', subscriptionPlan: 'FREE' }),
        REFERER,
        FRONTEND,
      );
      expect(html).toContain('<base');
    });
  });
});
