import type { Locale } from "./config";

/** Data-driven intro for category pages: real counts and names, so each page says something specific. */
export const CATEGORY_INTRO: Record<Locale, { lead: string; top: string; from: string; ages: string; sources: string; and: string }> = {
  en: {
    lead: "Orbivida has {count} source-checked biographies in {name}.",
    top: "The most thoroughly sourced pages here are {names}.",
    from: "Most common nationalities: {countries}.",
    ages: " Ages range from {min} to {max}.",
    sources: "Together these pages cite {sources} sources, and each one shows when it was last checked.",
    and: "and",
  },
  es: {
    lead: "Orbivida tiene {count} biografías verificadas con fuentes en {name}.",
    top: "Las páginas con más fuentes de esta sección son {names}.",
    from: "Nacionalidades más frecuentes: {countries}.",
    ages: " Las edades van de {min} a {max} años.",
    sources: "En total estas páginas citan {sources} fuentes, y cada una indica cuándo se revisó por última vez.",
    and: "y",
  },
  pt: {
    lead: "O Orbivida tem {count} biografias checadas com fontes em {name}.",
    top: "As páginas com mais fontes desta seção são {names}.",
    from: "Nacionalidades mais comuns: {countries}.",
    ages: " As idades vão de {min} a {max} anos.",
    sources: "Juntas, essas páginas citam {sources} fontes, e cada uma mostra quando foi conferida pela última vez.",
    and: "e",
  },
  de: {
    lead: "Orbivida hat {count} quellengeprüfte Biografien in der Rubrik {name}.",
    top: "Am ausführlichsten belegt sind hier {names}.",
    from: "Häufigste Nationalitäten: {countries}.",
    ages: " Das Alter reicht von {min} bis {max} Jahren.",
    sources: "Zusammen zitieren diese Seiten {sources} Quellen, und jede zeigt, wann sie zuletzt geprüft wurde.",
    and: "und",
  },
  fr: {
    lead: "Orbivida propose {count} biographies vérifiées et sourcées dans la rubrique {name}.",
    top: "Les pages les mieux sourcées ici sont celles de {names}.",
    from: "Nationalités les plus fréquentes : {countries}.",
    ages: " Les âges vont de {min} à {max} ans.",
    sources: "Ensemble, ces pages citent {sources} sources, et chacune indique la date de sa dernière vérification.",
    and: "et",
  },
};
