import { ALL_LOCALES, type Locale } from "@/i18n/config";

function enabledLocales(): Locale[] {
  const raw = process.env.NEXT_PUBLIC_ENABLED_LOCALES;
  if (!raw) return [...ALL_LOCALES];
  const list = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is Locale => (ALL_LOCALES as readonly string[]).includes(s));
  return list.length ? list : ["en"];
}

/** Everything brand-specific lives here so the name can change without touching pages. */
export const site = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Orbivida",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "editor@example.com",
  locales: enabledLocales(),
  defaultLocale: "en" as Locale,
  adsenseClient: process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "",
  gaId: process.env.NEXT_PUBLIC_GA_ID || "",
  googleVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
};

export function absoluteUrl(path: string): string {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}
