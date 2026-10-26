import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { site } from "@/config/site";
import { HREFLANG, isLocale } from "@/i18n/config";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ThirdPartyScripts } from "@/components/ThirdPartyScripts";
import "../globals.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return site.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s | ${site.name}` },
  applicationName: site.name,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  verification: site.googleVerification ? { google: site.googleVerification } : undefined,
};

export const viewport: Viewport = { themeColor: "#fbfaf7", width: "device-width", initialScale: 1 };

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html lang={HREFLANG[locale]}>
      <body className="min-h-screen">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:bg-white focus:p-2">
          Skip to content
        </a>
        <SiteHeader locale={locale} />
        <main id="main" className="mx-auto max-w-5xl px-4">
          {children}
        </main>
        <SiteFooter locale={locale} />
        <ThirdPartyScripts />
      </body>
    </html>
  );
}
