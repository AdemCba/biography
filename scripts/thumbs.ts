/**
 * Small WebP copies of every photo in public/images (people, topics) for lists and pages.
 * The originals stay for share images (og:image, Discover wants 1200px). Output is gitignored
 * and only rebuilt when the source is newer.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { THUMB_WIDTHS, thumbPath } from "../src/lib/images";

const ROOT = "public/images";
let made = 0;
for (const dir of ["people", "topics"]) {
  const folder = path.join(ROOT, dir);
  if (!fs.existsSync(folder)) continue;
  for (const name of fs.readdirSync(folder)) {
    if (!/\.(jpe?g|png|webp)$/i.test(name)) continue;
    const src = path.join(folder, name);
    const srcTime = fs.statSync(src).mtimeMs;
    for (const width of THUMB_WIDTHS) {
      const out = path.join("public", thumbPath(`/images/${dir}/${name}`, width));
      if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= srcTime) continue;
      fs.mkdirSync(path.dirname(out), { recursive: true });
      await sharp(src).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 72 }).toFile(out);
      made++;
    }
  }
}
console.log(`Thumbnails: ${made} written.`);
