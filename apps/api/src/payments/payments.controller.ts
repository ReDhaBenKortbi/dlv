import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentStatus, SubscriptionPlan } from '@prisma/client';
import { SkipThrottle } from '@nestjs/throttler';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/types';
import { ChargilyService } from './chargily.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private chargilyService: ChargilyService) {}

  @UseGuards(JwtAuthGuard)
  @Post('chargily/checkout')
  chargilyCheckout(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateCheckoutDto,
  ) {
    // fullName comes from the authenticated user record, never the request body.
    return this.chargilyService.createCheckout(
      req.user.id,
      req.user.fullName,
      dto.plan,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('chargily/cancel-pending')
  cancelPending(@Req() req: AuthenticatedRequest) {
    return this.chargilyService.cancelPendingSubscription(req.user.id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('history')
  getHistory(
    @Query('status') status?: PaymentStatus,
    @Query('plan') plan?: SubscriptionPlan,
  ) {
    return this.chargilyService.getPaymentHistory({ status, plan });
  }

  @SkipThrottle()
  @HttpCode(HttpStatus.OK)
  @Post('chargily/webhook')
  chargilyWebhook(
    @Req() req: { rawBody: Buffer },
    @Headers('signature') signature: string,
    @Body() event: { type: string; data?: { id: string } },
  ) {
    return this.chargilyService.handleWebhookEvent(
      signature,
      req.rawBody,
      event,
    );
  }
}
