/**
 * Finds cited sources that no longer open (404/410, dead domain) and writes data/seo/broken-sources.md
 * for the writer, which replaces a few per run. 403/429/5xx are ignored: many news sites block bots or
 * fail briefly, and those links still work for readers.
 */
import fs from "node:fs";
import path from "node:path";
import { getContent } from "../src/lib/content";

const OUT = path.join(process.cwd(), "data/seo/broken-sources.md");
const UA = "Mozilla/5.0 (compatible; OrbividaLinkCheck/1.0; +https://orbivida.com/en/contact/)";

async function status(url: string): Promise<number | "dead"> {
  for (const method of ["HEAD", "GET"] as const) {
    try {
      const res = await fetch(url, { method, redirect: "follow", headers: { "user-agent": UA }, signal: AbortSignal.timeout(15000) });
      if (method === "HEAD" && (res.status === 405 || res.status === 403 || res.status >= 500)) continue;
      return res.status;
    } catch (e) {
      const code = (e as { cause?: { code?: string } }).cause?.code;
      if (code === "ENOTFOUND") return "dead";
      if (method === "GET") return 0;
    }
  }
  return 0;
}

async function main() {
  const { people } = getContent();
  const rows: { person: string; id: string; url: string; code: number | "dead" }[] = [];
  const jobs = people.flatMap((p) => p.data.sources.map((s) => ({ person: p.data.id, id: s.id, url: s.url })));
  let i = 0;
  await Promise.all(
    Array.from({ length: 16 }, async () => {
      while (i < jobs.length) {
        const job = jobs[i++];
        const code = await status(job.url);
        if (code === 404 || code === 410 || code === "dead") rows.push({ ...job, code });
      }
    }),
  );
  // Network trouble on the runner, not dead links: keep the previous list.
  if (rows.length > jobs.length / 3) {
    console.log(`${rows.length} of ${jobs.length} failed, looks like a network problem; not writing the list`);
    return;
  }
  rows.sort((a, b) => a.person.localeCompare(b.person) || a.id.localeCompare(b.id));
  const body = [
    "# Broken sources",
    "",
    `Checked ${jobs.length} cited sources on ${new Date().toISOString().slice(0, 10)}; ${rows.length} no longer open (404/410 or dead domain).`,
    "The writer fixes up to 10 per people run: in content/people/<person>/person.json replace the source with a",
    "working reliable one that backs the same claims (keep the id so citations stay valid, update url, title,",
    "publisher, accessed), or remove the claim and its citation if nothing else backs it. Then delete the row.",
    "",
    "| Person | Source id | Status | URL |",
    "| --- | --- | --- | --- |",
    ...rows.map((r) => `| ${r.person} | ${r.id} | ${r.code} | ${r.url} |`),
    "",
  ].join("\n");
  fs.writeFileSync(OUT, body);
  console.log(`${rows.length} broken of ${jobs.length}`);
}

main();
