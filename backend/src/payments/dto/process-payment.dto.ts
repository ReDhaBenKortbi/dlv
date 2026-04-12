import { IsEnum } from 'class-validator';
import { PaymentStatus } from '@prisma/client';

export class ProcessPaymentDto {
  @IsEnum([PaymentStatus.APPROVED, PaymentStatus.REJECTED])
  action: PaymentStatus.APPROVED | PaymentStatus.REJECTED;
}
