// Fetchers for the public trend signals. Every function returns plain data so
// the scoring code can be tested offline with fixtures.

import { USER_AGENT } from "./config";

export interface TrendSignal {
  /** Search term or Wikipedia title as it appeared in the source. */
  term: string;
  source: "google-trends" | "wikipedia-top";
  /** Google geo (US, DE...) or wiki language (en, de...). */
  where: string;
  /** Wikipedia language to resolve the term in. */
  wiki: string;
  /** Approximate searches (Google) or daily views (Wikipedia). */
  volume: number;
  /** News headlines Google attached to the trend, used for sensitivity checks. */
  headlines: string[];
  /** News URLs Google attached to the trend, kept as leads for research. */
  newsUrls: string[];
  /** When Google says the trend started (RSS pubDate), ISO string. */
  startedAt?: string;
}

async function get(url: string, accept = "application/json"): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: accept } });
    if (res.ok || res.status === 404 || attempt >= 2) return res;
    await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
  }
}

async function getJson<T>(url: string): Promise<T | null> {
  const res = await get(url);
  if (!res.ok) return null;
  return (await res.json()) as T;
}

// ---------- Google Trends daily trending searches (RSS) ----------

function decodeXml(s: string): string {
  return s
    .replace(/^<!\[CDATA\[|\]\]>$/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .trim();
}

function tagValues(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "g");
  return [...xml.matchAll(re)].map((m) => decodeXml(m[1]));
}

/** "200,000+" → 200000, "2K+" → 2000. */
export function parseTraffic(s: string): number {
  const m = s.replace(/[,.\s+]/g, "").match(/^(\d+)([KMB])?$/i);
  if (!m) return 0;
  const mult = { K: 1e3, M: 1e6, B: 1e9 }[(m[2] ?? "").toUpperCase() as "K" | "M" | "B"] ?? 1;
  return Number(m[1]) * mult;
}

function toIso(date: string | undefined): string | undefined {
  const t = date ? Date.parse(date) : NaN;
  return Number.isNaN(t) ? undefined : new Date(t).toISOString();
}

export function parseTrendsRss(xml: string, geo: string, wiki: string): TrendSignal[] {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, item]) => {
    const term = tagValues(item, "title")[0] ?? "";
    return {
      term,
      source: "google-trends" as const,
      where: geo,
      wiki,
      volume: parseTraffic(tagValues(item, "ht:approx_traffic")[0] ?? ""),
      headlines: tagValues(item, "ht:news_item_title"),
      newsUrls: tagValues(item, "ht:news_item_url"),
      startedAt: toIso(tagValues(item, "pubDate")[0]),
    };
  }).filter((s) => s.term);
}

export async function fetchGoogleTrends(geo: string, wiki: string): Promise<TrendSignal[]> {
  const res = await get(`https://trends.google.com/trending/rss?geo=${geo}`, "application/rss+xml");
  if (!res.ok) {
    console.warn(`google trends ${geo}: HTTP ${res.status}`);
    return [];
  }
  return parseTrendsRss(await res.text(), geo, wiki);
}

// ---------- Wikimedia pageviews ----------

const SKIP_TITLE = /^(Main_Page|Wikipedia:|Special:|Spezial:|Especial:|Portal:|File:|Datei:|Arquivo:|Archivo:|Fichier:|Help:|Hilfe:|Ajuda:|Ayuda:|Aide:|Category:|Kategorie:|Categoria:|Categoría:|Catégorie:|Template:)/;
const MAIN_PAGES = new Set(["Main_Page", "Wikipedia:Portada", "Wikipedia:Página_principal", "Wikipedia:Hauptseite", "Wikipédia:Accueil_principal", "Página_principal", "Hauptseite"]);

