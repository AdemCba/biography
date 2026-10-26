/**
 * Writer agent: researches and writes new biographies so the site gets fresh pages every day in every
 * language.
 *
 *   npm run write                    -> 1 new person (WRITE_PER_DAY or --count N)
 *   npm run write -- --count 2
 *   npm run write -- "Serena Williams" athletes
 *
 * Who gets written: accepted people from the latest trend scan first (real demand right now), then the
 * evergreen list in content/queue.json. For each person it
 *   1. researches primary sources and sourced key facts (prompts/01-research.md) and may decide the
 *      person is not worth a page (no gap to fill, too little sourced material, sensitive),
 *   2. writes the English page (prompts/02-draft.md),
 *   3. writes every other enabled language natively (prompts/03-localize.md).
 * Everything lands in status "review": nothing is published until the quality gate passes and the
 * review agent (scripts/review.ts) has checked every claim against its source.
 */
import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { site } from "../src/config/site";
import { PEOPLE_DIR, readContent, today } from "../src/lib/content";
import { MIN_WORDS } from "../src/lib/quality";
import { writeArticle, writePerson } from "../src/lib/article-file";
import { personSchema, SOURCE_TYPES, type PersonData } from "../src/lib/schema";
import { slugify } from "../src/lib/slug";
import type { Locale } from "../src/i18n/config";
import { askStructured, hasApiKey, WRITER_MODEL, isApiUnavailable, exitOnError } from "./lib/claude";

const AUTHOR = "editor-in-chief";
const QUEUE_FILE = path.join(process.cwd(), "content", "queue.json");
const TRENDS_DIR = path.join(process.cwd(), "data", "trend-candidates");
const SKIPPED_FILE = path.join(process.cwd(), "data", "writer-skipped.json");

const args = process.argv.slice(2);
const COUNT = args.includes("--count") ? Number(args[args.indexOf("--count") + 1]) : Number(process.env.WRITE_PER_DAY || 1);
const explicit = args.includes("--prompt") || args.includes("--record") || args.includes("--candidates") ? [] : args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--count");

const queueSchema = z.array(z.object({ name: z.string(), category: z.string() }));

const factOut = z.object({ value: z.string(), sources: z.array(z.string()), note: z.string() });
const researchSchema = z.object({
  worthWriting: z.boolean(),
  reason: z.string(),
  wikidata: z.string(),
  importance: z.number().int(),
  risk: z.enum(["low", "medium", "high"]),
  sources: z.array(
    z.object({ id: z.string(), url: z.string(), title: z.string(), publisher: z.string(), type: z.enum(SOURCE_TYPES), lang: z.string() }),
  ),
  facts: z.object({
    birthDate: factOut.nullable(),
    deathDate: factOut.nullable(),
    birthPlace: factOut.nullable(),
    nationality: factOut.nullable(),
  }),
  targetQueries: z.array(z.string()),
  gapNote: z.string(),
});
type Research = z.infer<typeof researchSchema>;

const articleOut = z.object({
  title: z.string(),
  metaTitle: z.string(),
  metaDescription: z.string(),
  knownFor: z.string(),
  summary: z.string(),
  targetQueries: z.array(z.string()),
  faq: z.array(z.object({ q: z.string(), a: z.string() })),
  body: z.string(),
  newSources: z.array(
    z.object({ id: z.string(), url: z.string(), title: z.string(), publisher: z.string(), type: z.enum(SOURCE_TYPES), lang: z.string() }),
  ),
});
type ArticleOut = z.infer<typeof articleOut>;

const LANGUAGE: Record<Locale, string> = {
  en: "English",
  es: "Spanish",
  pt: "Brazilian Portuguese",
  de: "German",
  fr: "French",
};

function read(file: string) {
  return fs.readFileSync(path.join(process.cwd(), file), "utf8");
}

function fill(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k: string) => vars[k] ?? "");
}

