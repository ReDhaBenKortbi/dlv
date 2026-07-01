import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BookTier, Role, SubscriptionPlan, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

function canAccess(bookTier: BookTier, userPlan: SubscriptionPlan): boolean {
  if (bookTier === 'FREE') return true;
  if (bookTier === 'PRO') return userPlan === 'PRO' || userPlan === 'GOLD';
  return userPlan === 'GOLD';
}
import { BooksFilterDto } from './dto/books-filter.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async findAll(filter: BooksFilterDto) {
    const {
      targetLanguage,
      focusSkill,
      proficiencyLevel,
      search,
      page = 1,
      limit = 20,
    } = filter;
    const skip = (page - 1) * limit;

    const where = {
      ...(targetLanguage && { targetLanguage }),
      ...(focusSkill && { focusSkill }),
      ...(proficiencyLevel && { proficiencyLevel }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { author: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [books, total] = await Promise.all([
      this.prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          author: true,
          description: true,
          coverURL: true,
          bookTier: true,
          targetLanguage: true,
          focusSkill: true,
          proficiencyLevel: true,
          averageRating: true,
          totalReviews: true,
          createdAt: true,
          // indexURL is only exposed on the single-book endpoint (guarded by subscription)
        },
      }),
      this.prisma.book.count({ where }),
    ]);

    return { data: books, meta: { total, page, limit } };
  }

  async findOne(id: string, requestingUser?: User) {
    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book) throw new NotFoundException('Book not found');

    if (book.bookTier !== 'FREE' && requestingUser) {
      const isAdmin = requestingUser.role === Role.ADMIN;
      if (
        !isAdmin &&
        !canAccess(book.bookTier, requestingUser.subscriptionPlan)
      ) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { indexURL: _indexURL, ...meta } = book;
        return meta;
      }
    }

    return book;
  }

  async create(dto: CreateBookDto) {
    return this.prisma.book.create({ data: dto });
  }

  async update(id: string, dto: UpdateBookDto) {
    await this.findOne(id);
    return this.prisma.book.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.book.delete({ where: { id } });
  }

  async getReaderHtml(
    id: string,
    user: User,
    referer: string,
    frontendUrl: string,
  ): Promise<string> {
    const isLocal =
      referer.includes('localhost') || referer.includes('127.0.0.1');
    const isProd = referer.includes(frontendUrl);
    if (!isLocal && !isProd)
      throw new ForbiddenException('Unauthorized source');

    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book) throw new NotFoundException('Book not found');

    if (
      book.bookTier !== 'FREE' &&
      user.role !== Role.ADMIN &&
      !canAccess(book.bookTier, user.subscriptionPlan)
    ) {
      throw new ForbiddenException('Subscription required');
    }

    if (!book.indexURL)
      throw new InternalServerErrorException('Book URL missing');

    const response = await fetch(book.indexURL);
    if (!response.ok) throw new InternalServerErrorException('Upstream error');

    const baseUrl = book.indexURL.substring(
      0,
      book.indexURL.lastIndexOf('/') + 1,
    );
    let html = await response.text();

    const baseTag = `<base href="${baseUrl}">`;
    const protectionScript = `<script>
        if (window.self === window.top) { window.location.href = "${frontendUrl}"; }
        document.addEventListener('contextmenu', e => e.preventDefault());
      </script>`;

    const injection = `\n${baseTag}${protectionScript}`;
    html = html.includes('<head>')
      ? html.replace('<head>', `<head>${injection}`)
      : injection + html;

    return html;
  }
}
