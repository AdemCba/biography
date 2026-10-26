import type { Locale } from "@/i18n/config";
import { RESERVED_SLUGS, today, type Article, type ContentStore, type Person } from "./content";
import { citedSourceIds, linkedPersonIds, wordCount } from "./markdown";
import { similarity, STYLE_BLOCK_SCORE, styleFindings, styleScore } from "./style";

export type Issue = {
  level: "error" | "warning";
  code: string;
  message: string;
  personId?: string;
  locale?: Locale;
  file?: string;
};

export type ArticleReport = {
  personId: string;
  locale: Locale;
  status: Article["meta"]["status"];
  words: number;
  citations: number;
  styleScore: number;
  issues: Issue[];
};

/** Minimum body length by importance (1..5). Short is fine for niche people; padding is not. */
export const MIN_WORDS = [0, 300, 400, 550, 700, 900];
export const DUPLICATE_THRESHOLD = 0.3;
/** A biography needs at least this many H2 sections to count as more than a stub. */
export const MIN_SECTIONS = 3;
const PRIMARY_SOURCE_TYPES = new Set(["official", "award-body", "league-or-federation", "company", "filing", "book", "interview"]);

function addMonths(date: string, months: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
}

function checkPerson(person: Person, store: ContentStore): Issue[] {
  const issues: Issue[] = [];
  const base = { personId: person.data.id, file: `${person.dir}/person.json` };
  const ids = new Set(store.people.map((p) => p.data.id));
  const catIds = new Set(store.categories.map((c) => c.id));
  const sourceIds = new Set<string>();

  for (const s of person.data.sources) {
    if (sourceIds.has(s.id)) issues.push({ ...base, level: "error", code: "duplicate-source", message: `Source id "${s.id}" is used twice` });
    sourceIds.add(s.id);
  }
  for (const c of person.data.categories) {
    if (!catIds.has(c)) issues.push({ ...base, level: "error", code: "unknown-category", message: `Unknown category "${c}"` });
  }
  for (const r of person.data.related) {
    if (!ids.has(r)) issues.push({ ...base, level: "error", code: "unknown-related", message: `Related person "${r}" does not exist` });
  }
  for (const [key, fact] of Object.entries(person.data.facts)) {
    if (!fact) continue;
    for (const sid of fact.sources) {
      if (!sourceIds.has(sid)) issues.push({ ...base, level: "error", code: "unknown-source", message: `Fact "${key}" cites unknown source "${sid}"` });
    }
  }
  const nw = person.data.facts.netWorth;
  if (nw && (!nw.asOf || addMonths(nw.asOf, 12) < today())) {
    issues.push({ ...base, level: "warning", code: "stale-net-worth", message: "Net worth is older than 12 months or has no asOf date" });
  }
  return issues;
}

