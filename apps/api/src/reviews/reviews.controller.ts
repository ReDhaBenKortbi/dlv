import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/types';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { ReviewsService } from './reviews.service';

class CreateReviewDto {
  @IsInt() @Min(1) @Max(5) rating: number;
  @IsString() @IsOptional() body?: string;
}

class ReviewsQueryDto extends PaginationQueryDto {
  // Reviews default to a smaller page (9) to fit the 1/2/3-col grid.
  @IsInt() @Min(1) @Max(50) @IsOptional() @Type(() => Number) limit?: number =
    9;
}

@Controller('books/:bookId/reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Get()
  findAll(@Param('bookId') bookId: string, @Query() query: ReviewsQueryDto) {
    return this.reviewsService.findByBook(bookId, query.page, query.limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  findMine(@Param('bookId') bookId: string, @Req() req: AuthenticatedRequest) {
    return this.reviewsService.findMine(bookId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Param('bookId') bookId: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(req.user, bookId, dto.rating, dto.body);
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
