import type { Locale } from "@/i18n/config";
import type { Source } from "./schema";
import { slugify } from "./slug";

export const CITATION_RE = /\[s:([a-z0-9-]+)\]/g;
export const PERSON_LINK_RE = /\[([^\]]+)\]\(person:([a-z0-9-]+)\)/g;

export function citedSourceIds(body: string): string[] {
  return [...body.matchAll(CITATION_RE)].map((m) => m[1]);
}

export function linkedPersonIds(body: string): string[] {
  return [...body.matchAll(PERSON_LINK_RE)].map((m) => m[2]);
}

/**
 * Turns the authoring shortcuts into plain markdown:
 *  - `[s:source-id]` becomes a numbered link to the source list.
 *  - `[Name](person:id)` becomes an internal link when that person is live in this locale,
 *    otherwise plain text (so we never link to a missing page).
 */
export function resolveShortcuts(
  body: string,
  sources: Source[],
  personUrl: (id: string) => string | undefined,
): string {
  const index = new Map(sources.map((s, i) => [s.id, i + 1]));
  return body
    .replace(CITATION_RE, (_, id: string) => {
      const n = index.get(id);
      return n ? `[[${n}]](#src-${id})` : "";
    })
    .replace(PERSON_LINK_RE, (_, text: string, id: string) => {
      const url = personUrl(id);
      return url ? `[${text}](${url})` : text;
    });
}

export function headings(body: string): { id: string; text: string }[] {
  return [...body.matchAll(/^##\s+(.+)$/gm)].map((m) => {
    const text = m[1].trim();
    return { id: slugify(text), text };
  });
}

/** Splits the body before its Nth H2 so an ad can sit between sections instead of mid-paragraph. */
export function splitBeforeHeading(body: string, n: number): [string, string] {
  const matches = [...body.matchAll(/^##\s+/gm)];
  const m = matches[n - 1];
  if (!m || m.index === undefined) return [body, ""];
  return [body.slice(0, m.index), body.slice(m.index)];
}

export function wordCount(text: string): number {
  return text
    .replace(CITATION_RE, "")
    .replace(/[#*_>`[\]()]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

export function ageOn(birth: string, on: string): number {
  const [by, bm, bd] = birth.split("-").map(Number);
  const [y, m, d] = on.split("-").map(Number);
  return y - by - (m < bm || (m === bm && d < bd) ? 1 : 0);
}

export function formatDate(date: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function countryName(code: string, locale: Locale): string {
  try {
    return new Intl.DisplayNames([locale === "pt" ? "pt-BR" : locale], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}
