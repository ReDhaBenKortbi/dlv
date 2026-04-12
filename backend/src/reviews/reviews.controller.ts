import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';

@Controller('books/:bookId/reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  findAll(@Param('bookId') bookId: string) {
    return this.reviewsService.findByBook(bookId);
  }

  @Get('mine')
  findMine(
    @Param('bookId') bookId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.reviewsService.findMine(bookId, user.sub);
  }

  @Post()
  create(
    @Param('bookId') bookId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(bookId, user.sub, user.email, dto);
  }
}

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewDeleteController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.reviewsService.remove(id, user.sub, user.role);
  }
}
