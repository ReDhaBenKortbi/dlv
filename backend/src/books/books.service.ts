import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

interface BookFiles {
  cover?: Express.Multer.File[];
  index?: Express.Multer.File[];
}

@Injectable()
export class BooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  findAll() {
    return this.prisma.book.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  async create(dto: CreateBookDto, files: BookFiles) {
    const coverFile = files.cover?.[0];
    const indexFile = files.index?.[0];
    if (!coverFile) throw new BadRequestException('Cover file is required');
    if (!indexFile) throw new BadRequestException('Index file is required');

    const [coverURL, indexURL] = await Promise.all([
      this.cloudinary.upload(coverFile),
      this.cloudinary.upload(indexFile),
    ]);

    return this.prisma.book.create({ data: { ...dto, coverURL, indexURL } });
  }

  async update(id: string, dto: UpdateBookDto, files: BookFiles) {
    await this.findOne(id);

    const updates: Record<string, unknown> = { ...dto };

    if (files.cover?.[0]) {
      updates.coverURL = await this.cloudinary.upload(files.cover[0]);
    }
    if (files.index?.[0]) {
      updates.indexURL = await this.cloudinary.upload(files.index[0]);
    }

    return this.prisma.book.update({ where: { id }, data: updates });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.book.delete({ where: { id } });
  }
}
