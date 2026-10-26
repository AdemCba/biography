import type { MetadataRoute } from "next";
import { absoluteUrl, site } from "@/config/site";
import { HREFLANG, type Locale } from "@/i18n/config";
import { categoryPath, editorPath, getContent, lastModified, livePeople, personPath } from "@/lib/content";
import { categoryAlternates, personAlternates } from "@/lib/seo";

export const dynamic = "force-static";

function languages(paths: Partial<Record<Locale, string>>) {
  return Object.fromEntries(Object.entries(paths).map(([l, p]) => [HREFLANG[l as Locale], absoluteUrl(p!)]));
}

/**
 * Rebuilt on every deploy. Accurate <lastmod> per page is what makes Google recrawl updated
 * biographies quickly; we never bump it for pages that did not change.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const store = getContent();
  const entries: MetadataRoute.Sitemap = [];
  const homeAlternates = Object.fromEntries(site.locales.map((l) => [l, `/${l}/`]));

  for (const locale of site.locales) {
    const live = livePeople(locale, store);
    const newest = live.map((x) => lastModified(x.article.meta)).sort().at(-1);
    entries.push({ url: absoluteUrl(`/${locale}/`), lastModified: newest, alternates: { languages: languages(homeAlternates) } });

    for (const { person, article } of live) {
      if (article.meta.noindex) continue;
      entries.push({
        url: absoluteUrl(personPath(locale, article.meta.slug)),
        lastModified: lastModified(article.meta),
        alternates: { languages: languages(personAlternates(person)) },
      });
    }

    for (const category of store.categories) {
      const tr = category.i18n[locale];
      if (!tr) continue;
      const members = live.filter((x) => x.person.data.categories.includes(category.id));
      if (members.length < 3) continue; // thin category pages are noindex; keep them out of the sitemap too
      entries.push({
        url: absoluteUrl(categoryPath(locale, tr.slug)),
        lastModified: members.map((x) => lastModified(x.article.meta)).sort().at(-1),
        alternates: { languages: languages(categoryAlternates(category)) },
      });
    }

    for (const editor of store.editors) {
      if (editor.i18n[locale]) entries.push({ url: absoluteUrl(editorPath(locale, editor.id)) });
    }
    for (const p of ["about", "editorial-policy", "contact", "privacy", "terms"]) entries.push({ url: absoluteUrl(`/${locale}/${p}/`) });
  }
  return entries;
}
