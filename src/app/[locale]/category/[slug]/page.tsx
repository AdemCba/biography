import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { site } from "@/config/site";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { PersonCard } from "@/components/PersonCard";
import { categoryPath, getContent, livePeople, PLACEHOLDER_PARAM, withPlaceholder } from "@/lib/content";
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
  const people = livePeople(locale, store).filter((x) => x.person.data.categories.includes(category.id));
  return { category, t: category.i18n[locale]!, people };
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

export default async function CategoryPage({ params }: PageProps<"/[locale]/category/[slug]">) {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  const found = find(locale, slug);
  if (!found) notFound();
  const t = getDictionary(locale);
  return (
    <>
      <nav aria-label="Breadcrumb" className="pt-6 text-sm text-muted">
        <Link href={`/${locale}/`} className="hover:text-ink">{t.nav.home}</Link> / <span>{found.t.name}</span>
      </nav>
      <header className="py-8">
        <h1 className="text-4xl font-semibold">{found.t.name}</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted">{found.t.description}</p>
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
