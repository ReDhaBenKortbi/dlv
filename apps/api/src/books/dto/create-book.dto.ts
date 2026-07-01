import {
  BookTier,
  FocusSkill,
  ProficiencyLevel,
  TargetLanguage,
} from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateBookDto {
  @IsString()
  title: string;

  @IsString()
  author: string;

  @IsString()
  description: string;

  @IsUrl()
  coverURL: string;

  @IsUrl()
  indexURL: string;

  @IsEnum(BookTier)
  @IsOptional()
  bookTier?: BookTier;

  @IsEnum(TargetLanguage)
  @IsOptional()
  targetLanguage?: TargetLanguage;

  @IsEnum(FocusSkill)
  @IsOptional()
  focusSkill?: FocusSkill;

  @IsEnum(ProficiencyLevel)
  @IsOptional()
  proficiencyLevel?: ProficiencyLevel;
}
