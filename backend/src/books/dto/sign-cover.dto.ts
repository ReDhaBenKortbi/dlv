import { IsIn, IsString, MinLength } from 'class-validator';

export const ALLOWED_COVER_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export type AllowedCoverContentType = (typeof ALLOWED_COVER_CONTENT_TYPES)[number];

export class SignCoverDto {
  @IsString()
  @MinLength(1)
  fileName: string;

  @IsIn(ALLOWED_COVER_CONTENT_TYPES as readonly string[])
  contentType: AllowedCoverContentType;
}
