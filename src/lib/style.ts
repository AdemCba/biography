import type { Locale } from "@/i18n/config";
import { CITATION_RE } from "./markdown";

/**
 * Phrases that make a biography read like generic AI copy.
 * Matched case-insensitively as substrings. Keep lists short and specific: the goal is to flag
 * filler, not to ban normal words. Extend them as the editor spots new tics.
 */
export const CLICHES: Record<Locale, string[]> = {
  en: [
    "delve", "tapestry", "testament to", "in today's", "fast-paced world", "it's worth noting", "it is worth noting",
    "it is important to note", "in conclusion", "in summary", "navigate the complexities", "embark on a journey",
    "a true icon", "indelible mark", "unwavering", "nestled", "boasts", "rose to prominence", "meteoric rise",
    "household name", "needs no introduction", "larger than life", "whether you're", "game-changer",
    "the rest is history", "left an enduring legacy", "cemented his", "cemented her", "cemented their",
    "a beacon of", "stands as a", "multifaceted", "trailblazer", "realm of",
  ],
  es: [
    "en conclusión", "en resumen", "cabe destacar", "cabe mencionar", "es importante destacar", "un testimonio de",
    "sin lugar a dudas", "en el mundo actual", "un verdadero icono", "huella imborrable", "inquebrantable",
    "meteórico ascenso", "no necesita presentación", "lo demás es historia", "un referente indiscutible",
    "se embarcó en", "en el ámbito de",
  ],
  de: [
    "zusammenfassend", "abschließend lässt sich", "es ist wichtig zu beachten", "es ist erwähnenswert",
    "ein zeugnis", "in der heutigen", "schnelllebigen", "eine wahre ikone", "unauslöschlich", "unerschütterlich",
    "kometenhaft", "braucht keine vorstellung", "der rest ist geschichte", "begab sich auf eine reise",
    "im bereich der",
  ],
  fr: [
    "en conclusion", "en résumé", "il est important de noter", "il convient de noter", "il est à noter",
    "témoignage de", "dans le monde d'aujourd'hui", "véritable icône", "empreinte indélébile", "inébranlable",
    "ascension fulgurante", "qu'on ne présente plus", "la suite appartient à l'histoire", "s'est lancé dans l'aventure",
    "dans le domaine de",
  ],
  pt: [
    "em conclusão", "em resumo", "vale ressaltar", "vale destacar", "é importante notar", "é importante destacar",
    "um verdadeiro ícone", "marca indelével", "inabalável", "ascensão meteórica", "dispensa apresentações",
    "o resto é história", "embarcou em uma jornada", "no mundo atual", "no âmbito de",
  ],
};

export type StyleFinding = { code: string; message: string; weight: number };

function plainText(markdown: string): string {
  return markdown
    .replace(CITATION_RE, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#+\s.*$/gm, "")
    .replace(/[*_`>]/g, "");
}

export function sentences(text: string): string[] {
  return plainText(text)
    .split(/(?<=[.!?])\s+|\n{2,}/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).length >= 3);
}

function stdev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length);
}

/**
 * Heuristics for prose that reads machine-made. None of these prove anything on their own;
 * together they point the editor at paragraphs worth rewriting. `weight` feeds the score.
 */
export function styleFindings(body: string, locale: Locale): StyleFinding[] {
  const findings: StyleFinding[] = [];
  const lower = plainText(body).toLowerCase();

  for (const phrase of CLICHES[locale]) {
    const count = lower.split(phrase).length - 1;
    if (count > 0) {
      findings.push({ code: "cliche", message: `Cliché / filler phrase: "${phrase}"${count > 1 ? ` ×${count}` : ""}`, weight: 2 * count });
    }
  }

  const sents = sentences(body);
  const lengths = sents.map((s) => s.split(/\s+/).length);
  if (sents.length >= 12) {
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variation = stdev(lengths) / mean;
    // Human prose mixes short and long sentences; uniform rhythm is a strong machine tell.
    if (variation < 0.35) {
      findings.push({ code: "monotone-rhythm", message: `Sentence lengths are very uniform (variation ${variation.toFixed(2)}). Mix short and long sentences.`, weight: 3 });
    }
    const long = lengths.filter((n) => n > 40).length;
    if (long / sents.length > 0.15) {
      findings.push({ code: "long-sentences", message: `${long} sentences over 40 words. Split some of them.`, weight: 1 });
    }

    // Pronouns and articles naturally open many sentences in a biography; only flag them when extreme.
    const common = new Set(["he", "she", "they", "the", "his", "her", "el", "la", "ella", "er", "sie", "der", "die", "il", "elle", "le", "ele", "ela", "o", "a"]);
    const openers = new Map<string, number>();
    for (const s of sents) {
      const first = s.split(/\s+/)[0].toLowerCase().replace(/[^\p{L}]/gu, "");
      openers.set(first, (openers.get(first) ?? 0) + 1);
    }
    for (const [word, n] of openers) {
      const limit = common.has(word) ? 0.4 : 0.2;
      if (word && n / sents.length > limit && n >= 5) {
        findings.push({ code: "repeated-opener", message: `${n} sentences start with "${word}".`, weight: 2 });
      }
    }
  }

  const words = lower.split(/\s+/).filter(Boolean).length || 1;
  const dashes = (body.match(/—/g) ?? []).length;
  if (dashes / words > 1 / 150) {
    findings.push({ code: "em-dash", message: `${dashes} em dashes in ${words} words. Use commas or full stops instead.`, weight: 2 });
  }

  const notOnly = (lower.match(/not only\b|no solo\b|no sólo\b|nicht nur\b|non seulement\b|não só\b|não apenas\b/g) ?? []).length;
  if (notOnly >= 2) {
    findings.push({ code: "not-only", message: `"Not only… but also" construction used ${notOnly} times.`, weight: 1 });
  }

  const paragraphs = body.split(/\n{2,}/).filter((p) => !p.startsWith("#") && p.trim().length > 0);
  const paraLengths = paragraphs.map((p) => p.split(/\s+/).length);
  if (paragraphs.length >= 6 && stdev(paraLengths) / (paraLengths.reduce((a, b) => a + b, 0) / paraLengths.length) < 0.2) {
    findings.push({ code: "uniform-paragraphs", message: "Paragraphs are all about the same length.", weight: 1 });
  }

  const exclaim = (body.match(/!/g) ?? []).length;
  if (exclaim > 2) findings.push({ code: "exclamation", message: `${exclaim} exclamation marks. Biographies should not cheer.`, weight: 1 });

  return findings;
}

export function styleScore(findings: StyleFinding[]): number {
  return findings.reduce((a, f) => a + f.weight, 0);
}

/** Style score at or above this blocks publishing. */
export const STYLE_BLOCK_SCORE = 6;

function shingles(text: string, size = 5): Set<string> {
  const words = plainText(text).toLowerCase().split(/\s+/).filter(Boolean);
  const out = new Set<string>();
  for (let i = 0; i + size <= words.length; i++) out.add(words.slice(i, i + size).join(" "));
  return out;
}

/** Jaccard similarity of 5-word shingles. Templated articles about different people score high. */
export function similarity(a: string, b: string): number {
  const sa = shingles(a);
  const sb = shingles(b);
  if (!sa.size || !sb.size) return 0;
  let inter = 0;
  for (const s of sa) if (sb.has(s)) inter++;
  return inter / (sa.size + sb.size - inter);
}
