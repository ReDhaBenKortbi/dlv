import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  fullName: string;

  @IsString()
  amount: string;

  @IsOptional()
  @IsUrl()
  receiptURL?: string;
}
