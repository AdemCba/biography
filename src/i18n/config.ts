export const ALL_LOCALES = ["en", "es", "de", "fr", "pt"] as const;
export type Locale = (typeof ALL_LOCALES)[number];

export function isLocale(value: string): value is Locale {
  return (ALL_LOCALES as readonly string[]).includes(value);
}

/** hreflang values. Portuguese targets Brazil first; see docs/seo.md before adding pt-PT. */
export const HREFLANG: Record<Locale, string> = {
  en: "en",
  es: "es",
  de: "de",
  fr: "fr",
  pt: "pt-BR",
};

export const OG_LOCALE: Record<Locale, string> = {
  en: "en_US",
  es: "es_ES",
  de: "de_DE",
  fr: "fr_FR",
  pt: "pt_BR",
};

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  es: "Español",
  de: "Deutsch",
  fr: "Français",
  pt: "Português",
};
