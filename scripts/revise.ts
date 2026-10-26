/**
 * Fix-and-re-audit loop.
 *
 *   npm run revise                       -> every article that fails the gate and is published/approved/review
 *   npm run revise -- ana-ferreira/en    -> specific articles
 *   npm run revise -- --max-attempts 2 --limit 5
 *
 * For each failing article: send the checker's report, the style guide, person.json and the article to
 * Claude (with web fetch/search so it can open the sources), apply the rewrite, run the checker again,
 * and repeat. After the last attempt a still-failing article is set to status "review" with a `flag`,
 * so it stays offline until a human looks at it. Needs ANTHROPIC_API_KEY.
 */
import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { site } from "../src/config/site";
import { readContent, today, type Article, type Person } from "../src/lib/content";
import { writeArticle, writePerson } from "../src/lib/article-file";
import { checkContent, GATE_CODES, NOT_FIXABLE_BY_REWRITE, type ArticleReport } from "../src/lib/quality";
import { articleSchema, sourceSchema } from "../src/lib/schema";
import { askStructured, hasApiKey, WRITER_MODEL, isApiUnavailable, exitOnError } from "./lib/claude";

const args = process.argv.slice(2);
const opt = (name: string, fallback: number) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? Number(args[i + 1]) : fallback;
};
const MAX_ATTEMPTS = opt("max-attempts", 3);
const LIMIT = opt("limit", 10);
const explicit = args.filter((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));

const revisionSchema = z.object({
  title: z.string(),
  metaTitle: z.string(),
  metaDescription: z.string(),
  knownFor: z.string(),
  summary: z.string(),
  targetQueries: z.array(z.string()),
  faq: z.array(z.object({ q: z.string(), a: z.string() })),
  body: z.string(),
  newSources: z.array(
    z.object({ id: z.string(), url: z.string(), title: z.string(), publisher: z.string(), type: z.string(), accessed: z.string() }),
  ),
  /** What changed, and anything the editor must know (e.g. "sources too thin for a fuller article"). */
  note: z.string(),
});
type Revision = z.infer<typeof revisionSchema>;

function read(file: string) {
  return fs.readFileSync(path.join(process.cwd(), file), "utf8");
}

function reportFor(personId: string, locale: string): ArticleReport | undefined {
  return checkContent(readContent()).reports.find((r) => r.personId === personId && r.locale === locale);
}

const blocking = (r: ArticleReport) => r.issues.filter((i) => i.level === "error");
/** Failing = any error now, or any issue that would become an error once the article is published. */
const failsGate = (r: ArticleReport) =>
  r.issues.some((i) => !NOT_FIXABLE_BY_REWRITE.has(i.code) && (i.level === "error" || GATE_CODES.has(i.code))) || hasReviewNotes(r);

function hasReviewNotes(r: ArticleReport): boolean {
  return !!readContent().people.find((p) => p.data.id === r.personId)?.articles[r.locale]?.meta.reviewNotes;
}

async function askClaude(client: Anthropic, person: Person, article: Article, report: ArticleReport): Promise<Revision> {
  const problems = [
    ...report.issues.map((i) => `- ${i.level.toUpperCase()} ${i.code}: ${i.message}`),
    ...(article.meta.reviewNotes ? [`- ERROR fact-check: ${article.meta.reviewNotes}`] : []),
  ].join("\n");
  const sourceDomains = [...new Set(person.data.sources.map((s) => new URL(s.url).hostname))];
  const prompt = [
    read("prompts/05-revise.md").replaceAll("{{SITE_NAME}}", site.name),
    `\n<style_guide>\n${read("docs/style-guide.md")}\n</style_guide>`,
    `\n<person_json>\n${JSON.stringify(person.data, null, 2)}\n</person_json>`,
    `\n<article locale="${article.locale}">\n${fs.readFileSync(article.file, "utf8")}\n</article>`,
    `\n<problems>\n${problems}\n</problems>`,
    `\nToday is ${today()}. Language of the article: ${article.locale}${article.locale === "pt" ? " (Brazilian Portuguese)" : ""}.`,
    `Existing source domains: ${sourceDomains.join(", ")}.`,
    "Cite new facts with [s:id] using either existing source ids or the ids of newSources you add.",
    "Return the full revised article fields as JSON matching the schema. `body` is markdown without frontmatter.",
  ].join("\n");

  return askStructured(client, prompt, revisionSchema, { model: WRITER_MODEL });
}

