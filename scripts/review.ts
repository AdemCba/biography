/**
 * Review agent: the automated editor that approves articles.
 *
 *   npm run review                      -> every article in status "review" that passes the quality gate
 *   npm run review -- usain-bolt/en
 *
 * For each article it opens every cited source (web fetch), checks each claim, and judges whether the
 * page reads human-written and adds something to what is already out there. The code, not the model,
 * makes the final call: any wrong, unsupported or outdated claim, any uncited claim, or a failed
 * style/value judgement means rejection. Approved articles get `reviewer: fact-check-desk` and status
 * "approved" (then `npm run schedule` dates them). Rejected ones get `reviewNotes`, which the fix loop
 * (`npm run revise`) works from; after 3 rejections the article is flagged for a human.
 * High-risk articles (money, legal, health) are never approved by the agent.
 * A per-article audit trail is written next to the article as <locale>.review.json.
 */
import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { site } from "../src/config/site";
import { readContent, today, type Article, type Person } from "../src/lib/content";
import { writeArticle } from "../src/lib/article-file";
import { checkContent, GATE_CODES, NOT_FIXABLE_BY_REWRITE } from "../src/lib/quality";
import { askStructured, hasApiKey, MODEL, isApiUnavailable, exitOnError } from "./lib/claude";

export const REVIEWER_ID = "fact-check-desk";
const MAX_REVIEWS = 3;
const args = process.argv.slice(2);
const LIMIT = args.includes("--limit") ? Number(args[args.indexOf("--limit") + 1]) : 20;
const VALUE_FLAGS = ["--limit", "--prompt", "--record", "--model"];
const explicit = args.filter((a, i) => !a.startsWith("--") && !VALUE_FLAGS.includes(args[i - 1]) && args[i - 2] !== "--record");

const verdictSchema = z.object({
  claims: z.array(
    z.object({
      claim: z.string(),
      sourceIds: z.array(z.string()),
      verdict: z.enum(["confirmed", "wrong", "unsupported", "outdated", "source_unreachable"]),
      note: z.string(),
    }),
  ),
  /** Factual statements in the article that carry no citation at all. */
  uncitedClaims: z.array(z.string()),
  readsHumanWritten: z.boolean(),
  addsValue: z.boolean(),
  valueNote: z.string(),
  decision: z.enum(["approve", "reject"]),
  summary: z.string(),
});
type Verdict = z.infer<typeof verdictSchema>;

/** The model recommends; these rules decide. */
export function decide(v: Verdict): { approved: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const bad = v.claims.filter((c) => ["wrong", "unsupported", "outdated"].includes(c.verdict));
  if (bad.length) reasons.push(...bad.map((c) => `${c.verdict.toUpperCase()}: "${c.claim}" (${c.note})`));
  const unreachable = v.claims.filter((c) => c.verdict === "source_unreachable").length;
  if (v.claims.length === 0) reasons.push("No claims were checked");
  else if (unreachable / v.claims.length > 0.25) reasons.push(`${unreachable} of ${v.claims.length} claims could not be checked (source unreachable)`);
  if (v.uncitedClaims.length) reasons.push(...v.uncitedClaims.map((c) => `UNCITED: "${c}"`));
  if (!v.readsHumanWritten) reasons.push("Prose reads machine-written");
  if (!v.addsValue) reasons.push(`Adds no value over existing pages: ${v.valueNote}`);
  if (v.decision !== "approve") reasons.push(`Reviewer recommends rejection: ${v.summary}`);
  return { approved: reasons.length === 0, reasons };
}

function read(file: string) {
  return fs.readFileSync(path.join(process.cwd(), file), "utf8");
}

