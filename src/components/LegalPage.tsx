import type { Metadata } from "next";
import { site } from "@/config/site";
import type { Locale } from "@/i18n/config";
import { LEGAL_PAGES, LEGAL_PATHS, type LegalKey } from "@/i18n/legalPages";
import { pageMetadata } from "@/lib/seo";
import { linkify } from "./StaticPage";

export function legalMetadata(key: LegalKey) {
  return async ({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> => {
    const locale = (await params).locale as Locale;
    const page = LEGAL_PAGES[locale][key];
    const alternates = Object.fromEntries(site.locales.map((l) => [l, `/${l}/${LEGAL_PATHS[key]}/`]));
    return pageMetadata({ locale, title: page.title, description: page.body.slice(0, 155), path: `/${locale}/${LEGAL_PATHS[key]}/`, alternates });
  };
}

/** Copyright / cookies / disclaimer. */
export function legalPage(key: LegalKey) {
  return async function Page({ params }: { params: Promise<{ locale: string }> }) {
    const locale = (await params).locale as Locale;
    const page = LEGAL_PAGES[locale][key];
    return (
      <div className="prose prose-lg mx-auto max-w-3xl py-10 prose-headings:font-serif">
        <h1>{page.title}</h1>
        <p>{page.body}</p>
        {page.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            <p>{linkify(section.text)}</p>
          </section>
        ))}
      </div>
    );
  };
}
