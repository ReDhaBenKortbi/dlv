import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { SignContentDto } from './dto/sign-content.dto';
import { SignContentBatchDto } from './dto/sign-content-batch.dto';
import { SignPartsDto } from './dto/sign-parts.dto';
import { CompleteMultipartDto } from './dto/complete-multipart.dto';
import { AbortMultipartDto } from './dto/abort-multipart.dto';
import { SetContentDto } from './dto/set-content.dto';

@Injectable()
export class BooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  findAll() {
    return this.prisma.book.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  create(dto: CreateBookDto) {
    return this.prisma.book.create({
      data: {
        title: dto.title,
        author: dto.author,
        description: dto.description,
        coverURL: dto.coverURL,
        indexURL: dto.indexURL ?? undefined,
        isPremium: dto.isPremium ?? false,
        category: dto.category,
        targetLanguage: dto.targetLanguage,
        focusSkill: dto.focusSkill,
        proficiencyLevel: dto.proficiencyLevel,
      },
    });
  }

  async update(id: string, dto: UpdateBookDto) {
    await this.findOne(id);
    return this.prisma.book.update({ where: { id }, data: { ...dto } });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.book.delete({ where: { id } });
    await this.storage.deleteFolder(`books/${id}`);
  }

  async signContentUrl(id: string, dto: SignContentDto) {
    await this.findOne(id);
    const key = `books/${id}/${dto.fileName}`;
    const url = await this.storage.signPutUrl(key, dto.contentType);
    return { url, key };
  }

  async signContentUrlBatch(id: string, dto: SignContentBatchDto) {
    await this.findOne(id);
    const signed = await Promise.all(
      dto.files.map(async ({ fileName, contentType }) => {
        const key = `books/${id}/${fileName}`;
        const url = await this.storage.signPutUrl(key, contentType);
        return { url, key };
      }),
    );
    return { files: signed };
  }

  async initiateContentUpload(id: string, dto: SignContentDto) {
    await this.findOne(id);
    const key = `books/${id}/${dto.fileName}`;
    const uploadId = await this.storage.initiateMultipartUpload(key, dto.contentType);
    return { uploadId, key };
  }

  async signContentParts(id: string, dto: SignPartsDto) {
    await this.findOne(id);
    if (!dto.key.startsWith(`books/${id}/`)) {
      throw new ForbiddenException('Key does not belong to this book');
    }
    const partUrls = await this.storage.signMultipartPartUrls(
      dto.key,
      dto.uploadId,
      dto.partNumbers,
    );
    return { partUrls };
  }

  async completeContentUpload(id: string, dto: CompleteMultipartDto) {
    await this.findOne(id);
    if (!dto.key.startsWith(`books/${id}/`)) {
      throw new ForbiddenException('Key does not belong to this book');
    }
    await this.storage.completeMultipartUpload(dto.key, dto.uploadId, dto.parts);
  }

  async abortContentUpload(id: string, dto: AbortMultipartDto) {
    await this.findOne(id);
    if (!dto.key.startsWith(`books/${id}/`)) {
      throw new ForbiddenException('Key does not belong to this book');
    }
    await this.storage.abortMultipartUpload(dto.key, dto.uploadId);
  }

  async setContentIndex(id: string, dto: SetContentDto) {
    await this.findOne(id);
    const entryFileName = dto.entryFileName ?? 'index.html';
    if (entryFileName.includes('..')) {
      throw new ForbiddenException('Invalid entry file name');
    }
    const indexKey = `books/${id}/${entryFileName}`;
    const exists = await this.storage.headObject(indexKey);
    if (!exists) throw new UnprocessableEntityException('Index file not found in storage');
    const indexURL = this.storage.publicUrl(indexKey);
    return this.prisma.book.update({ where: { id }, data: { indexURL } });
  }
}
