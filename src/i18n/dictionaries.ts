import type { Locale } from "./config";

export type Dictionary = {
  nav: { home: string; categories: string; search: string; about: string };
  home: { title: string; intro: string; latest: string; browse: string; empty: string };
  category: { people: string; empty: string };
  bio: {
    keyFacts: string;
    born: string;
    died: string;
    age: string;
    nationality: string;
    knownFor: string;
    faq: string;
    sources: string;
    related: string;
    lastReviewed: string;
    published: string;
    editorialNote: string;
    reportError: string;
    imageCredit: string;
    contents: string;
  };
  search: { title: string; placeholder: string; noResults: string; hint: string };
  footer: { about: string; editorial: string; privacy: string; contact: string; terms: string; rights: string };
  pages: {
    about: { title: string; body: string };
    editorial: { title: string; body: string };
    privacy: { title: string; body: string };
    contact: { title: string; body: string };
    terms: { title: string; body: string };
  };
  ad: string;
  languages: string;
};

const en: Dictionary = {
  nav: { home: "Home", categories: "Categories", search: "Search", about: "About" },
  home: {
    title: "Life stories, checked against the record",
    intro:
      "Biographies of athletes, founders, artists and creators, written by editors and backed by sources you can open yourself.",
    latest: "Recently published",
    browse: "Browse by category",
    empty: "The first biographies are on their way.",
  },
  category: { people: "People in this category", empty: "No biographies in this category yet." },
  bio: {
    keyFacts: "Key facts",
    born: "Born",
    died: "Died",
    age: "Age",
    nationality: "Nationality",
    knownFor: "Known for",
    faq: "Frequently asked questions",
    sources: "Sources",
    related: "Related biographies",
    lastReviewed: "Last reviewed",
    published: "Published",
    editorialNote: "Facts on this page are checked against the sources listed below.",
    reportError: "Spotted an error? Tell us",
    imageCredit: "Image",
    contents: "On this page",
  },
  search: {
    title: "Search",
    placeholder: "Search by name, sport, company…",
    noResults: "No matches yet.",
    hint: "Type at least two letters.",
  },
  footer: {
    about: "About",
    editorial: "Editorial policy",
    privacy: "Privacy",
    contact: "Contact",
    terms: "Terms",
    rights: "All rights reserved.",
  },
  pages: {
    about: {
      title: "About us",
      body: "We publish biographies that answer the questions people actually ask, and we show our sources. Every page is researched, written and reviewed by an editor before it goes live, and we revisit pages when facts change.",
    },
    editorial: {
      title: "Editorial policy",
      body: "We rely on official profiles, organisations that award prizes, company filings and established publications. Dates, ages, education, ownership and net-worth figures must match a cited source. We do not publish claims about private life without a reliable public source. AI tools help with research and drafting; a human editor checks every claim and approves every page. Corrections are made promptly and the review date is updated.",
    },
    privacy: {
      title: "Privacy policy",
      body: "This site uses cookies for analytics and, where enabled, advertising by Google. Visitors in the EEA, the UK and Switzerland are asked for consent through a certified consent tool before personalised ads are shown. You can change your choice at any time from the privacy settings link.",
    },
    contact: {
      title: "Contact",
      body: "For corrections, image rights or questions about a biography, write to us at the address below. Please include the page link.",
    },
    terms: {
      title: "Terms of use",
      body: "Content on this site is for general information. We work hard to keep it accurate and cite our sources, but facts about living people change; check the sources for anything important. Texts are our own work and may not be republished without permission. Images belong to their credited owners and are used under the licence shown with each image. Links to other sites are provided for reference; we are not responsible for their content.",
    },
  },
  ad: "Advertisement",
  languages: "Languages",
};

