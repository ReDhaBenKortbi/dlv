import { IsIn, IsString, MinLength } from 'class-validator';

export const ALLOWED_RECEIPT_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export type AllowedReceiptContentType =
  (typeof ALLOWED_RECEIPT_CONTENT_TYPES)[number];

export class SignReceiptDto {
  @IsString()
  @MinLength(1)
  fileName: string;

  @IsIn(ALLOWED_RECEIPT_CONTENT_TYPES as readonly string[])
  contentType: AllowedReceiptContentType;
}
