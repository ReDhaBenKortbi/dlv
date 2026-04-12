import { Module } from '@nestjs/common';
import { ReviewDeleteController, ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  controllers: [ReviewsController, ReviewDeleteController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
