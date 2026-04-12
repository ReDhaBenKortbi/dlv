import { IsString, MinLength } from 'class-validator';

export class SubmitPaymentDto {
  @IsString()
  @MinLength(1)
  amount: string;
}
