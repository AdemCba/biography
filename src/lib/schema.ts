import { z } from "zod";
import { ALL_LOCALES } from "@/i18n/config";

/** YAML turns unquoted dates into Date objects; normalise everything to YYYY-MM-DD. */
const isoDate = z.preprocess(
  (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
);

const localeEnum = z.enum(ALL_LOCALES);
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, digits and hyphens only");

export const SOURCE_TYPES = ["official", "award-body", "league-or-federation", "company", "filing", "press", "book", "database", "interview", "other"] as const;

export const sourceSchema = z.object({
  id: slug,
  url: z.url(),
  title: z.string().min(2),
  publisher: z.string().min(1),
  type: z.enum(SOURCE_TYPES),
  /** Date the editor last opened the source. */
  accessed: isoDate,
  /** Optional language of the source, useful when citing local-language press. */
  lang: z.string().optional(),
});

const fact = <T extends z.ZodType>(value: T) =>
  z.object({
    value,
    sources: z.array(slug).min(1, "Every fact needs at least one source id"),
    /** For values that change over time (net worth, club, title). */
    asOf: isoDate.optional(),
    note: z.string().optional(),
  });

export const personSchema = z.object({
  id: slug,
  name: z.string().min(2),
  categories: z.array(slug).min(1),
  /** 1 = niche, 5 = globally famous. Drives target length and update cadence, not ranking. */
  importance: z.number().int().min(1).max(5).default(3),
  wikidata: z.string().regex(/^Q\d+$/).optional(),
  /** Official websites and verified profiles (schema.org sameAs). */
  sameAs: z.array(z.url()).default([]),
  image: z
    .object({
      src: z.string().startsWith("/images/"),
      alt: z.string().min(3),
      credit: z.string().min(2),
      license: z.string().min(2),
      sourceUrl: z.url(),
    })
    .optional(),
  facts: z
    .object({
      birthDate: fact(isoDate).optional(),
      deathDate: fact(isoDate).optional(),
      birthPlace: fact(z.string()).optional(),
      /** ISO 3166-1 alpha-2 codes, localised at render time. */
      nationality: fact(z.array(z.string().length(2))).optional(),
      netWorth: fact(z.string()).optional(),
    })
    .default({}),
  related: z.array(slug).default([]),
  sources: z.array(sourceSchema).default([]),
});

export const STATUSES = ["idea", "research", "draft", "review", "approved", "published"] as const;
export type Status = (typeof STATUSES)[number];
export const RISKS = ["low", "medium", "high"] as const;

export const articleSchema = z.object({
  title: z.string().min(2),
  slug,
  /** <title> tag. Falls back to title. */
  metaTitle: z.string().optional(),
  metaDescription: z.string().max(170).default(""),
  /** Short role line, e.g. "Argentine footballer". Written per language, not translated literally. */
  knownFor: z.string().default(""),
  /** Lead paragraph that answers "who is this and why are they known". */
  summary: z.string().default(""),
  status: z.enum(STATUSES).default("draft"),
  /** high = living people with sensitive topics, money, health, legal matters. Needs extra review. */
  risk: z.enum(RISKS).default("medium"),
  /** Publish date. A future date schedules the article; the daily build releases it. */
  publishedAt: isoDate.optional(),
  updatedAt: isoDate.optional(),
  reviewedAt: isoDate.optional(),
  /** When the facts should be checked again. */
  reviewBy: isoDate.optional(),
  /** Editor id (content/editors.json) credited as the writer. */
  author: slug.optional(),
  /** Editor id of the human who fact-checked and approved publication. Required to publish. */
  reviewer: slug.optional(),
  aiAssisted: z.boolean().default(true),
  /** Search queries this page is written to answer (from keyword research). */
  targetQueries: z.array(z.string()).default([]),
  faq: z.array(z.object({ q: z.string().min(5), a: z.string().min(10) })).default([]),
  noindex: z.boolean().default(false),
  /** How many times the automatic fix loop has rewritten this article. */
  autoRevisions: z.number().int().default(0),
  /** Set by the fix loop when it gives up: a human has to look at this article. */
  flag: z.string().optional(),
  /** Findings of the last automated fact-check that rejected the article; the fix loop works from these. */
  reviewNotes: z.string().optional(),
  /** How many times the review agent has looked at this article. */
  autoReviews: z.number().int().default(0),
});

export const categorySchema = z.object({
  id: slug,
  order: z.number().int(),
  i18n: z.partialRecord(
    localeEnum,
    z.object({ name: z.string(), slug, description: z.string(), metaDescription: z.string().optional() }),
  ),
});

export const editorSchema = z.object({
  id: slug,
  name: z.string().min(2),
  /** Public profile pages, e.g. LinkedIn, personal site. Strong E-E-A-T signal. */
  sameAs: z.array(z.url()).default([]),
  image: z.string().startsWith("/images/").optional(),
  i18n: z.partialRecord(localeEnum, z.object({ role: z.string(), bio: z.string().min(40) })),
});

export type Editor = z.infer<typeof editorSchema>;
export type Source = z.infer<typeof sourceSchema>;
export type PersonData = z.infer<typeof personSchema>;
export type ArticleMeta = z.infer<typeof articleSchema>;
export type Category = z.infer<typeof categorySchema>;
