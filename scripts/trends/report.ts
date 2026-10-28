// Markdown summary of a trend scan, written in Turkish for the editor.

import type { Candidate } from "./evaluate";
import type { TrendSignal } from "./sources";
import { GEOS } from "./config";

export interface Report {
  generatedAt: string;
  signals: number;
  scaffolded: string[];
  candidates: Candidate[];
  /** Raw Google Trends signals, for the trending-topics section. */
  google?: TrendSignal[];
}

/** Hours a Google trend counts as "fresh" for the trending-topics writer. */
export const FRESH_HOURS = 4;

/** Google trends that started in the last FRESH_HOURS, grouped by search term, most countries first. */
export function freshTopics(google: TrendSignal[], now: Date) {
  const since = now.getTime() - FRESH_HOURS * 3600e3;
  const groups = new Map<string, { term: string; where: Set<string>; volume: number; headline?: string; url?: string; startedAt: string }>();
  for (const s of google) {
    if (s.source !== "google-trends" || !s.startedAt || Date.parse(s.startedAt) < since) continue;
    const key = s.term.toLowerCase();
    const g = groups.get(key) ?? { term: s.term, where: new Set<string>(), volume: 0, startedAt: s.startedAt };
    g.where.add(s.where);
    g.volume += s.volume;
    g.headline ??= s.headlines[0];
    g.url ??= s.newsUrls[0];
    if (s.startedAt < g.startedAt) g.startedAt = s.startedAt;
    groups.set(key, g);
  }
  return [...groups.values()].sort((a, b) => b.where.size - a.where.size || b.volume - a.volume);
}

/** Site languages whose countries search this term (FR -> fr, MX -> es...). */
function langsOf(where: Set<string>): string {
  return [...new Set([...where].map((w) => GEOS.find((g) => g.geo === w)?.wiki).filter(Boolean))].join(", ");
}

function topicsSection(r: Report): string {
  const list = freshTopics(r.google ?? [], new Date(r.generatedAt)).slice(0, 40);
  if (list.length === 0) return `## Son ${FRESH_HOURS} saatte Google'da yükselen konular\n\nYok.\n`;
  return [
    `## Son ${FRESH_HOURS} saatte Google'da yükselen konular (${list.length})`,
    "",
    "Gündem yazıları buradan seçilir. Ölüm, kaza, suç, savaş ve siyaset konularını atla.",
    "",
    "| Arama | Ülkeler | Diller | Yaklaşık arama | Başladı (UTC) | Haber |",
    "| --- | --- | --- | --- | --- | --- |",
    ...list.map((g) => `| ${g.term} | ${[...g.where].join(", ")} | ${langsOf(g.where)} | ${g.volume} | ${g.startedAt.slice(11, 16)} | ${g.url ? `[${(g.headline ?? "haber").replace(/\|/g, "/")}](${g.url})` : ""} |`),
    "",
  ].join("\n");
}

function row(c: Candidate): string {
  const where = [...new Set(c.signals.map((s) => s.where))].join(", ");
  const wiki = c.wikipedia.en ? `[Wikipedia](https://en.wikipedia.org/wiki/${encodeURIComponent(c.wikipedia.en.replace(/ /g, "_"))})` : "";
  const why = c.reasons.length ? c.reasons.join("; ") : "";
  return `| ${c.score} | ${c.name} | ${c.category ?? "?"} | ${where} | ${c.spike}x | [${c.wikidataId}](https://www.wikidata.org/wiki/${c.wikidataId}) ${wiki} | ${why} |`;
}

function table(title: string, list: Candidate[]): string {
  if (list.length === 0) return `## ${title}\n\nYok.\n`;
  return [
    `## ${title} (${list.length})`,
    "",
    "| Puan | Kişi | Kategori | Nerede trend | Wikipedia artışı | Kaynak | Not |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...list.map(row),
    "",
  ].join("\n");
}

export function renderReport(r: Report): string {
  const accepted = r.candidates.filter((c) => c.decision === "accept" && !c.onSite);
  const update = r.candidates.filter((c) => c.decision !== "reject" && c.onSite);
  const rejected = r.candidates.filter((c) => c.decision === "reject");
  return [
    `# Trend taraması ${r.generatedAt.slice(0, 16).replace("T", " ")} UTC`,
    "",
    `${r.signals} trend sinyali tarandı, ${r.candidates.length} tanınmış kişi bulundu.`,
    "",
    r.scaffolded.length
      ? `Taslak sırasına eklenenler (durum: idea, yayın yok): ${r.scaffolded.join(", ")}`
      : "Bu çalışmada taslak sırasına kimse eklenmedi.",
    "",
    topicsSection(r),
    table("Uygun yeni adaylar", accepted),
    table("Sitede zaten var, güncellemeye aday", update),
    `## Elenenler\n\n${rejected.length} kişi elendi (reşit olmayan, suç ya da trajedi haberi, az tanınan, kategori dışı ya da trend zayıf). Ayrıntı JSON dosyasında.\n`,
  ].join("\n");
}
