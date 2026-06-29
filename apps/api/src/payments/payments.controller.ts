import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/types';
import { ChargilyService } from './chargily.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private paymentsService: PaymentsService,
    private chargilyService: ChargilyService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  mine(@Req() req: AuthenticatedRequest) {
    return this.paymentsService.mine(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('chargily/checkout')
  chargilyCheckout(
    @Req() req: AuthenticatedRequest,
    @Body('fullName') fullName: string,
  ) {
    return this.chargilyService.createCheckout(req.user.id, fullName);
  }

  @HttpCode(HttpStatus.OK)
  @Post('chargily/webhook')
  chargilyWebhook(
    @Req() req: { rawBody: Buffer },
    @Headers('signature') signature: string,
    @Body() event: { type: string; data?: { id: string } },
  ) {
    return this.chargilyService.handleWebhookEvent(signature, req.rawBody!, event);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  listAll() {
    return this.paymentsService.listAll();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(':id/approve')
  approve(@Param('id') id: string) {
    return this.paymentsService.approve(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(':id/reject')
  reject(@Param('id') id: string) {
    return this.paymentsService.reject(id);
  }
}
