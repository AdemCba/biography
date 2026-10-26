// Daily trend scan: finds notable people trending on Google and Wikipedia,
// filters and scores them, writes a report to data/trend-candidates/ and
// optionally scaffolds the best new ones as status "idea" for the normal
// research → draft → review pipeline. Nothing here publishes anything.
//
// Usage: tsx scripts/trends/run.ts [--scaffold N] [--dry-run]

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { slugify } from "../../src/lib/slug";
import { DEFAULT_SCAFFOLD, GEOS, WIKI_TOP_N, WIKIS } from "./config";
import { claimIds, evaluate, type Candidate } from "./evaluate";
import { renderReport } from "./report";
import {
  entitiesForTitles,
  fetchDailyViews,
  fetchGoogleTrends,
  fetchWikiTop,
  labelsFor,
  searchWikipedia,
  spikeRatio,
  type TrendSignal,
  type WikidataEntity,
} from "./sources";

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, "data", "trend-candidates");
const PEOPLE_DIR = join(ROOT, "content", "people");
const LOCALES = process.env.TREND_LOCALES ?? "en,es,pt,de,fr";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

/** Wikidata ids and folder names of people already on the site. */
function sitePeople(): { ids: Set<string>; text: string } {
  if (!existsSync(PEOPLE_DIR)) return { ids: new Set(), text: "" };
  const ids = new Set<string>();
  let text = "";
  for (const dir of readdirSync(PEOPLE_DIR)) {
    ids.add(dir);
    const file = join(PEOPLE_DIR, dir, "person.json");
    if (existsSync(file)) text += readFileSync(file, "utf8");
  }
  return { ids, text };
}

async function collectSignals(now: Date): Promise<TrendSignal[]> {
  const signals: TrendSignal[] = [];
  for (const { geo, wiki } of GEOS) signals.push(...(await fetchGoogleTrends(geo, wiki)));
  // Wikimedia publishes a day's top list a few hours after it ends.
  for (const wiki of WIKIS) {
    let top = await fetchWikiTop(wiki, new Date(now.getTime() - 86400e3), WIKI_TOP_N);
    if (top.length === 0) top = await fetchWikiTop(wiki, new Date(now.getTime() - 2 * 86400e3), WIKI_TOP_N);
    signals.push(...top);
  }
  return signals;
}

async function main() {
  const now = new Date();
  const dryRun = process.argv.includes("--dry-run");
  const scaffold = Number(arg("--scaffold") ?? (process.argv.includes("--scaffold") ? DEFAULT_SCAFFOLD : 0));

  const signals = await collectSignals(now);
  console.log(`collected ${signals.length} signals`);

  // Resolve every signal to a Wikipedia title on its wiki.
  const titleOf = new Map<TrendSignal, string>();
  const searchCache = new Map<string, string | null>();
  for (const s of signals) {
    if (s.source === "wikipedia-top") {
      titleOf.set(s, s.term);
      continue;
    }
    const key = `${s.wiki}:${s.term.toLowerCase()}`;
    if (!searchCache.has(key)) searchCache.set(key, await searchWikipedia(s.wiki, s.term));
    const title = searchCache.get(key);
    if (title) titleOf.set(s, title);
  }

  // Map titles to Wikidata entities and group signals per person.
  const byEntity = new Map<string, { entity: WikidataEntity; signals: TrendSignal[] }>();
  for (const wiki of new Set(signals.map((s) => s.wiki))) {
    const wikiSignals = signals.filter((s) => s.wiki === wiki && titleOf.has(s));
    const entities = await entitiesForTitles(wiki, [...new Set(wikiSignals.map((s) => titleOf.get(s)!))]);
    for (const s of wikiSignals) {
      const entity = entities.get(titleOf.get(s)!);
      if (!entity || !claimIds(entity, "P31").includes("Q5")) continue;
      const group = byEntity.get(entity.id) ?? { entity, signals: [] };
      group.signals.push(s);
      byEntity.set(entity.id, group);
    }
  }
  console.log(`${byEntity.size} trending people found`);

  const occupationLabels = await labelsFor([...byEntity.values()].flatMap((g) => claimIds(g.entity, "P106")));
  const site = sitePeople();

  const candidates: Candidate[] = [];
  for (const { entity, signals: own } of byEntity.values()) {
    const wiki = own[0].wiki;
    const title = entity.sitelinks?.[`${wiki}wiki`]?.title;
    const spike = title ? spikeRatio(await fetchDailyViews(wiki, title, new Date(now.getTime() - 86400e3), 8)) : 0;
    const name = entity.labels?.en?.value ?? title ?? entity.id;
    const onSite = site.ids.has(slugify(name)) || site.text.includes(`"${entity.id}"`);
    candidates.push(evaluate({ entity, signals: own, spike, occupationLabels, onSite, now }));
  }
  candidates.sort((a, b) => b.score - a.score);

  const day = now.toISOString().slice(0, 10);
  const scaffolded: string[] = [];
  if (scaffold > 0) {
    for (const c of candidates.filter((c) => c.decision === "accept" && !c.onSite && c.category).slice(0, scaffold)) {
      if (dryRun) {
        scaffolded.push(c.name);
        continue;
      }
      try {
        execFileSync("npm", ["run", "--silent", "new", "--", c.name, c.category!, LOCALES], { stdio: "inherit" });
        scaffolded.push(c.name);
      } catch (err) {
        console.warn(`could not scaffold ${c.name}: ${(err as Error).message}`);
      }
    }
  }

  const report = { generatedAt: now.toISOString(), signals: signals.length, scaffolded, candidates };
  if (dryRun) {
    console.log(renderReport(report));
    return;
  }
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(join(OUT_DIR, `${day}.json`), JSON.stringify(report, null, 2) + "\n");
  writeFileSync(join(OUT_DIR, "latest.md"), renderReport(report));
  console.log(`wrote ${candidates.length} candidates, scaffolded ${scaffolded.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
