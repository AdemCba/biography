import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/config/site";
import { LOCALE_NAMES, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { AdSlot } from "@/components/AdSlot";
import { Markdown } from "@/components/Markdown";
import { PersonCard } from "@/components/PersonCard";
import {
  PLACEHOLDER_PARAM,
  withPlaceholder,
  categoryPath,
  editorPath,
  getContent,
  isoDateTime,
  lastModified,
  liveArticle,
  livePeople,
  personPath,
} from "@/lib/content";
import { ageOn, countryName, fillAge, formatDate, headings, resolveShortcuts, splitBeforeHeading } from "@/lib/markdown";
import { pageMetadata, personAlternates, personJsonLd } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return withPlaceholder(
    site.locales.flatMap((locale) => livePeople(locale).map(({ article }) => ({ locale, slug: article.meta.slug }))),
    { locale: site.defaultLocale, slug: PLACEHOLDER_PARAM },
  );
}

function find(locale: Locale, slug: string) {
  for (const person of getContent().people) {
    const article = liveArticle(person, locale);
    if (article?.meta.slug === slug) return { person, article };
  }
  return undefined;
}

export async function generateMetadata({ params }: PageProps<"/[locale]/[slug]">): Promise<Metadata> {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  const found = find(locale, slug);
  if (!found) return {};
  const { person, article } = found;
  const { birthDate, deathDate } = person.data.facts;
  const fill = (t: string) => fillAge(t, birthDate?.value, deathDate?.value, new Date().toISOString().slice(0, 10));
  return {
    ...pageMetadata({
      locale,
      title: fill(article.meta.metaTitle ?? article.meta.title),
      description: fill(article.meta.metaDescription),
      path: personPath(locale, slug),
      alternates: personAlternates(person),
      image: person.data.image?.src,
      type: "profile",
      noindex: article.meta.noindex,
    }),
    other: { "article:modified_time": isoDateTime(lastModified(article.meta))! },
  };
}

/** Related people: explicit links first, then the same categories, then the newest others. Feeds internal linking. */
function related(personId: string, locale: Locale) {
  const store = getContent();
  const person = store.people.find((p) => p.data.id === personId)!;
  const live = livePeople(locale, store).filter((x) => x.person.data.id !== personId);
  const explicit = person.data.related.map((id) => live.find((x) => x.person.data.id === id)).filter((x) => !!x);
  const sameCategory = live.filter(
    (x) => !explicit.includes(x) && x.person.data.categories.some((c) => person.data.categories.includes(c)),
  );
  const others = live.filter((x) => !explicit.includes(x) && !sameCategory.includes(x));
  return [...explicit, ...sameCategory, ...others].slice(0, 6);
}

