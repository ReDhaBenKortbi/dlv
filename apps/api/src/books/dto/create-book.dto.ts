import { FocusSkill, ProficiencyLevel, TargetLanguage } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

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

  @IsBoolean()
  @IsOptional()
  isPremium?: boolean;

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
