import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { BooksService } from './books.service';
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

@Controller('books')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  findAll() {
    return this.booksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateBookDto) {
    return this.booksService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateBookDto) {
    return this.booksService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.booksService.remove(id);
  }

  @Post(':id/content/sign')
  @Roles(Role.ADMIN)
  signContentUrl(@Param('id') id: string, @Body() dto: SignContentDto) {
    return this.booksService.signContentUrl(id, dto);
  }

  @Post(':id/content/sign-batch')
  @Roles(Role.ADMIN)
  signContentUrlBatch(@Param('id') id: string, @Body() dto: SignContentBatchDto) {
    return this.booksService.signContentUrlBatch(id, dto);
  }

  @Post(':id/content/multipart/initiate')
  @Roles(Role.ADMIN)
  initiateContentUpload(@Param('id') id: string, @Body() dto: SignContentDto) {
    return this.booksService.initiateContentUpload(id, dto);
  }

  @Post(':id/content/multipart/sign-parts')
  @Roles(Role.ADMIN)
  signContentParts(@Param('id') id: string, @Body() dto: SignPartsDto) {
    return this.booksService.signContentParts(id, dto);
  }

  @Post(':id/content/multipart/complete')
  @Roles(Role.ADMIN)
  @HttpCode(204)
  completeContentUpload(@Param('id') id: string, @Body() dto: CompleteMultipartDto) {
    return this.booksService.completeContentUpload(id, dto);
  }

  @Delete(':id/content/multipart/abort')
  @Roles(Role.ADMIN)
  @HttpCode(204)
  abortContentUpload(@Param('id') id: string, @Body() dto: AbortMultipartDto) {
    return this.booksService.abortContentUpload(id, dto);
  }

  @Patch(':id/content')
  @Roles(Role.ADMIN)
  setContentIndex(@Param('id') id: string, @Body() dto: SetContentDto) {
    return this.booksService.setContentIndex(id, dto);
  }

  @Post(':id/content/process')
  @Roles(Role.ADMIN)
  @HttpCode(202)
  processContent(@Param('id') id: string, @Body() dto: SetContentDto) {
    return this.booksService.enqueueFlipbookProcessing(id, dto);
  }

  @Get(':id/upload-session')
  @Roles(Role.ADMIN)
  getUploadSession(@Param('id') id: string) {
    return this.booksService.getUploadSession(id);
  }

  @Post(':id/upload-session')
  @Roles(Role.ADMIN)
  createUploadSession(
    @Param('id') id: string,
    @Body() dto: CreateUploadSessionDto,
  ) {
    return this.booksService.createUploadSession(id, dto);
  }

  @Patch(':id/upload-session')
  @Roles(Role.ADMIN)
  updateUploadSession(
    @Param('id') id: string,
    @Body() dto: UpdateUploadSessionDto,
  ) {
    return this.booksService.updateUploadSession(id, dto);
  }
}