export function ymd(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

export async function fetchWikiTop(wiki: string, day: Date, topN: number): Promise<TrendSignal[]> {
  const [y, m, d] = day.toISOString().slice(0, 10).split("-");
  const data = await getJson<{ items: { articles: { article: string; views: number }[] }[] }>(
    `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/${wiki}.wikipedia/all-access/${y}/${m}/${d}`,
  );
  if (!data) {
    console.warn(`wikipedia top ${wiki}: no data for ${y}-${m}-${d}`);
    return [];
  }
  return data.items[0].articles
    .filter((a) => !SKIP_TITLE.test(a.article) && !MAIN_PAGES.has(a.article) && !a.article.includes(":"))
    .slice(0, topN)
    .map((a) => ({
      term: a.article.replace(/_/g, " "),
      source: "wikipedia-top" as const,
      where: wiki,
      wiki,
      volume: a.views,
      headlines: [],
      newsUrls: [],
    }));
}

/** Daily views for one article, oldest first. */
export async function fetchDailyViews(wiki: string, title: string, end: Date, days: number): Promise<number[]> {
  const start = new Date(end.getTime() - (days - 1) * 86400e3);
  const t = encodeURIComponent(title.replace(/ /g, "_"));
  const data = await getJson<{ items: { views: number }[] }>(
    `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/${wiki}.wikipedia/all-access/user/${t}/daily/${ymd(start)}/${ymd(end)}`,
  );
  return data?.items.map((i) => i.views) ?? [];
}

/** Latest day divided by the median of the earlier days; 0 when there is no history. */
export function spikeRatio(views: number[]): number {
  if (views.length < 3) return 0;
  const latest = views[views.length - 1];
  const prev = views.slice(0, -1).sort((a, b) => a - b);
  const median = prev[Math.floor(prev.length / 2)];
  return median > 0 ? latest / median : latest > 0 ? latest : 0;
}

// ---------- Wikipedia search + Wikidata ----------

/** Best matching Wikipedia article title for a search term, or null. */
export async function searchWikipedia(wiki: string, term: string): Promise<string | null> {
  const data = await getJson<{ query?: { search?: { title: string }[] } }>(
    `https://${wiki}.wikipedia.org/w/api.php?action=query&list=search&srlimit=1&format=json&srsearch=${encodeURIComponent(term)}`,
  );
  return data?.query?.search?.[0]?.title ?? null;
}

export interface WikidataEntity {
  id: string;
  labels?: Record<string, { value: string }>;
  descriptions?: Record<string, { value: string }>;
  claims?: Record<string, { mainsnak: { datavalue?: { value: unknown } } }[]>;
  sitelinks?: Record<string, { title: string }>;
  missing?: string;
}

/** Wikidata entities for Wikipedia titles on one wiki, keyed by the requested title. */
export async function entitiesForTitles(wiki: string, titles: string[]): Promise<Map<string, WikidataEntity>> {
  const out = new Map<string, WikidataEntity>();
  for (let i = 0; i < titles.length; i += 50) {
    const batch = titles.slice(i, i + 50);
    // No normalize=1: Wikidata only accepts it for a single title and rejects the whole batch otherwise.
    // The titles come from Wikipedia search, so they are already canonical.
    const data = await getJson<{ entities?: Record<string, WikidataEntity>; error?: { info: string } }>(
      `https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=labels|descriptions|claims|sitelinks&languages=en|es|pt|de|fr&sites=${wiki}wiki&titles=${encodeURIComponent(batch.join("|"))}`,
    );
    if (data?.error) console.warn(`wikidata ${wiki}: ${data.error.info}`);
    for (const e of Object.values(data?.entities ?? {})) {
      const title = e.sitelinks?.[`${wiki}wiki`]?.title;
      if (!e.missing && title) out.set(title, e);
    }
  }
  return out;
}

/** English labels for Wikidata ids (used for occupations). */
export async function labelsFor(ids: string[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const unique = [...new Set(ids)];
  for (let i = 0; i < unique.length; i += 50) {
    const data = await getJson<{ entities: Record<string, WikidataEntity> }>(
      `https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=labels&languages=en&ids=${unique.slice(i, i + 50).join("|")}`,
    );
    for (const e of Object.values(data?.entities ?? {})) {
      const label = e.labels?.en?.value;
      if (label) out.set(e.id, label);
    }
  }
  return out;
}
