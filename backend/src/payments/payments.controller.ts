import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { ProcessPaymentDto } from './dto/process-payment.dto';
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

  @Post('submit')
  @UseInterceptors(FileInterceptor('receipt'))
  submit(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SubmitPaymentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.paymentsService.submit(user.sub, user.email, dto, file);
  }

  @Patch(':id/process')
  @Roles(Role.ADMIN)
  process(@Param('id') id: string, @Body() dto: ProcessPaymentDto) {
    return this.paymentsService.process(id, dto);
  }
}
