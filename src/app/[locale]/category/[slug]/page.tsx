import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { absoluteUrl, site } from "@/config/site";
import { HREFLANG } from "@/i18n/config";
import { CATEGORY_INTRO } from "@/i18n/categoryIntro";
import { ageOn, countryName } from "@/lib/markdown";
import type { Person } from "@/lib/content";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { PersonCard } from "@/components/PersonCard";
import { categoryPath, getContent, livePeople, personPath, PLACEHOLDER_PARAM, withPlaceholder } from "@/lib/content";
import { categoryAlternates, MIN_CATEGORY_PEOPLE, pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  // Only categories with at least one live biography get a page; empty pages are thin content.
  return withPlaceholder(site.locales.flatMap((locale) => {
    const live = livePeople(locale);
    return getContent()
      .categories.filter((c) => c.i18n[locale] && live.some((x) => x.person.data.categories.includes(c.id)))
      .map((c) => ({ locale, slug: c.i18n[locale]!.slug }));
  }), { locale: site.defaultLocale, slug: PLACEHOLDER_PARAM });
}

function find(locale: Locale, slug: string) {
  const store = getContent();
  const category = store.categories.find((c) => c.i18n[locale]?.slug === slug);
  if (!category) return undefined;
  const live = livePeople(locale, store);
  const people = live.filter((x) => x.person.data.categories.includes(category.id));
  const parent = category.parent ? store.categories.find((c) => c.id === category.parent && c.i18n[locale]) : undefined;
  // Subcategory links shown on a parent page: only ones with enough people to be indexable.
  const subcategories = store.categories
    .filter((c) => c.parent === category.id && c.i18n[locale])
    .map((c) => ({ c, count: live.filter((x) => x.person.data.categories.includes(c.id)).length }))
    .filter((x) => x.count >= MIN_CATEGORY_PEOPLE)
    .sort((a, b) => b.count - a.count);
  return { category, t: category.i18n[locale]!, people, parent, subcategories };
}

export async function generateMetadata({ params }: PageProps<"/[locale]/category/[slug]">): Promise<Metadata> {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  const found = find(locale, slug);
  if (!found) return {};
  return pageMetadata({
    locale,
    title: found.t.name,
    description: found.t.metaDescription ?? found.t.description,
    path: categoryPath(locale, slug),
    alternates: categoryAlternates(found.category),
    // Empty or near-empty category pages are thin content: keep them out of the index until they grow.
    noindex: found.people.length < MIN_CATEGORY_PEOPLE,
  });
}

function list(items: string[], and: string): string {
  return items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} ${and} ${items.at(-1)}`;
}

/** Real numbers about the people in a category: count, best-sourced names, countries, age range, sources. */
function intro(locale: Locale, name: string, people: { person: Person }[]): string {
  const t = CATEGORY_INTRO[locale];
  const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));
  const fmt = new Intl.NumberFormat(locale);
  const top = [...people].sort((a, b) => b.person.data.sources.length - a.person.data.sources.length).slice(0, 4).map((x) => x.person.data.name);
  const counts = new Map<string, number>();
  for (const { person } of people) for (const c of person.data.facts.nationality?.value ?? []) counts.set(c, (counts.get(c) ?? 0) + 1);
  const countries = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c]) => countryName(c, locale));
  const today = new Date().toISOString().slice(0, 10);
  const ages = people
    .map(({ person }) => person.data.facts.birthDate?.value)
    .filter((d): d is string => !!d)
    .map((d) => ageOn(d, today));
  const parts = [fill(t.lead, { count: fmt.format(people.length), name })];
  if (top.length > 1) parts.push(fill(t.top, { names: list(top, t.and) }));
  if (countries.length) parts.push(fill(t.from, { countries: list(countries, t.and) }) + (ages.length > 1 ? fill(t.ages, { min: Math.min(...ages), max: Math.max(...ages) }) : ""));
  parts.push(fill(t.sources, { sources: fmt.format(people.reduce((n, x) => n + x.person.data.sources.length, 0)) }));
  return parts.join(" ");
}

export default async function CategoryPage({ params }: PageProps<"/[locale]/category/[slug]">) {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  const found = find(locale, slug);
  if (!found) notFound();
  const t = getDictionary(locale);
  const url = absoluteUrl(categoryPath(locale, slug));
  const crumbs = [
    { name: t.nav.home, path: `/${locale}/` },
    ...(found.parent ? [{ name: found.parent.i18n[locale]!.name, path: categoryPath(locale, found.parent.i18n[locale]!.slug) }] : []),
    { name: found.t.name, path: categoryPath(locale, slug) },
  ];
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": url,
      url,
      name: found.t.name,
      description: found.t.description,
      inLanguage: HREFLANG[locale],
      isPartOf: { "@id": `${site.url}/#website` },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: found.people.length,
        itemListElement: found.people.slice(0, 50).map(({ person, article }, i) => ({ "@type": "ListItem", position: i + 1, name: person.data.name, url: absoluteUrl(personPath(locale, article.meta.slug)) })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: absoluteUrl(c.path) })),
    },
  ];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb" className="pt-6 text-sm text-muted">
        <Link href={`/${locale}/`} className="hover:text-ink">{t.nav.home}</Link> /{" "}
        {found.parent && (
          <>
            <Link href={categoryPath(locale, found.parent.i18n[locale]!.slug)} className="hover:text-ink">{found.parent.i18n[locale]!.name}</Link> /{" "}
          </>
        )}
        <span aria-current="page">{found.t.name}</span>
      </nav>
      <header className="py-8">
        <h1 className="text-4xl font-semibold">{found.t.name}</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted">{found.t.description}</p>
        {found.people.length > 0 && <p className="mt-3 max-w-2xl text-muted">{intro(locale, found.t.name, found.people)}</p>}
        {found.subcategories.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-2 text-sm">
            {found.subcategories.map(({ c, count }) => (
              <li key={c.id}>
                <Link href={categoryPath(locale, c.i18n[locale]!.slug)} className="rounded-full border border-line px-3 py-1 hover:text-ink">
                  {c.i18n[locale]!.name} ({count})
                </Link>
              </li>
            ))}
          </ul>
        )}
      </header>
      <h2 className="sr-only">{t.category.people}</h2>
      {found.people.length ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {found.people.map(({ person, article }) => (
            <li key={person.data.id}>
              <PersonCard person={person} article={article} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted">{t.category.empty}</p>
      )}
    </>
  );
}
