import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { ALL_LOCALES, type Locale } from "@/i18n/config";
import { checkContent } from "./quality";
import {
  articleSchema,
  categorySchema,
  personSchema,
  type ArticleMeta,
  editorSchema,
  type Category,
  type Editor,
  type PersonData,
} from "./schema";

export const CONTENT_DIR = path.resolve(process.env.CONTENT_DIR || path.join(process.cwd(), "content"));
export const PEOPLE_DIR = path.join(CONTENT_DIR, "people");

export type Article = {
  personId: string;
  locale: Locale;
  file: string;
  meta: ArticleMeta;
  body: string;
  /** Set when the quality gate found blocking errors; such articles never go live. */
  blocked?: string[];
};

export type Person = {
  data: PersonData;
  dir: string;
  articles: Partial<Record<Locale, Article>>;
};

export type LoadIssue = { file: string; message: string };

export type ContentStore = {
  categories: Category[];
  editors: Editor[];
  people: Person[];
  issues: LoadIssue[];
};

function formatZod(error: { issues: { path: PropertyKey[]; message: string }[] }): string {
  return error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`).join("; ");
}

/** Reads every content file from disk. No caching: the admin panel needs fresh reads. */
export function readContent(): ContentStore {
  const issues: LoadIssue[] = [];
  const categories: Category[] = [];
  const catFile = path.join(CONTENT_DIR, "categories.json");
  if (fs.existsSync(catFile)) {
    const raw = JSON.parse(fs.readFileSync(catFile, "utf8")) as unknown[];
    for (const item of raw) {
      const parsed = categorySchema.safeParse(item);
      if (parsed.success) categories.push(parsed.data);
      else issues.push({ file: catFile, message: formatZod(parsed.error) });
    }
  }
  categories.sort((a, b) => a.order - b.order);

  const editors: Editor[] = [];
  const edFile = path.join(CONTENT_DIR, "editors.json");
  if (fs.existsSync(edFile)) {
    for (const item of JSON.parse(fs.readFileSync(edFile, "utf8")) as unknown[]) {
      const parsed = editorSchema.safeParse(item);
      if (parsed.success) editors.push(parsed.data);
      else issues.push({ file: edFile, message: formatZod(parsed.error) });
    }
  }

  const people: Person[] = [];
  const dirs = fs.existsSync(PEOPLE_DIR) ? fs.readdirSync(PEOPLE_DIR).sort() : [];
  for (const id of dirs) {
    const dir = path.join(PEOPLE_DIR, id);
    if (!fs.statSync(dir).isDirectory()) continue;
    const personFile = path.join(dir, "person.json");
    if (!fs.existsSync(personFile)) {
      issues.push({ file: dir, message: "person.json is missing" });
      continue;
    }
    let json: unknown;
    try {
      json = JSON.parse(fs.readFileSync(personFile, "utf8"));
    } catch (e) {
      issues.push({ file: personFile, message: `Invalid JSON: ${(e as Error).message}` });
      continue;
    }
    const parsed = personSchema.safeParse(json);
    if (!parsed.success) {
      issues.push({ file: personFile, message: formatZod(parsed.error) });
      continue;
    }
    if (parsed.data.id !== id) {
      issues.push({ file: personFile, message: `id "${parsed.data.id}" must match folder name "${id}"` });
    }
    const articles: Person["articles"] = {};
    for (const locale of ALL_LOCALES) {
      const file = path.join(dir, `${locale}.md`);
      if (!fs.existsSync(file)) continue;
      const { data, content } = matter(fs.readFileSync(file, "utf8"));
      const meta = articleSchema.safeParse(data);
      if (!meta.success) {
        issues.push({ file, message: formatZod(meta.error) });
        continue;
      }
      articles[locale] = { personId: id, locale, file, meta: meta.data, body: content.trim() };
    }
    people.push({ data: parsed.data, dir, articles });
  }
  return { categories, editors, people, issues };
}

let cached: ContentStore | undefined;

/** Content with the quality gate applied. Cached for the static build, fresh in dev. */
export function getContent(): ContentStore {
  if (cached && process.env.NODE_ENV === "production") return cached;
  const store = readContent();
  const { reports } = checkContent(store);
  for (const r of reports) {
    const errors = r.issues.filter((i) => i.level === "error").map((i) => i.message);
    if (errors.length) {
      const article = store.people.find((p) => p.data.id === r.personId)?.articles[r.locale];
      if (article) article.blocked = errors;
    }
  }
  cached = store;
  return store;
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** An article is live when a human approved it and its publish date has arrived. */
export function isLive(meta: ArticleMeta, now = today()): boolean {
  return (
    meta.status === "published" &&
    !!meta.reviewer &&
    !!meta.publishedAt &&
    meta.publishedAt <= now
  );
}

export function liveArticle(person: Person, locale: Locale): Article | undefined {
  const a = person.articles[locale];
  return a && !a.blocked && isLive(a.meta) ? a : undefined;
}

export function livePeople(locale: Locale, store = getContent()): { person: Person; article: Article }[] {
  return store.people
    .map((person) => ({ person, article: liveArticle(person, locale) }))
    .filter((x): x is { person: Person; article: Article } => !!x.article)
    .sort((a, b) => (b.article.meta.publishedAt ?? "").localeCompare(a.article.meta.publishedAt ?? ""));
}

export function lastModified(meta: ArticleMeta): string {
  return [meta.updatedAt, meta.reviewedAt, meta.publishedAt].filter(Boolean).sort().at(-1) ?? today();
}

export function personPath(locale: Locale, slug: string): string {
  return `/${locale}/${slug}/`;
}

export function editorPath(locale: Locale, id: string): string {
  return `/${locale}/editors/${id}/`;
}

export function categoryPath(locale: Locale, slug: string): string {
  return `/${locale}/category/${slug}/`;
}

/** Slugs a biography may not use because a fixed page lives there. */
export const RESERVED_SLUGS = ["category", "search", "about", "editorial-policy", "privacy", "contact", "terms", "search-index.json", "admin", "editors"];

/**
 * `output: "export"` refuses a dynamic route with zero params (e.g. before the first biography goes live).
 * Emit one placeholder that renders the 404 page; it is never linked or listed in the sitemap.
 */
export const PLACEHOLDER_PARAM = "_none";
export function withPlaceholder<T extends Record<string, string>>(params: T[], placeholder: T): T[] {
  return params.length ? params : [placeholder];
}