/** People to write next: accepted trend candidates first, then the evergreen queue. */
function pickCandidates(onSite: Set<string>, skipped: Set<string>): { name: string; category: string; leads: string[] }[] {
  const picks: { name: string; category: string; leads: string[] }[] = [];
  const seen = new Set<string>();
  const take = (name: string, category: string, leads: string[] = []) => {
    const id = slugify(name);
    if (onSite.has(id) || skipped.has(id) || seen.has(id)) return;
    seen.add(id);
    picks.push({ name, category, leads });
  };
  if (fs.existsSync(TRENDS_DIR)) {
    const latest = fs.readdirSync(TRENDS_DIR).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort().pop();
    if (latest) {
      type C = {
        name: string; category: string | null; decision: string; onSite: boolean; score?: number;
        description?: string; occupations?: string[]; newsUrls?: string[]; wikipedia?: Record<string, string>;
      };
      const report = JSON.parse(fs.readFileSync(path.join(TRENDS_DIR, latest), "utf8")) as { candidates: C[] };
      // Footballers and creators/influencers first (the site's focus), then by trend score.
      const focus = (c: C) =>
        c.category === "creators" || /football|soccer/i.test(`${c.description ?? ""} ${(c.occupations ?? []).join(" ")}`) ? 1 : 0;
      const ranked = [...report.candidates].sort((a, b) => focus(b) - focus(a) || (b.score ?? 0) - (a.score ?? 0));
      for (const c of ranked) {
        if (c.decision === "accept" && !c.onSite && c.category) {
          const wiki = Object.entries(c.wikipedia ?? {}).map(([l, t]) => `https://${l}.wikipedia.org/wiki/${encodeURIComponent(t.replace(/ /g, "_"))}`);
          take(c.name, c.category, [...wiki, ...(c.newsUrls ?? [])]);
        }
      }
    }
  }
  if (fs.existsSync(QUEUE_FILE)) for (const q of queueSchema.parse(JSON.parse(fs.readFileSync(QUEUE_FILE, "utf8")))) take(q.name, q.category);
  return picks;
}

function dropFromQueue(name: string) {
  if (!fs.existsSync(QUEUE_FILE)) return;
  const queue = queueSchema.parse(JSON.parse(fs.readFileSync(QUEUE_FILE, "utf8")));
  const id = slugify(name);
  fs.writeFileSync(QUEUE_FILE, `${JSON.stringify(queue.filter((q) => slugify(q.name) !== id), null, 2)}\n`);
}

function remember(name: string, reason: string) {
  const list: { id: string; name: string; reason: string; date: string }[] = fs.existsSync(SKIPPED_FILE)
    ? JSON.parse(fs.readFileSync(SKIPPED_FILE, "utf8"))
    : [];
  list.push({ id: slugify(name), name, reason, date: today() });
  fs.mkdirSync(path.dirname(SKIPPED_FILE), { recursive: true });
  fs.writeFileSync(SKIPPED_FILE, `${JSON.stringify(list, null, 2)}\n`);
}

const STYLE = () => `\n<style_guide>\n${read("docs/style-guide.md")}\n</style_guide>`;
const EXAMPLE = () => {
  const file = path.join(PEOPLE_DIR, "usain-bolt", "en.md");
  return fs.existsSync(file) ? `\n<example_of_a_finished_page>\n${fs.readFileSync(file, "utf8")}\n</example_of_a_finished_page>` : "";
};

function researchPrompt(name: string, category: string, leads: string[]): string {
  return [
    fill(read("prompts/01-research.md"), { SITE_NAME: site.name, NAME: name, LOCALE: "en" }),
    `\nCategory on our site: ${category}. Today is ${today()}.`,
    leads.length ? `\nLeads to start from (not citable on their own unless reputable):\n${leads.slice(0, 8).join("\n")}` : "",
    "\nOpen every source you list with web_fetch and keep only facts the fetched page states. Prefer official,",
    "federation, award-body and company pages; encyclopedias and major outlets for context. Never list a URL",
    "you did not open. Source ids are short kebab-case labels.",
    "facts: give the value as text (birthDate/deathDate as YYYY-MM-DD, nationality as comma-separated ISO",
    "3166-1 alpha-2 codes); use null when no source states it. wikidata: the person's Q-id, or \"\".",
    "importance: 1 (niche) to 5 (globally famous). risk: high if the page would center on crime, health,",
    "legal trouble, money disputes or other sensitive matters about a living person.",
    "worthWriting=false if the person is a minor, a private individual, known mainly for a crime or",
    "tragedy, or if there are fewer than three solid sources. Explain in reason.",
  ].join("\n");
}

async function research(client: Anthropic, name: string, category: string, leads: string[]): Promise<Research> {
  return askStructured(client, researchPrompt(name, category, leads), researchSchema, { fetches: 8, searches: 4, model: WRITER_MODEL });
}

