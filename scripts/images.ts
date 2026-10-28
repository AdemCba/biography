/**
 * Adds a freely licensed photo to every person and trending topic that has none.
 *
 *   npm run images                  -> every person and topic without an image
 *   npm run images -- usain-bolt
 *
 * The photo is the person's Wikidata image (P18) on Wikimedia Commons. Only free licenses are used
 * (CC0, public domain, CC BY, CC BY-SA); NC/ND or unknown licenses are skipped, never guessed. The file
 * is saved to public/images/people/<id>.<ext> and person.json gets the credit, license and source page,
 * which the biography page prints under the photo as the license requires.
 *
 * Topics use the photo of their `wikidata` item (or of the first person they link) and are saved to
 * public/images/topics/<id>.<ext>. Photos are 1200 px wide, the minimum Google Discover wants for large previews.
 */
import fs from "node:fs";
import path from "node:path";
import { readContent } from "../src/lib/content";
import { writePerson } from "../src/lib/article-file";
import { USER_AGENT } from "./trends/config";

const WIDTH = 1200;
const IMAGES_DIR = path.join(process.cwd(), "public", "images");
const FREE_LICENSE = /^(cc0|cc[ -]by(-sa)?( \d(\.\d)?)?|public domain|pd\b)/i;

async function getJson<T>(url: string): Promise<T | null> {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } });
  return res.ok ? ((await res.json()) as T) : null;
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isFreeLicense(name: string): boolean {
  return FREE_LICENSE.test(name.trim()) && !/\b(nc|nd)\b/i.test(name);
}

async function wikidataId(name: string): Promise<string | null> {
  const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=en&type=item&limit=1&search=${encodeURIComponent(name)}`;
  const data = await getJson<{ search?: { id: string }[] }>(url);
  return data?.search?.[0]?.id ?? null;
}

async function commonsFile(qid: string): Promise<string | null> {
  type Entity = { claims?: { P18?: { mainsnak: { datavalue?: { value: string } } }[] } };
  const data = await getJson<{ entities: Record<string, Entity> }>(`https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`);
  return data?.entities?.[qid]?.claims?.P18?.[0]?.mainsnak.datavalue?.value ?? null;
}

interface ImageInfo {
  thumburl: string;
  descriptionurl: string;
  extmetadata?: Record<string, { value: string } | undefined>;
}

async function imageInfo(file: string): Promise<ImageInfo | null> {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=${WIDTH}&titles=${encodeURIComponent(`File:${file}`)}`;
  const data = await getJson<{ query?: { pages?: Record<string, { imageinfo?: ImageInfo[] }> } }>(url);
  const page = Object.values(data?.query?.pages ?? {})[0];
  return page?.imageinfo?.[0] ?? null;
}

type Photo = { src: string; alt: string; credit: string; license: string; sourceUrl: string };

/** Downloads the Commons photo of a Wikidata item to public/images/<kind>/<id>.<ext>; a string is the reason it did not. */
async function fetchPhoto(qid: string | null, kind: "people" | "topics", id: string, alt: string): Promise<Photo | string> {
  const file = qid && (await commonsFile(qid));
  if (!file) return "no Wikidata/Commons photo";
  const info = await imageInfo(file);
  const meta = info?.extmetadata ?? {};
  const license = stripHtml(meta.LicenseShortName?.value ?? "");
  if (!info || !isFreeLicense(license)) return `skipped ${file} (license "${license || "unknown"}")`;
  const credit = stripHtml(meta.Artist?.value ?? "") || "Wikimedia Commons";
  const ext = path.extname(new URL(info.thumburl).pathname).toLowerCase() || ".jpg";
  const res = await fetch(info.thumburl, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`download failed: ${res.status}`);
  const dir = path.join(IMAGES_DIR, kind);
  fs.mkdirSync(dir, { recursive: true });
  for (const old of fs.readdirSync(dir).filter((f) => f.startsWith(`${id}.`))) fs.rmSync(path.join(dir, old));
  fs.writeFileSync(path.join(dir, `${id}${ext}`), Buffer.from(await res.arrayBuffer()));
  return { src: `/images/${kind}/${id}${ext}`, alt, credit: credit.slice(0, 200), license, sourceUrl: info.descriptionurl };
}

async function main() {
  const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const store = readContent();
  const log: string[] = [];

  for (const person of store.people) {
    const data = person.data;
    if (only.length ? !only.includes(data.id) : !!data.image) continue;
    try {
      const qid = data.wikidata ?? (await wikidataId(data.name));
      const photo = await fetchPhoto(qid, "people", data.id, data.name);
      if (typeof photo === "string") {
        log.push(`- ${data.id}: ${photo}`);
        continue;
      }
      writePerson(path.join(person.dir, "person.json"), { ...data, wikidata: qid ?? undefined, image: photo });
      log.push(`✓ ${data.id}: ${photo.sourceUrl} (${photo.license}, ${photo.credit})`);
    } catch (e) {
      log.push(`! ${data.id}: ${(e as Error).message}`);
    }
  }

  for (const topic of store.topics) {
    const data = topic.data;
    if (only.length ? !only.includes(data.id) : !!data.image) continue;
    try {
      const person = store.people.find((p) => p.data.id === data.people[0])?.data;
      const qid = data.wikidata ?? person?.wikidata ?? null;
      const title = topic.articles.en?.meta.title ?? Object.values(topic.articles)[0]?.meta.title ?? data.id;
      const photo = await fetchPhoto(qid, "topics", data.id, person?.name ?? title);
      if (typeof photo === "string") {
        log.push(`- trending/${data.id}: ${photo}`);
        continue;
      }
      writePerson(path.join(topic.dir, "topic.json"), { ...data, image: photo } as never);
      log.push(`✓ trending/${data.id}: ${photo.sourceUrl} (${photo.license}, ${photo.credit})`);
    } catch (e) {
      log.push(`! trending/${data.id}: ${(e as Error).message}`);
    }
  }
  const out = log.length ? log.join("\n") : "Every person and topic already has a photo.";
  console.log(out);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Photos\n\n${out}\n`);
}

if (process.argv[1]?.endsWith("images.ts")) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
