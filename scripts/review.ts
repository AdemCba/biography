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
import { checkContent, GATE_CODES } from "../src/lib/quality";
import { askStructured, hasApiKey, MODEL } from "./lib/claude";

export const REVIEWER_ID = "fact-check-desk";
const MAX_REVIEWS = 3;
const args = process.argv.slice(2);
const LIMIT = args.includes("--limit") ? Number(args[args.indexOf("--limit") + 1]) : 20;
const explicit = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--limit");

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

async function factCheck(client: Anthropic, person: Person, article: Article): Promise<Verdict> {
  const prompt = [
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
    "Be strict. When in doubt, reject and say exactly what to fix.",
  ].join("\n");
  return askStructured(client, prompt, verdictSchema, { fetches: 20, searches: 5 });
}

function addMonths(date: string, months: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
}

async function main() {
  if (!hasApiKey()) {
    console.log("ANTHROPIC_API_KEY not set; skipping the review agent.");
    return;
  }
  const client = new Anthropic();
  const store = readContent();
  const { reports } = checkContent(store);
  // Gate problems other than the missing approval itself must be fixed (by `npm run revise`) first.
  const approvalOnly = new Set(["no-reviewer", "no-publish-date"]);
  const gateClean = (personId: string, locale: string) =>
    !reports
      .find((r) => r.personId === personId && r.locale === locale)
      ?.issues.some((i) => i.level === "error" || (!approvalOnly.has(i.code) && !i.code.startsWith("style:") && GATE_CODES.has(i.code)));

  const queue = store.people
    .flatMap((person) => Object.values(person.articles).map((article) => ({ person, article: article! })))
    .filter(({ person, article }) =>
      explicit.length
        ? explicit.includes(`${person.data.id}/${article.locale}`)
        : article.meta.status === "review" && !article.meta.flag && !article.meta.reviewNotes,
    )
    .slice(0, LIMIT);

  const summary: string[] = [];
  for (const { person, article } of queue) {
    const key = `${person.data.id}/${article.locale}`;
    const meta = article.meta;
    if (meta.risk === "high") {
      writeArticle(article.file, { ...meta, flag: "High-risk article: needs a human editor's approval." }, article.body);
      summary.push(`⚑ ${key}: high risk, sent to a human editor`);
      continue;
    }
    if (!gateClean(person.data.id, article.locale)) {
      summary.push(`… ${key}: fails the quality gate, left for the fix loop`);
      continue;
    }
    let verdict: Verdict;
    try {
      verdict = await factCheck(client, person, article);
    } catch (e) {
      if (e instanceof Anthropic.AuthenticationError) throw e;
      summary.push(`! ${key}: review failed (${(e as Error).message}), will retry next run`);
      continue;
    }
    const { approved, reasons } = decide(verdict);
    fs.writeFileSync(
      path.join(person.dir, `${article.locale}.review.json`),
      `${JSON.stringify({ date: today(), model: MODEL, approved, reasons, ...verdict }, null, 2)}\n`,
    );
    const reviews = meta.autoReviews + 1;
    if (approved) {
      writeArticle(
        article.file,
        { ...meta, status: "approved", reviewer: REVIEWER_ID, reviewedAt: today(), reviewBy: addMonths(today(), 6), reviewNotes: undefined, autoReviews: reviews },
        article.body,
      );
      summary.push(`✓ ${key}: approved (${verdict.claims.length} claims confirmed)`);
    } else {
      const notes = reasons.join(" | ").slice(0, 4000);
      const flag = reviews >= MAX_REVIEWS ? `Rejected by the fact-check ${reviews} times; needs a human editor.` : undefined;
      writeArticle(article.file, { ...meta, reviewNotes: notes, autoReviews: reviews, flag }, article.body);
      summary.push(`✗ ${key}: rejected, ${reasons.length} problem(s)${flag ? " (flagged for a human)" : ", sent to the fix loop"}`);
    }
  }
  const out = summary.length ? summary.join("\n") : "Nothing to review.";
  console.log(out);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Review agent\n\n${out}\n`);
}


if (process.argv[1]?.endsWith("review.ts")) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