function checkArticle(person: Person, article: Article, store: ContentStore): ArticleReport {
  const { meta, body, locale } = article;
  const publishing = meta.status === "published";
  const gate = publishing ? "error" : "warning";
  const base = { personId: person.data.id, locale, file: article.file };
  const issues: Issue[] = [];
  const push = (level: Issue["level"], code: string, message: string) => issues.push({ ...base, level, code, message });

  const words = wordCount(body);
  const cited = citedSourceIds(body);
  const sourceIds = new Set(person.data.sources.map((s) => s.id));
  const style = styleFindings(body, locale);
  const score = styleScore(style);

  if (RESERVED_SLUGS.includes(meta.slug)) push("error", "reserved-slug", `Slug "${meta.slug}" is reserved`);
  for (const id of new Set(cited)) {
    if (!sourceIds.has(id)) push("error", "unknown-citation", `Citation [s:${id}] has no matching source`);
  }
  const peopleIds = new Set(store.people.map((p) => p.data.id));
  for (const id of linkedPersonIds(body)) {
    if (!peopleIds.has(id)) push("error", "unknown-person-link", `Link to unknown person "${id}"`);
  }

  // Publishing gates: errors when the article claims to be published, hints otherwise.
  if (!meta.knownFor.trim()) push(gate, "no-known-for", "knownFor is empty");
  if (meta.metaDescription.length < 50) push(gate, "no-meta-description", "metaDescription is missing or under 50 characters");
  if (!meta.reviewer) push(gate, "no-reviewer", "No human reviewer recorded (reviewer:)");
  if (!meta.publishedAt) push(gate, "no-publish-date", "publishedAt is missing");
  if (person.data.sources.length < 2) push(gate, "few-sources", "At least two sources are required");
  const minCitations = Math.max(3, Math.floor(words / 300));
  if (cited.length < minCitations) push(gate, "few-citations", `${cited.length} citations; need at least ${minCitations} for ${words} words`);
  if (words < MIN_WORDS[1]) push(gate, "too-short", `Only ${words} words`);
  else if (words < MIN_WORDS[person.data.importance]) {
    push("warning", "short-for-importance", `${words} words; importance ${person.data.importance} usually needs ${MIN_WORDS[person.data.importance]}+`);
  }
  // Thin / low-value content (Google "helpful content"): substance, not just length.
  const sections = (body.match(/^##\s+/gm) ?? []).length;
  if (sections < MIN_SECTIONS) push(gate, "thin-structure", `${sections} sections; a biography needs at least ${MIN_SECTIONS} (e.g. early life, career, achievements)`);
  const distinctCited = new Set(cited.filter((id) => sourceIds.has(id)));
  if (distinctCited.size < 2) push(gate, "single-source", `Body cites ${distinctCited.size} distinct source(s); needs at least 2`);
  const citedTypes = person.data.sources.filter((s) => distinctCited.has(s.id)).map((s) => s.type);
  if (!citedTypes.some((t) => PRIMARY_SOURCE_TYPES.has(t))) {
    push(gate, "no-primary-source", "No primary source cited (official profile, federation, award body, company, filing, book or interview)");
  }
  const sourcedFacts = Object.values(person.data.facts).filter(Boolean).length;
  if (sourcedFacts === 0) push(gate, "no-verified-facts", "person.json has no sourced key facts");
  if (meta.summary.split(/\s+/).length < 25) push(gate, "thin-summary", "Summary is under 25 words; it must say who this is and why they matter");
  for (const f of meta.faq) {
    if (f.a.split(/\s+/).length < 12) push("warning", "thin-faq", `FAQ answer too short: "${f.q}"`);
  }
  if (meta.faq.length > 8) push("warning", "faq-padding", `${meta.faq.length} FAQ items; keep only questions people really search`);

  // E-E-A-T: every live page names a real writer and a real fact-checker.
  const editorIds = new Map(store.editors.map((e) => [e.id, e]));
  if (!meta.author) push(gate, "no-author", "No author recorded (author:)");
  for (const [field, id] of [["author", meta.author], ["reviewer", meta.reviewer]] as const) {
    if (!id) continue;
    const editor = editorIds.get(id);
    if (!editor) push("error", "unknown-editor", `${field} "${id}" is not in content/editors.json`);
    else if (!editor.i18n[locale]) push(gate, "editor-not-translated", `Editor "${id}" has no ${locale} bio`);
  }

  if (meta.risk === "high" && !meta.reviewedAt) push(gate, "high-risk-unreviewed", "High-risk article needs reviewedAt (full fact check)");
  if (score >= STYLE_BLOCK_SCORE) push(gate, "ai-style", `Style score ${score} (limit ${STYLE_BLOCK_SCORE}). Rewrite flagged passages.`);
  for (const f of style) push("warning", `style:${f.code}`, f.message);
  if (!person.data.categories.some((c) => store.categories.find((x) => x.id === c)?.i18n[locale])) {
    push(gate, "category-not-translated", `None of this person's categories has a ${locale} translation`);
  }

  // SEO hygiene.
  const title = meta.metaTitle ?? meta.title;
  if (title.length > 65) push("warning", "long-title", `Meta title is ${title.length} characters (aim for ≤ 60)`);
  if (meta.metaDescription.length >= 50 && meta.metaDescription.length < 110) push("warning", "short-description", `Meta description is ${meta.metaDescription.length} characters (aim for 120–160)`);
  if (meta.summary.trim() === meta.metaDescription.trim()) push("warning", "summary-equals-description", "Summary and meta description are identical");
  if (meta.targetQueries.length === 0) push("warning", "no-target-queries", "No targetQueries recorded from keyword research");
  if (new Set(meta.faq.map((f) => f.q.toLowerCase())).size !== meta.faq.length) push("warning", "duplicate-faq", "Duplicate FAQ questions");

  // Freshness.
  if (meta.reviewBy && meta.reviewBy < today()) push("warning", "review-due", `Fact review was due on ${meta.reviewBy}`);
  if (!meta.reviewBy && meta.reviewedAt && addMonths(meta.reviewedAt, person.data.facts.deathDate ? 24 : 6) < today()) {
    push("warning", "review-due", `Last reviewed ${meta.reviewedAt}`);
  }

  return { personId: person.data.id, locale, status: meta.status, words, citations: cited.length, styleScore: score, issues };
}

export function checkContent(store: ContentStore): { reports: ArticleReport[]; issues: Issue[] } {
  const issues: Issue[] = store.issues.map((i) => ({ level: "error", code: "invalid-file", message: i.message, file: i.file }));
  const reports: ArticleReport[] = [];
  const slugs = new Map<string, string>();
  const byLocale = new Map<Locale, Article[]>();

  for (const person of store.people) {
    issues.push(...checkPerson(person, store));
    for (const article of Object.values(person.articles)) {
      if (!article) continue;
      const key = `${article.locale}/${article.meta.slug}`;
      const other = slugs.get(key);
      if (other) issues.push({ level: "error", code: "duplicate-slug", message: `Slug ${key} also used by ${other}`, personId: person.data.id, locale: article.locale, file: article.file });
      slugs.set(key, person.data.id);
      reports.push(checkArticle(person, article, store));
      byLocale.set(article.locale, [...(byLocale.get(article.locale) ?? []), article]);
    }
  }

  // Near-duplicate detection inside each language: catches template-stamped biographies.
  for (const [, articles] of byLocale) {
    for (let i = 0; i < articles.length; i++) {
      for (let j = i + 1; j < articles.length; j++) {
        const sim = similarity(articles[i].body, articles[j].body);
        if (sim >= DUPLICATE_THRESHOLD) {
          for (const a of [articles[i], articles[j]]) {
            const other = a === articles[i] ? articles[j] : articles[i];
            const report = reports.find((r) => r.personId === a.personId && r.locale === a.locale)!;
            report.issues.push({
              level: a.meta.status === "published" ? "error" : "warning",
              code: "near-duplicate",
              message: `${Math.round(sim * 100)}% overlap with ${other.personId}/${other.locale}. Rewrite instead of reusing a template.`,
              personId: a.personId,
              locale: a.locale,
              file: a.file,
            });
          }
        }
      }
    }
  }

  return { reports, issues };
}

export function allIssues(result: ReturnType<typeof checkContent>): Issue[] {
  return [...result.issues, ...result.reports.flatMap((r) => r.issues)];
}
