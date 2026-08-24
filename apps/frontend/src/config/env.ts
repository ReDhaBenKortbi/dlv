/**
 * Every `import.meta.env` read in the app, in one place.
 *
 * Absorbs the former `utils/constants.ts` (Cloudinary) and the `API_URL`
 * fallback literal that was duplicated in `lib/api.ts` and `pages/client/Reader.tsx`
 * — where the two copies could silently drift apart.
 */

/** Base URL of the NestJS API, including its `/api` prefix. */
export const API_URL: string =
  import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

/** Unsigned upload preset used for book cover uploads. */
export const CLOUDINARY_UPLOAD_PRESET: string = import.meta.env
  .VITE_CLOUDINARY_UPLOAD_PRESET;

export const CLOUDINARY_CLOUD_NAME: string = import.meta.env
  .VITE_CLOUDINARY_CLOUD_NAME;
