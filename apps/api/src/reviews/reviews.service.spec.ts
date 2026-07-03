import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { BookTier, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewsService } from './reviews.service';

function createPrismaMock() {
  return {
    book: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    review: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  };
}

function makeBook(overrides: Record<string, unknown> = {}) {
  return {
    id: 'b_1',
    bookTier: 'FREE' as BookTier,
    averageRating: 0,
    totalReviews: 0,
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

describe('ReviewsService.create entitlement gate', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let service: ReviewsService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new ReviewsService(prisma as unknown as PrismaService);
    prisma.review.findUnique.mockResolvedValue(null);
    prisma.review.create.mockResolvedValue({ id: 'r_1' });
    prisma.book.update.mockResolvedValue({});
  });

  it('throws NotFound when the book does not exist', async () => {
    prisma.book.findUnique.mockResolvedValue(null);
    await expect(
      service.create(makeUser(), 'missing', 5),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('allows a FREE user to review a FREE book', async () => {
    prisma.book.findUnique.mockResolvedValue(makeBook({ bookTier: 'FREE' }));
    await expect(service.create(makeUser(), 'b_1', 5)).resolves.toBeDefined();
    expect(prisma.review.create).toHaveBeenCalled();
  });

  it('forbids a FREE user from reviewing a PRO book', async () => {
    prisma.book.findUnique.mockResolvedValue(makeBook({ bookTier: 'PRO' }));
    await expect(
      service.create(makeUser({ subscriptionPlan: 'FREE' }), 'b_1', 5),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.review.create).not.toHaveBeenCalled();
  });

  it('forbids a PRO user from reviewing a GOLD book', async () => {
    prisma.book.findUnique.mockResolvedValue(makeBook({ bookTier: 'GOLD' }));
    await expect(
      service.create(makeUser({ subscriptionPlan: 'PRO' }), 'b_1', 5),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows a GOLD user to review a GOLD book', async () => {
    prisma.book.findUnique.mockResolvedValue(makeBook({ bookTier: 'GOLD' }));
    await expect(
      service.create(makeUser({ subscriptionPlan: 'GOLD' }), 'b_1', 5),
    ).resolves.toBeDefined();
  });

  it('lets an ADMIN bypass tier gating', async () => {
    prisma.book.findUnique.mockResolvedValue(makeBook({ bookTier: 'GOLD' }));
    await expect(
      service.create(
        makeUser({ role: 'ADMIN', subscriptionPlan: 'FREE' }),
        'b_1',
        5,
      ),
    ).resolves.toBeDefined();
  });
});
