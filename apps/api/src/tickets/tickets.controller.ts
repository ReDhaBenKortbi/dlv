import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TicketStatus } from '@prisma/client';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/types';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketsService } from './tickets.service';

class TicketsQueryDto extends PaginationQueryDto {
  // Tickets default to a smaller page (10) than the shared default (20).
  @IsInt() @Min(1) @Max(50) @IsOptional() @Type(() => Number) limit?: number =
    10;
}

@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateTicketDto) {
    return this.ticketsService.create(req.user.id, dto);
  }

  @Get('mine')
  mine(@Req() req: AuthenticatedRequest) {
    return this.ticketsService.mine(req.user.id);
  }

  @UseGuards(AdminGuard)
  @Get()
  listAll(@Query() query: TicketsQueryDto) {
    return this.ticketsService.listAll(query.page, query.limit);
  }

  @UseGuards(AdminGuard)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: TicketStatus) {
    return this.ticketsService.updateStatus(id, status);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(id);
  }
}
