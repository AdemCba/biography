/**
 * What people actually type into Google about a name, per site language (Google autocomplete).
 *
 *   npm run -s suggest -- "Arda Güler"
 *
 * The writer turns these into FAQ entries and targetQueries instead of guessing generic questions.
 * Autocomplete reflects real search volume per country, so each language gets its own questions.
 */
import { USER_AGENT } from "./trends/config";

const MARKETS = [
  { locale: "en", hl: "en", gl: "US" },
  { locale: "es", hl: "es", gl: "MX" },
  { locale: "pt", hl: "pt-BR", gl: "BR" },
  { locale: "de", hl: "de", gl: "DE" },
  { locale: "fr", hl: "fr", gl: "FR" },
];

async function complete(q: string, hl: string, gl: string): Promise<string[]> {
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=${hl}&gl=${gl}&q=${encodeURIComponent(q)}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) return [];
    const data = (await res.json()) as [string, string[]];
    return data[1] ?? [];
  } catch {
    return [];
  }
}

async function main() {
  const name = process.argv.slice(2).join(" ").trim();
  if (!name) throw new Error('Usage: npm run -s suggest -- "Name"');
  for (const m of MARKETS) {
    // "<name> " gives the most searched follow-ups; a few letters widen it past the top 10.
    const lists = await Promise.all(["", "a", "e", "s"].map((x) => complete(`${name} ${x}`, m.hl, m.gl)));
    const all = [...new Set(lists.flat().map((s) => s.toLowerCase()))].filter((s) => s !== name.toLowerCase());
    console.log(`${m.locale}: ${all.slice(0, 15).join(" | ") || "(none)"}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
