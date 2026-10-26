// Pure filtering and scoring of trend candidates. No network access here.

import { CATEGORY_RULES, MIN_AGE, MIN_SITELINKS, MIN_SPIKE, SENSITIVE_NEWS_WORDS } from "./config";
import type { TrendSignal, WikidataEntity } from "./sources";

const HUMAN = "Q5";
/** Wikidata "manner of death" values that point to a crime or tragedy. */
const SENSITIVE_DEATH = new Set(["Q149086" /* homicide */, "Q10737" /* suicide */]);
const NON_WIKIPEDIA_SITES = new Set(["commonswiki", "specieswiki", "metawiki", "wikidatawiki", "mediawikiwiki", "sourceswiki"]);

export type Decision = "accept" | "reject";

export interface Candidate {
  wikidataId: string;
  name: string;
  description: string;
  category: string | null;
  occupations: string[];
  birthYear: number | null;
  deathYear: number | null;
  sitelinks: number;
  /** Wikipedia article titles by language, the first sources for research. */
  wikipedia: Record<string, string>;
  signals: { source: TrendSignal["source"]; where: string; term: string; volume: number }[];
  newsUrls: string[];
  spike: number;
  score: number;
  decision: Decision;
  reasons: string[];
  onSite: boolean;
}

function claimValues(e: WikidataEntity, prop: string): unknown[] {
  return (e.claims?.[prop] ?? []).map((c) => c.mainsnak.datavalue?.value).filter((v) => v !== undefined);
}

export function claimIds(e: WikidataEntity, prop: string): string[] {
  return claimValues(e, prop)
    .map((v) => (v as { id?: string }).id)
    .filter((id): id is string => Boolean(id));
}

function claimYear(e: WikidataEntity, prop: string): number | null {
  const t = (claimValues(e, prop)[0] as { time?: string } | undefined)?.time;
  const m = t?.match(/^([+-]\d+)-/);
  return m ? Number(m[1]) : null;
}

function wikipediaLinks(e: WikidataEntity): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [site, { title }] of Object.entries(e.sitelinks ?? {})) {
    const m = site.match(/^([a-z_]+)wiki$/);
    if (m && !NON_WIKIPEDIA_SITES.has(site)) out[m[1]] = title;
  }
  return out;
}

export function categoryFor(occupations: string[]): string | null {
  const lower = occupations.map((o) => o.toLowerCase());
  for (const rule of CATEGORY_RULES) {
    if (lower.some((o) => rule.words.some((w) => o.includes(w)))) return rule.category;
  }
  return null;
}

export function sensitiveHeadline(headlines: string[]): string | null {
  for (const h of headlines) {
    const words = h.toLowerCase().split(/[^\p{L}]+/u);
    const hit = SENSITIVE_NEWS_WORDS.find((w) => words.includes(w));
    if (hit) return hit;
  }
  return null;
}

export interface EvaluateInput {
  entity: WikidataEntity;
  signals: TrendSignal[];
  spike: number;
  occupationLabels: Map<string, string>;
  onSite: boolean;
  now: Date;
}

export function evaluate({ entity, signals, spike, occupationLabels, onSite, now }: EvaluateInput): Candidate {
  const reasons: string[] = [];
  let decision: Decision = "accept";
  const reject = (why: string) => {
    reasons.push(why);
    decision = "reject";
  };

  const wikipedia = wikipediaLinks(entity);
  const sitelinks = Object.keys(wikipedia).length;
  const occupations = claimIds(entity, "P106").map((id) => occupationLabels.get(id) ?? id);
  const category = categoryFor(occupations);
  const birthYear = claimYear(entity, "P569");
  const deathYear = claimYear(entity, "P570");
  const headlines = signals.flatMap((s) => s.headlines);

  if (!claimIds(entity, "P31").includes(HUMAN)) reject("not a person");
  if (birthYear === null) reject("birth date unknown, cannot confirm adult");
  else if (deathYear === null && now.getUTCFullYear() - birthYear < MIN_AGE + 1) reject("may be a minor");
  if (sitelinks === 0) reject("no Wikipedia article to source from");
  else if (sitelinks < MIN_SITELINKS) reject(`only ${sitelinks} Wikipedia editions (needs ${MIN_SITELINKS})`);
  if (claimIds(entity, "P1196").some((id) => SENSITIVE_DEATH.has(id))) reject("sensitive manner of death");
  const hit = sensitiveHeadline(headlines);
  if (hit) reject(`news mentions "${hit}", likely crime or tragedy context`);
  if (deathYear !== null && now.getUTCFullYear() - deathYear <= 1) reasons.push("recent death, write with care");
  if (!category) reject("no matching site category");
  const fromGoogle = signals.some((s) => s.source === "google-trends");
  if (!fromGoogle && spike < MIN_SPIKE) reject(`pageview spike ${spike.toFixed(1)}x is below ${MIN_SPIKE}x`);

  const places = new Set(signals.map((s) => s.where)).size;
  const volume = signals.reduce((sum, s) => sum + s.volume, 0);
  const score = Math.round(
    places * 20 +
      Math.log10(volume + 1) * 5 +
      Math.min(spike, 20) * 3 +
      Math.log2(sitelinks + 1) * 5 +
      (fromGoogle ? 10 : 0),
  );

  return {
    wikidataId: entity.id,
    name: entity.labels?.en?.value ?? Object.values(entity.labels ?? {})[0]?.value ?? entity.id,
    description: entity.descriptions?.en?.value ?? "",
    category,
    occupations,
    birthYear,
    deathYear,
    sitelinks,
    wikipedia,
    signals: signals.map(({ source, where, term, volume }) => ({ source, where, term, volume })),
    newsUrls: [...new Set(signals.flatMap((s) => s.newsUrls))].slice(0, 10),
    spike: Math.round(spike * 10) / 10,
    score,
    decision,
    reasons,
    onSite,
  };
}
