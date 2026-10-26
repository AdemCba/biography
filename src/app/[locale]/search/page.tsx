import type { Metadata } from "next";
import { site } from "@/config/site";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { SearchBox } from "@/components/SearchBox";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/search">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = getDictionary(locale);
  const alternates = Object.fromEntries(site.locales.map((l) => [l, `/${l}/search/`]));
  // Search pages carry no unique content of their own, so keep them out of the index.
  return pageMetadata({ locale, title: t.search.title, description: t.home.intro, path: `/${locale}/search/`, alternates, noindex: true });
}

export default async function SearchPage({ params }: PageProps<"/[locale]/search">) {
  const locale = (await params).locale as Locale;
  const t = getDictionary(locale);
  return (
    <div className="mx-auto max-w-2xl py-10">
      <h1 className="mb-6 text-3xl font-semibold">{t.search.title}</h1>
      <SearchBox locale={locale} placeholder={t.search.placeholder} noResults={t.search.noResults} hint={t.search.hint} />
    </div>
  );
}