/** People already on the site, so new pages can link to them ([Name](person:id)) and list them as related. */
function sitePeople(): string {
  const people = readContent().people.filter((p) => p.data.id);
  return people.length
    ? `\n<people_on_our_site>\n${people.map((p) => `${p.data.id}: ${p.data.name} (${p.data.categories.join(", ")})`).join("\n")}\n</people_on_our_site>\n` +
        "Where the sources connect this person to someone in that list (rival, teammate, partner, co-founder), link the" +
        " first mention as [Name](person:id). Only real, sourced connections; never force a link."
    : "";
}

function draftPrompt(name: string, person: PersonData, r: Pick<Research, "targetQueries" | "gapNote">): string {
  return [
    fill(read("prompts/02-draft.md"), { SITE_NAME: site.name, NAME: name, LOCALE: "en" }),
    STYLE(),
    EXAMPLE(),
    `\n<person_json>\n${JSON.stringify(person, null, 2)}\n</person_json>`,
    `\n<target_queries>\n${r.targetQueries.join("\n")}\n</target_queries>\n<gap_note>\n${r.gapNote}\n</gap_note>`,
    sitePeople(),
    "\nYou may open the sources again with web_fetch to get details right. Every factual sentence ends with",
    "[s:source-id] using ids from person_json (or from newSources, which you must have opened).",
    "body: Markdown without frontmatter, starting with an opening paragraph (no H1), then ## sections.",
    `Length follows the material and is never padded, but this person (importance ${person.importance}) needs at least`,
    `${MIN_WORDS[person.importance]} words of real substance: career turning points, numbers, context, what changed. metaTitle ≤ 60 characters,`,
    "metaDescription 120-160 characters, summary 2-3 sentences and at least 25 words, 3-4 FAQ items.",
  ].join("\n");
}

async function draft(client: Anthropic, name: string, person: PersonData, r: Research): Promise<ArticleOut> {
  return askStructured(client, draftPrompt(name, person, r), articleOut, { fetches: 4, searches: 2, model: WRITER_MODEL });
}

function localizePrompt(name: string, person: PersonData, locale: Locale, en: string): string {
  return [
    fill(read("prompts/03-localize.md"), { NAME: name, LOCALE: `${locale} (${LANGUAGE[locale]})`, SOURCE_LOCALE: "en" }),
    STYLE(),
    `\n<person_json>\n${JSON.stringify(person, null, 2)}\n</person_json>`,
    `\n<english_version>\n${en}\n</english_version>`,
    "Keep the [Name](person:id) links of the English version where the same person is mentioned.",
    `\nWrite everything (title fields, summary, FAQ, body) in ${LANGUAGE[locale]}, with that language's`,
    "number and date conventions. Same citation rule: [s:source-id] after every factual sentence, ids from",
    "person_json or from newSources (which you must have opened with web_fetch). No claim that is not in a",
    "source. body: Markdown without frontmatter, opening paragraph then ## sections. metaTitle ≤ 60",
    "characters, metaDescription 120-160 characters, summary at least 25 words, 3-4 FAQ items.",
  ].join("\n");
}

async function localize(client: Anthropic, name: string, person: PersonData, locale: Locale, en: string): Promise<ArticleOut> {
  return askStructured(client, localizePrompt(name, person, locale, en), articleOut, { fetches: 2, searches: 1, model: WRITER_MODEL, effort: "medium" });
}

function toFacts(r: Research): PersonData["facts"] {
  const out: Record<string, unknown> = {};
  for (const [key, f] of Object.entries(r.facts)) {
    if (!f || !f.value || !f.sources.length) continue;
    const value = key === "nationality" ? f.value.split(",").map((s) => s.trim().toUpperCase()).filter((s) => s.length === 2) : f.value;
    if (Array.isArray(value) && !value.length) continue;
    out[key] = { value, sources: f.sources, ...(f.note ? { note: f.note } : {}) };
  }
  return out as PersonData["facts"];
}

function addSources(person: PersonData, extra: ArticleOut["newSources"]): PersonData {
  const known = new Set(person.sources.map((s) => s.id));
  const add = extra.filter((s) => !known.has(slugify(s.id)));
  return personSchema.parse({
    ...person,
    sources: [...person.sources, ...add.map((s) => ({ ...s, id: slugify(s.id), accessed: today(), lang: s.lang || undefined }))],
  });
}