const es: Dictionary = {
  nav: { home: "Inicio", categories: "Categorías", search: "Buscar", about: "Quiénes somos" },
  home: {
    title: "Historias de vida, contrastadas con las fuentes",
    intro:
      "Biografías de deportistas, emprendedores, artistas y creadores, escritas por editores y respaldadas por fuentes que puedes consultar.",
    latest: "Publicadas recientemente",
    browse: "Explorar por categoría",
    empty: "Las primeras biografías están en camino.",
  },
  category: { people: "Personas en esta categoría", empty: "Todavía no hay biografías en esta categoría." },
  bio: {
    keyFacts: "Datos clave",
    born: "Nacimiento",
    died: "Fallecimiento",
    age: "Edad",
    nationality: "Nacionalidad",
    knownFor: "Conocido por",
    faq: "Preguntas frecuentes",
    sources: "Fuentes",
    related: "Biografías relacionadas",
    lastReviewed: "Última revisión",
    published: "Publicado",
    editorialNote: "Los datos de esta página se contrastan con las fuentes indicadas abajo.",
    reportError: "¿Has visto un error? Avísanos",
    imageCredit: "Imagen",
    contents: "En esta página",
  },
  search: {
    title: "Buscar",
    placeholder: "Busca por nombre, deporte, empresa…",
    noResults: "Sin resultados por ahora.",
    hint: "Escribe al menos dos letras.",
  },
  footer: {
    about: "Quiénes somos",
    editorial: "Política editorial",
    privacy: "Privacidad",
    contact: "Contacto",
    terms: "Condiciones",
    rights: "Todos los derechos reservados.",
  },
  pages: {
    about: {
      title: "Quiénes somos",
      body: "Publicamos biografías que responden a lo que la gente busca de verdad, y mostramos nuestras fuentes. Cada página la investiga, redacta y revisa un editor antes de publicarse, y la actualizamos cuando cambian los datos.",
    },
    editorial: {
      title: "Política editorial",
      body: "Nos basamos en perfiles oficiales, organismos que conceden premios, registros de empresas y medios de referencia. Fechas, edades, estudios, participaciones empresariales y estimaciones de patrimonio deben coincidir con una fuente citada. No publicamos afirmaciones sobre la vida privada sin una fuente pública fiable. Usamos herramientas de IA para investigar y redactar; un editor humano verifica cada dato y aprueba cada página.",
    },
    privacy: {
      title: "Política de privacidad",
      body: "Este sitio utiliza cookies de analítica y, cuando está activada, publicidad de Google. A los visitantes del EEE, el Reino Unido y Suiza se les pide su consentimiento mediante una herramienta certificada antes de mostrar anuncios personalizados.",
    },
    contact: {
      title: "Contacto",
      body: "Para correcciones, derechos de imagen o dudas sobre una biografía, escríbenos a la dirección de abajo e incluye el enlace de la página.",
    },
    terms: {
      title: "Condiciones de uso",
      body: "El contenido de este sitio es informativo. Trabajamos para que sea exacto y citamos nuestras fuentes, pero los datos sobre personas vivas cambian; consulta las fuentes para cualquier asunto importante. Los textos son obra nuestra y no pueden reproducirse sin permiso. Las imágenes pertenecen a sus autores acreditados y se usan con la licencia indicada en cada una.",
    },
  },
  ad: "Publicidad",
  languages: "Idiomas",
};

