import Link from "next/link";
import { site } from "@/config/site";
import { LOCALE_NAMES, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { LEGAL_PAGES } from "@/i18n/legalPages";

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const links = [
    ["about", t.footer.about],
    ["editorial-policy", t.footer.editorial],
    ["privacy", t.footer.privacy],
    ["contact", t.footer.contact],
    ["terms", t.footer.terms],
    ["cookies", LEGAL_PAGES[locale].cookies.footer],
    ["copyright", LEGAL_PAGES[locale].copyright.footer],
    ["disclaimer", LEGAL_PAGES[locale].disclaimer.footer],
  ] as const;
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 text-sm text-muted sm:grid-cols-2">
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {links.map(([path, label]) => (
            <li key={path}>
              <Link href={`/${locale}/${path}/`} className="hover:text-ink">
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="sm:text-right">
          <span className="sr-only">{t.languages}: </span>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 sm:justify-end">
            {site.locales.map((l) => (
              <li key={l}>
                <Link href={`/${l}/`} hrefLang={l} lang={l} aria-current={l === locale ? "true" : undefined} className={l === locale ? "text-ink" : "hover:text-ink"}>
                  {LOCALE_NAMES[l]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <p className="sm:col-span-2">
          © {new Date().getFullYear()} {site.name}. {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
