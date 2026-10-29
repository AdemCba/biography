import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TrendingList, trendingMetadata, trendingPageCount } from "@/components/TrendingList";
import { site } from "@/config/site";
import type { Locale } from "@/i18n/config";
import { PLACEHOLDER_PARAM, withPlaceholder } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  const params = site.locales.flatMap((locale) =>
    Array.from({ length: trendingPageCount(locale) - 1 }, (_, i) => ({ locale, n: String(i + 2) })),
  );
  return withPlaceholder(params, { locale: site.locales[0], n: PLACEHOLDER_PARAM });
}

function pageNumber(n: string, locale: Locale): number | undefined {
  const page = Number(n);
  return Number.isInteger(page) && page >= 2 && page <= trendingPageCount(locale) ? page : undefined;
}

export async function generateMetadata({ params }: PageProps<"/[locale]/trending/page/[n]">): Promise<Metadata> {
  const { locale, n } = await params;
  const page = pageNumber(n, locale as Locale);
  return page ? trendingMetadata(locale as Locale, page) : {};
}

export default async function TrendingPage({ params }: PageProps<"/[locale]/trending/page/[n]">) {
  const { locale, n } = await params;
  const page = pageNumber(n, locale as Locale);
  if (!page) notFound();
  return <TrendingList locale={locale as Locale} page={page} />;
}