function saveArticle(dir: string, id: string, locale: Locale, risk: Research["risk"], a: ArticleOut) {
  writeArticle(
    path.join(dir, `${locale}.md`),
    {
      title: a.title,
      slug: id,
      metaTitle: a.metaTitle,
      metaDescription: a.metaDescription.slice(0, 170),
      knownFor: a.knownFor,
      summary: a.summary,
      status: "review",
      risk,
      author: AUTHOR,
      targetQueries: a.targetQueries,
      faq: a.faq,
    },
    a.body,
  );
}

/** Turns a research result into person.json; returns null (and remembers why) when the person is not worth a page. */
function savePerson(name: string, category: string, r: Research): PersonData | null {
  const id = slugify(name);
  if (!r.worthWriting) {
    remember(name, r.reason);
    return null;
  }
  const person = personSchema.parse({
    id,
    name,
    categories: [category],
    importance: Math.min(5, Math.max(1, r.importance)),
    wikidata: /^Q\d+$/.test(r.wikidata) ? r.wikidata : undefined,
    sources: r.sources.map((s) => ({ ...s, id: slugify(s.id), accessed: today(), lang: s.lang || undefined })),
    facts: toFacts(r),
  });
  const dir = path.join(PEOPLE_DIR, id);
  fs.mkdirSync(dir, { recursive: true });
  writePerson(path.join(dir, "person.json"), person);
  return person;
}

/** Saves the English page, links related people both ways. */
function saveEnglish(person: PersonData, risk: Research["risk"], en: ArticleOut): PersonData {
  const id = person.id;
  const dir = path.join(PEOPLE_DIR, id);
  person = addSources(person, en.newSources);
  const linked = [...en.body.matchAll(/\]\(person:([a-z0-9-]+)\)/g)].map((m) => m[1]).filter((x) => x !== id);
  person = personSchema.parse({ ...person, related: [...new Set(linked)] });
  // Link back from the people this page mentions, so the new page gets internal links on day one.
  for (const other of readContent().people.filter((p) => linked.includes(p.data.id) && !p.data.related.includes(id))) {
    writePerson(path.join(other.dir, "person.json"), { ...other.data, related: [...other.data.related, id] });
  }
  writePerson(path.join(dir, "person.json"), person);
  saveArticle(dir, id, "en", risk, en);
  return person;
}

function saveLocale(person: PersonData, locale: Locale, risk: Research["risk"], a: ArticleOut): PersonData {
  const dir = path.join(PEOPLE_DIR, person.id);
  person = addSources(person, a.newSources);
  writePerson(path.join(dir, "person.json"), person);
  saveArticle(dir, person.id, locale, risk, a);
  return person;
}

async function writePersonPages(client: Anthropic, name: string, category: string, leads: string[]): Promise<string> {
  const r = await research(client, name, category, leads);
  let person = savePerson(name, category, r);
  if (!person) return `- ${name}: skipped (${r.reason})`;
  const dir = path.join(PEOPLE_DIR, person.id);
  person = saveEnglish(person, r.risk, await draft(client, name, person, r));
  const written: string[] = ["en"];

  for (const locale of site.locales.filter((l) => l !== "en")) {
    try {
      const a = await localize(client, name, person, locale, fs.readFileSync(path.join(dir, "en.md"), "utf8"));
      person = saveLocale(person, locale, r.risk, a);
      written.push(locale);
    } catch (e) {
      if (isApiUnavailable(e)) throw e;
      console.warn(`${person.id}/${locale}: ${(e as Error).message}`);
    }
  }
  return `✓ ${name}: ${written.join(", ")} written (${person.sources.length} sources, risk ${r.risk})`;
}

function knownIds() {
  const onSite = new Set(readContent().people.map((p) => p.data.id));
  const skipped = new Set<string>(
    fs.existsSync(SKIPPED_FILE) ? (JSON.parse(fs.readFileSync(SKIPPED_FILE, "utf8")) as { id: string }[]).map((s) => s.id) : [],
  );
  return { onSite, skipped };
}

const schemaText = (schema: z.ZodType) =>
  `\nUse your web fetch and web search tools for the research. Answer with one JSON object, nothing else, that matches this JSON schema:\n${JSON.stringify(z.toJSONSchema(schema), null, 2)}`;

/**
 * Subscription mode, for a scheduled Claude task that writes the pages itself (no API key needed). Research
 * results are kept in data/research/<id>.json between the steps.
 *   npm run write -- --candidates 4                          -> next people to write (name<TAB>category<TAB>leads)
 *   npm run write -- --prompt research "<name>" <category>   -> research brief + JSON schema
 *   npm run write -- --record research "<name>" <category> <file>
 *   npm run write -- --prompt draft <id>                     -> English page brief + JSON schema
 *   npm run write -- --record draft <id> <file>
 *   npm run write -- --prompt localize <id> <locale>
 *   npm run write -- --record localize <id> <locale> <file>
 */