function factCheckPrompt(person: Person, article: Article): string {
  return [
    `You are the fact-check editor of ${site.name}. Nothing is published unless you confirm it.`,
    read("prompts/04-fact-check.md"),
    `\n<style_guide>\n${read("docs/style-guide.md")}\n</style_guide>`,
    `\n<person_json>\n${JSON.stringify(person.data, null, 2)}\n</person_json>`,
    `\n<article locale="${article.locale}">\n${fs.readFileSync(article.file, "utf8")}\n</article>`,
    `\nToday is ${today()}.`,
    "Open every source URL listed in person_json with web_fetch. For each factual claim in the article",
    "(body, summary, knownFor, FAQ answers, and every fact in person_json.facts) record the cited source ids",
    "and whether the source confirms it. Use web_search only to check whether a claim is outdated.",
    "Also judge: does it read like a careful human writer (see the style guide)? Does it add something",
    "a reader would not get from the usual top results (clear timeline, primary sources, context, corrections)?",
    "Citation tags [s:id] belong in the body only. The frontmatter fields (title, metaTitle, metaDescription,",
    "knownFor, summary, FAQ answers) cannot carry tags: check that what they say is backed by the body or the",
    "sources, and never list them as uncited. In the body, one tag may cover the sentences of the same paragraph",
    "that come from the same source; flag a body claim as uncited only when no nearby tag supports it.",
    "A claim is \"outdated\" only if it describes the present and is no longer true; a dated past event",
    "(\"in 2021 Time named him...\") is never outdated. Rounded spans (\"two decades later\") are fine when the",
    "dates in the article support them.",
    "Be strict about facts. When in doubt, reject and say exactly what to fix.",
  ].join("\n");
}

async function factCheck(client: Anthropic, person: Person, article: Article): Promise<Verdict> {
  return askStructured(client, factCheckPrompt(person, article), verdictSchema, { fetches: 6, searches: 2 });
}

function addMonths(date: string, months: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
}

/** Articles ready for the fact-check: in review, unflagged, gate-clean. High-risk ones are sent to a human. */
function readyForReview(summary: string[]): { person: Person; article: Article }[] {
  const store = readContent();
  const { reports } = checkContent(store);
  // Gate problems other than the missing approval itself must be fixed (by `npm run revise`) first.
  const approvalOnly = NOT_FIXABLE_BY_REWRITE;
  const gateClean = (personId: string, locale: string) =>
    !reports
      .find((r) => r.personId === personId && r.locale === locale)
      ?.issues.some((i) => (i.level === "error" && !approvalOnly.has(i.code)) || (!approvalOnly.has(i.code) && !i.code.startsWith("style:") && GATE_CODES.has(i.code)));

  const queue = store.people
    .flatMap((person) => Object.values(person.articles).map((article) => ({ person, article: article! })))
    .filter(({ person, article }) =>
      explicit.length
        ? explicit.includes(`${person.data.id}/${article.locale}`)
        : article.meta.status === "review" && !article.meta.flag && !article.meta.reviewNotes,
    );
  const ready: { person: Person; article: Article }[] = [];
  for (const { person, article } of queue) {
    const key = `${person.data.id}/${article.locale}`;
    if (article.meta.risk === "high") {
      writeArticle(article.file, { ...article.meta, flag: "High-risk article: needs a human editor's approval." }, article.body);
      summary.push(`⚑ ${key}: high risk, sent to a human editor`);
    } else if (!gateClean(person.data.id, article.locale)) {
      summary.push(`… ${key}: fails the quality gate, left for the fix loop`);
    } else {
      ready.push({ person, article });
    }
  }
  return ready.slice(0, LIMIT);
}

