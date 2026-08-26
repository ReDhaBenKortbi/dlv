/**
 * Requests a resized, format-negotiated, quality-compressed rendition from
 * Cloudinary by inserting a transformation segment after `/upload/`. Cover
 * images are uploaded at their original resolution, so without this a 200px
 * grid thumbnail was shipping the same bytes as a full-size download —
 * the dominant cause of a slow LCP on image-heavy pages.
 *
 * Falls back to the original URL for anything that isn't a Cloudinary
 * delivery URL (e.g. local blob/object URLs used in upload previews).
 */
export function optimizedCoverUrl(url: string, width: number): string {
  const marker = "/upload/";
  const i = url.indexOf(marker);
  if (i === -1) return url;

  const insertAt = i + marker.length;
  return `${url.slice(0, insertAt)}f_auto,q_auto,c_fill,w_${width}/${url.slice(insertAt)}`;
}
