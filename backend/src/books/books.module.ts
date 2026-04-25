import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { FlipbookProcessor } from './flipbook-processing.processor';
import { FLIPBOOK_QUEUE } from './flipbook-processing.constants';

@Module({
  imports: [BullModule.registerQueue({ name: FLIPBOOK_QUEUE })],
  controllers: [BooksController],
  providers: [BooksService, FlipbookProcessor],
})
export class BooksModule {}