/** Applies the code-enforced decision to one verdict and records the audit trail. */
function applyVerdict(person: Person, article: Article, verdict: Verdict, model: string): string {
  const key = `${person.data.id}/${article.locale}`;
  const meta = article.meta;
  const { approved, reasons } = decide(verdict);
  fs.writeFileSync(
    path.join(person.dir, `${article.locale}.review.json`),
    `${JSON.stringify({ date: today(), model, approved, reasons, ...verdict }, null, 2)}\n`,
  );
  const reviews = meta.autoReviews + 1;
  if (approved) {
    writeArticle(
      article.file,
      { ...meta, status: "approved", reviewer: REVIEWER_ID, reviewedAt: today(), reviewBy: addMonths(today(), 6), reviewNotes: undefined, autoReviews: reviews },
      article.body,
    );
    return `✓ ${key}: approved (${verdict.claims.length} claims confirmed)`;
  }
  const notes = reasons.join(" | ").slice(0, 4000);
  const flag = reviews >= MAX_REVIEWS ? `Rejected by the fact-check ${reviews} times; needs a human editor.` : undefined;
  writeArticle(article.file, { ...meta, reviewNotes: notes, autoReviews: reviews, flag }, article.body);
  return `✗ ${key}: rejected, ${reasons.length} problem(s)${flag ? " (flagged for a human)" : ", sent to the fix loop"}`;
}

function find(key: string): { person: Person; article: Article } {
  const [id, locale] = key.split("/");
  const person = readContent().people.find((p) => p.data.id === id);
  const article = person?.articles[locale as keyof typeof person.articles];
  if (!person || !article) throw new Error(`No article ${key}`);
  return { person, article };
}

/**
 * Subscription mode, for a scheduled Claude task that does the fact-check itself (no API key needed):
 *   npm run review -- --queue                       -> keys of the articles ready for review
 *   npm run review -- --prompt <id/locale>          -> the fact-check brief plus the verdict JSON schema
 *   npm run review -- --record <id/locale> <file>   -> applies a verdict JSON written by the task
 */
function subscriptionMode(): boolean {
  const opt = (name: string) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
  if (args.includes("--queue")) {
    const summary: string[] = [];
    const ready = readyForReview(summary);
    if (summary.length) console.error(summary.join("\n"));
    console.log(ready.map(({ person, article }) => `${person.data.id}/${article.locale}`).join("\n"));
    return true;
  }
  const promptKey = opt("--prompt");
  if (promptKey) {
    const { person, article } = find(promptKey);
    console.log(factCheckPrompt(person, article));
    console.log("\nUse your web fetch tool to open the sources and web search only for the outdated check.");
    console.log("Answer with one JSON object, nothing else, that matches this JSON schema:");
    console.log(JSON.stringify(z.toJSONSchema(verdictSchema), null, 2));
    return true;
  }
  const recordKey = opt("--record");
  if (recordKey) {
    const file = args[args.indexOf("--record") + 2];
    const { person, article } = find(recordKey);
    const verdict = verdictSchema.parse(JSON.parse(fs.readFileSync(file, "utf8")));
    console.log(applyVerdict(person, article, verdict, opt("--model") ?? "claude-subscription"));
    return true;
  }
  return false;
}

async function main() {
  if (subscriptionMode()) return;
  if (!hasApiKey()) {
    console.log("ANTHROPIC_API_KEY not set; skipping the review agent.");
    return;
  }
  const client = new Anthropic();
  const summary: string[] = [];
  const queue = readyForReview(summary);
  console.log(`Reviewing ${queue.length} article(s)`);
  for (const { person, article } of queue) {
    const key = `${person.data.id}/${article.locale}`;
    console.log(`… ${key}`);
    let verdict: Verdict;
    try {
      verdict = await factCheck(client, person, article);
    } catch (e) {
      if (isApiUnavailable(e)) throw e;
      summary.push(`! ${key}: review failed (${(e as Error).message}), will retry next run`);
      continue;
    }
    summary.push(applyVerdict(person, article, verdict, MODEL));
  }
  const out = summary.length ? summary.join("\n") : "Nothing to review.";
  console.log(out);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Review agent\n\n${out}\n`);
}

if (process.argv[1]?.endsWith("review.ts")) {
  main().catch(exitOnError("Review agent"));
}
