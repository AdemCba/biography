import fs from "node:fs";
import matter from "gray-matter";
import type { ArticleMeta, PersonData } from "./schema";

/** Writes frontmatter + body back to disk, dropping empty/default noise so diffs stay readable. */
export function writeArticle(file: string, meta: Partial<ArticleMeta>, body: string) {
  const clean = Object.fromEntries(
    Object.entries(meta).filter(([k, v]) => {
      if (v === undefined || v === null || v === "") return false;
      if (Array.isArray(v) && v.length === 0) return false;
      if (k === "noindex" && v === false) return false;
      if ((k === "autoRevisions" || k === "autoReviews") && v === 0) return false;
      return true;
    }),
  );
  fs.writeFileSync(file, matter.stringify(`${body.trim()}\n`, clean));
}

export function writePerson(file: string, data: PersonData) {
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}
