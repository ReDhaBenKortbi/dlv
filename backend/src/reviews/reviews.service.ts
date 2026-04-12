import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import {
  computeNewAverageRating,
  computeRatingAfterDeletion,
} from './rating.utils';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  findByBook(bookId: string) {
    return this.prisma.review.findMany({
      where: { bookId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findMine(bookId: string, userId: string) {
    return this.prisma.review.findUnique({ where: { bookId_userId: { bookId, userId } } });
  }

  async create(bookId: string, userId: string, userName: string, dto: CreateReviewDto) {
    const book = await this.prisma.book.findUnique({ where: { id: bookId } });
    if (!book) throw new NotFoundException('Book not found');

    const existing = await this.prisma.review.findUnique({
      where: { bookId_userId: { bookId, userId } },
    });
    if (existing) throw new ConflictException('You already reviewed this book');

    const newAverage = computeNewAverageRating(
      book.averageRating,
      book.totalReviews,
      dto.rating,
    );

    const [review] = await this.prisma.$transaction([
      this.prisma.review.create({
        data: { bookId, userId, userName, rating: dto.rating, comment: dto.comment },
      }),
      this.prisma.book.update({
        where: { id: bookId },
        data: {
          averageRating: newAverage,
          totalReviews: { increment: 1 },
        },
      }),
    ]);

    return review;
  }

  async remove(reviewId: string, userId: string, userRole: Role) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Cannot delete another user\'s review');
    }

    const book = await this.prisma.book.findUniqueOrThrow({
      where: { id: review.bookId },
    });

    const newAverage = computeRatingAfterDeletion(
      book.averageRating,
      book.totalReviews,
      review.rating,
    );

    await this.prisma.$transaction([
      this.prisma.review.delete({ where: { id: reviewId } }),
      this.prisma.book.update({
        where: { id: review.bookId },
        data: {
          averageRating: newAverage,
          totalReviews: { decrement: 1 },
        },
      }),
    ]);
  }
}
