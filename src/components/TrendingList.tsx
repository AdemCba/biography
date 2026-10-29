import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";
import type { Locale } from "@/i18n/config";
import { TRENDING } from "@/i18n/trending";
import { liveTopics, topicPath } from "@/lib/content";
import { formatDate } from "@/lib/markdown";
import { pageMetadata } from "@/lib/seo";

export const TOPICS_PER_PAGE = 20;

export function trendingPagePath(locale: Locale, page: number): string {
  return page <= 1 ? `/${locale}/trending/` : `/${locale}/trending/page/${page}/`;
}

export function trendingPageCount(locale: Locale): number {
  return Math.max(1, Math.ceil(liveTopics(locale).length / TOPICS_PER_PAGE));
}

export function trendingMetadata(locale: Locale, page: number): Metadata {
  const t = TRENDING[locale];
  const title = page > 1 ? `${t.title} (${t.page} ${page})` : t.title;
  // Only page 1 exists in every language; later pages only point to themselves.
  const alternates = page > 1 ? { [locale]: trendingPagePath(locale, page) } : Object.fromEntries(site.locales.map((l) => [l, `/${l}/trending/`]));
  return {
    ...pageMetadata({ locale, title, description: t.intro, path: trendingPagePath(locale, page), alternates }),
    // An empty list is a thin page; keep it out of the index until the first story is live.
    ...(liveTopics(locale).length === 0 ? { robots: { index: false, follow: true } } : {}),
  };
}

/** One page of the newest-first trending list, with links to newer and older pages. */
export function TrendingList({ locale, page }: { locale: Locale; page: number }) {
  const t = TRENDING[locale];
  const all = liveTopics(locale);
  const topics = all.slice((page - 1) * TOPICS_PER_PAGE, page * TOPICS_PER_PAGE);
  const pages = trendingPageCount(locale);
  return (
    <div className="mx-auto max-w-5xl py-10">
      <h1 className="text-4xl font-semibold">{t.title}</h1>
      {page === 1 && <p className="mt-3 text-lg text-muted">{t.intro}</p>}
      {topics.length ? (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2">
          {topics.map(({ topic, article }, i) => {
            const lead = page === 1 && i === 0;
            return (
              <li key={topic.data.id} className={lead ? "sm:col-span-2" : undefined}>
                <Link href={topicPath(locale, article.meta.slug)} className="group block h-full overflow-hidden rounded-xl border border-line transition hover:shadow-lg">
                  <div className={`relative overflow-hidden bg-line ${lead ? "aspect-[2/1]" : "aspect-[16/9]"}`}>
                    {topic.data.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={topic.data.image.src}
                        alt={article.meta.title}
                        loading={i < 3 ? "eager" : "lazy"}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-line to-muted/30" />
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
                      {formatDate(article.meta.publishedAt!, locale)}
                    </span>
                  </div>
                  <div className="p-5">
                    <h2 className={`font-serif font-semibold leading-snug group-hover:underline ${lead ? "text-3xl" : "text-xl"}`}>{article.meta.title}</h2>
                    <p className={`mt-2 text-muted ${lead ? "line-clamp-3" : "line-clamp-2"}`}>{article.meta.summary}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-8 text-muted">{t.empty}</p>
      )}
      {pages > 1 && (
        <nav className="mt-10 flex items-center justify-between border-t border-line pt-6 text-sm" aria-label={t.page}>
          {page > 1 ? <Link href={trendingPagePath(locale, page - 1)} className="hover:underline">← {t.newer}</Link> : <span />}
          <span className="text-muted">{t.page} {page} / {pages}</span>
          {page < pages ? <Link href={trendingPagePath(locale, page + 1)} className="hover:underline">{t.older} →</Link> : <span />}
        </nav>
      )}
    </div>
  );
}
