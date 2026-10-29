import type { Locale } from "./config";
import type { PageSection } from "./pageSections";

/** Copyright, cookie and disclaimer pages: trust signals reviewers (AdSense, readers) look for in the footer. */
export type LegalKey = "copyright" | "cookies" | "disclaimer";
type LegalPage = { title: string; footer: string; body: string; sections: PageSection[] };

const UPDATED = "2026-10-29";

export const LEGAL_PATHS: Record<LegalKey, string> = { copyright: "copyright", cookies: "cookies", disclaimer: "disclaimer" };

export const LEGAL_PAGES: Record<Locale, Record<LegalKey, LegalPage>> = {
  en: {
    copyright: {
      title: "Copyright policy",
      footer: "Copyright",
      body: "The texts on Orbivida are written by our editorial team and are protected by copyright. This page explains what you may reuse and how to report a copyright problem.",
      sections: [
        { heading: "Our texts", text: "You may quote short passages with a link to the original page. Copying whole articles or republishing them, in any language, needs our written permission." },
        { heading: "Photos", text: "Photos come from Wikimedia Commons under free licences (public domain, CC0, CC BY, CC BY-SA). The author and licence are printed under every image, and those terms apply to any reuse." },
        { heading: "Quotes and sources", text: "Short quotes from interviews and news reports are used for reporting and are always credited to their source with a link." },
        { heading: "Report an infringement", text: "If you believe content on this site infringes your copyright, write to us through the contact page with the page link, a description of the work, proof that you hold the rights and your contact details. We review every notice and remove infringing material promptly." },
        { heading: "Last updated", text: UPDATED },
      ],
    },
    cookies: {
      title: "Cookie policy",
      footer: "Cookies",
      body: "This page lists the cookies and similar technologies Orbivida uses and how you can control them.",
      sections: [
        { heading: "Necessary", text: "Our hosting provider, Cloudflare, may set technical cookies to deliver the site securely and block abuse. They hold no advertising data." },
        { heading: "Analytics", text: "Google Analytics measures visits and popular pages. In the EEA, the UK and Switzerland it only stores cookies after you agree in the consent banner." },
        { heading: "Advertising", text: "Google AdSense and its partners use cookies to show ads and measure them, including ads based on your previous visits to this and other sites. More: https://policies.google.com/technologies/ads. You can turn off personalised ads at https://adssettings.google.com." },
        { heading: "Your choice", text: "Visitors in the EEA, the UK and Switzerland see a Google-certified consent banner and can change their choice at any time from its privacy settings link. You can also delete or block cookies in your browser settings." },
        { heading: "Last updated", text: UPDATED },
      ],
    },
    disclaimer: {
      title: "Disclaimer",
      footer: "Disclaimer",
      body: "Orbivida publishes biographies and news explainers for general information. Please read this before relying on anything you find here.",
      sections: [
        { heading: "Accuracy", text: "Every fact is checked against the sources we cite, but people's lives change quickly and sources can be wrong. Figures such as net worth, salaries or transfer fees are estimates reported by others. If you spot an error, tell us through the contact page and we will correct it." },
        { heading: "No professional advice", text: "Nothing on this site is financial, legal, medical or betting advice." },
        { heading: "No affiliation", text: "Orbivida is independent. We are not affiliated with, endorsed by or paid by the people, clubs, companies or brands we write about. Names and trademarks belong to their owners." },
        { heading: "External links", text: "We link to the sources we use. We are not responsible for the content of external sites." },
        { heading: "Advertising", text: "The site is funded by ads served by Google. Ads are labelled and never influence what we write." },
        { heading: "Last updated", text: UPDATED },
      ],
    },
  },
  es: {
    copyright: {
      title: "Política de derechos de autor",
      footer: "Derechos de autor",
      body: "Los textos de Orbivida los escribe nuestro equipo editorial y están protegidos por derechos de autor. Aquí explicamos qué puedes reutilizar y cómo avisarnos de un problema.",
      sections: [
        { heading: "Nuestros textos", text: "Puedes citar fragmentos breves con un enlace a la página original. Copiar artículos completos o republicarlos, en cualquier idioma, requiere nuestro permiso por escrito." },
        { heading: "Fotos", text: "Las fotos proceden de Wikimedia Commons con licencias libres (dominio público, CC0, CC BY, CC BY-SA). El autor y la licencia figuran bajo cada imagen y rigen cualquier reutilización." },
        { heading: "Citas y fuentes", text: "Las citas breves de entrevistas y noticias se usan con fines informativos y siempre se atribuyen a su fuente con un enlace." },
        { heading: "Denunciar una infracción", text: "Si crees que un contenido infringe tus derechos de autor, escríbenos desde la página de contacto con el enlace, una descripción de la obra, prueba de que tienes los derechos y tus datos de contacto. Revisamos cada aviso y retiramos el material infractor con rapidez." },
        { heading: "Última actualización", text: UPDATED },
      ],
    },
    cookies: {
      title: "Política de cookies",
      footer: "Cookies",
      body: "Esta página enumera las cookies y tecnologías similares que usa Orbivida y cómo puedes controlarlas.",
      sections: [
        { heading: "Necesarias", text: "Nuestro proveedor de alojamiento, Cloudflare, puede usar cookies técnicas para servir el sitio de forma segura y frenar abusos. No contienen datos publicitarios." },
        { heading: "Analítica", text: "Google Analytics mide las visitas y las páginas más leídas. En el EEE, el Reino Unido y Suiza solo guarda cookies después de que lo aceptes en el aviso de consentimiento." },
        { heading: "Publicidad", text: "Google AdSense y sus socios usan cookies para mostrar y medir anuncios, incluidos anuncios basados en tus visitas anteriores a este y otros sitios. Más información: https://policies.google.com/technologies/ads. Puedes desactivar los anuncios personalizados en https://adssettings.google.com." },
        { heading: "Tu elección", text: "Los visitantes del EEE, el Reino Unido y Suiza ven un aviso de consentimiento certificado por Google y pueden cambiar su elección en cualquier momento desde su enlace de privacidad. También puedes borrar o bloquear cookies en tu navegador." },
        { heading: "Última actualización", text: UPDATED },
      ],
    },
    disclaimer: {
      title: "Aviso legal",
      footer: "Aviso legal",
      body: "Orbivida publica biografías y artículos de actualidad con fines informativos. Léelo antes de basarte en algo que encuentres aquí.",
      sections: [
        { heading: "Exactitud", text: "Cada dato se comprueba con las fuentes que citamos, pero la vida de las personas cambia rápido y las fuentes pueden equivocarse. Cifras como patrimonio, salarios o traspasos son estimaciones publicadas por terceros. Si ves un error, avísanos desde la página de contacto y lo corregiremos." },
        { heading: "Sin asesoramiento profesional", text: "Nada en este sitio es asesoramiento financiero, legal, médico ni de apuestas." },
        { heading: "Sin vinculación", text: "Orbivida es independiente. No estamos vinculados, respaldados ni pagados por las personas, clubes, empresas o marcas sobre las que escribimos. Los nombres y marcas pertenecen a sus dueños." },
        { heading: "Enlaces externos", text: "Enlazamos las fuentes que usamos. No somos responsables del contenido de sitios externos." },
        { heading: "Publicidad", text: "El sitio se financia con anuncios de Google. Los anuncios están señalados y nunca influyen en lo que escribimos." },
        { heading: "Última actualización", text: UPDATED },
      ],
    },
  },
  pt: {
    copyright: {
      title: "Política de direitos autorais",
      footer: "Direitos autorais",
      body: "Os textos da Orbivida são escritos pela nossa equipe editorial e protegidos por direitos autorais. Aqui explicamos o que você pode reutilizar e como nos avisar de um problema.",
      sections: [
        { heading: "Nossos textos", text: "Você pode citar trechos curtos com um link para a página original. Copiar artigos inteiros ou republicá-los, em qualquer idioma, exige nossa autorização por escrito." },
        { heading: "Fotos", text: "As fotos vêm do Wikimedia Commons com licenças livres (domínio público, CC0, CC BY, CC BY-SA). O autor e a licença aparecem abaixo de cada imagem e valem para qualquer reutilização." },
        { heading: "Citações e fontes", text: "Citações curtas de entrevistas e notícias são usadas para informar e sempre creditadas à fonte com um link." },
        { heading: "Denunciar uma violação", text: "Se você acredita que um conteúdo viola seus direitos autorais, escreva pela página de contato com o link, a descrição da obra, a prova de que você detém os direitos e seus dados de contato. Analisamos cada aviso e removemos o material infrator rapidamente." },
        { heading: "Última atualização", text: UPDATED },
      ],
    },
    cookies: {
      title: "Política de cookies",
      footer: "Cookies",
      body: "Esta página lista os cookies e tecnologias semelhantes que a Orbivida usa e como você pode controlá-los.",
      sections: [
        { heading: "Necessários", text: "Nosso provedor de hospedagem, a Cloudflare, pode usar cookies técnicos para entregar o site com segurança e bloquear abusos. Eles não contêm dados de publicidade." },
        { heading: "Análise", text: "O Google Analytics mede visitas e as páginas mais lidas. No EEE, no Reino Unido e na Suíça, só grava cookies depois que você aceita no aviso de consentimento." },
        { heading: "Publicidade", text: "O Google AdSense e seus parceiros usam cookies para exibir e medir anúncios, inclusive anúncios com base nas suas visitas anteriores a este e a outros sites. Saiba mais: https://policies.google.com/technologies/ads. Você pode desativar anúncios personalizados em https://adssettings.google.com." },
        { heading: "Sua escolha", text: "Visitantes do EEE, do Reino Unido e da Suíça veem um aviso de consentimento certificado pelo Google e podem mudar a escolha a qualquer momento pelo link de privacidade. Você também pode apagar ou bloquear cookies no navegador." },
        { heading: "Última atualização", text: UPDATED },
      ],
    },
    disclaimer: {
      title: "Aviso legal",
      footer: "Aviso legal",
      body: "A Orbivida publica biografias e matérias explicativas para fins informativos. Leia isto antes de confiar em algo que encontrar aqui.",
      sections: [
        { heading: "Precisão", text: "Cada fato é conferido com as fontes que citamos, mas a vida das pessoas muda rápido e as fontes podem errar. Números como patrimônio, salários ou valores de transferência são estimativas publicadas por terceiros. Se encontrar um erro, avise pela página de contato e vamos corrigir." },
        { heading: "Sem aconselhamento profissional", text: "Nada neste site é aconselhamento financeiro, jurídico, médico ou de apostas." },
        { heading: "Sem vínculo", text: "A Orbivida é independente. Não somos ligados, endossados nem pagos pelas pessoas, clubes, empresas ou marcas sobre os quais escrevemos. Nomes e marcas pertencem aos seus donos." },
        { heading: "Links externos", text: "Linkamos as fontes que usamos. Não somos responsáveis pelo conteúdo de sites externos." },
        { heading: "Publicidade", text: "O site é mantido por anúncios do Google. Os anúncios são identificados e nunca influenciam o que escrevemos." },
        { heading: "Última atualização", text: UPDATED },
      ],
    },
  },
  de: {
    copyright: {
      title: "Urheberrecht",
      footer: "Urheberrecht",
      body: "Die Texte auf Orbivida schreibt unsere Redaktion; sie sind urheberrechtlich geschützt. Hier steht, was Sie weiterverwenden dürfen und wie Sie uns ein Problem melden.",
      sections: [
        { heading: "Unsere Texte", text: "Kurze Zitate mit Link auf die Originalseite sind erlaubt. Ganze Artikel zu kopieren oder neu zu veröffentlichen, in jeder Sprache, erfordert unsere schriftliche Zustimmung." },
        { heading: "Fotos", text: "Die Fotos stammen von Wikimedia Commons und stehen unter freien Lizenzen (gemeinfrei, CC0, CC BY, CC BY-SA). Urheber und Lizenz stehen unter jedem Bild und gelten für jede Weiterverwendung." },
        { heading: "Zitate und Quellen", text: "Kurze Zitate aus Interviews und Berichten dienen der Berichterstattung und werden immer mit Link der Quelle zugeordnet." },
        { heading: "Verstoß melden", text: "Wenn Sie meinen, dass Inhalte Ihr Urheberrecht verletzen, schreiben Sie uns über die Kontaktseite mit dem Link, einer Beschreibung des Werks, einem Nachweis Ihrer Rechte und Ihren Kontaktdaten. Wir prüfen jede Meldung und entfernen rechtsverletzende Inhalte umgehend." },
        { heading: "Stand", text: UPDATED },
      ],
    },
    cookies: {
      title: "Cookie-Richtlinie",
      footer: "Cookies",
      body: "Diese Seite listet die Cookies und ähnlichen Technologien auf, die Orbivida nutzt, und wie Sie sie steuern.",
      sections: [
        { heading: "Notwendig", text: "Unser Hoster Cloudflare kann technische Cookies setzen, um die Seite sicher auszuliefern und Missbrauch zu verhindern. Sie enthalten keine Werbedaten." },
        { heading: "Statistik", text: "Google Analytics misst Besuche und meistgelesene Seiten. Im EWR, im Vereinigten Königreich und in der Schweiz speichert es Cookies erst, nachdem Sie im Einwilligungsbanner zugestimmt haben." },
        { heading: "Werbung", text: "Google AdSense und seine Partner nutzen Cookies, um Anzeigen auszuspielen und zu messen, auch auf Basis Ihrer früheren Besuche auf dieser und anderen Websites. Mehr: https://policies.google.com/technologies/ads. Personalisierte Werbung können Sie unter https://adssettings.google.com abschalten." },
        { heading: "Ihre Wahl", text: "Besucher im EWR, im Vereinigten Königreich und in der Schweiz sehen ein von Google zertifiziertes Einwilligungsbanner und können ihre Wahl jederzeit über dessen Datenschutz-Link ändern. Sie können Cookies auch im Browser löschen oder blockieren." },
        { heading: "Stand", text: UPDATED },
      ],
    },
    disclaimer: {
      title: "Haftungsausschluss",
      footer: "Haftungsausschluss",
      body: "Orbivida veröffentlicht Biografien und Hintergrundartikel zur allgemeinen Information. Bitte lesen Sie dies, bevor Sie sich auf Angaben hier verlassen.",
      sections: [
        { heading: "Richtigkeit", text: "Jede Angabe wird mit den zitierten Quellen abgeglichen, aber Lebensläufe ändern sich schnell und Quellen können irren. Zahlen wie Vermögen, Gehälter oder Ablösesummen sind Schätzungen Dritter. Wenn Sie einen Fehler finden, melden Sie ihn über die Kontaktseite; wir korrigieren ihn." },
        { heading: "Keine Beratung", text: "Nichts auf dieser Website ist Finanz-, Rechts-, Medizin- oder Wettberatung." },
        { heading: "Keine Verbindung", text: "Orbivida ist unabhängig. Wir sind mit den Personen, Vereinen, Unternehmen und Marken, über die wir schreiben, weder verbunden noch werden wir von ihnen unterstützt oder bezahlt. Namen und Marken gehören ihren Inhabern." },
        { heading: "Externe Links", text: "Wir verlinken die Quellen, die wir nutzen. Für Inhalte externer Websites übernehmen wir keine Haftung." },
        { heading: "Werbung", text: "Die Website finanziert sich über Anzeigen von Google. Anzeigen sind gekennzeichnet und beeinflussen nie, was wir schreiben." },
        { heading: "Stand", text: UPDATED },
      ],
    },
  },
  fr: {
    copyright: {
      title: "Politique de droits d'auteur",
      footer: "Droits d'auteur",
      body: "Les textes d'Orbivida sont écrits par notre rédaction et protégés par le droit d'auteur. Voici ce que vous pouvez réutiliser et comment nous signaler un problème.",
      sections: [
        { heading: "Nos textes", text: "Vous pouvez citer de courts extraits avec un lien vers la page d'origine. Copier ou republier des articles entiers, dans n'importe quelle langue, nécessite notre accord écrit." },
        { heading: "Photos", text: "Les photos viennent de Wikimedia Commons sous licences libres (domaine public, CC0, CC BY, CC BY-SA). L'auteur et la licence figurent sous chaque image et s'appliquent à toute réutilisation." },
        { heading: "Citations et sources", text: "Les courtes citations d'interviews et d'articles sont utilisées à des fins d'information et toujours attribuées à leur source avec un lien." },
        { heading: "Signaler une atteinte", text: "Si vous pensez qu'un contenu porte atteinte à vos droits, écrivez-nous via la page contact avec le lien, une description de l'œuvre, la preuve de vos droits et vos coordonnées. Nous examinons chaque signalement et retirons rapidement le contenu en cause." },
        { heading: "Dernière mise à jour", text: UPDATED },
      ],
    },
    cookies: {
      title: "Politique de cookies",
      footer: "Cookies",
      body: "Cette page liste les cookies et technologies similaires utilisés par Orbivida et la façon de les contrôler.",
      sections: [
        { heading: "Nécessaires", text: "Notre hébergeur, Cloudflare, peut déposer des cookies techniques pour servir le site en sécurité et bloquer les abus. Ils ne contiennent aucune donnée publicitaire." },
        { heading: "Mesure d'audience", text: "Google Analytics mesure les visites et les pages les plus lues. Dans l'EEE, au Royaume-Uni et en Suisse, il ne dépose de cookies qu'après votre accord dans la bannière de consentement." },
        { heading: "Publicité", text: "Google AdSense et ses partenaires utilisent des cookies pour afficher et mesurer des annonces, y compris selon vos visites précédentes sur ce site et d'autres. En savoir plus : https://policies.google.com/technologies/ads. Vous pouvez désactiver les annonces personnalisées sur https://adssettings.google.com." },
        { heading: "Votre choix", text: "Les visiteurs de l'EEE, du Royaume-Uni et de Suisse voient une bannière de consentement certifiée par Google et peuvent modifier leur choix à tout moment via son lien de confidentialité. Vous pouvez aussi supprimer ou bloquer les cookies dans votre navigateur." },
        { heading: "Dernière mise à jour", text: UPDATED },
      ],
    },
    disclaimer: {
      title: "Avertissement",
      footer: "Avertissement",
      body: "Orbivida publie des biographies et des articles d'actualité à titre d'information générale. Lisez ceci avant de vous fier à ce que vous trouvez ici.",
      sections: [
        { heading: "Exactitude", text: "Chaque fait est vérifié avec les sources citées, mais la vie des gens évolue vite et les sources peuvent se tromper. Les chiffres comme la fortune, les salaires ou les transferts sont des estimations publiées par d'autres. Si vous repérez une erreur, signalez-la via la page contact et nous la corrigerons." },
        { heading: "Pas de conseil professionnel", text: "Rien sur ce site ne constitue un conseil financier, juridique, médical ou de paris." },
        { heading: "Aucune affiliation", text: "Orbivida est indépendant. Nous ne sommes ni liés, ni soutenus, ni payés par les personnes, clubs, entreprises ou marques dont nous parlons. Les noms et marques appartiennent à leurs propriétaires." },
        { heading: "Liens externes", text: "Nous renvoyons vers les sources utilisées. Nous ne sommes pas responsables du contenu des sites externes." },
        { heading: "Publicité", text: "Le site est financé par des annonces de Google. Elles sont signalées et n'influencent jamais ce que nous écrivons." },
        { heading: "Dernière mise à jour", text: UPDATED },
      ],
    },
  },
};
