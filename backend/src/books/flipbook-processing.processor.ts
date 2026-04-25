import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import {
  FLIPBOOK_QUEUE,
  FlipbookJobData,
} from './flipbook-processing.constants';

@Processor(FLIPBOOK_QUEUE)
export class FlipbookProcessor extends WorkerHost {
  private readonly logger = new Logger(FlipbookProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {
    super();
  }

  async process(job: Job<FlipbookJobData>): Promise<{ indexURL: string }> {
    const { bookId, entryFileName } = job.data;
    if (
      !entryFileName ||
      entryFileName.startsWith('/') ||
      entryFileName.includes('\\') ||
      /\x00/.test(entryFileName) ||
      entryFileName.split('/').some((s) => s === '..' || s === '.')
    ) {
      throw new Error('Invalid entry file name');
    }
    const indexKey = `books/${bookId}/${entryFileName}`;
    const exists = await this.storage.headObject(indexKey);
    if (!exists) {
      throw new Error(`Index file not found in storage: ${indexKey}`);
    }
    const indexURL = this.storage.publicUrl(indexKey);
    await this.prisma.book.update({ where: { id: bookId }, data: { indexURL } });
    await this.prisma.uploadSession
      .updateMany({ where: { bookId }, data: { status: 'complete' } })
      .catch((error: unknown) => {
        this.logger.warn(`Failed to mark upload session complete for ${bookId}: ${String(error)}`);
      });
    this.logger.log(`Flipbook processed for book ${bookId} -> ${indexURL}`);
    return { indexURL };
  }
}
