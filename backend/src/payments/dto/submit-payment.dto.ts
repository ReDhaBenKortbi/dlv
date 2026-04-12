import { IsString, IsUrl, MinLength } from 'class-validator';

export class SubmitPaymentDto {
  @IsString()
  @MinLength(1)
  amount: string;

  @IsUrl()
  receiptURL: string;
}