const de: Dictionary = {
  nav: { home: "Start", categories: "Kategorien", search: "Suche", about: "Über uns" },
  home: {
    title: "Lebensgeschichten, geprüft an den Quellen",
    intro:
      "Biografien von Sportlern, Gründerinnen, Künstlern und Creatorn, von Redakteuren geschrieben und mit Quellen belegt, die Sie selbst öffnen können.",
    latest: "Neu veröffentlicht",
    browse: "Nach Kategorie stöbern",
    empty: "Die ersten Biografien sind in Arbeit.",
  },
  category: { people: "Personen in dieser Kategorie", empty: "In dieser Kategorie gibt es noch keine Biografien." },
  bio: {
    keyFacts: "Steckbrief",
    born: "Geboren",
    died: "Gestorben",
    age: "Alter",
    nationality: "Nationalität",
    knownFor: "Bekannt für",
    faq: "Häufige Fragen",
    sources: "Quellen",
    related: "Verwandte Biografien",
    lastReviewed: "Zuletzt geprüft",
    published: "Veröffentlicht",
    editorialNote: "Die Angaben auf dieser Seite sind mit den unten genannten Quellen abgeglichen.",
    reportError: "Fehler entdeckt? Schreiben Sie uns",
    imageCredit: "Bild",
    contents: "Auf dieser Seite",
  },
  search: {
    title: "Suche",
    placeholder: "Name, Sportart, Unternehmen…",
    noResults: "Noch keine Treffer.",
    hint: "Mindestens zwei Buchstaben eingeben.",
  },
  footer: {
    about: "Über uns",
    editorial: "Redaktionelle Richtlinien",
    privacy: "Datenschutz",
    contact: "Kontakt",
    terms: "Nutzungsbedingungen",
    rights: "Alle Rechte vorbehalten.",
  },
  pages: {
    about: {
      title: "Über uns",
      body: "Wir veröffentlichen Biografien, die die Fragen beantworten, die Menschen wirklich stellen, und wir legen unsere Quellen offen. Jede Seite wird vor der Veröffentlichung von einem Redakteur recherchiert, geschrieben und geprüft.",
    },
    editorial: {
      title: "Redaktionelle Richtlinien",
      body: "Wir stützen uns auf offizielle Profile, preisverleihende Organisationen, Unternehmensangaben und etablierte Medien. Daten, Alter, Ausbildung, Beteiligungen und Vermögensschätzungen müssen mit einer zitierten Quelle übereinstimmen. Behauptungen über das Privatleben ohne verlässliche öffentliche Quelle veröffentlichen wir nicht. KI-Werkzeuge helfen bei Recherche und Entwurf; ein Mensch prüft jede Angabe und gibt jede Seite frei.",
    },
    privacy: {
      title: "Datenschutzerklärung",
      body: "Diese Website verwendet Cookies für Statistik und, sofern aktiviert, Werbung von Google. Besucher aus dem EWR, dem Vereinigten Königreich und der Schweiz werden über ein zertifiziertes Einwilligungstool um Zustimmung gebeten, bevor personalisierte Werbung angezeigt wird.",
    },
    contact: {
      title: "Kontakt",
      body: "Für Korrekturen, Bildrechte oder Fragen zu einer Biografie schreiben Sie uns an die unten stehende Adresse und nennen Sie bitte den Link zur Seite.",
    },
    terms: {
      title: "Nutzungsbedingungen",
      body: "Die Inhalte dieser Website dienen der allgemeinen Information. Wir arbeiten sorgfältig und nennen unsere Quellen, doch Angaben zu lebenden Personen ändern sich; prüfen Sie bei wichtigen Fragen die Quellen. Die Texte sind unsere eigene Arbeit und dürfen nicht ohne Erlaubnis übernommen werden. Bilder gehören den genannten Urhebern und werden unter der jeweils angegebenen Lizenz verwendet.",
    },
  },
  ad: "Anzeige",
  languages: "Sprachen",
};

const fr: Dictionary = {
  nav: { home: "Accueil", categories: "Catégories", search: "Recherche", about: "À propos" },
  home: {
    title: "Des parcours de vie, vérifiés à la source",
    intro:
      "Biographies de sportifs, d’entrepreneurs, d’artistes et de créateurs, rédigées par des éditeurs et appuyées sur des sources que vous pouvez consulter.",
    latest: "Publiées récemment",
    browse: "Parcourir par catégorie",
    empty: "Les premières biographies arrivent bientôt.",
  },
  category: { people: "Personnalités de cette catégorie", empty: "Aucune biographie dans cette catégorie pour l’instant." },
  bio: {
    keyFacts: "En bref",
    born: "Naissance",
    died: "Décès",
    age: "Âge",
    nationality: "Nationalité",
    knownFor: "Connu pour",
    faq: "Questions fréquentes",
    sources: "Sources",
    related: "Biographies associées",
    lastReviewed: "Dernière vérification",
    published: "Publié",
    editorialNote: "Les informations de cette page sont vérifiées à partir des sources ci-dessous.",
    reportError: "Une erreur ? Signalez-la",
    imageCredit: "Image",
    contents: "Sur cette page",
  },
  search: {
    title: "Recherche",
    placeholder: "Nom, sport, entreprise…",
    noResults: "Aucun résultat pour l’instant.",
    hint: "Saisissez au moins deux lettres.",
  },
  footer: {
    about: "À propos",
    editorial: "Charte éditoriale",
    privacy: "Confidentialité",
    contact: "Contact",
    terms: "Conditions",
    rights: "Tous droits réservés.",
  },
  pages: {
    about: {
      title: "À propos",
      body: "Nous publions des biographies qui répondent aux questions que les lecteurs se posent vraiment, et nous citons nos sources. Chaque page est documentée, rédigée et relue par un éditeur avant sa mise en ligne.",
    },
    editorial: {
      title: "Charte éditoriale",
      body: "Nous nous appuyons sur les profils officiels, les organismes qui décernent des prix, les documents d’entreprise et les médias reconnus. Dates, âges, formation, participations et estimations de fortune doivent correspondre à une source citée. Nous ne publions pas d’affirmations sur la vie privée sans source publique fiable. L’IA aide à la recherche et au premier jet ; un éditeur vérifie chaque information et valide chaque page.",
    },
    privacy: {
      title: "Politique de confidentialité",
      body: "Ce site utilise des cookies de mesure d’audience et, lorsqu’elle est activée, la publicité Google. Les visiteurs de l’EEE, du Royaume-Uni et de Suisse sont invités à donner leur consentement via un outil certifié avant l’affichage d’annonces personnalisées.",
    },
    contact: {
      title: "Contact",
      body: "Pour une correction, une question de droits sur une image ou une biographie, écrivez-nous à l’adresse ci-dessous en indiquant le lien de la page.",
    },
    terms: {
      title: "Conditions d’utilisation",
      body: "Le contenu de ce site est fourni à titre informatif. Nous veillons à son exactitude et citons nos sources, mais les informations sur les personnes vivantes évoluent ; vérifiez les sources pour tout point important. Les textes sont notre propre travail et ne peuvent être repris sans autorisation. Les images appartiennent à leurs auteurs crédités et sont utilisées selon la licence indiquée.",
    },
  },
  ad: "Publicité",
  languages: "Langues",
};

