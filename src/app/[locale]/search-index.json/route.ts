import { site } from "@/config/site";
import type { Locale } from "@/i18n/config";
import { getContent, livePeople, personPath } from "@/lib/content";

export const dynamic = "force-static";

export function generateStaticParams() {
  return site.locales.map((locale) => ({ locale }));
}

/** Small per-language index the search page downloads; keeps search free of servers and APIs. */
export async function GET(_req: Request, { params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale as Locale;
  const store = getContent();
  const cats = new Map(store.categories.map((c) => [c.id, c.i18n[locale]?.name ?? ""]));
  const items = livePeople(locale, store).map(({ person, article }) => ({
    t: article.meta.title,
    k: article.meta.knownFor,
    c: person.data.categories.map((c) => cats.get(c)).filter(Boolean).join(", "),
    u: personPath(locale, article.meta.slug),
  }));
  return Response.json(items);
}
