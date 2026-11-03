import type { Metadata } from "next";
import { absoluteUrl, site } from "@/config/site";
import { HREFLANG, OG_LOCALE, type Locale } from "@/i18n/config";
import { categoryPath, editorPath, getContent, isoDateTime, lastModified, liveArticle, livePeople, personPath, type Article, type Person } from "./content";
import { fillAge } from "./markdown";
import type { Category, Editor } from "./schema";

/** hreflang map for a set of locale -> path pairs, with x-default pointing at English when present. */
export function languageAlternates(paths: Partial<Record<Locale, string>>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const locale of site.locales) {
    const p = paths[locale];
    if (p) out[HREFLANG[locale]] = absoluteUrl(p);
  }
  const fallback = paths.en ?? Object.values(paths)[0];
  if (fallback && Object.keys(out).length > 1) out["x-default"] = absoluteUrl(fallback);
  return out;
}

/** Only languages where this person is actually published take part in hreflang. */
export function personAlternates(person: Person): Partial<Record<Locale, string>> {
  const paths: Partial<Record<Locale, string>> = {};
  for (const locale of site.locales) {
    const a = liveArticle(person, locale);
    if (a) paths[locale] = personPath(locale, a.meta.slug);
  }
  return paths;
}

/** Below this many live people a category page is thin: noindex, not in the sitemap, no hreflang to it. */
export const MIN_CATEGORY_PEOPLE = 3;

/** Language versions of a category page that exist and are indexable (never point hreflang at a 404 or noindex page). */
export function categoryAlternates(category: Category): Partial<Record<Locale, string>> {
  const store = getContent();
  const paths: Partial<Record<Locale, string>> = {};
  for (const locale of site.locales) {
    const t = category.i18n[locale];
    const members = livePeople(locale, store).filter((x) => x.person.data.categories.includes(category.id)).length;
    if (t && members >= MIN_CATEGORY_PEOPLE) paths[locale] = categoryPath(locale, t.slug);
  }
  return paths;
}

export function pageMetadata(opts: {
  locale: Locale;
  title: string;
  description: string;
  path: string;
  alternates: Partial<Record<Locale, string>>;
  image?: string;
  type?: "website" | "article" | "profile";
  noindex?: boolean;
}): Metadata {
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: absoluteUrl(opts.path), languages: languageAlternates(opts.alternates) },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url: absoluteUrl(opts.path),
      siteName: site.name,
      locale: OG_LOCALE[opts.locale],
      type: opts.type ?? "website",
      images: [{ url: absoluteUrl(opts.image ?? DEFAULT_SHARE_IMAGE) }],
    },
    twitter: { card: "summary_large_image", title: opts.title, description: opts.description },
    // Large previews make pages eligible for Google Discover and image-rich results.
    robots: opts.noindex
      ? { index: false, follow: true }
      : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  };
}

/** Shown when a page has no photo of its own (link previews, Discover). */
export const DEFAULT_SHARE_IMAGE = "/og-default.png";
export const LOGO = "/logo-512.png";

const FOUNDER_ID = "editor-in-chief";
const ORG_DESCRIPTION = "Source-checked biographies of online creators, actors and other public figures in five languages.";

/** A writer or reviewer as a schema.org Person with a stable @id, so every page points at the same entity. */
export function editorJsonLd(editor: Editor, locale: Locale) {
  const t = editor.i18n[locale] ?? editor.i18n.en;
  const automated = editor.id !== FOUNDER_ID && editor.sameAs.length === 0 && !editor.image;
  return {
    "@type": automated ? "Organization" : "Person",
    "@id": `${site.url}/#editor-${editor.id}`,
    name: editor.name,
    url: absoluteUrl(editorPath(locale, editor.id)),
    ...(automated
      ? {}
      : { jobTitle: t?.role, image: editor.image ? absoluteUrl(editor.image) : undefined, sameAs: editor.sameAs.length ? editor.sameAs : undefined, worksFor: { "@id": `${site.url}/#organization` }, knowsAbout: ["Biographies", "Online creators", "Film and television actors", "Fact-checking"] }),
  };
}

/** Site-wide identity for Google: the brand, its logo and the site search. */
export function siteJsonLd(locale: Locale) {
  const founder = getContent().editors.find((e) => e.id === FOUNDER_ID);
  const org = {
    "@type": "Organization",
    "@id": `${site.url}/#organization`,
    name: site.name,
    url: site.url,
    logo: { "@type": "ImageObject", url: absoluteUrl(LOGO), width: 512, height: 512 },
    description: ORG_DESCRIPTION,
    founder: founder ? editorJsonLd(founder, locale) : undefined,
    publishingPrinciples: absoluteUrl(`/${locale}/editorial-policy/`),
    correctionsPolicy: absoluteUrl(`/${locale}/editorial-policy/`),
    ethicsPolicy: absoluteUrl(`/${locale}/editorial-policy/`),
    contactPoint: { "@type": "ContactPoint", contactType: "editorial", email: site.contactEmail, url: absoluteUrl(`/${locale}/contact/`), availableLanguage: site.locales.map((l) => HREFLANG[l]) },
  };
  return [
    { "@context": "https://schema.org", ...org },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      name: site.name,
      url: absoluteUrl(`/${locale}/`),
      inLanguage: HREFLANG[locale],
      publisher: { "@id": `${site.url}/#organization` },
    },
  ];
}

export function personJsonLd(person: Person, article: Article, crumbs: { name: string; path: string }[]) {
  const { data } = person;
  const editors = getContent().editors;
  const author = editors.find((e) => e.id === article.meta.author);
  const reviewer = editors.find((e) => e.id === article.meta.reviewer);
  const url = absoluteUrl(personPath(article.locale, article.meta.slug));
  const sameAs = [...data.sameAs, ...(data.wikidata ? [`https://www.wikidata.org/wiki/${data.wikidata}`] : [])];
  return [
    {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      "@id": url,
      url,
      name: fillAge(article.meta.metaTitle ?? article.meta.title, data.facts.birthDate?.value, data.facts.deathDate?.value, new Date().toISOString().slice(0, 10)),
      inLanguage: HREFLANG[article.locale],
      datePublished: isoDateTime(article.meta.publishedAt),
      dateModified: isoDateTime(lastModified(article.meta)),
      publisher: { "@type": "Organization", "@id": `${site.url}/#organization`, name: site.name, url: site.url, logo: { "@type": "ImageObject", url: absoluteUrl(LOGO) } },
      author: author ? editorJsonLd(author, article.locale) : undefined,
      reviewedBy: reviewer ? editorJsonLd(reviewer, article.locale) : undefined,
      lastReviewed: article.meta.reviewedAt ?? undefined,
      isPartOf: { "@id": `${site.url}/#website` },
      citation: data.sources.length ? data.sources.slice(0, 10).map((src) => src.url) : undefined,
      mainEntity: {
        "@type": "Person",
        name: data.name,
        description: article.meta.knownFor,
        birthDate: data.facts.birthDate?.value,
        deathDate: data.facts.deathDate?.value,
        birthPlace: data.facts.birthPlace ? { "@type": "Place", name: data.facts.birthPlace.value } : undefined,
        nationality: data.facts.nationality?.value.map((c) => ({ "@type": "Country", name: c })),
        image: data.image ? absoluteUrl(data.image.src) : undefined,
        sameAs: sameAs.length ? sameAs : undefined,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: absoluteUrl(c.path) })),
    },
  ];
}
