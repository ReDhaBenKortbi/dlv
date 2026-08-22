import { FocusSkill, ProficiencyLevel, TargetLanguage } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

const splitList = ({ value }: { value: unknown }) =>
  Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : value;

export class BooksFilterDto {
  @IsEnum(TargetLanguage)
  @IsOptional()
  targetLanguage?: TargetLanguage;

  @Transform(splitList)
  @IsArray()
  @IsEnum(FocusSkill, { each: true })
  @IsOptional()
  focusSkill?: FocusSkill[];

  @Transform(splitList)
  @IsArray()
  @IsEnum(ProficiencyLevel, { each: true })
  @IsOptional()
  proficiencyLevel?: ProficiencyLevel[];

  @IsString()
  @IsOptional()
  search?: string;

  // Raw (ungrouped) row-level pagination — used by the admin book table,
  // which lists individual tier editions as separate, editable rows. The
  // default (false) groups multi-tier editions of the same title into one
  // series per page for the public library grid.
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  raw?: boolean = false;

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
