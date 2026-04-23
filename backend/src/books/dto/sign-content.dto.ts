import { IsString, IsNotEmpty } from 'class-validator';

export class SignContentDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  contentType: string;
}
