import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { SignReceiptDto } from './dto/sign-receipt.dto';
import { SubmitPaymentDto } from './dto/submit-payment.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('pending')
  @Roles(Role.ADMIN)
  getPending() {
    return this.paymentsService.getPending();
  }

  @Post('receipt/sign')
  signReceipt(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SignReceiptDto,
  ) {
    return this.paymentsService.signReceiptUrl(user.sub, dto);
  }

  @Post('submit')
  submit(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SubmitPaymentDto,
  ) {
    return this.paymentsService.submit(user.sub, user.email, dto);
  }

  @Patch(':id/process')
  @Roles(Role.ADMIN)
  process(@Param('id') id: string, @Body() dto: ProcessPaymentDto) {
    return this.paymentsService.process(id, dto);
  }
}
