/**
 * Quality gate. Runs before every build and in CI.
 *   npm run check            -> report (never fails; failing articles are left out of the build)
 *   npm run check -- --strict -> exit 1 if a published article or a shared file has errors (CI)
 *   npm run check -- --json  -> machine-readable report (used by the fix loop)
 */
import path from "node:path";
import { readContent } from "../src/lib/content";
import { allIssues, checkContent } from "../src/lib/quality";

const store = readContent();
const result = checkContent(store);
const issues = allIssues(result);

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(result, null, 2));
} else {
  const rel = (f?: string) => (f ? path.relative(process.cwd(), f) : "");
  for (const r of result.reports) {
    const errors = r.issues.filter((i) => i.level === "error").length;
    const mark = errors ? "✗" : "✓";
    console.log(`${mark} ${r.topic ? "trending/" : ""}${r.personId}/${r.locale}  [${r.status}]  ${r.words} words, ${r.citations} citations, style ${r.styleScore}`);
    for (const i of r.issues) console.log(`    ${i.level === "error" ? "ERROR" : "warn "} ${i.code}: ${i.message}`);
  }
  for (const i of result.issues) console.log(`${i.level === "error" ? "ERROR" : "warn "} ${i.code}: ${i.message} ${rel(i.file)}`);
}

const errors = issues.filter((i) => i.level === "error");
const live = result.reports.filter((r) => r.status === "published");
const blocked = live.filter((r) => r.issues.some((i) => i.level === "error"));
console.error(
  `\n${result.reports.length} articles, ${live.length} marked published, ${blocked.length} blocked by the quality gate, ${errors.length} errors total.`,
);
// Blocked articles are already excluded from the build; --strict (CI) makes sure someone fixes them.
// Drafts may be broken while they are being written; only live content and shared files are enforced.
const globalErrors = result.issues.filter((i) => i.level === "error");
if (process.argv.includes("--strict") && (blocked.length || globalErrors.length)) process.exit(1);
