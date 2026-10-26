/**
 * Drip-feeds approved articles: gives each "approved" article a publish date, N per day, and marks it
 * published. The daily scheduled build then releases them one day at a time, which looks natural to
 * search engines and spreads the editor's review load.
 *
 *   npm run schedule -- --per-day 3            (start tomorrow)
 *   npm run schedule -- --per-day 5 --from 2026-11-01
 *
 * Only articles with a reviewer are scheduled: approval stays a human decision.
 */
import { readContent, today } from "../src/lib/content";
import { writeArticle } from "../src/lib/article-file";

const args = process.argv.slice(2);
const val = (n: string) => args[args.indexOf(`--${n}`) + 1];
const perDay = args.includes("--per-day") ? Number(val("per-day")) : 3;
const start = new Date(`${args.includes("--from") ? val("from") : today()}T00:00:00Z`);
if (!args.includes("--from")) start.setUTCDate(start.getUTCDate() + 1);

const store = readContent();
// Existing future slots count against the daily quota.
const taken = new Map<string, number>();
for (const p of store.people) {
  for (const a of Object.values(p.articles)) {
    if (a?.meta.status === "published" && a.meta.publishedAt && a.meta.publishedAt > today()) {
      taken.set(a.meta.publishedAt, (taken.get(a.meta.publishedAt) ?? 0) + 1);
    }
  }
}

const queue = store.people
  .flatMap((p) => Object.values(p.articles))
  .filter((a) => a && a.meta.status === "approved" && a.meta.reviewer && !a.meta.flag)
  .sort((a, b) => a!.personId.localeCompare(b!.personId));

const day = new Date(start);
let skipped = 0;
for (const article of queue) {
  if (!article) continue;
  let date = day.toISOString().slice(0, 10);
  while ((taken.get(date) ?? 0) >= perDay) {
    day.setUTCDate(day.getUTCDate() + 1);
    date = day.toISOString().slice(0, 10);
  }
  taken.set(date, (taken.get(date) ?? 0) + 1);
  writeArticle(article.file, { ...article.meta, status: "published", publishedAt: date, updatedAt: undefined }, article.body);
  console.log(`${date}  ${article.personId}/${article.locale}`);
}
const unreviewed = store.people.flatMap((p) => Object.values(p.articles)).filter((a) => a?.meta.status === "approved" && !a.meta.reviewer).length;
skipped += unreviewed;
console.log(`\nScheduled ${queue.length} article(s), ${perDay}/day.${skipped ? ` ${skipped} approved article(s) skipped: no reviewer.` : ""}`);
