import Link from "next/link";
import { site } from "@/config/site";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { categoryPath, getContent, livePeople } from "@/lib/content";

export function SiteHeader({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const store = getContent();
  const live = livePeople(locale, store);
  const categories = store.categories.filter((c) => c.i18n[locale] && live.some((x) => x.person.data.categories.includes(c.id)));
  return (
    <header className="border-b border-line bg-paper/95">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href={`/${locale}/`} className="font-serif text-xl font-semibold tracking-tight">
          {site.name}
        </Link>
        <Link href={`/${locale}/search/`} className="rounded-full border border-line px-3 py-1.5 text-sm text-muted hover:text-ink">
          {t.nav.search}
        </Link>
      </div>
      <nav aria-label={t.nav.categories} className="mx-auto max-w-5xl overflow-x-auto px-4 pb-3">
        <ul className="flex gap-5 whitespace-nowrap text-sm text-muted">
          {categories.map((c) => (
            <li key={c.id}>
              <Link href={categoryPath(locale, c.i18n[locale]!.slug)} className="hover:text-ink">
                {c.i18n[locale]!.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
