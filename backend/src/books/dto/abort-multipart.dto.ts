import { IsString, IsNotEmpty } from 'class-validator';

export class AbortMultipartDto {
  @IsString()
  @IsNotEmpty()
  uploadId: string;

  @IsString()
  @IsNotEmpty()
  key: string;
}
