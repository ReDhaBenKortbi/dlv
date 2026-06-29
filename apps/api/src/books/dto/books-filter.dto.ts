import { FocusSkill, ProficiencyLevel, TargetLanguage } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class BooksFilterDto {
  @IsEnum(TargetLanguage)
  @IsOptional()
  targetLanguage?: TargetLanguage;

  @IsEnum(FocusSkill)
  @IsOptional()
  focusSkill?: FocusSkill;

  @IsEnum(ProficiencyLevel)
  @IsOptional()
  proficiencyLevel?: ProficiencyLevel;

  @IsString()
  @IsOptional()
  search?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
