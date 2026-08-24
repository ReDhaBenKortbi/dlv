import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { canAccess } from './access.util';
import { BooksFilterDto } from './dto/books-filter.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  private readonly bookListSelect = {
    id: true,
    title: true,
    author: true,
    description: true,
    coverURL: true,
    bookTier: true,
    groupKey: true,
    targetLanguage: true,
    focusSkill: true,
    proficiencyLevel: true,
    averageRating: true,
    totalReviews: true,
    createdAt: true,
    // indexURL is only exposed on the single-book endpoint (guarded by subscription)
  } as const;

  async findAll(filter: BooksFilterDto) {
    const {
      targetLanguage,
      focusSkill,
      proficiencyLevel,
      search,
      groupKey,
      raw = false,
      page = 1,
      limit = 20,
    } = filter;

    const where = {
      ...(groupKey && { groupKey }),
      ...(targetLanguage && { targetLanguage }),
      ...(focusSkill?.length && { focusSkill: { in: focusSkill } }),
      ...(proficiencyLevel?.length && {
        proficiencyLevel: { in: proficiencyLevel },
      }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { author: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    // Asking for one title's editions means the caller wants the ladder, not a
    // series card — so a groupKey query always takes the ungrouped path.
    if (raw || groupKey) {
      const skip = (page - 1) * limit;
      const [books, total] = await Promise.all([
        this.prisma.book.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: this.bookListSelect,
        }),
        this.prisma.book.count({ where }),
      ]);
      return { data: books, meta: { total, page, limit } };
    }

    // Group-aware pagination: multi-tier (FREE/PRO/GOLD) editions of the same
    // title share `groupKey` and must land on the same page, in full, or a
    // title's edition ladder could be split across a page boundary. Two
    // queries share the same `orderBy` so the first-seen order in step 2
    // matches the row order in step 3 — keep them in sync if either changes.
    const orderBy = { createdAt: 'desc' as const };

    const matches = await this.prisma.book.findMany({
      where,
      select: { id: true, groupKey: true, createdAt: true },
      orderBy,
    });

    const seriesKeys: string[] = [];
    const seen = new Set<string>();
    for (const book of matches) {
      const key = book.groupKey ?? book.id;
      if (!seen.has(key)) {
        seen.add(key);
        seriesKeys.push(key);
      }
    }

    const total = seriesKeys.length;
    const pageKeys = seriesKeys.slice(
      (page - 1) * limit,
      (page - 1) * limit + limit,
    );

    // Every edition of a series kept on this page is included, regardless of
    // whether it individually matches `where` — a series is shown in full
    // once any of its editions match, so the card always has its complete
    // access ladder (free sample, locked tiers, etc).
    const books = pageKeys.length
      ? await this.prisma.book.findMany({
          where: {
            OR: [
              { groupKey: { in: pageKeys } },
              { groupKey: null, id: { in: pageKeys } },
            ],
          },
          orderBy,
          select: this.bookListSelect,
        })
      : [];

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
    try {
      return await this.prisma.book.create({ data: dto });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException(
          'A book with this content URL already exists',
        );
      }
      throw e;
    }
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
