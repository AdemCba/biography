/** Widths of the WebP copies scripts/thumbs.ts writes next to each photo. */
export const THUMB_WIDTHS = [480, 960] as const;

/** /images/topics/x.jpg -> /images/w/480/topics/x.webp */
export function thumbPath(src: string, width: number): string {
  return src.replace(/^\/images\//, `/images/w/${width}/`).replace(/\.(jpe?g|png|webp)$/i, ".webp");
}

/** Props for a responsive <img>: small WebP copies, the browser picks by `sizes`. */
export function responsiveImage(src: string, sizes: string) {
  return {
    src: thumbPath(src, THUMB_WIDTHS[THUMB_WIDTHS.length - 1]),
    srcSet: THUMB_WIDTHS.map((w) => `${thumbPath(src, w)} ${w}w`).join(", "),
    sizes,
  };
}
