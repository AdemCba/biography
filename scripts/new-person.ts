/**
 * Scaffolds a new biography folder.
 *   npm run new -- "Kylian Mbappé" athletes en,es,fr
 */
import fs from "node:fs";
import path from "node:path";
import { PEOPLE_DIR } from "../src/lib/content";
import { writeArticle, writePerson } from "../src/lib/article-file";
import { slugify } from "../src/lib/slug";
import { isLocale } from "../src/i18n/config";
import { personSchema } from "../src/lib/schema";

const [name, category = "athletes", locales = "en"] = process.argv.slice(2);
if (!name) {
  console.error('Usage: npm run new -- "Full Name" <category> <en,es,...>');
  process.exit(1);
}
const id = slugify(name);
const dir = path.join(PEOPLE_DIR, id);
if (fs.existsSync(dir)) {
  console.error(`${dir} already exists`);
  process.exit(1);
}
fs.mkdirSync(dir, { recursive: true });
writePerson(path.join(dir, "person.json"), personSchema.parse({ id, name, categories: [category], sources: [], facts: {} }));
for (const locale of locales.split(",").filter(isLocale)) {
  writeArticle(
    path.join(dir, `${locale}.md`),
    { title: name, slug: id, status: "idea", risk: "medium", targetQueries: [] },
    "<!-- Follow prompts/01-research.md, then prompts/02-draft.md. Cite each fact with its source id in square brackets, prefixed by 's:'. -->",
  );
}
console.log(`Created ${path.relative(process.cwd(), dir)}`);
