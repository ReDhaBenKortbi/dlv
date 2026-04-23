import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';

export class SetContentDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[^/][^\0]*\.html?$/i, {
    message: 'entryFileName must be a relative path ending in .html or .htm',
  })
  entryFileName?: string;
}