function subscriptionMode(): boolean {
  const at = (flag: string) => args.indexOf(flag);
  const RESEARCH_DIR = path.join(process.cwd(), "data", "research");
  const loadResearch = (id: string) => researchSchema.parse(JSON.parse(fs.readFileSync(path.join(RESEARCH_DIR, `${id}.json`), "utf8")));
  const loadPerson = (id: string) => {
    const p = readContent().people.find((x) => x.data.id === id);
    if (!p) throw new Error(`No person ${id}`);
    return p;
  };
  if (at("--candidates") >= 0) {
    const { onSite, skipped } = knownIds();
    for (const c of pickCandidates(onSite, skipped).slice(0, Number(args[at("--candidates") + 1]) || 4))
      console.log([c.name, c.category, c.leads.join(" ")].join("\t"));
    return true;
  }
  const mode = at("--prompt") >= 0 ? "prompt" : at("--record") >= 0 ? "record" : null;
  if (!mode) return false;
  const [step, a1, a2, a3] = args.slice(at(`--${mode}`) + 1);
  const json = (file: string) => JSON.parse(fs.readFileSync(file, "utf8"));
  if (step === "research") {
    if (mode === "prompt") return console.log(researchPrompt(a1, a2, []) + schemaText(researchSchema)), true;
    const r = researchSchema.parse(json(a3));
    const person = savePerson(a1, a2, r);
    if (!person) return console.log(`- ${a1}: skipped (${r.reason})`), true;
    fs.mkdirSync(RESEARCH_DIR, { recursive: true });
    fs.writeFileSync(path.join(RESEARCH_DIR, `${person.id}.json`), `${JSON.stringify(r, null, 2)}\n`);
    dropFromQueue(a1);
    return console.log(`✓ ${person.id}: person.json saved (${person.sources.length} sources)`), true;
  }
  if (step === "draft") {
    const p = loadPerson(a1);
    if (mode === "prompt") return console.log(draftPrompt(p.data.name, p.data, loadResearch(a1)) + schemaText(articleOut)), true;
    saveEnglish(p.data, loadResearch(a1).risk, articleOut.parse(json(a2)));
    return console.log(`✓ ${a1}/en saved`), true;
  }
  if (step === "localize") {
    const p = loadPerson(a1);
    const locale = a2 as Locale;
    if (mode === "prompt")
      return console.log(localizePrompt(p.data.name, p.data, locale, fs.readFileSync(path.join(p.dir, "en.md"), "utf8")) + schemaText(articleOut)), true;
    saveLocale(p.data, locale, loadResearch(a1).risk, articleOut.parse(json(a3)));
    return console.log(`✓ ${a1}/${locale} saved`), true;
  }
  throw new Error(`Unknown step ${step}`);
}

async function main() {
  if (subscriptionMode()) return;
  if (!hasApiKey()) {
    console.log("ANTHROPIC_API_KEY not set; skipping the writer agent.");
    return;
  }
  const client = new Anthropic();
  const store = readContent();
  const onSite = new Set(store.people.map((p) => p.data.id));
  const skipped = new Set<string>(
    fs.existsSync(SKIPPED_FILE) ? (JSON.parse(fs.readFileSync(SKIPPED_FILE, "utf8")) as { id: string }[]).map((s) => s.id) : [],
  );
  const picks = explicit.length
    ? [{ name: explicit[0], category: explicit[1] ?? "athletes", leads: [] }]
    : pickCandidates(onSite, skipped).slice(0, COUNT);

  const log: string[] = [];
  for (const { name, category, leads } of picks) {
    try {
      log.push(await writePersonPages(client, name, category, leads));
      dropFromQueue(name);
    } catch (e) {
      if (isApiUnavailable(e)) throw e;
      log.push(`! ${name}: ${(e as Error).message}, will retry next run`);
    }
  }
  const out = log.length ? log.join("\n") : "Nobody left to write: add names to content/queue.json.";
  console.log(out);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Writer agent\n\n${out}\n`);
}

if (process.argv[1]?.endsWith("write.ts")) {
  main().catch(exitOnError("Writer agent"));
}
