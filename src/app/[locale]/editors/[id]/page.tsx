import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { absoluteUrl, site } from "@/config/site";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { PersonCard } from "@/components/PersonCard";
import { editorPath, getContent, livePeople, PLACEHOLDER_PARAM, withPlaceholder } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return withPlaceholder(
    site.locales.flatMap((locale) => getContent().editors.filter((e) => e.i18n[locale]).map((e) => ({ locale, id: e.id }))),
    { locale: site.defaultLocale, id: PLACEHOLDER_PARAM },
  );
}

function find(locale: Locale, id: string) {
  const editor = getContent().editors.find((e) => e.id === id && e.i18n[locale]);
  return editor ? { editor, t: editor.i18n[locale]! } : undefined;
}

export async function generateMetadata({ params }: PageProps<"/[locale]/editors/[id]">): Promise<Metadata> {
  const { locale, id } = (await params) as { locale: Locale; id: string };
  const found = find(locale, id);
  if (!found) return {};
  const alternates = Object.fromEntries(site.locales.filter((l) => found.editor.i18n[l]).map((l) => [l, editorPath(l, id)]));
  return pageMetadata({ locale, title: found.editor.name, description: found.t.bio.slice(0, 155), path: editorPath(locale, id), alternates, type: "profile" });
}

/** Author pages: who writes and checks the biographies. A core E-E-A-T signal. */
export default async function EditorPage({ params }: PageProps<"/[locale]/editors/[id]">) {
  const { locale, id } = (await params) as { locale: Locale; id: string };
  const found = find(locale, id);
  if (!found) notFound();
  const { editor } = found;
  const t = getDictionary(locale);
  const work = livePeople(locale).filter(({ article }) => article.meta.author === id || article.meta.reviewer === id);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: { "@type": "Person", name: editor.name, jobTitle: found.t.role, url: absoluteUrl(editorPath(locale, id)), sameAs: editor.sameAs, image: editor.image ? absoluteUrl(editor.image) : undefined, worksFor: { "@type": "Organization", name: site.name } },
  };
  return (
    <div className="mx-auto max-w-3xl py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      {editor.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={editor.image} alt={editor.name} width={112} height={112} className="mb-4 size-28 rounded-full object-cover" />
      )}
      <h1 className="text-4xl font-semibold">{editor.name}</h1>
      <p className="mt-1 text-muted">{found.t.role}</p>
      <p className="mt-6 text-lg leading-relaxed">{found.t.bio}</p>
      {editor.sameAs.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-4 text-sm">
          {editor.sameAs.map((u) => (
            <li key={u}><a href={u} rel="me noopener" className="underline">{new URL(u).hostname}</a></li>
          ))}
        </ul>
      )}
      {work.length > 0 && (
        <ul className="mt-10 grid gap-3 sm:grid-cols-2">
          {work.map(({ person, article }) => (
            <li key={person.data.id}><PersonCard person={person} article={article} /></li>
          ))}
        </ul>
      )}
      <p className="sr-only">{t.footer.editorial}</p>
    </div>
  );
}
