import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";
import type { Locale } from "@/i18n/config";
import { TRENDING } from "@/i18n/trending";
import { liveTopics, topicPath } from "@/lib/content";
import { formatDate } from "@/lib/markdown";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/trending">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = TRENDING[locale];
  const alternates = Object.fromEntries(site.locales.map((l) => [l, `/${l}/trending/`]));
  return {
    ...pageMetadata({ locale, title: t.title, description: t.intro, path: `/${locale}/trending/`, alternates }),
    // An empty list is a thin page; keep it out of the index until the first story is live.
    ...(liveTopics(locale).length === 0 ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function TrendingIndex({ params }: PageProps<"/[locale]/trending">) {
  const locale = (await params).locale as Locale;
  const t = TRENDING[locale];
  const topics = liveTopics(locale);
  return (
    <div className="mx-auto max-w-3xl py-10">
      <h1 className="text-4xl font-semibold">{t.title}</h1>
      <p className="mt-3 text-lg text-muted">{t.intro}</p>
      {topics.length ? (
        <ul className="mt-8 divide-y divide-line">
          {topics.map(({ topic, article }) => (
            <li key={topic.data.id} className="py-5">
              <Link href={topicPath(locale, article.meta.slug)} className="font-serif text-2xl hover:underline">{article.meta.title}</Link>
              <p className="mt-1 text-sm text-muted">{formatDate(article.meta.publishedAt!, locale)}</p>
              <p className="mt-2">{article.meta.summary}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-muted">{t.empty}</p>
      )}
    </div>
  );
}
