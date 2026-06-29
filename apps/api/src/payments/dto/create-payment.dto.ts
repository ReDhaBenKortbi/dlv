import { IsString, IsUrl } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  fullName: string;

  @IsString()
  amount: string;

  @IsUrl()
  receiptURL: string;
}
