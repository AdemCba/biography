// Where and how the trend scanner looks. Tuned for the launch locales.

export const USER_AGENT =
  "OrbividaTrendScanner/0.1 (https://github.com/AdemCba/biography; editorial research)";

/** Google Trends geos to scan, mapped to the Wikipedia language that best covers them. */
export const GEOS: { geo: string; wiki: string }[] = [
  { geo: "US", wiki: "en" },
  { geo: "GB", wiki: "en" },
  { geo: "ES", wiki: "es" },
  { geo: "MX", wiki: "es" },
  { geo: "AR", wiki: "es" },
  { geo: "BR", wiki: "pt" },
  { geo: "PT", wiki: "pt" },
  { geo: "DE", wiki: "de" },
  { geo: "AT", wiki: "de" },
  { geo: "FR", wiki: "fr" },
];

/** Wikipedias whose daily top-viewed list we also scan for spikes. */
export const WIKIS = ["en", "es", "pt", "de", "fr"];

/** How many entries of each Wikipedia top list to consider. */
export const WIKI_TOP_N = 150;

export const MIN_AGE = 18;
/** A person needs at least this many Wikipedia language editions to count as notable. */
export const MIN_SITELINKS = 5;
/** Views on the latest day divided by the median of the 7 days before. */
export const MIN_SPIKE = 2;
/** At most this many new people get scaffolded per run. */
export const DEFAULT_SCAFFOLD = 5;

/**
 * Words in trend news headlines that suggest the person is in the news as a
 * victim or suspect of a crime, or for a tragedy. Such candidates are dropped.
 */
export const SENSITIVE_NEWS_WORDS = [
  // en
  "killed", "murder", "murdered", "victim", "shooting", "stabbed", "abuse", "assault", "arrested", "charged", "suicide", "missing", "kidnapped", "rape",
  // es
  "asesinato", "asesinado", "asesinada", "víctima", "victima", "tiroteo", "apuñalado", "abuso", "detenido", "detenida", "desaparecido", "desaparecida", "secuestro", "suicidio", "violación",
  // pt
  "assassinato", "assassinado", "assassinada", "vítima", "tiroteio", "esfaqueado", "preso", "presa", "desaparecido", "sequestro", "suicídio", "estupro",
  // de
  "mord", "ermordet", "opfer", "schüsse", "erstochen", "missbrauch", "festgenommen", "verhaftet", "vermisst", "entführt", "suizid", "vergewaltigung",
  // fr
  "meurtre", "assassiné", "assassinée", "victime", "fusillade", "poignardé", "abus", "arrêté", "arrêtée", "disparu", "disparue", "enlèvement", "suicide", "viol",
];

/**
 * Wikidata occupations (English labels, matched as substrings) mapped to site
 * category ids from content/categories.json. First match wins.
 */
export const CATEGORY_RULES: { category: string; words: string[] }[] = [
  { category: "athletes", words: ["footballer", "football player", "soccer", "tennis", "basketball", "athlete", "cyclist", "boxer", "racing driver", "swimmer", "golfer", "baseball", "cricketer", "volleyball", "handball", "martial artist", "wrestler", "skier", "runner", "sprinter", "rugby", "ice hockey", "coach", "association football manager"] },
  { category: "business", words: ["entrepreneur", "businessperson", "business executive", "chief executive", "investor", "industrialist", "banker", "founder", "economist"] },
  { category: "creators", words: ["youtuber", "influencer", "streamer", "podcaster", "content creator", "blogger", "tiktoker", "internet celebrity"] },
  { category: "artists", words: ["actor", "actress", "singer", "musician", "rapper", "songwriter", "composer", "film director", "painter", "writer", "novelist", "poet", "dancer", "comedian", "model", "record producer", "disc jockey", "screenwriter", "television presenter"] },
];
