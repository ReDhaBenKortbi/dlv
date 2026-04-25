import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import {
  FLIPBOOK_JOB,
  FLIPBOOK_QUEUE,
  FlipbookJobData,
} from './flipbook-processing.constants';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { SignContentDto } from './dto/sign-content.dto';
import { SignContentBatchDto } from './dto/sign-content-batch.dto';
import { SignPartsDto } from './dto/sign-parts.dto';
import { CompleteMultipartDto } from './dto/complete-multipart.dto';
import { AbortMultipartDto } from './dto/abort-multipart.dto';
import { SetContentDto } from './dto/set-content.dto';
import {
  CreateUploadSessionDto,
  UpdateUploadSessionDto,
} from './dto/upload-session.dto';
import { Prisma } from '@prisma/client';

interface ManifestEntry {
  fileName: string;
  status: 'pending' | 'complete';
}

function assertSafeRelativePath(name: string): void {
  if (
    !name ||
    name.startsWith('/') ||
    name.includes('\\') ||
    /\x00/.test(name) ||
    name.split('/').some((segment) => segment === '..' || segment === '.')
  ) {
    throw new ForbiddenException('Invalid file path');
  }
}

@Injectable()
export class BooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    @InjectQueue(FLIPBOOK_QUEUE) private readonly flipbookQueue: Queue<FlipbookJobData>,
  ) {}

  async enqueueFlipbookProcessing(id: string, dto: SetContentDto) {
    await this.findOne(id);
    const entryFileName = dto.entryFileName ?? 'index.html';
    assertSafeRelativePath(entryFileName);

    const jobId = `flipbook:${id}`;
    const existing = await this.flipbookQueue.getJob(jobId);
    if (existing) await existing.remove().catch(() => undefined);

    const job = await this.flipbookQueue.add(
      FLIPBOOK_JOB,
      { bookId: id, entryFileName },
      {
        jobId,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { age: 3600, count: 100 },
        removeOnFail: { age: 86400 },
      },
    );
    return { jobId: job.id, status: 'queued' as const };
  }

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
    assertSafeRelativePath(dto.fileName);
    const key = `books/${id}/${dto.fileName}`;
    const url = await this.storage.signPutUrl(key, dto.contentType);
    return { url, key };
  }

  async signContentUrlBatch(id: string, dto: SignContentBatchDto) {
    await this.findOne(id);
    for (const { fileName } of dto.files) assertSafeRelativePath(fileName);
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
    assertSafeRelativePath(dto.fileName);
    const key = `books/${id}/${dto.fileName}`;
    const uploadId = await this.storage.initiateMultipartUpload(key, dto.contentType);
    return { uploadId, key };
  }

  async signContentParts(id: string, dto: SignPartsDto) {
    await this.findOne(id);
    if (!dto.key.startsWith(`books/${id}/`) || dto.key.includes('..')) {
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
    if (!dto.key.startsWith(`books/${id}/`) || dto.key.includes('..')) {
      throw new ForbiddenException('Key does not belong to this book');
    }
    await this.storage.completeMultipartUpload(dto.key, dto.uploadId, dto.parts);
  }

  async abortContentUpload(id: string, dto: AbortMultipartDto) {
    await this.findOne(id);
    if (!dto.key.startsWith(`books/${id}/`) || dto.key.includes('..')) {
      throw new ForbiddenException('Key does not belong to this book');
    }
    await this.storage.abortMultipartUpload(dto.key, dto.uploadId);
  }

  async getUploadSession(id: string) {
    await this.findOne(id);
    return this.prisma.uploadSession.findUnique({ where: { bookId: id } });
  }

  async createUploadSession(id: string, dto: CreateUploadSessionDto) {
    await this.findOne(id);
    for (const { fileName } of dto.files) assertSafeRelativePath(fileName);
    const manifest: ManifestEntry[] = dto.files.map((f) => ({
      fileName: f.fileName,
      status: 'pending',
    }));
    return this.prisma.uploadSession.upsert({
      where: { bookId: id },
      create: {
        bookId: id,
        status: 'in_progress',
        manifest: manifest as unknown as Prisma.InputJsonValue,
      },
      update: {
        status: 'in_progress',
        manifest: manifest as unknown as Prisma.InputJsonValue,
      },
    });
  }

  async updateUploadSession(id: string, dto: UpdateUploadSessionDto) {
    await this.findOne(id);
    const session = await this.prisma.uploadSession.findUnique({
      where: { bookId: id },
    });
    if (!session) throw new NotFoundException('Upload session not found');

    let manifest = session.manifest as unknown as ManifestEntry[];
    if (dto.completed && dto.completed.length > 0) {
      const completedSet = new Set(dto.completed);
      manifest = manifest.map((entry) =>
        completedSet.has(entry.fileName) ? { ...entry, status: 'complete' } : entry,
      );
    }

    return this.prisma.uploadSession.update({
      where: { bookId: id },
      data: {
        manifest: manifest as unknown as Prisma.InputJsonValue,
        ...(dto.status ? { status: dto.status } : {}),
      },
    });
  }

  async setContentIndex(id: string, dto: SetContentDto) {
    await this.findOne(id);
    const entryFileName = dto.entryFileName ?? 'index.html';
    assertSafeRelativePath(entryFileName);
    const indexKey = `books/${id}/${entryFileName}`;
    const exists = await this.storage.headObject(indexKey);
    if (!exists) throw new UnprocessableEntityException('Index file not found in storage');
    const indexURL = this.storage.publicUrl(indexKey);
    return this.prisma.book.update({ where: { id }, data: { indexURL } });
  }
}
