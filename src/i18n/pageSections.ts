import type { Locale } from "./config";

/** Extra sections under the intro of the static pages. The privacy text covers what AdSense requires a policy to say. */
export type PageSection = { heading: string; text: string };
type SectionKey = "about" | "privacy";

const UPDATED = "2026-10-27";

export const PAGE_SECTIONS: Record<Locale, Partial<Record<SectionKey, PageSection[]>>> = {
  en: {
    about: [
      { heading: "Who we are", text: "Orbivida is an independent biography site run by our editor-in-chief, Adem Caba. We write about athletes, creators, entrepreneurs and artists in English, Spanish, Portuguese, German and French." },
      { heading: "How a page is made", text: "We pick people that readers are searching for, gather official profiles, club and league pages, award bodies, company filings and interviews, and write the page from those sources. Every factual claim carries a citation you can open. AI tools help with research, drafting and translation; the result is checked against the cited sources before it goes live." },
      { heading: "Photos", text: "Photos come from Wikimedia Commons and are shown with the author's name and licence under each image." },
      { heading: "Corrections", text: "If something is wrong or out of date, write to us through the contact page with the link to the page. We fix confirmed errors promptly and update the review date." },
    ],
    privacy: [
      { heading: "What we collect", text: "You do not need an account to use this site. Our hosting provider, Cloudflare, processes standard technical data such as your IP address, browser type and the pages you request, so that the site can be delivered and protected. If you email us, we keep your message and address only to answer it." },
      { heading: "Cookies and advertising", text: "Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website or other websites. Google's use of advertising cookies enables it and its partners to serve ads to you based on your visits to this site and/or other sites on the Internet. You can opt out of personalised advertising in Google Ads Settings: https://adssettings.google.com. You can also opt out of some third-party vendors' use of cookies for personalised advertising at https://www.aboutads.info/choices. How Google uses data from sites that use its services: https://policies.google.com/technologies/partner-sites" },
      { heading: "Consent", text: "Visitors in the EEA, the UK and Switzerland are asked for consent through a Google-certified consent tool before personalised ads or analytics cookies are used. You can change your choice at any time from the privacy and cookie settings link that the consent tool shows." },
      { heading: "Analytics", text: "We may use Google Analytics to count visits and see which pages are read. It uses cookies only where you have allowed them." },
      { heading: "Your rights", text: "Depending on where you live (for example under the GDPR, the UK GDPR, Brazil's LGPD or California's CCPA), you can ask to see, correct or delete personal data we hold about you. Write to us through the contact page." },
      { heading: "Children", text: "This site is not directed at children under 13, and we do not knowingly collect their personal data." },
      { heading: "Changes", text: `We will update this page if our practices change. Last updated: ${UPDATED}.` },
    ],
  },
  es: {
    about: [
      { heading: "Quiénes somos", text: "Orbivida es un sitio independiente de biografías dirigido por nuestro editor jefe, Adem Caba. Escribimos sobre deportistas, creadores, emprendedores y artistas en inglés, español, portugués, alemán y francés." },
      { heading: "Cómo se hace una página", text: "Elegimos a las personas que los lectores buscan, reunimos perfiles oficiales, páginas de clubes y ligas, organismos que entregan premios, registros de empresas y entrevistas, y escribimos la página a partir de esas fuentes. Cada dato lleva una cita que puedes abrir. Las herramientas de IA ayudan con la investigación, la redacción y la traducción; el resultado se contrasta con las fuentes citadas antes de publicarse." },
      { heading: "Fotos", text: "Las fotos proceden de Wikimedia Commons y se muestran con el nombre del autor y la licencia bajo cada imagen." },
      { heading: "Correcciones", text: "Si algo es incorrecto o está desactualizado, escríbenos desde la página de contacto con el enlace a la página. Corregimos con rapidez los errores confirmados y actualizamos la fecha de revisión." },
    ],
    privacy: [
      { heading: "Qué datos recogemos", text: "No necesitas una cuenta para usar este sitio. Nuestro proveedor de alojamiento, Cloudflare, trata datos técnicos habituales como tu dirección IP, el tipo de navegador y las páginas que solicitas, para servir y proteger el sitio. Si nos escribes, guardamos tu mensaje y tu dirección solo para responderte." },
      { heading: "Cookies y publicidad", text: "Proveedores externos, incluido Google, utilizan cookies para mostrar anuncios basados en tus visitas anteriores a este sitio web o a otros sitios. El uso de cookies publicitarias por parte de Google le permite a él y a sus socios mostrarte anuncios basados en tus visitas a este sitio y/o a otros sitios de Internet. Puedes desactivar la publicidad personalizada en la Configuración de anuncios de Google: https://adssettings.google.com. También puedes desactivar el uso de cookies de algunos proveedores externos en https://www.aboutads.info/choices. Cómo usa Google los datos de los sitios que utilizan sus servicios: https://policies.google.com/technologies/partner-sites" },
      { heading: "Consentimiento", text: "A los visitantes del EEE, el Reino Unido y Suiza se les pide su consentimiento mediante una herramienta certificada por Google antes de usar anuncios personalizados o cookies de analítica. Puedes cambiar tu elección en cualquier momento desde el enlace de configuración de privacidad y cookies que muestra esa herramienta." },
      { heading: "Analítica", text: "Podemos usar Google Analytics para contar visitas y ver qué páginas se leen. Solo usa cookies cuando lo has permitido." },
      { heading: "Tus derechos", text: "Según dónde vivas (por ejemplo, conforme al RGPD), puedes pedir ver, corregir o borrar los datos personales que tengamos sobre ti. Escríbenos desde la página de contacto." },
      { heading: "Menores", text: "Este sitio no está dirigido a menores de 13 años y no recogemos conscientemente sus datos personales." },
      { heading: "Cambios", text: `Actualizaremos esta página si cambian nuestras prácticas. Última actualización: ${UPDATED}.` },
    ],
  },
  de: {
    about: [
      { heading: "Wer wir sind", text: "Orbivida ist eine unabhängige Biografie-Website, die von unserem Chefredakteur Adem Caba geführt wird. Wir schreiben über Sportler, Creator, Unternehmer und Künstler auf Englisch, Spanisch, Portugiesisch, Deutsch und Französisch." },
      { heading: "Wie eine Seite entsteht", text: "Wir wählen Menschen aus, nach denen Leser suchen, sammeln offizielle Profile, Seiten von Vereinen und Ligen, Preisverleihern, Unternehmensberichte und Interviews und schreiben die Seite aus diesen Quellen. Jede Tatsachenbehauptung hat einen Beleg, den du öffnen kannst. KI-Werkzeuge helfen bei Recherche, Entwurf und Übersetzung; das Ergebnis wird vor der Veröffentlichung mit den Quellen abgeglichen." },
      { heading: "Fotos", text: "Die Fotos stammen von Wikimedia Commons und werden mit Urheber und Lizenz unter dem Bild angezeigt." },
      { heading: "Korrekturen", text: "Wenn etwas falsch oder veraltet ist, schreib uns über die Kontaktseite mit dem Link zur Seite. Bestätigte Fehler korrigieren wir zügig und aktualisieren das Prüfdatum." },
    ],
    privacy: [
      { heading: "Welche Daten wir erheben", text: "Für die Nutzung dieser Website brauchst du kein Konto. Unser Hosting-Anbieter Cloudflare verarbeitet übliche technische Daten wie IP-Adresse, Browsertyp und aufgerufene Seiten, um die Website auszuliefern und zu schützen. Wenn du uns schreibst, speichern wir Nachricht und Adresse nur, um zu antworten." },
      { heading: "Cookies und Werbung", text: "Drittanbieter, darunter Google, verwenden Cookies, um Anzeigen auf Grundlage deiner früheren Besuche auf dieser oder anderen Websites zu schalten. Durch Werbe-Cookies können Google und seine Partner dir Anzeigen auf Grundlage deiner Besuche auf dieser und/oder anderen Websites im Internet zeigen. Personalisierte Werbung kannst du in den Google-Anzeigeneinstellungen deaktivieren: https://adssettings.google.com. Die Cookie-Nutzung mancher Drittanbieter kannst du unter https://www.aboutads.info/choices deaktivieren. Wie Google Daten von Websites nutzt, die seine Dienste verwenden: https://policies.google.com/technologies/partner-sites" },
      { heading: "Einwilligung", text: "Besucher aus dem EWR, dem Vereinigten Königreich und der Schweiz werden über ein von Google zertifiziertes Einwilligungstool gefragt, bevor personalisierte Anzeigen oder Analyse-Cookies verwendet werden. Du kannst deine Wahl jederzeit über den Link zu den Datenschutz- und Cookie-Einstellungen ändern, den dieses Tool anzeigt." },
      { heading: "Statistik", text: "Wir nutzen möglicherweise Google Analytics, um Besuche zu zählen und zu sehen, welche Seiten gelesen werden. Cookies werden nur gesetzt, wenn du zugestimmt hast." },
      { heading: "Deine Rechte", text: "Nach der DSGVO kannst du Auskunft über deine bei uns gespeicherten personenbezogenen Daten verlangen und sie berichtigen oder löschen lassen. Schreib uns über die Kontaktseite." },
      { heading: "Kinder", text: "Diese Website richtet sich nicht an Kinder unter 13 Jahren, und wir erheben wissentlich keine Daten von ihnen." },
      { heading: "Änderungen", text: `Wir aktualisieren diese Seite, wenn sich unsere Praxis ändert. Zuletzt aktualisiert: ${UPDATED}.` },
    ],
  },
  fr: {
    about: [
      { heading: "Qui sommes-nous", text: "Orbivida est un site de biographies indépendant dirigé par notre rédacteur en chef, Adem Caba. Nous écrivons sur des sportifs, des créateurs, des entrepreneurs et des artistes en anglais, espagnol, portugais, allemand et français." },
      { heading: "Comment une page est faite", text: "Nous choisissons des personnes que les lecteurs recherchent, rassemblons profils officiels, pages de clubs et de ligues, organismes qui décernent des prix, documents d’entreprises et interviews, puis rédigeons la page à partir de ces sources. Chaque fait est accompagné d’une référence que vous pouvez ouvrir. Des outils d’IA aident à la recherche, à la rédaction et à la traduction ; le résultat est comparé aux sources citées avant publication." },
      { heading: "Photos", text: "Les photos proviennent de Wikimedia Commons et sont affichées avec le nom de l’auteur et la licence sous chaque image." },
      { heading: "Corrections", text: "Si une information est fausse ou dépassée, écrivez-nous depuis la page de contact en indiquant le lien de la page. Nous corrigeons rapidement les erreurs confirmées et mettons à jour la date de vérification." },
    ],
    privacy: [
      { heading: "Données collectées", text: "Aucun compte n’est nécessaire pour utiliser ce site. Notre hébergeur, Cloudflare, traite des données techniques courantes comme votre adresse IP, votre navigateur et les pages demandées, afin de diffuser et protéger le site. Si vous nous écrivez, nous conservons votre message et votre adresse uniquement pour vous répondre." },
      { heading: "Cookies et publicité", text: "Des fournisseurs tiers, dont Google, utilisent des cookies pour diffuser des annonces en fonction de vos visites précédentes sur ce site ou sur d’autres sites. Les cookies publicitaires permettent à Google et à ses partenaires de vous proposer des annonces en fonction de vos visites sur ce site et/ou sur d’autres sites Internet. Vous pouvez désactiver la publicité personnalisée dans les Paramètres des annonces Google : https://adssettings.google.com. Vous pouvez aussi refuser l’utilisation de cookies par certains fournisseurs tiers sur https://www.aboutads.info/choices. Comment Google utilise les données des sites qui utilisent ses services : https://policies.google.com/technologies/partner-sites" },
      { heading: "Consentement", text: "Les visiteurs de l’EEE, du Royaume-Uni et de Suisse sont invités à donner leur consentement via un outil certifié par Google avant toute publicité personnalisée ou tout cookie de mesure d’audience. Vous pouvez modifier votre choix à tout moment depuis le lien des paramètres de confidentialité et de cookies affiché par cet outil." },
      { heading: "Mesure d’audience", text: "Nous pouvons utiliser Google Analytics pour compter les visites et voir quelles pages sont lues. Les cookies ne sont utilisés qu’avec votre accord." },
      { heading: "Vos droits", text: "Conformément au RGPD, vous pouvez demander à consulter, corriger ou supprimer les données personnelles que nous détenons sur vous. Écrivez-nous depuis la page de contact." },
      { heading: "Enfants", text: "Ce site ne s’adresse pas aux enfants de moins de 13 ans et nous ne collectons pas sciemment leurs données." },
      { heading: "Modifications", text: `Nous mettrons cette page à jour si nos pratiques changent. Dernière mise à jour : ${UPDATED}.` },
    ],
  },
  pt: {
    about: [
      { heading: "Quem somos", text: "O Orbivida é um site independente de biografias dirigido pelo nosso editor-chefe, Adem Caba. Escrevemos sobre atletas, criadores, empreendedores e artistas em inglês, espanhol, português, alemão e francês." },
      { heading: "Como uma página é feita", text: "Escolhemos pessoas que os leitores estão procurando, reunimos perfis oficiais, páginas de clubes e ligas, entidades que concedem prêmios, documentos de empresas e entrevistas, e escrevemos a página a partir dessas fontes. Cada fato traz uma citação que você pode abrir. Ferramentas de IA ajudam na pesquisa, na redação e na tradução; o resultado é conferido com as fontes citadas antes de ir ao ar." },
      { heading: "Fotos", text: "As fotos vêm do Wikimedia Commons e aparecem com o nome do autor e a licença abaixo de cada imagem." },
      { heading: "Correções", text: "Se algo estiver errado ou desatualizado, escreva para nós pela página de contato com o link da página. Corrigimos rapidamente os erros confirmados e atualizamos a data de revisão." },
    ],
    privacy: [
      { heading: "Quais dados coletamos", text: "Você não precisa de conta para usar este site. Nosso provedor de hospedagem, a Cloudflare, trata dados técnicos comuns como endereço IP, tipo de navegador e páginas acessadas, para entregar e proteger o site. Se você nos escrever, guardamos sua mensagem e seu endereço apenas para responder." },
      { heading: "Cookies e publicidade", text: "Fornecedores terceiros, incluindo o Google, usam cookies para exibir anúncios com base em suas visitas anteriores a este site ou a outros sites. O uso de cookies de publicidade permite que o Google e seus parceiros exibam anúncios com base em suas visitas a este site e/ou a outros sites na Internet. Você pode desativar a publicidade personalizada nas Configurações de anúncios do Google: https://adssettings.google.com. Também pode desativar o uso de cookies de alguns fornecedores terceiros em https://www.aboutads.info/choices. Como o Google usa dados de sites que usam seus serviços: https://policies.google.com/technologies/partner-sites" },
      { heading: "Consentimento", text: "Visitantes do EEE, do Reino Unido e da Suíça recebem um pedido de consentimento por meio de uma ferramenta certificada pelo Google antes do uso de anúncios personalizados ou cookies de análise. Você pode mudar sua escolha a qualquer momento pelo link de configurações de privacidade e cookies exibido por essa ferramenta." },
      { heading: "Análise", text: "Podemos usar o Google Analytics para contar visitas e ver quais páginas são lidas. Ele só usa cookies quando você permite." },
      { heading: "Seus direitos", text: "Nos termos da LGPD (e do RGPD na Europa), você pode pedir para ver, corrigir ou excluir os dados pessoais que temos sobre você. Escreva para nós pela página de contato." },
      { heading: "Crianças", text: "Este site não é direcionado a menores de 13 anos e não coletamos intencionalmente dados deles." },
      { heading: "Alterações", text: `Atualizaremos esta página se nossas práticas mudarem. Última atualização: ${UPDATED}.` },
    ],
  },
};
