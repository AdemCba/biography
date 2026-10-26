// Markdown summary of a trend scan, written in Turkish for the editor.

import type { Candidate } from "./evaluate";

export interface Report {
  generatedAt: string;
  signals: number;
  scaffolded: string[];
  candidates: Candidate[];
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
    table("Uygun yeni adaylar", accepted),
    table("Sitede zaten var, güncellemeye aday", update),
    `## Elenenler\n\n${rejected.length} kişi elendi (reşit olmayan, suç ya da trajedi haberi, az tanınan, kategori dışı ya da trend zayıf). Ayrıntı JSON dosyasında.\n`,
  ].join("\n");
}
