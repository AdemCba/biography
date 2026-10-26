/**
 * Tells Bing, Yandex, Seznam, Naver (IndexNow) which URLs are new or changed in this deploy.
 * Google does not use IndexNow; it reads the sitemap we keep accurate instead.
 *
 *   tsx scripts/indexnow.ts --old previous-sitemap.xml --new out/sitemap.xml
 *
 * The diff of the previous live sitemap and the freshly built one catches new articles, edited
 * articles (lastmod moved) and scheduled articles whose publish date just arrived.
 */
import fs from "node:fs";
import { site } from "../src/config/site";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

export function parseSitemap(xml: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const block of xml.split("<url>").slice(1)) {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
    if (loc) out.set(loc.trim(), block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]?.trim() ?? "");
  }
  return out;
}

export function changedUrls(oldXml: string, newXml: string): string[] {
  const before = parseSitemap(oldXml);
  return [...parseSitemap(newXml)].filter(([url, lastmod]) => before.get(url) !== lastmod).map(([url]) => url);
}

async function main() {
  const key = process.env.INDEXNOW_KEY;
  const newFile = arg("new") ?? "out/sitemap.xml";
  const oldFile = arg("old");
  if (!key) {
    console.log("INDEXNOW_KEY not set; skipping IndexNow.");
    return;
  }
  const oldXml = oldFile && fs.existsSync(oldFile) ? fs.readFileSync(oldFile, "utf8") : "";
  const urls = changedUrls(oldXml, fs.readFileSync(newFile, "utf8"));
  if (!urls.length) {
    console.log("IndexNow: no changed URLs.");
    return;
  }
  const host = new URL(site.url).host;
  // The API accepts up to 10,000 URLs per request.
  for (let i = 0; i < urls.length; i += 10000) {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host, key, keyLocation: `${site.url}/${key}.txt`, urlList: urls.slice(i, i + 10000) }),
    });
    console.log(`IndexNow: submitted ${Math.min(10000, urls.length - i)} URLs, HTTP ${res.status}`);
  }
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### IndexNow\n\n${urls.map((u) => `- ${u}`).join("\n")}\n`);
  }
}

if (process.argv[1]?.endsWith("indexnow.ts")) {
  main().catch((e) => {
    // Never fail a deploy because a ping failed.
    console.error("IndexNow failed:", e);
  });
}
