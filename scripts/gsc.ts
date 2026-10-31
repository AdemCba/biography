/**
 * Pulls Search Console data and rewrites the page list in data/seo/focus.md, which the writer
 * works through (pages Google already shows near page one that get few clicks, with the real queries).
 *
 *   GSC_SERVICE_ACCOUNT='<service account JSON>' GSC_SITE=sc-domain:orbivida.com npm run gsc
 *
 * The service account needs read access in Search Console (Settings > Users and permissions).
 * Pages the writer ticked in the last 14 days are kept as they are and not listed again.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const DAYS = 7;
const FOCUS = path.join(process.cwd(), "data", "seo", "focus.md");
const SUMMARY = path.join(process.cwd(), "data", "seo", "summary.md");
const MARKER = "## Pages";
const NOT_ARTICLES = new Set(["about", "contact", "privacy", "terms", "editorial-policy", "search", "category", "editors"]);

type Row = { keys: string[]; clicks: number; impressions: number; ctr: number; position: number };

const b64url = (s: string | Buffer) => Buffer.from(s).toString("base64url");

export async function accessToken(scope = "https://www.googleapis.com/auth/webmasters.readonly"): Promise<string> {
  const key = JSON.parse(process.env.GSC_SERVICE_ACCOUNT ?? "{}") as { client_email?: string; private_key?: string };
  if (!key.client_email || !key.private_key) throw new Error("GSC_SERVICE_ACCOUNT is missing or not a service account JSON key");
  const now = Math.floor(Date.now() / 1000);
  const claims = { iss: key.client_email, scope, aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 };
  const unsigned = `${b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${b64url(JSON.stringify(claims))}`;
  const signature = crypto.createSign("RSA-SHA256").update(unsigned).sign(key.private_key);
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${b64url(signature)}` }),
  });
  if (!res.ok) throw new Error(`token: HTTP ${res.status} ${await res.text()}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

async function query(token: string, site: string, body: object): Promise<Row[]> {
  const res = await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ rowLimit: 25000, dataState: "all", ...body }),
  });
  if (!res.ok) throw new Error(`search analytics: HTTP ${res.status} ${await res.text()}`);
  return ((await res.json()) as { rows?: Row[] }).rows ?? [];
}

/** "https://orbivida.com/de/alexia-putellas/" -> "de/alexia-putellas"; null for non-article pages. */
export function articleKey(url: string): string | null {
  const m = new URL(url).pathname.match(/^\/(en|es|pt|de|fr)\/((?:trending\/)?[^/]+)\/$/);
  if (!m || NOT_ARTICLES.has(m[2]) || m[2] === "trending") return null;
  return `${m[1]}/${m[2]}`;
}

/** Pages ticked by the writer in the last 14 days ("- [x] de/slug ... 2026-10-29"). */
export function recentlyDone(focus: string, today: string): Set<string> {
  const since = new Date(Date.parse(today) - 14 * 86400e3).toISOString().slice(0, 10);
  const done = new Set<string>();
  for (const line of focus.split("\n")) {
    const m = line.match(/^- \[x\] (\S+)/i);
    const date = line.match(/\d{4}-\d{2}-\d{2}/g)?.at(-1);
    if (m && (!date || date >= since)) done.add(m[1]);
  }
  return done;
}

const day = (offset: number) => new Date(Date.now() - offset * 86400e3).toISOString().slice(0, 10);

async function main() {
  const site = process.env.GSC_SITE || "sc-domain:orbivida.com";
  const token = await accessToken();
  const [startDate, endDate] = [day(DAYS), day(0)];
  const rows = await query(token, site, { startDate, endDate, dimensions: ["page", "query"] });
  const daily = await query(token, site, { startDate, endDate, dimensions: ["date"] });

  const pages = new Map<string, { clicks: number; impressions: number; posSum: number; queries: Row[] }>();
  for (const r of rows) {
    const key = articleKey(r.keys[0]);
    if (!key) continue;
    const p = pages.get(key) ?? { clicks: 0, impressions: 0, posSum: 0, queries: [] };
    p.clicks += r.clicks;
    p.impressions += r.impressions;
    p.posSum += r.position * r.impressions;
    p.queries.push(r);
    pages.set(key, p);
  }

  const focus = fs.existsSync(FOCUS) ? fs.readFileSync(FOCUS, "utf8") : `# Search Console focus list\n\n${MARKER}\n`;
  const [head, tail = ""] = focus.split(MARKER);
  const done = recentlyDone(tail, endDate);
  const keep = tail.split("\n").filter((l) => /^- \[x\] /i.test(l) && done.has(l.match(/^- \[x\] (\S+)/i)![1]));

  const picks = [...pages]
    .map(([key, p]) => ({ key, ...p, position: p.posSum / Math.max(p.impressions, 1) }))
    // Close to page one, seen often, rarely clicked: the cheapest clicks to win.
    .filter((p) => p.position >= 3 && p.position <= 20 && p.impressions >= 15 && p.clicks / p.impressions < 0.03 && !done.has(p.key))
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 25);

  const lines = picks.map((p) => {
    const queries = p.queries.sort((a, b) => b.impressions - a.impressions).slice(0, 8).map((q) => q.keys[1]);
    return `- [ ] ${p.key} (${p.impressions} impressions, ${p.clicks} clicks, position ${p.position.toFixed(1)}): ${queries.join(", ")}`;
  });
  const header = head.replace(/^From Search Console.*$/m, `From Search Console, ${startDate} to ${endDate}, updated automatically every day.`);
  fs.mkdirSync(path.dirname(FOCUS), { recursive: true });
  fs.writeFileSync(FOCUS, `${header}${MARKER}\n\n${[...lines, ...keep].join("\n")}\n`);

  const clicks = daily.reduce((s, r) => s + r.clicks, 0);
  const impressions = daily.reduce((s, r) => s + r.impressions, 0);
  fs.writeFileSync(
    SUMMARY,
    [
      `# Search Console, last ${DAYS} days`,
      "",
      `Updated ${endDate}. ${clicks} clicks, ${impressions} impressions.`,
      "",
      "| Day | Clicks | Impressions | CTR | Position |",
      "| --- | --- | --- | --- | --- |",
      ...daily.map((r) => `| ${r.keys[0]} | ${r.clicks} | ${r.impressions} | ${(r.ctr * 100).toFixed(1)}% | ${r.position.toFixed(1)} |`),
      "",
    ].join("\n"),
  );
  console.log(`GSC: ${rows.length} rows, ${picks.length} focus pages, ${clicks} clicks / ${impressions} impressions.`);
}

if (process.argv[1]?.endsWith("gsc.ts")) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
