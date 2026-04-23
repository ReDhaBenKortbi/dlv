import { IsString, IsNotEmpty, IsArray, IsInt, Min, ArrayNotEmpty } from 'class-validator';

export class SignPartsDto {
  @IsString()
  @IsNotEmpty()
  uploadId: string;

  @IsString()
  @IsNotEmpty()
  key: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @Min(1, { each: true })
  partNumbers: number[];
}
