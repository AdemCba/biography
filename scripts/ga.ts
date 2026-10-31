/**
 * Pulls Google Analytics 4 numbers for the last 7 days into data/seo/analytics.md: totals, countries,
 * languages and the most-read pages with how long people stay. The writer and editors use it to see
 * which kinds of pages people actually read, not only which ones Google shows.
 *
 *   GSC_SERVICE_ACCOUNT='<service account JSON>' GA_PROPERTY_ID=123456789 npm run ga
 *
 * Uses the same service account as Search Console; it needs Viewer access on the GA4 property and the
 * "Google Analytics Data API" enabled in its Google Cloud project.
 */
import fs from "node:fs";
import path from "node:path";
import { accessToken } from "./gsc";

const OUT = path.join(process.cwd(), "data", "seo", "analytics.md");
type Report = { rows?: { dimensionValues?: { value: string }[]; metricValues: { value: string }[] }[] };

async function report(token: string, property: string, body: object): Promise<Report> {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${property}:runReport`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ dateRanges: [{ startDate: "7daysAgo", endDate: "yesterday" }], ...body }),
  });
  if (!res.ok) throw new Error(`analytics: HTTP ${res.status} ${await res.text()}`);
  return (await res.json()) as Report;
}

const n = (v: string) => Math.round(Number(v)).toLocaleString("en-US");
const secs = (v: string) => `${Math.round(Number(v))}s`;

async function main() {
  const property = process.env.GA_PROPERTY_ID;
  if (!property) throw new Error("GA_PROPERTY_ID is missing");
  const token = await accessToken("https://www.googleapis.com/auth/analytics.readonly");
  const metric = (name: string) => ({ name });

  const [daily, countries, pages, sources] = await Promise.all([
    report(token, property, {
      dimensions: [{ name: "date" }],
      metrics: ["activeUsers", "sessions", "screenPageViews", "userEngagementDuration"].map(metric),
      orderBys: [{ dimension: { dimensionName: "date" } }],
    }),
    report(token, property, {
      dimensions: [{ name: "country" }],
      metrics: ["activeUsers", "screenPageViews"].map(metric),
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 12,
    }),
    report(token, property, {
      dimensions: [{ name: "pagePath" }],
      metrics: ["screenPageViews", "activeUsers", "userEngagementDuration"].map(metric),
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 30,
    }),
    report(token, property, {
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: ["sessions"].map(metric),
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 8,
    }),
  ]);

  const day = (d: string) => `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}`;
  const views = (daily.rows ?? []).reduce((s, r) => s + Number(r.metricValues[2].value), 0);
  const lines = [
    "# Google Analytics, last 7 days",
    "",
    `Updated ${new Date().toISOString().slice(0, 10)}. ${n(String(views))} page views.`,
    "",
    "| Day | Users | Sessions | Page views | Engaged time per user |",
    "| --- | --- | --- | --- | --- |",
    ...(daily.rows ?? []).map((r) => {
      const [users, sessions, pv, eng] = r.metricValues.map((m) => m.value);
      return `| ${day(r.dimensionValues![0].value)} | ${n(users)} | ${n(sessions)} | ${n(pv)} | ${secs(String(Number(eng) / Math.max(Number(users), 1)))} |`;
    }),
    "",
    "## Where visitors come from",
    "",
    "| Channel | Sessions |",
    "| --- | --- |",
    ...(sources.rows ?? []).map((r) => `| ${r.dimensionValues![0].value} | ${n(r.metricValues[0].value)} |`),
    "",
    "## Countries",
    "",
    "| Country | Users | Page views |",
    "| --- | --- | --- |",
    ...(countries.rows ?? []).map((r) => `| ${r.dimensionValues![0].value} | ${n(r.metricValues[0].value)} | ${n(r.metricValues[1].value)} |`),
    "",
    "## Most-read pages",
    "",
    "| Page | Views | Users | Engaged time per user |",
    "| --- | --- | --- | --- |",
    ...(pages.rows ?? []).map((r) => {
      const [pv, users, eng] = r.metricValues.map((m) => m.value);
      return `| ${r.dimensionValues![0].value} | ${n(pv)} | ${n(users)} | ${secs(String(Number(eng) / Math.max(Number(users), 1)))} |`;
    }),
    "",
  ];
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, lines.join("\n"));
  console.log(`GA: ${views} page views in 7 days, ${(pages.rows ?? []).length} top pages.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
