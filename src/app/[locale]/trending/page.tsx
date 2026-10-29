import type { Metadata } from "next";
import { TrendingList, trendingMetadata } from "@/components/TrendingList";
import type { Locale } from "@/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[locale]/trending">): Promise<Metadata> {
  return trendingMetadata((await params).locale as Locale, 1);
}

export default async function TrendingIndex({ params }: PageProps<"/[locale]/trending">) {
  return <TrendingList locale={(await params).locale as Locale} page={1} />;
}
