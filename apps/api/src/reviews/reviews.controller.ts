import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/types';
import { ReviewsService } from './reviews.service';

class CreateReviewDto {
  @IsInt() @Min(1) @Max(5) rating: number;
  @IsString() @IsOptional() body?: string;
}

@Controller('books/:bookId/reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Get()
  findAll(@Param('bookId') bookId: string) {
    return this.reviewsService.findByBook(bookId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Param('bookId') bookId: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(
      req.user.id,
      bookId,
      dto.rating,
      dto.body,
    );
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':reviewId')
  remove(
    @Param('reviewId') reviewId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.reviewsService.remove(reviewId, req.user.id);
  }
}
