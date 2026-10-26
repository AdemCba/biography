import type { Metadata } from "next";
import { absoluteUrl, site } from "@/config/site";
import { HREFLANG, LOCALE_NAMES } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export const metadata: Metadata = {
  title: site.name,
  description: getDictionary("en").home.intro,
  alternates: {
    canonical: absoluteUrl("/"),
    languages: {
      ...Object.fromEntries(site.locales.map((l) => [HREFLANG[l], absoluteUrl(`/${l}/`)])),
      "x-default": absoluteUrl("/"),
    },
  },
};

/**
 * x-default landing page. With a single live language it forwards straight to it;
 * otherwise it offers a language choice (and the browser's language is suggested first).
 */
export default function RootPage() {
  const single = site.locales.length === 1 ? site.locales[0] : undefined;
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4">
      {single && <meta httpEquiv="refresh" content={`0; url=/${single}/`} />}
      <h1 className="font-serif text-4xl font-semibold">{site.name}</h1>
      <ul className="mt-8 grid gap-2">
        {site.locales.map((l) => (
          <li key={l}>
            <a href={`/${l}/`} hrefLang={l} lang={l} className="block rounded-lg border border-line bg-white px-4 py-3 hover:border-ink/30">
              <span className="font-medium">{LOCALE_NAMES[l]}</span>
              <span className="block text-sm text-muted">{getDictionary(l).home.title}</span>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
