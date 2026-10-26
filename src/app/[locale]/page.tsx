import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { PersonCard } from "@/components/PersonCard";
import { categoryPath, getContent, livePeople } from "@/lib/content";
import { pageMetadata, siteJsonLd } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = getDictionary(locale);
  const alternates = Object.fromEntries(site.locales.map((l) => [l, `/${l}/`]));
  return {
    ...pageMetadata({ locale, title: `${site.name}: ${t.home.title}`, description: t.home.intro, path: `/${locale}/`, alternates }),
    title: { absolute: `${site.name}: ${t.home.title}` },
  };
}

export default async function Home({ params }: PageProps<"/[locale]">) {
  const locale = (await params).locale as Locale;
  const t = getDictionary(locale);
  const store = getContent();
  const latest = livePeople(locale, store).slice(0, 12);
  const categories = store.categories
    .filter((c) => c.i18n[locale])
    .map((c) => ({ c, count: livePeople(locale, store).filter((x) => x.person.data.categories.includes(c.id)).length }))
    .filter((x) => x.count > 0); // never show empty sections to readers (or AdSense reviewers)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd(locale)).replace(/</g, "\\u003c") }} />
      <section className="py-12 sm:py-16">
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">{t.home.title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">{t.home.intro}</p>
      </section>

      {categories.length > 0 && <section aria-labelledby="browse" className="mb-12">
        <h2 id="browse" className="mb-4 text-2xl font-semibold">{t.home.browse}</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map(({ c, count }) => (
            <li key={c.id}>
              <Link href={categoryPath(locale, c.i18n[locale]!.slug)} className="block h-full rounded-lg border border-line bg-white p-4 hover:border-ink/30">
                <span className="font-serif text-lg">{c.i18n[locale]!.name}</span>
                <span className="mt-1 block text-sm text-muted">{count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>}

      <section aria-labelledby="latest">
        <h2 id="latest" className="mb-4 text-2xl font-semibold">{t.home.latest}</h2>
        {latest.length ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {latest.map(({ person, article }) => (
              <li key={person.data.id}>
                <PersonCard person={person} article={article} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">{t.home.empty}</p>
        )}
      </section>
    </>
  );
}
