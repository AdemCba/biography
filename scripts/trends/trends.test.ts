import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { categoryFor, evaluate, sensitiveHeadline } from "./evaluate";
import { parseTraffic, parseTrendsRss, spikeRatio, type TrendSignal, type WikidataEntity } from "./sources";

const now = new Date("2026-10-26T12:00:00Z");

function person(opts: { born?: string; died?: string; occupations?: string[]; sitelinks?: number; human?: boolean; death?: string }): WikidataEntity {
  const item = (id: string) => ({ mainsnak: { datavalue: { value: { id } } } });
  const time = (t: string) => ({ mainsnak: { datavalue: { value: { time: `+${t}-01-01T00:00:00Z` } } } });
  const sitelinks: Record<string, { title: string }> = { commonswiki: { title: "x" } };
  for (const lang of ["en", "es", "pt", "de", "fr", "it", "nl", "pl", "ja", "ar"].slice(0, opts.sitelinks ?? 10)) sitelinks[`${lang}wiki`] = { title: "Jane Doe" };
  return {
    id: "Q1",
    labels: { en: { value: "Jane Doe" } },
    claims: {
      P31: [item(opts.human === false ? "Q515" : "Q5")],
      ...(opts.born ? { P569: [time(opts.born)] } : {}),
      ...(opts.died ? { P570: [time(opts.died)] } : {}),
      ...(opts.death ? { P1196: [item(opts.death)] } : {}),
      P106: (opts.occupations ?? ["Q937857"]).map(item),
    },
    sitelinks,
  };
}

const labels = new Map([["Q937857", "association football player"], ["Q82955", "politician"]]);
const google = (headlines: string[] = []): TrendSignal => ({ term: "Jane Doe", source: "google-trends", where: "US", wiki: "en", volume: 100000, headlines, newsUrls: [] });
const wikiTop: TrendSignal = { term: "Jane Doe", source: "wikipedia-top", where: "de", wiki: "de", volume: 50000, headlines: [], newsUrls: [] };
const run = (entity: WikidataEntity, signals = [google()], spike = 4) => evaluate({ entity, signals, spike, occupationLabels: labels, onSite: false, now });

test("parses Google Trends RSS", () => {
  const items = parseTrendsRss(readFileSync(join(process.cwd(), "scripts/trends/__fixtures__/trends-us.xml"), "utf8"), "US", "en");
  assert.equal(items.length, 2);
  assert.equal(items[0].term, "Lamine Yamal");
  assert.equal(items[0].volume, 500000);
  assert.deepEqual(items[0].newsUrls, ["https://example.com/a"]);
  assert.equal(items[1].term, "Taylor Swift & Travis");
  assert.equal(items[1].volume, 2000);
});

test("traffic and spike helpers", () => {
  assert.equal(parseTraffic("200,000+"), 200000);
  assert.equal(parseTraffic("1M+"), 1000000);
  assert.equal(parseTraffic(""), 0);
  assert.equal(spikeRatio([100, 100, 120, 90, 100, 110, 100, 500]), 5);
  assert.equal(spikeRatio([5]), 0);
});

test("accepts a notable adult athlete", () => {
  const c = run(person({ born: "1990" }));
  assert.equal(c.decision, "accept");
  assert.equal(c.category, "athletes");
  assert.ok(c.score > 0);
});

test("rejects minors and non-people", () => {
  assert.equal(run(person({ born: "2010" })).decision, "reject");
  assert.equal(run(person({ born: "1990", human: false })).decision, "reject");
});

test("rejects a person without any Wikipedia article", () => {
  assert.equal(run(person({ born: "1990", sitelinks: 0 })).decision, "reject");
});

test("drops sensitive or uncertain cases", () => {
  assert.equal(run(person({ born: "1990" }), [google(["Footballer arrested after crash"])]).decision, "reject");
  assert.equal(run(person({ born: "1990", died: "2026", death: "Q149086" })).decision, "reject");
  assert.equal(run(person({})).decision, "reject");
  assert.equal(run(person({ born: "1990", sitelinks: 2 })).decision, "reject");
  assert.equal(run(person({ born: "1970", occupations: ["Q82955"] })).decision, "reject");
});

test("a Wikipedia-only signal needs a real spike", () => {
  assert.equal(run(person({ born: "1990" }), [wikiTop], 1.2).decision, "reject");
  assert.equal(run(person({ born: "1990" }), [wikiTop], 3).decision, "accept");
});

test("keyword helpers", () => {
  assert.equal(categoryFor(["YouTuber"]), "creators");
  assert.equal(categoryFor(["chief executive officer"]), "business");
  assert.equal(sensitiveHeadline(["Sänger als Opfer identifiziert"]), "opfer");
  assert.equal(sensitiveHeadline(["Opferbereitschaft im Spiel"]), null);
});
