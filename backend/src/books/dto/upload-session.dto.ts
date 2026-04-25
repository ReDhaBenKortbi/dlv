import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UploadSessionFileDto {
  @IsString()
  fileName!: string;
}

export class CreateUploadSessionDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10000)
  @ValidateNested({ each: true })
  @Type(() => UploadSessionFileDto)
  files!: UploadSessionFileDto[];
}

export class UpdateUploadSessionDto {
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10000)
  @IsString({ each: true })
  completed?: string[];

  @IsOptional()
  @IsIn(['in_progress', 'complete', 'failed'])
  status?: 'in_progress' | 'complete' | 'failed';
}
