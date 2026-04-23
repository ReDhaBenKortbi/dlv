import { IsString, IsNotEmpty, IsInt, IsArray, ArrayNotEmpty, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CompletedPart } from '../../storage/storage.service';

class PartDto implements CompletedPart {
  @IsInt()
  @Min(1)
  PartNumber: number;

  @IsString()
  @IsNotEmpty()
  ETag: string;
}

export class CompleteMultipartDto {
  @IsString()
  @IsNotEmpty()
  uploadId: string;

  @IsString()
  @IsNotEmpty()
  key: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PartDto)
  parts: PartDto[];
}
