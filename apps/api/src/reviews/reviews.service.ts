import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { canAccess } from '../books/access.util';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async findByBook(bookId: string, page = 1, limit = 9) {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { bookId },
        include: { user: { select: { id: true, email: true } } },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.review.count({ where: { bookId } }),
    ]);
    return { data: reviews, meta: { total, page, limit } };
  }

  findMine(bookId: string, userId: string) {
    return this.prisma.review.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });
  }

  async create(user: User, bookId: string, rating: number, body?: string) {
    const userId = user.id;
    const book = await this.prisma.book.findUnique({ where: { id: bookId } });
    if (!book) throw new NotFoundException('Book not found');

    // Only users entitled to the book (by subscription tier) may review it.
    // Admins bypass tier gating.
    if (
      user.role !== Role.ADMIN &&
      !canAccess(book.bookTier, user.subscriptionPlan)
    ) {
      throw new ForbiddenException(
        'A subscription is required to review this book',
      );
    }

    const existing = await this.prisma.review.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });
    if (existing) throw new BadRequestException('Already reviewed');

    const review = await this.prisma.review.create({
      data: { userId, bookId, rating, body },
    });

    // Update book aggregates
    const newTotal = book.totalReviews + 1;
    const newAvg = (book.averageRating * book.totalReviews + rating) / newTotal;
    await this.prisma.book.update({
      where: { id: bookId },
      data: { totalReviews: newTotal, averageRating: newAvg },
    });

    return review;
  }

  async remove(reviewId: string, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== userId)
      throw new BadRequestException('Not your review');

    await this.prisma.review.delete({ where: { id: reviewId } });

    const book = await this.prisma.book.findUnique({
      where: { id: review.bookId },
    });
    if (book && book.totalReviews > 0) {
      const newTotal = book.totalReviews - 1;
      const newAvg =
        newTotal === 0
          ? 0
          : (book.averageRating * book.totalReviews - review.rating) / newTotal;
      await this.prisma.book.update({
        where: { id: review.bookId },
        data: { totalReviews: newTotal, averageRating: newAvg },
      });
    }
  }
}
