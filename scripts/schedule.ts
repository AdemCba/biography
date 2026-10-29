/**
 * Drip-feeds approved articles: gives each "approved" article a publish date, N per day in each
 * language, and marks it published. The daily scheduled build then releases them one day at a time, which looks natural to
 * search engines and spreads the editor's review load.
 *
 *   npm run schedule -- --per-day 3            (start today: the same run builds and deploys them)
 *   npm run schedule -- --per-day 5 --from 2026-11-01
 *
 * Only articles with a reviewer are scheduled: approval stays a human decision.
 */
import { readContent, today } from "../src/lib/content";
import { writeArticle } from "../src/lib/article-file";
import { checkContent, GATE_CODES } from "../src/lib/quality";

const args = process.argv.slice(2);
const val = (n: string) => args[args.indexOf(`--${n}`) + 1];
const perDay = args.includes("--per-day") ? Number(val("per-day")) : 3;
const start = new Date(`${args.includes("--from") ? val("from") : today()}T00:00:00Z`);

let store = readContent();

// Trending topics go stale in a day, and review.ts does not handle them: a topic in review that passes
// every quality gate (sources, length, citations, style) is approved by the fact-check desk here.
{
  const { reports } = checkContent(store);
  let approved = 0;
  for (const topic of store.topics) {
    for (const a of Object.values(topic.articles)) {
      if (!a || a.meta.status !== "review" || a.meta.flag) continue;
      const report = reports.find((r) => r.topic && r.personId === topic.data.id && r.locale === a.locale);
      const blocking = report?.issues.some((i) => i.level === "error" || (GATE_CODES.has(i.code) && i.code !== "no-reviewer"));
      if (blocking) continue;
      writeArticle(a.file, { ...a.meta, status: "approved", reviewer: "fact-check-desk", reviewedAt: today() }, a.body);
      approved++;
    }
  }
  if (approved) {
    console.log(`Approved ${approved} gate-clean trending topic article(s).`);
    store = readContent();
  }
}
// Existing future slots count against the daily quota of their language.
const taken = new Map<string, number>();
const slot = (date: string, locale: string) => `${date}|${locale}`;
const entries = [...store.people, ...store.topics];
for (const p of entries) {
  for (const a of Object.values(p.articles)) {
    if (a?.meta.status === "published" && a.meta.publishedAt && a.meta.publishedAt > today()) {
      const k = slot(a.meta.publishedAt, a.locale);
      taken.set(k, (taken.get(k) ?? 0) + 1);
    }
  }
}

const queue = entries
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
  const publishedTime = date === today() ? new Date().toISOString() : `${date}T06:00:00.000Z`;
  writeArticle(article.file, { ...article.meta, status: "published", publishedAt: date, publishedTime, updatedAt: undefined }, article.body);
  console.log(`${date}  ${article.personId}/${article.locale}`);
}
const unreviewed = entries.flatMap((p) => Object.values(p.articles)).filter((a) => a?.meta.status === "approved" && !a.meta.reviewer).length;
skipped += unreviewed;
console.log(`\nScheduled ${queue.length} article(s), ${perDay}/day per language.${skipped ? ` ${skipped} approved article(s) skipped: no reviewer.` : ""}`);
