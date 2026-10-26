/**
 * Drip-feeds approved articles: gives each "approved" article a publish date, N per day in each
 * language, and marks it published. The daily scheduled build then releases them one day at a time, which looks natural to
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
// Existing future slots count against the daily quota of their language.
const taken = new Map<string, number>();
const slot = (date: string, locale: string) => `${date}|${locale}`;
for (const p of store.people) {
  for (const a of Object.values(p.articles)) {
    if (a?.meta.status === "published" && a.meta.publishedAt && a.meta.publishedAt > today()) {
      const k = slot(a.meta.publishedAt, a.locale);
      taken.set(k, (taken.get(k) ?? 0) + 1);
    }
  }
}

const queue = store.people
  .flatMap((p) => Object.values(p.articles))
  .filter((a) => a && a.meta.status === "approved" && a.meta.reviewer && !a.meta.flag)
  .sort((a, b) => a!.personId.localeCompare(b!.personId));

let skipped = 0;
for (const article of queue) {
  if (!article) continue;
  const day = new Date(start);
  let date = day.toISOString().slice(0, 10);
  while ((taken.get(slot(date, article.locale)) ?? 0) >= perDay) {
    day.setUTCDate(day.getUTCDate() + 1);
    date = day.toISOString().slice(0, 10);
  }
  taken.set(slot(date, article.locale), (taken.get(slot(date, article.locale)) ?? 0) + 1);
  writeArticle(article.file, { ...article.meta, status: "published", publishedAt: date, updatedAt: undefined }, article.body);
  console.log(`${date}  ${article.personId}/${article.locale}`);
}
const unreviewed = store.people.flatMap((p) => Object.values(p.articles)).filter((a) => a?.meta.status === "approved" && !a.meta.reviewer).length;
skipped += unreviewed;
console.log(`\nScheduled ${queue.length} article(s), ${perDay}/day per language.${skipped ? ` ${skipped} approved article(s) skipped: no reviewer.` : ""}`);
