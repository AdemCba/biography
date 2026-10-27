import type { Locale } from "./config";

/** Labels for the trending-topics section. */
export const TRENDING: Record<Locale, { nav: string; title: string; intro: string; people: string; empty: string }> = {
  en: { nav: "Trending", title: "Trending now", intro: "What people are searching for right now, explained with sources, and the people behind the story.", people: "People in this story", empty: "No trending stories yet." },
  es: { nav: "Tendencias", title: "Tendencias ahora", intro: "Lo que la gente busca ahora mismo, explicado con fuentes, y las personas detrás de cada historia.", people: "Personas de esta historia", empty: "Todavía no hay historias en tendencia." },
  de: { nav: "Aktuell", title: "Gerade gefragt", intro: "Wonach gerade gesucht wird, mit Quellen erklärt, und die Menschen hinter der Geschichte.", people: "Personen in dieser Geschichte", empty: "Noch keine aktuellen Themen." },
  fr: { nav: "Tendances", title: "Tendances du moment", intro: "Ce que les gens recherchent en ce moment, expliqué avec des sources, et les personnes derrière chaque sujet.", people: "Les personnes de ce sujet", empty: "Pas encore de sujets tendance." },
  pt: { nav: "Em alta", title: "Em alta agora", intro: "O que as pessoas estão buscando agora, explicado com fontes, e as pessoas por trás de cada história.", people: "Pessoas desta história", empty: "Ainda não há histórias em alta." },
};