function apply(person: Person, article: Article, rev: Revision) {
  const existing = new Set(person.data.sources.map((s) => s.id));
  const added = rev.newSources
    .map((s) => sourceSchema.safeParse({ ...s, accessed: s.accessed || today() }))
    .filter((r) => r.success && !existing.has(r.data.id))
    .map((r) => r.data!);
  if (added.length) {
    person.data.sources.push(...added);
    writePerson(path.join(person.dir, "person.json"), person.data);
  }

  const meta = article.meta;
  const next = articleSchema.parse({
    ...meta,
    title: rev.title,
    metaTitle: rev.metaTitle,
    metaDescription: rev.metaDescription,
    knownFor: rev.knownFor,
    summary: rev.summary,
    targetQueries: rev.targetQueries,
    faq: rev.faq,
    updatedAt: today(),
    aiAssisted: true,
    autoRevisions: meta.autoRevisions + 1,
    flag: undefined,
    reviewNotes: undefined,
  });
  // A machine rewrite of a high-risk page is never trusted without a human: take it offline for review.
  if (meta.risk === "high" && meta.status === "published") {
    next.status = "review";
    next.flag = "Auto-revised high-risk article: re-check facts and set status back to published.";
  }
  writeArticle(article.file, next, rev.body);
  return added.length;
}

function giveUp(article: Article, report: ArticleReport) {
  const fresh = readContent().people.find((p) => p.data.id === article.personId)!.articles[article.locale]!;
  const reasons = blocking(report).map((i) => i.code).join(", ") || "quality warnings";
  writeArticle(fresh.file, { ...fresh.meta, status: fresh.meta.status === "published" ? "review" : fresh.meta.status, flag: `Fix loop gave up after ${MAX_ATTEMPTS} attempts: ${reasons}` }, fresh.body);
}

async function main() {
  if (!hasApiKey()) {
    console.log("ANTHROPIC_API_KEY not set; skipping the automatic fix loop.");
    return;
  }
  const client = new Anthropic();
  const { reports } = checkContent(readContent());
  const targets = (
    explicit.length
      ? reports.filter((r) => explicit.includes(`${r.personId}/${r.locale}`))
      : reports.filter((r) => ["published", "approved", "review"].includes(r.status) && failsGate(r) && !readFlag(r))
  ).slice(0, LIMIT);

  const summary: string[] = [];
  for (const target of targets) {
    const key = `${target.personId}/${target.locale}`;
    let report = target;
    let fixed = false;
    let rewrites = 0;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const store = readContent();
      const person = store.people.find((p) => p.data.id === target.personId)!;
      const article = person.articles[target.locale]!;
      console.log(`→ ${key} attempt ${attempt}: ${report.issues.filter((i) => i.level === "error").length} errors`);
      try {
        const rev = await askClaude(client, person, article, report);
        const added = apply(person, article, rev);
        rewrites++;
        console.log(`  rewritten (${added} new sources). ${rev.note}`);
      } catch (e) {
        console.error(`  attempt failed: ${(e as Error).message}`);
        if (isApiUnavailable(e)) throw e;
        continue;
      }
      report = reportFor(target.personId, target.locale)!;
      if (!failsGate(report)) {
        fixed = true;
        break;
      }
    }
    if (fixed) {
      summary.push(`✓ ${key} passes after revision`);
    } else if (!rewrites) {
      // Every attempt was an API or output error, not a bad rewrite: leave it unflagged for the next run.
      summary.push(`! ${key}: no rewrite came back, will retry next run`);
    } else {
      const store = readContent();
      giveUp(store.people.find((p) => p.data.id === target.personId)!.articles[target.locale]!, report);
      summary.push(`⚑ ${key} still fails: flagged for human review`);
    }
  }
  const out = summary.length ? summary.join("\n") : "Nothing to revise.";
  console.log(`\n${out}`);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Fix loop\n\n${out}\n`);
}

/** Articles a human already has to look at are not retried automatically. */
function readFlag(r: ArticleReport): boolean {
  const person = readContent().people.find((p) => p.data.id === r.personId);
  return !!person?.articles[r.locale]?.meta.flag;
}

main().catch(exitOnError("Fix loop"));
