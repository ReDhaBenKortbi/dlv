import { IsEnum } from 'class-validator';

export enum PaymentAction {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class ProcessPaymentDto {
  @IsEnum(PaymentAction)
  action: PaymentAction;
}
