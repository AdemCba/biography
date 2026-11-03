import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";
import type { Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/dictionaries";
import { PAGE_SECTIONS, type PageSection } from "@/i18n/pageSections";
import { fillTrust, TRUST } from "@/i18n/trustPages";
import { editorPath, getContent, livePeople } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

type Key = keyof Dictionary["pages"];

/** Plain text with bare https:// URLs turned into links. */
export function linkify(text: string) {
  return text.split(/(https:\/\/[^\s]+?)(?=[.,;]?(?:\s|$))/).map((part, i) =>
    part.startsWith("https://") ? (
      <a key={i} href={part} rel="nofollow noopener" target="_blank">
        {part}
      </a>
    ) : (
      part
    ),
  );
}
const PATHS: Record<Key, string> = { about: "about", editorial: "editorial-policy", privacy: "privacy", contact: "contact", terms: "terms" };

export function staticMetadata(key: Key) {
  return async ({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> => {
    const locale = (await params).locale as Locale;
    const page = getDictionary(locale).pages[key];
    const alternates = Object.fromEntries(site.locales.map((l) => [l, `/${l}/${PATHS[key]}/`]));
    return pageMetadata({ locale, title: page.title, description: page.body.slice(0, 155), path: `/${locale}/${PATHS[key]}/`, alternates });
  };
}

function sections(locale: Locale, key: Key): PageSection[] {
  if (key === "about") return TRUST[locale].about;
  if (key === "contact") return TRUST[locale].contact;
  if (key === "privacy") {
    const base = PAGE_SECTIONS[locale].privacy ?? [];
    return [...base.slice(0, -1), ...TRUST[locale].privacyExtra, ...base.slice(-1)];
  }
  return PAGE_SECTIONS[locale][key as "about" | "privacy"] ?? [];
}

/** Real numbers on the about page: how many biographies and cited sources this language has. */
function aboutStats(locale: Locale): string {
  const live = livePeople(locale);
  const sources = live.reduce((n, { person }) => n + person.data.sources.length, 0);
  const fmt = new Intl.NumberFormat(locale);
  return fillTrust(TRUST[locale].stats, { people: fmt.format(live.length), sources: fmt.format(sources) });
}

/** About / editorial / privacy / contact. These pages are trust signals (E-E-A-T) as well as legal requirements. */
export function staticPage(key: Key) {
  return async function Page({ params }: { params: Promise<{ locale: string }> }) {
    const locale = (await params).locale as Locale;
    const t = getDictionary(locale);
    const page = t.pages[key];
    const editors = key === "about" || key === "editorial" ? getContent().editors.filter((e) => e.i18n[locale]) : [];
    return (
      <div className="prose prose-lg mx-auto max-w-3xl py-10 prose-headings:font-serif">
        <h1>{page.title}</h1>
        <p>{page.body}</p>
        {key === "contact" && (
          <p>
            <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
          </p>
        )}
        {key === "about" && <p>{aboutStats(locale)}</p>}
        {sections(locale, key).map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            <p>{linkify(fillTrust(section.text, { email: site.contactEmail }))}</p>
          </section>
        ))}
        {editors.length > 0 && (
          <ul>
            {editors.map((e) => (
              <li key={e.id}>
                <Link href={editorPath(locale, e.id)}>{e.name}</Link>, {e.i18n[locale]!.role}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };
}
