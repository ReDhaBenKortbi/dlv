import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtGuard } from '../auth/guards/optional-jwt.guard';
import type {
  AuthenticatedRequest,
  OptionallyAuthenticatedRequest,
} from '../common/types';
import { BooksService } from './books.service';
import { BooksFilterDto } from './dto/books-filter.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Controller('books')
export class BooksController {
  constructor(
    private booksService: BooksService,
    private config: ConfigService,
  ) {}

  @UseGuards(OptionalJwtGuard)
  @Get()
  findAll(@Query() filter: BooksFilterDto) {
    return this.booksService.findAll(filter);
  }

  @UseGuards(OptionalJwtGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: OptionallyAuthenticatedRequest) {
    return this.booksService.findOne(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/read')
  async read(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Headers('referer') referer = '',
    @Res() res: Response,
  ) {
    const frontendUrl = this.config.getOrThrow<string>('FRONTEND_URL');
    const html = await this.booksService.getReaderHtml(
      id,
      req.user,
      referer,
      frontendUrl,
    );
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    // Allow the frontend origin to embed this reader in an iframe.
    // Global helmet defaults to `frame-ancestors 'self'` + X-Frame-Options,
    // which blocks the cross-origin frontend from framing this API response.
    const frontendOrigin = new URL(frontendUrl).origin;
    res.setHeader(
      'Content-Security-Policy',
      `frame-ancestors 'self' ${frontendOrigin}`,
    );
    res.removeHeader('X-Frame-Options');
    res.send(html);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  create(@Body() dto: CreateBookDto) {
    return this.booksService.create(dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBookDto) {
    return this.booksService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.booksService.remove(id);
  }
}