const pt: Dictionary = {
  nav: { home: "Início", categories: "Categorias", search: "Buscar", about: "Sobre" },
  home: {
    title: "Histórias de vida, checadas nas fontes",
    intro:
      "Biografias de atletas, empreendedores, artistas e criadores, escritas por editores e baseadas em fontes que você pode conferir.",
    latest: "Publicadas recentemente",
    browse: "Navegue por categoria",
    empty: "As primeiras biografias estão a caminho.",
  },
  category: { people: "Pessoas nesta categoria", empty: "Ainda não há biografias nesta categoria." },
  bio: {
    keyFacts: "Dados principais",
    born: "Nascimento",
    died: "Morte",
    age: "Idade",
    nationality: "Nacionalidade",
    knownFor: "Conhecido por",
    faq: "Perguntas frequentes",
    sources: "Fontes",
    related: "Biografias relacionadas",
    lastReviewed: "Última revisão",
    published: "Publicado",
    editorialNote: "As informações desta página são conferidas com as fontes listadas abaixo.",
    reportError: "Achou um erro? Fale com a gente",
    imageCredit: "Imagem",
    contents: "Nesta página",
  },
  search: {
    title: "Buscar",
    placeholder: "Busque por nome, esporte, empresa…",
    noResults: "Nenhum resultado por enquanto.",
    hint: "Digite pelo menos duas letras.",
  },
  footer: {
    about: "Sobre",
    editorial: "Política editorial",
    privacy: "Privacidade",
    contact: "Contato",
    terms: "Termos",
    rights: "Todos os direitos reservados.",
  },
  pages: {
    about: {
      title: "Sobre nós",
      body: "Publicamos biografias que respondem ao que as pessoas realmente procuram, e mostramos nossas fontes. Cada página é pesquisada, escrita e revisada por um editor antes de ir ao ar.",
    },
    editorial: {
      title: "Política editorial",
      body: "Usamos perfis oficiais, entidades que concedem prêmios, documentos de empresas e veículos de imprensa reconhecidos. Datas, idades, formação, participações societárias e estimativas de patrimônio precisam bater com uma fonte citada. Não publicamos afirmações sobre vida privada sem fonte pública confiável. Ferramentas de IA ajudam na pesquisa e no rascunho; um editor humano confere cada informação e aprova cada página.",
    },
    privacy: {
      title: "Política de privacidade",
      body: "Este site usa cookies de análise e, quando ativada, publicidade do Google. Visitantes do EEE, do Reino Unido e da Suíça recebem um pedido de consentimento por meio de uma ferramenta certificada antes de verem anúncios personalizados. No Brasil, seguimos a LGPD.",
    },
    contact: {
      title: "Contato",
      body: "Para correções, direitos de imagem ou dúvidas sobre uma biografia, escreva para o endereço abaixo e inclua o link da página.",
    },
    terms: {
      title: "Termos de uso",
      body: "O conteúdo deste site tem caráter informativo. Trabalhamos para que seja preciso e citamos nossas fontes, mas informações sobre pessoas vivas mudam; confira as fontes para qualquer assunto importante. Os textos são nossos e não podem ser reproduzidos sem permissão. As imagens pertencem aos autores creditados e são usadas sob a licença indicada em cada uma.",
    },
  },
  ad: "Publicidade",
  languages: "Idiomas",
};

const dictionaries: Record<Locale, Dictionary> = { en, es, de, fr, pt };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