export default async function BiographyPage({ params }: PageProps<"/[locale]/[slug]">) {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  const found = find(locale, slug);
  if (!found) notFound();
  const { person, article } = found;
  const { data } = person;
  const { meta } = article;
  const t = getDictionary(locale);
  const store = getContent();

  const body = resolveShortcuts(article.body, data.sources, (id) => {
    const other = store.people.find((p) => p.data.id === id);
    const a = other && liveArticle(other, locale);
    return a ? personPath(locale, a.meta.slug) : undefined;
  });
  const [firstPart, rest] = splitBeforeHeading(body, 2);
  const toc = headings(article.body);

  const category = store.categories.find((c) => data.categories.includes(c.id) && c.i18n[locale]);
  const crumbs = [
    { name: t.nav.home, path: `/${locale}/` },
    ...(category ? [{ name: category.i18n[locale]!.name, path: categoryPath(locale, category.i18n[locale]!.slug) }] : []),
    { name: meta.title, path: personPath(locale, slug) },
  ];

  const alternates = Object.entries(personAlternates(person)).filter(([l]) => l !== locale) as [Locale, string][];
  const editors = new Map(store.editors.map((e) => [e.id, e]));
  const author = meta.author ? editors.get(meta.author) : undefined;
  const reviewer = meta.reviewer ? editors.get(meta.reviewer) : undefined;
  const { facts } = data;
  const now = new Date().toISOString().slice(0, 10);
  const relatedPeople = related(data.id, locale);

  return (
    <article className="mx-auto max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd(person, article, crumbs)).replace(/</g, "\\u003c") }}
      />
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
        <p className="mt-2 text-lg text-muted">{meta.knownFor}</p>
        <p className="mt-4 text-sm text-muted">
          {author && (
            <>
              <Link href={editorPath(locale, author.id)} rel="author" className="text-ink underline-offset-2 hover:underline">{author.name}</Link>
              {reviewer && reviewer.id !== author.id && (
                <>
                  {" · "}✓ <Link href={editorPath(locale, reviewer.id)} className="hover:underline">{reviewer.name}</Link>
                </>
              )}
              {" · "}
            </>
          )}
          {t.bio.lastReviewed}: <time dateTime={lastModified(meta)}>{formatDate(lastModified(meta), locale)}</time>
        </p>
      </header>

      <div className="grid gap-8">
        <p className="font-serif text-xl leading-relaxed">{meta.summary}</p>

        <aside aria-labelledby="facts" className="rounded-lg border border-line bg-white p-5 sm:flex sm:gap-6">
          {data.image && (
            <figure className="mb-4 shrink-0 sm:mb-0 sm:w-44">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.image.src} alt={data.image.alt} width={176} height={220} className="w-full rounded-md object-cover" />
              <figcaption className="mt-1 text-[11px] leading-snug text-muted">
                {t.bio.imageCredit}: <a href={data.image.sourceUrl} rel="noopener" className="underline">{data.image.credit}</a>, {data.image.license}
              </figcaption>
            </figure>
          )}
          <div className="grow">
            <h2 id="facts" className="mb-3 font-serif text-lg font-semibold">{t.bio.keyFacts}</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted">{t.bio.knownFor}</dt>
              <dd>{meta.knownFor}</dd>
              {facts.birthDate && (
                <>
                  <dt className="text-muted">{t.bio.born}</dt>
                  <dd>
                    {formatDate(facts.birthDate.value, locale)}
                    {facts.birthPlace && `, ${facts.birthPlace.value}`}
                  </dd>
                </>
              )}
              {facts.deathDate && (
                <>
                  <dt className="text-muted">{t.bio.died}</dt>
                  <dd>{formatDate(facts.deathDate.value, locale)}</dd>
                </>
              )}
              {facts.birthDate && (
                <>
                  <dt className="text-muted">{t.bio.age}</dt>
                  <dd>{ageOn(facts.birthDate.value, facts.deathDate?.value ?? now)}</dd>
                </>
              )}
              {facts.nationality && (
                <>
                  <dt className="text-muted">{t.bio.nationality}</dt>
                  <dd>{facts.nationality.value.map((c) => countryName(c, locale)).join(", ")}</dd>
                </>
              )}
            </dl>
          </div>
        </aside>

        {toc.length >= 3 && (
          <nav aria-labelledby="toc" className="text-sm">
            <h2 id="toc" className="mb-2 font-sans text-xs font-semibold uppercase tracking-wider text-muted">{t.bio.contents}</h2>
            <ol className="list-decimal space-y-1 pl-5">
              {toc.map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`} className="hover:underline">{h.text}</a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="prose prose-lg max-w-none prose-headings:font-serif prose-a:text-accent">
          <Markdown source={firstPart} />
          {rest && <AdSlot label={t.ad} />}
          {rest && <Markdown source={rest} />}
        </div>

        {meta.faq.length > 0 && (
          <section aria-labelledby="faq">
            <h2 id="faq" className="mb-4 text-2xl font-semibold">{t.bio.faq}</h2>
            <div className="divide-y divide-line rounded-lg border border-line bg-white">
              {meta.faq.map((f) => (
                <details key={f.q} className="group p-4">
                  <summary className="cursor-pointer font-medium">{f.q}</summary>
                  <p className="mt-2 text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="sources">
          <h2 id="sources" className="mb-2 text-2xl font-semibold">{t.bio.sources}</h2>
          <p className="mb-3 text-sm text-muted">
            {t.bio.editorialNote}{" "}
            <Link href={`/${locale}/editorial-policy/`} className="underline">{t.footer.editorial}</Link>
          </p>
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            {data.sources.map((s) => (
              <li key={s.id} id={`src-${s.id}`}>
                <a href={s.url} rel="noopener" target="_blank" className="underline">{s.title}</a>, {s.publisher}{" "}
                <span className="text-muted">({formatDate(s.accessed, locale)})</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm">
            <a href={`mailto:${site.contactEmail}?subject=${encodeURIComponent(`Correction: ${meta.title} (${locale})`)}`} className="text-accent underline">
              {t.bio.reportError}
            </a>
          </p>
        </section>

        {relatedPeople.length > 0 && (
          <section aria-labelledby="related">
            <h2 id="related" className="mb-4 text-2xl font-semibold">{t.bio.related}</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {relatedPeople.map(({ person: p, article: a }) => (
                <li key={p.data.id}>
                  <PersonCard person={p} article={a} />
                </li>
              ))}
            </ul>
          </section>
        )}

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
