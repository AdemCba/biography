import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { absoluteUrl, site } from "@/config/site";
import { HREFLANG, LOCALE_NAMES, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { TRENDING } from "@/i18n/trending";
import { AdSlot } from "@/components/AdSlot";
import { Markdown } from "@/components/Markdown";
import { PersonCard } from "@/components/PersonCard";
import {
  PLACEHOLDER_PARAM,
  withPlaceholder,
  editorPath,
  getContent,
  isoDateTime,
  lastModified,
  liveArticle,
  liveTopics,
  personPath,
  topicPath,
  type Topic,
} from "@/lib/content";
import { formatDate, resolveShortcuts, splitBeforeHeading } from "@/lib/markdown";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return withPlaceholder(
    site.locales.flatMap((locale) => liveTopics(locale).map(({ article }) => ({ locale, slug: article.meta.slug }))),
    { locale: site.defaultLocale, slug: PLACEHOLDER_PARAM },
  );
}

function find(locale: Locale, slug: string) {
  return liveTopics(locale).find(({ article }) => article.meta.slug === slug);
}

function alternatesOf(topic: Topic): Partial<Record<Locale, string>> {
  const out: Partial<Record<Locale, string>> = {};
  for (const locale of site.locales) {
    const a = find(locale, topic.articles[locale]?.meta.slug ?? "");
    if (a) out[locale] = topicPath(locale, a.article.meta.slug);
  }
  return out;
}

export async function generateMetadata({ params }: PageProps<"/[locale]/trending/[slug]">): Promise<Metadata> {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  const found = find(locale, slug);
  if (!found) return {};
  const { topic, article } = found;
  return {
    ...pageMetadata({
      locale,
      title: article.meta.metaTitle ?? article.meta.title,
      description: article.meta.metaDescription,
      path: topicPath(locale, slug),
      alternates: alternatesOf(topic),
      image: topic.data.image?.src,
      type: "article",
      noindex: article.meta.noindex,
    }),
    other: { "article:modified_time": isoDateTime(lastModified(article.meta))! },
  };
}

export default async function TopicPage({ params }: PageProps<"/[locale]/trending/[slug]">) {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  const found = find(locale, slug);
  if (!found) notFound();
  const { topic, article } = found;
  const { meta } = article;
  const t = getDictionary(locale);
  const tt = TRENDING[locale];
  const store = getContent();

  const body = resolveShortcuts(article.body, topic.data.sources, (id) => {
    const other = store.people.find((p) => p.data.id === id);
    const a = other && liveArticle(other, locale);
    return a ? personPath(locale, a.meta.slug) : undefined;
  });
  const [firstPart, rest] = splitBeforeHeading(body, 2);
  const editors = new Map(store.editors.map((e) => [e.id, e]));
  const author = meta.author ? editors.get(meta.author) : undefined;
  const people = topic.data.people
    .map((id) => store.people.find((p) => p.data.id === id))
    .map((p) => p && { person: p, article: liveArticle(p, locale) })
    .filter((x) => !!x?.article) as { person: (typeof store.people)[number]; article: NonNullable<ReturnType<typeof liveArticle>> }[];
  const url = absoluteUrl(topicPath(locale, slug));
  const crumbs = [
    { name: t.nav.home, path: `/${locale}/` },
    { name: tt.nav, path: `/${locale}/trending/` },
    { name: meta.title, path: topicPath(locale, slug) },
  ];
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": url,
      url,
      headline: meta.title,
      description: meta.metaDescription,
      inLanguage: HREFLANG[locale],
      datePublished: isoDateTime(meta.publishedAt),
      dateModified: isoDateTime(lastModified(meta)),
      image: topic.data.image ? absoluteUrl(topic.data.image.src) : undefined,
      author: author ? { "@type": "Person", name: author.name, url: absoluteUrl(editorPath(locale, author.id)) } : undefined,
      publisher: { "@type": "Organization", "@id": `${site.url}/#organization`, name: site.name, url: site.url },
      about: people.map(({ person, article: a }) => ({ "@type": "Person", name: person.data.name, url: absoluteUrl(personPath(locale, a.meta.slug)) })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: absoluteUrl(c.path) })),
    },
  ];
  const alternates = Object.entries(alternatesOf(topic)).filter(([l]) => l !== locale) as [Locale, string][];

  return (
    <article className="mx-auto max-w-3xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb" className="pt-6 text-sm text-muted">
        {crumbs.slice(0, -1).map((c) => (
          <span key={c.path}>
            <Link href={c.path} className="hover:text-ink">{c.name}</Link> /{" "}
          </span>
        ))}
        <span aria-current="page">{meta.title}</span>
      </nav>
      <header className="py-8">
        <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">{meta.title}</h1>
        <p className="mt-4 text-sm text-muted">
          {author && (
            <>
              <Link href={editorPath(locale, author.id)} rel="author" className="text-ink hover:underline">{author.name}</Link>
              {" · "}
            </>
          )}
          <time dateTime={isoDateTime(meta.publishedAt)}>{formatDate(meta.publishedAt!, locale)}</time>
        </p>
      </header>
      <div className="grid gap-8">
        <p className="font-serif text-xl leading-relaxed">{meta.summary}</p>
        {topic.data.image && (
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={topic.data.image.src} alt={topic.data.image.alt} className="w-full rounded-md object-cover" />
            <figcaption className="mt-1 text-[11px] text-muted">
              {t.bio.imageCredit}: <a href={topic.data.image.sourceUrl} rel="noopener" className="underline">{topic.data.image.credit}</a>, {topic.data.image.license}
            </figcaption>
          </figure>
        )}
        <div className="prose prose-lg max-w-none prose-headings:font-serif prose-a:text-accent">
          <Markdown source={firstPart} />
          {rest && <AdSlot label={t.ad} />}
          {rest && <Markdown source={rest} />}
        </div>
        {people.length > 0 && (
          <section aria-labelledby="people">
            <h2 id="people" className="mb-4 text-2xl font-semibold">{tt.people}</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {people.map(({ person, article: a }) => (
                <li key={person.data.id}>
                  <PersonCard person={person} article={a} />
                </li>
              ))}
            </ul>
          </section>
        )}
        <section aria-labelledby="sources">
          <h2 id="sources" className="mb-2 text-2xl font-semibold">{t.bio.sources}</h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            {topic.data.sources.map((s) => (
              <li key={s.id} id={`src-${s.id}`}>
                <a href={s.url} rel="noopener" target="_blank" className="underline">{s.title}</a>, {s.publisher}{" "}
                <span className="text-muted">({formatDate(s.accessed, locale)})</span>
              </li>
            ))}
          </ol>
        </section>
        <AdSlot label={t.ad} />
        {alternates.length > 0 && (
          <p className="text-sm text-muted">
            {t.languages}:{" "}
            {alternates.map(([l, path], i) => (
              <span key={l}>
                {i > 0 && " · "}
                <Link href={path} hrefLang={l} lang={l} className="underline">{LOCALE_NAMES[l]}</Link>
              </span>
            ))}
          </p>
        )}
      </div>
    </article>
  );
}
