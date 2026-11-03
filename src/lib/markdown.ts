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

/** Replaces {age} in meta titles and descriptions with the age on the build day, so titles never go stale. */
export function fillAge(text: string, birth: string | undefined, death: string | undefined, today: string): string {
  if (!text.includes("{age}")) return text;
  return birth ? text.replace(/\{age\}/g, String(ageOn(birth, death ?? today))) : text.replace(/\s*\(?\{age\}\)?/g, "");
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

const MD_LINK_RE = /(\[[^\]]*\]\([^)]*\))/;

/** A name safe to auto-link: two or more words, or one long distinctive word ("Raphinha", "IShowSpeed"). */
function linkableName(name: string): boolean {
  return /\s/.test(name.trim()) ? name.trim().length >= 6 : name.length >= 8;
}

/**
 * Semantic internal linking: the first plain-text mention of another live biography's name becomes a
 * link to it. Headings and existing links are left alone; at most `max` links per page.
 */
export function autoLinkPeople(body: string, people: { name: string; url: string }[], max = 8): string {
  const targets = people
    .filter((p) => linkableName(p.name))
    .sort((a, b) => b.name.length - a.name.length) // "Bill Kaulitz" before "Bill"
    .map((p) => ({ ...p, re: new RegExp(`(?<![\\p{L}\\p{N}])${p.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}\\p{N}])`, "u") }));
  const done = new Set<string>([...body.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1]));
  const lines = body.split("\n");
  let added = 0;
  for (let i = 0; i < lines.length && added < max; i++) {
    if (/^\s*(#|>|\|)/.test(lines[i])) continue;
    const parts = lines[i].split(MD_LINK_RE);
    for (let j = 0; j < parts.length; j += 2) {
      for (const t of targets) {
        if (added >= max || done.has(t.url)) continue;
        const m = parts[j].match(t.re);
        if (!m || m.index === undefined) continue;
        parts[j] = `${parts[j].slice(0, m.index)}[${m[0]}](${t.url})${parts[j].slice(m.index + m[0].length)}`;
        done.add(t.url);
        added++;
        // Re-split so later names never land inside the link just added.
        const again = parts[j].split(MD_LINK_RE);
        parts.splice(j, 1, ...again);
        break;
      }
    }
    lines[i] = parts.join("");
  }
  return lines.join("\n");
}
