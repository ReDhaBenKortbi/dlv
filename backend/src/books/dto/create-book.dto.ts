import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @MinLength(1)
  author: string;

  @IsString()
  description: string;

  @IsUrl()
  coverURL: string;

  @IsOptional()
  @IsString()
  indexURL?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isPremium?: boolean;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  targetLanguage?: string;

  @IsOptional()
  @IsString()
  focusSkill?: string;

  @IsOptional()
  @IsString()
  proficiencyLevel?: string;
}
