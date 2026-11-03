import type { Locale } from "./config";
import type { PageSection } from "./pageSections";

/**
 * Trust pages written for what this site actually is: source-checked biographies of online creators and
 * film and TV actors (plus musicians and athletes). Reviewers (AdSense, readers) look for who runs the site,
 * what it covers, how facts are checked and how to reach a human.
 * `{people}`, `{sources}` and `{email}` are filled in at build time.
 */
type TrustText = {
  about: PageSection[];
  stats: string;
  contact: PageSection[];
  privacyExtra: PageSection[];
  cookiesExtra: PageSection[];
  imprint: { title: string; footer: string; body: string; sections: PageSection[] };
};

export const TRUST_UPDATED = "2026-11-03";

export const TRUST: Record<Locale, TrustText> = {
  en: {
    about: [
      { heading: "Who we are", text: "Orbivida is an independent biography site founded and run by Adem Caba, a software developer who has always liked reading about the people behind famous names. We publish in English, Spanish, Portuguese, German and French, and every language version is written and checked for its own readers instead of being copied word for word from English." },
      { heading: "What we cover", text: "We focus on the people readers look up the moment they first hear a name: YouTubers, streamers, TikTok and Instagram creators, film and television actors (including the character actors and casts of well-loved series and films), musicians and athletes. A page answers the questions people actually ask, such as age, real name, where they come from, how they got started, public relationships and what they are doing now." },
      { heading: "What we do not cover", text: "We do not write about minors, private individuals or people who are only in the news because of a crime or a tragedy. We do not publish rumours, leaked private information, explicit content, or speculation about anyone's health, sexuality or family life. Pages about creators who also work on adult subscription platforms describe their public career only." },
      { heading: "Where our facts come from", text: "We use official websites and verified social profiles, studio, network, club and league pages, award bodies, company filings and reporting by established news outlets. Every factual claim links to its source in the reference list at the end of the page, so you can check it yourself. When good sources disagree, for example on a birth date, we say so instead of quietly picking one." },
      { heading: "How a page is checked", text: "AI tools help us research, draft and translate. Before a page goes live, an automated fact-check opens every cited source and compares it with each claim; pages with wrong or unsupported statements are rejected and rewritten. Pages on sensitive subjects are read by our editor-in-chief before publication. Each page shows who wrote it, who reviewed it and when it was last checked." },
      { heading: "Keeping pages up to date", text: "We go back to a page when there is major news about the person, when facts such as age, team or current project change, and when search data shows readers asking something the page does not answer yet. The review date on every page tells you when it was last checked." },
      { heading: "Photos", text: "Photos come from Wikimedia Commons and are shown with the author's name and licence under each image. We never use paparazzi shots or images taken from private accounts." },
      { heading: "Independence and advertising", text: "Orbivida is funded by ads served by Google. Nobody can pay to be covered, to be left out or to change a page, and advertisers never see or influence what we write. We are not affiliated with the people, studios, clubs or brands we write about." },
      { heading: "Corrections and requests", text: "If something is wrong or out of date, write to us through the contact page with the link to the page. We fix confirmed errors promptly and update the review date. If a page is about you, you can also ask us to update it or to remove personal details that are not of public interest." },
    ],
    stats: "Today Orbivida has {people} published biographies in this language, backed by {sources} cited sources.",
    contact: [
      { heading: "Report an error", text: "Send the link to the page, what is wrong and, if you can, a source that shows the correct fact. We check every report and update the page and its review date once the correction is confirmed." },
      { heading: "If a page is about you", text: "If a biography is about you or someone you represent, you can ask us to correct or update it, or to remove personal details that are not of public interest. Please write from an official address or link to a verified profile so we can confirm who you are." },
      { heading: "Copyright and photos", text: "For a copyright notice about a text or photo, include the page link, the work concerned and proof that you hold the rights. Details are in our copyright policy." },
      { heading: "Privacy requests", text: "To see, correct or delete personal data we hold about you, write to us with the subject 'Privacy request'." },
      { heading: "Suggestions and other messages", text: "Suggestions for people to cover and general feedback are welcome. We do not accept paid articles, sponsored biographies or link placements." },
      { heading: "Who answers", text: "Every message is read by our editor-in-chief, Adem Caba. We usually reply within three working days, in English or in the language you wrote in." },
    ],
    privacyExtra: [
      { heading: "Who is responsible", text: "This website is operated by Adem Caba, who is responsible for the processing of personal data described on this page. You can reach him at {email}." },
      { heading: "Legal bases", text: "We process technical data to deliver and protect the site (legitimate interest). Analytics and personalised advertising cookies are used only with your consent where the law requires it. Emails are processed to answer your request." },
      { heading: "How long we keep data", text: "Emails are deleted once the matter is closed, at the latest after 12 months. Analytics data is kept for at most 14 months. Technical logs at Cloudflare and advertising data at Google are kept for the periods set in their own policies." },
      { heading: "Service providers", text: "We use Cloudflare (hosting and security) and Google (AdSense advertising, consent management and Analytics). These providers may process data outside your country under the safeguards described in their policies: https://www.cloudflare.com/privacypolicy/ and https://policies.google.com/privacy" },
    ],
    cookiesExtra: [
      { heading: "Cookies you may see", text: "Consent: FCCDCF and FCNEC store your consent choice (up to 13 months). Analytics: _ga and _ga_* tell visits apart (up to 2 years). Advertising: __gads, __gpi and __eoi help Google show ads and limit how often you see them (up to 13 months); Google may also use cookies on its own domains, such as IDE. We do not set any cookies of our own for tracking." },
    ],
    imprint: {
      title: "Imprint",
      footer: "Imprint",
      body: "Who runs Orbivida and who is responsible for its content.",
      sections: [
        { heading: "Operator", text: "Orbivida (orbivida.com) is an independent website published by Adem Caba as an individual." },
        { heading: "Responsible for content", text: "Adem Caba, founder and editor-in-chief." },
        { heading: "Contact", text: "Email: {email}. You can also use our contact page." },
        { heading: "Hosting", text: "Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, USA (Cloudflare Pages)." },
        { heading: "Advertising", text: "Ads on this site are served by Google through Google AdSense. Ads are labelled and do not influence our content." },
        { heading: "Editorial standards", text: "How we choose, write and check our pages is described in our editorial policy." },
        { heading: "External links", text: "We check sources when we cite them, but we are not responsible for later changes to external websites." },
        { heading: "Last updated", text: TRUST_UPDATED },
      ],
    },
  },
  es: {
    about: [
      { heading: "Quiénes somos", text: "Orbivida es un sitio independiente de biografías fundado y dirigido por Adem Caba, desarrollador de software al que siempre le ha gustado leer sobre las personas que hay detrás de los nombres famosos. Publicamos en inglés, español, portugués, alemán y francés, y cada versión se escribe y se revisa para sus propios lectores, no se copia palabra por palabra del inglés." },
      { heading: "De quién escribimos", text: "Nos centramos en las personas que los lectores buscan en cuanto oyen un nombre por primera vez: youtubers, streamers, creadores de TikTok e Instagram, actores de cine y televisión (también actores de reparto y elencos de series y películas muy queridas), músicos y deportistas. Cada página responde a lo que la gente pregunta de verdad: edad, nombre real, de dónde es, cómo empezó, relaciones públicas y a qué se dedica ahora." },
      { heading: "De quién no escribimos", text: "No escribimos sobre menores, particulares ni personas que solo son noticia por un delito o una tragedia. No publicamos rumores, información privada filtrada, contenido explícito ni especulaciones sobre la salud, la sexualidad o la vida familiar de nadie. Las páginas de creadores que también trabajan en plataformas de suscripción para adultos tratan solo su carrera pública." },
      { heading: "De dónde salen los datos", text: "Usamos webs oficiales y perfiles sociales verificados, páginas de estudios, cadenas, clubes y ligas, organismos que entregan premios, registros de empresas e información de medios consolidados. Cada dato enlaza con su fuente en la lista de referencias al final de la página, para que puedas comprobarlo. Cuando fuentes fiables no coinciden, por ejemplo en una fecha de nacimiento, lo decimos en lugar de elegir una sin avisar." },
      { heading: "Cómo se revisa una página", text: "Las herramientas de IA nos ayudan a investigar, redactar y traducir. Antes de publicar, una verificación automática abre cada fuente citada y la compara con cada dato; las páginas con afirmaciones erróneas o sin respaldo se rechazan y se reescriben. Las páginas sobre temas sensibles las lee nuestro editor jefe antes de publicarse. Cada página indica quién la escribió, quién la revisó y cuándo se comprobó por última vez." },
      { heading: "Cómo mantenemos las páginas al día", text: "Volvemos a una página cuando hay una noticia importante sobre la persona, cuando cambian datos como la edad, el equipo o el proyecto actual, y cuando los datos de búsqueda muestran que los lectores preguntan algo que la página aún no responde. La fecha de revisión de cada página indica cuándo se comprobó por última vez." },
      { heading: "Fotos", text: "Las fotos proceden de Wikimedia Commons y se muestran con el nombre del autor y la licencia bajo cada imagen. Nunca usamos fotos de paparazzi ni imágenes sacadas de cuentas privadas." },
      { heading: "Independencia y publicidad", text: "Orbivida se financia con anuncios servidos por Google. Nadie puede pagar para aparecer, para no aparecer o para cambiar una página, y los anunciantes no ven ni influyen en lo que escribimos. No tenemos relación con las personas, estudios, clubes o marcas de los que hablamos." },
      { heading: "Correcciones y solicitudes", text: "Si algo es incorrecto o está desactualizado, escríbenos desde la página de contacto con el enlace a la página. Corregimos con rapidez los errores confirmados y actualizamos la fecha de revisión. Si una página trata sobre ti, también puedes pedirnos que la actualicemos o que retiremos datos personales que no sean de interés público." },
    ],
    stats: "Hoy Orbivida tiene {people} biografías publicadas en este idioma, respaldadas por {sources} fuentes citadas.",
    contact: [
      { heading: "Avisar de un error", text: "Envía el enlace a la página, qué está mal y, si puedes, una fuente que muestre el dato correcto. Revisamos cada aviso y actualizamos la página y su fecha de revisión cuando la corrección está confirmada." },
      { heading: "Si una página trata sobre ti", text: "Si una biografía trata sobre ti o sobre alguien a quien representas, puedes pedirnos que la corrijamos o actualicemos, o que retiremos datos personales que no sean de interés público. Escríbenos desde una dirección oficial o enlaza un perfil verificado para que podamos confirmar tu identidad." },
      { heading: "Derechos de autor y fotos", text: "Para un aviso de derechos de autor sobre un texto o una foto, incluye el enlace a la página, la obra afectada y una prueba de que tienes los derechos. Más detalles en nuestra política de derechos de autor." },
      { heading: "Solicitudes de privacidad", text: "Para ver, corregir o borrar datos personales que tengamos sobre ti, escríbenos con el asunto «Solicitud de privacidad»." },
      { heading: "Sugerencias y otros mensajes", text: "Agradecemos sugerencias de personas sobre las que escribir y comentarios generales. No aceptamos artículos pagados, biografías patrocinadas ni enlaces de pago." },
      { heading: "Quién responde", text: "Todos los mensajes los lee nuestro editor jefe, Adem Caba. Solemos responder en un plazo de tres días laborables, en inglés o en el idioma en que nos escribas." },
    ],
    privacyExtra: [
      { heading: "Responsable", text: "Este sitio web lo gestiona Adem Caba, responsable del tratamiento de los datos personales descritos en esta página. Puedes escribirle a {email}." },
      { heading: "Bases legales", text: "Tratamos datos técnicos para servir y proteger el sitio (interés legítimo). Las cookies de analítica y de publicidad personalizada solo se usan con tu consentimiento cuando la ley lo exige. Los correos se tratan para responder a tu solicitud." },
      { heading: "Cuánto tiempo guardamos los datos", text: "Los correos se borran cuando el asunto queda cerrado, como máximo a los 12 meses. Los datos de analítica se conservan un máximo de 14 meses. Los registros técnicos de Cloudflare y los datos publicitarios de Google se conservan según sus propias políticas." },
      { heading: "Proveedores", text: "Usamos Cloudflare (alojamiento y seguridad) y Google (publicidad de AdSense, gestión del consentimiento y Analytics). Estos proveedores pueden tratar datos fuera de tu país con las garantías descritas en sus políticas: https://www.cloudflare.com/privacypolicy/ y https://policies.google.com/privacy" },
    ],
    cookiesExtra: [
      { heading: "Cookies que puedes ver", text: "Consentimiento: FCCDCF y FCNEC guardan tu elección (hasta 13 meses). Analítica: _ga y _ga_* distinguen visitas (hasta 2 años). Publicidad: __gads, __gpi y __eoi ayudan a Google a mostrar anuncios y a limitar cuántas veces los ves (hasta 13 meses); Google también puede usar cookies en sus propios dominios, como IDE. No usamos cookies propias de seguimiento." },
    ],
    imprint: {
      title: "Aviso legal",
      footer: "Aviso legal",
      body: "Quién gestiona Orbivida y quién es responsable de su contenido.",
      sections: [
        { heading: "Titular", text: "Orbivida (orbivida.com) es un sitio web independiente publicado por Adem Caba como particular." },
        { heading: "Responsable del contenido", text: "Adem Caba, fundador y editor jefe." },
        { heading: "Contacto", text: "Correo: {email}. También puedes usar nuestra página de contacto." },
        { heading: "Alojamiento", text: "Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, EE. UU. (Cloudflare Pages)." },
        { heading: "Publicidad", text: "Los anuncios de este sitio los sirve Google mediante Google AdSense. Están identificados y no influyen en nuestro contenido." },
        { heading: "Normas editoriales", text: "Cómo elegimos, escribimos y revisamos nuestras páginas se explica en nuestra política editorial." },
        { heading: "Enlaces externos", text: "Revisamos las fuentes cuando las citamos, pero no somos responsables de cambios posteriores en sitios externos." },
        { heading: "Última actualización", text: TRUST_UPDATED },
      ],
    },
  },
  pt: {
    about: [
      { heading: "Quem somos", text: "O Orbivida é um site independente de biografias fundado e dirigido por Adem Caba, desenvolvedor de software que sempre gostou de ler sobre as pessoas por trás dos nomes famosos. Publicamos em inglês, espanhol, português, alemão e francês, e cada versão é escrita e revisada para os seus próprios leitores, sem ser copiada palavra por palavra do inglês." },
      { heading: "Sobre quem escrevemos", text: "Nosso foco são as pessoas que os leitores pesquisam assim que ouvem um nome pela primeira vez: youtubers, streamers, criadores do TikTok e do Instagram, atores de cinema e televisão (inclusive coadjuvantes e elencos de séries e filmes queridos), músicos e atletas. Cada página responde ao que as pessoas realmente perguntam: idade, nome verdadeiro, de onde vem, como começou, relacionamentos públicos e o que faz hoje." },
      { heading: "Sobre quem não escrevemos", text: "Não escrevemos sobre menores de idade, pessoas privadas ou pessoas que só estão no noticiário por causa de um crime ou de uma tragédia. Não publicamos boatos, informações privadas vazadas, conteúdo explícito nem especulações sobre saúde, sexualidade ou vida familiar de ninguém. Páginas sobre criadores que também atuam em plataformas de assinatura adultas tratam apenas da carreira pública." },
      { heading: "De onde vêm as informações", text: "Usamos sites oficiais e perfis verificados, páginas de estúdios, emissoras, clubes e ligas, entidades que concedem prêmios, documentos de empresas e reportagens de veículos consolidados. Cada fato tem link para a sua fonte na lista de referências no fim da página, para você conferir. Quando boas fontes discordam, por exemplo sobre uma data de nascimento, dizemos isso em vez de escolher uma em silêncio." },
      { heading: "Como uma página é revisada", text: "Ferramentas de IA ajudam na pesquisa, na redação e na tradução. Antes de publicar, uma checagem automática abre cada fonte citada e a compara com cada informação; páginas com afirmações erradas ou sem respaldo são rejeitadas e reescritas. Páginas sobre temas sensíveis são lidas pelo nosso editor-chefe antes da publicação. Cada página mostra quem a escreveu, quem a revisou e quando foi conferida pela última vez." },
      { heading: "Como mantemos as páginas atualizadas", text: "Voltamos a uma página quando há uma notícia importante sobre a pessoa, quando mudam dados como idade, time ou projeto atual, e quando os dados de busca mostram leitores perguntando algo que a página ainda não responde. A data de revisão de cada página indica quando ela foi conferida pela última vez." },
      { heading: "Fotos", text: "As fotos vêm do Wikimedia Commons e aparecem com o nome do autor e a licença abaixo de cada imagem. Nunca usamos fotos de paparazzi nem imagens tiradas de contas privadas." },
      { heading: "Independência e publicidade", text: "O Orbivida é financiado por anúncios exibidos pelo Google. Ninguém pode pagar para aparecer, para ficar de fora ou para mudar uma página, e os anunciantes não veem nem influenciam o que escrevemos. Não temos vínculo com as pessoas, estúdios, clubes ou marcas sobre os quais escrevemos." },
      { heading: "Correções e pedidos", text: "Se algo estiver errado ou desatualizado, escreva para nós pela página de contato com o link da página. Corrigimos rapidamente os erros confirmados e atualizamos a data de revisão. Se uma página é sobre você, também pode pedir que a atualizemos ou que retiremos dados pessoais que não sejam de interesse público." },
    ],
    stats: "Hoje o Orbivida tem {people} biografias publicadas neste idioma, apoiadas em {sources} fontes citadas.",
    contact: [
      { heading: "Avisar sobre um erro", text: "Envie o link da página, o que está errado e, se puder, uma fonte que mostre a informação correta. Conferimos cada aviso e atualizamos a página e a data de revisão quando a correção é confirmada." },
      { heading: "Se uma página é sobre você", text: "Se uma biografia é sobre você ou sobre alguém que você representa, pode pedir que a corrijamos ou atualizemos, ou que retiremos dados pessoais que não sejam de interesse público. Escreva de um endereço oficial ou indique um perfil verificado para confirmarmos sua identidade." },
      { heading: "Direitos autorais e fotos", text: "Para uma notificação de direitos autorais sobre um texto ou uma foto, inclua o link da página, a obra em questão e uma prova de que você detém os direitos. Mais detalhes na nossa política de direitos autorais." },
      { heading: "Pedidos de privacidade", text: "Para ver, corrigir ou excluir dados pessoais que temos sobre você, escreva com o assunto \"Pedido de privacidade\"." },
      { heading: "Sugestões e outras mensagens", text: "Sugestões de pessoas para cobrir e comentários gerais são bem-vindos. Não aceitamos matérias pagas, biografias patrocinadas nem venda de links." },
      { heading: "Quem responde", text: "Todas as mensagens são lidas pelo nosso editor-chefe, Adem Caba. Costumamos responder em até três dias úteis, em inglês ou no idioma em que você escreveu." },
    ],
    privacyExtra: [
      { heading: "Responsável", text: "Este site é operado por Adem Caba, responsável pelo tratamento dos dados pessoais descritos nesta página. Você pode escrever para {email}." },
      { heading: "Bases legais", text: "Tratamos dados técnicos para entregar e proteger o site (legítimo interesse). Cookies de análise e de publicidade personalizada só são usados com o seu consentimento quando a lei exige. E-mails são tratados para responder ao seu pedido." },
      { heading: "Por quanto tempo guardamos os dados", text: "E-mails são apagados quando o assunto é encerrado, no máximo após 12 meses. Dados de análise são guardados por no máximo 14 meses. Registros técnicos da Cloudflare e dados de publicidade do Google seguem os prazos das políticas desses serviços." },
      { heading: "Prestadores de serviço", text: "Usamos a Cloudflare (hospedagem e segurança) e o Google (publicidade do AdSense, gestão de consentimento e Analytics). Esses prestadores podem tratar dados fora do seu país com as garantias descritas em suas políticas: https://www.cloudflare.com/privacypolicy/ e https://policies.google.com/privacy" },
    ],
    cookiesExtra: [
      { heading: "Cookies que você pode encontrar", text: "Consentimento: FCCDCF e FCNEC guardam sua escolha (até 13 meses). Análise: _ga e _ga_* distinguem visitas (até 2 anos). Publicidade: __gads, __gpi e __eoi ajudam o Google a exibir anúncios e a limitar quantas vezes você os vê (até 13 meses); o Google também pode usar cookies em seus próprios domínios, como IDE. Não usamos cookies próprios de rastreamento." },
    ],
    imprint: {
      title: "Expediente",
      footer: "Expediente",
      body: "Quem mantém o Orbivida e quem é responsável pelo seu conteúdo.",
      sections: [
        { heading: "Responsável pelo site", text: "O Orbivida (orbivida.com) é um site independente publicado por Adem Caba como pessoa física." },
        { heading: "Responsável pelo conteúdo", text: "Adem Caba, fundador e editor-chefe." },
        { heading: "Contato", text: "E-mail: {email}. Você também pode usar a nossa página de contato." },
        { heading: "Hospedagem", text: "Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, EUA (Cloudflare Pages)." },
        { heading: "Publicidade", text: "Os anúncios deste site são exibidos pelo Google por meio do Google AdSense. São identificados e não influenciam o nosso conteúdo." },
        { heading: "Padrões editoriais", text: "Como escolhemos, escrevemos e revisamos nossas páginas está descrito na nossa política editorial." },
        { heading: "Links externos", text: "Conferimos as fontes quando as citamos, mas não somos responsáveis por mudanças posteriores em sites externos." },
        { heading: "Última atualização", text: TRUST_UPDATED },
      ],
    },
  },
  de: {
    about: [
      { heading: "Wer wir sind", text: "Orbivida ist eine unabhängige Biografie-Website, gegründet und geführt von Adem Caba, einem Softwareentwickler, der schon immer gern über die Menschen hinter bekannten Namen gelesen hat. Wir veröffentlichen auf Englisch, Spanisch, Portugiesisch, Deutsch und Französisch, und jede Sprachfassung wird für ihre eigenen Leser geschrieben und geprüft, statt Wort für Wort aus dem Englischen übernommen zu werden." },
      { heading: "Worüber wir schreiben", text: "Im Mittelpunkt stehen die Menschen, die Leser nachschlagen, sobald sie einen Namen zum ersten Mal hören: YouTuber, Streamer, Creator auf TikTok und Instagram, Film- und Fernsehschauspieler (auch Nebendarsteller und Ensembles beliebter Serien und Filme), Musiker und Sportler. Eine Seite beantwortet die Fragen, die wirklich gestellt werden: Alter, bürgerlicher Name, Herkunft, Anfänge, öffentlich bekannte Beziehungen und was die Person heute macht." },
      { heading: "Worüber wir nicht schreiben", text: "Wir schreiben nicht über Minderjährige, Privatpersonen oder Menschen, die nur wegen einer Straftat oder eines Unglücks in den Nachrichten sind. Wir veröffentlichen keine Gerüchte, keine geleakten privaten Informationen, keine expliziten Inhalte und keine Spekulationen über Gesundheit, Sexualität oder Familienleben. Seiten über Creator, die auch auf Abo-Plattformen für Erwachsene arbeiten, behandeln nur ihre öffentliche Karriere." },
      { heading: "Woher unsere Angaben stammen", text: "Wir nutzen offizielle Websites und verifizierte Profile, Seiten von Studios, Sendern, Vereinen und Ligen, Preisverleihern, Unternehmensunterlagen und Berichte etablierter Medien. Jede Tatsachenangabe verlinkt auf ihre Quelle im Quellenverzeichnis am Ende der Seite, damit du sie selbst prüfen kannst. Wenn seriöse Quellen sich widersprechen, etwa beim Geburtsdatum, sagen wir das, statt stillschweigend eine auszuwählen." },
      { heading: "Wie eine Seite geprüft wird", text: "KI-Werkzeuge helfen uns bei Recherche, Entwurf und Übersetzung. Vor der Veröffentlichung öffnet ein automatischer Faktencheck jede zitierte Quelle und vergleicht sie mit jeder Angabe; Seiten mit falschen oder unbelegten Aussagen werden abgelehnt und neu geschrieben. Seiten zu sensiblen Themen liest unser Chefredakteur vor der Veröffentlichung selbst. Jede Seite zeigt, wer sie geschrieben und geprüft hat und wann sie zuletzt kontrolliert wurde." },
      { heading: "Wie wir Seiten aktuell halten", text: "Wir überarbeiten eine Seite, wenn es wichtige Neuigkeiten über die Person gibt, wenn sich Angaben wie Alter, Verein oder aktuelles Projekt ändern und wenn Suchdaten zeigen, dass Leser etwas fragen, das die Seite noch nicht beantwortet. Das Prüfdatum auf jeder Seite zeigt, wann sie zuletzt kontrolliert wurde." },
      { heading: "Fotos", text: "Die Fotos stammen von Wikimedia Commons und werden mit Urheber und Lizenz unter dem Bild angezeigt. Paparazzi-Fotos oder Bilder aus privaten Konten verwenden wir nie." },
      { heading: "Unabhängigkeit und Werbung", text: "Orbivida finanziert sich über Anzeigen, die Google ausliefert. Niemand kann dafür bezahlen, erwähnt, weggelassen oder anders dargestellt zu werden, und Werbekunden sehen oder beeinflussen unsere Texte nicht. Wir stehen in keiner Verbindung zu den Personen, Studios, Vereinen oder Marken, über die wir schreiben." },
      { heading: "Korrekturen und Anliegen", text: "Wenn etwas falsch oder veraltet ist, schreib uns über die Kontaktseite mit dem Link zur Seite. Bestätigte Fehler korrigieren wir zügig und aktualisieren das Prüfdatum. Wenn eine Seite dich betrifft, kannst du uns auch bitten, sie zu aktualisieren oder persönliche Angaben ohne öffentliches Interesse zu entfernen." },
    ],
    stats: "Orbivida hat heute {people} veröffentlichte Biografien in dieser Sprache, gestützt auf {sources} zitierte Quellen.",
    contact: [
      { heading: "Einen Fehler melden", text: "Schick uns den Link zur Seite, was falsch ist und wenn möglich eine Quelle, die die richtige Angabe zeigt. Wir prüfen jede Meldung und aktualisieren Seite und Prüfdatum, sobald die Korrektur bestätigt ist." },
      { heading: "Wenn eine Seite dich betrifft", text: "Wenn eine Biografie dich oder jemanden betrifft, den du vertrittst, kannst du uns bitten, sie zu korrigieren oder zu aktualisieren oder persönliche Angaben ohne öffentliches Interesse zu entfernen. Bitte schreib von einer offiziellen Adresse oder verlinke ein verifiziertes Profil, damit wir deine Identität bestätigen können." },
      { heading: "Urheberrecht und Fotos", text: "Für einen Hinweis auf eine Urheberrechtsverletzung bei einem Text oder Foto nenne bitte den Link zur Seite, das betroffene Werk und einen Nachweis deiner Rechte. Details stehen in unserer Urheberrechtsrichtlinie." },
      { heading: "Datenschutzanfragen", text: "Um Auskunft über deine bei uns gespeicherten personenbezogenen Daten zu erhalten oder sie berichtigen oder löschen zu lassen, schreib uns mit dem Betreff „Datenschutzanfrage“." },
      { heading: "Vorschläge und sonstige Nachrichten", text: "Vorschläge, über wen wir schreiben sollen, und allgemeines Feedback sind willkommen. Bezahlte Artikel, gesponserte Biografien oder Linkplatzierungen nehmen wir nicht an." },
      { heading: "Wer antwortet", text: "Jede Nachricht liest unser Chefredakteur Adem Caba. Wir antworten in der Regel innerhalb von drei Werktagen, auf Englisch oder in der Sprache, in der du geschrieben hast." },
    ],
    privacyExtra: [
      { heading: "Verantwortlicher", text: "Diese Website wird von Adem Caba betrieben, der für die auf dieser Seite beschriebene Verarbeitung personenbezogener Daten verantwortlich ist. Du erreichst ihn unter {email}." },
      { heading: "Rechtsgrundlagen", text: "Technische Daten verarbeiten wir, um die Website auszuliefern und zu schützen (berechtigtes Interesse, Art. 6 Abs. 1 lit. f DSGVO). Analyse- und personalisierte Werbe-Cookies setzen wir nur mit deiner Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). E-Mails verarbeiten wir, um deine Anfrage zu beantworten." },
      { heading: "Speicherdauer", text: "E-Mails löschen wir, sobald das Anliegen erledigt ist, spätestens nach 12 Monaten. Analysedaten werden höchstens 14 Monate gespeichert. Technische Protokolle bei Cloudflare und Werbedaten bei Google werden nach deren eigenen Richtlinien gespeichert." },
      { heading: "Dienstleister", text: "Wir nutzen Cloudflare (Hosting und Sicherheit) und Google (AdSense-Werbung, Einwilligungsverwaltung und Analytics). Diese Anbieter können Daten auch außerhalb der EU verarbeiten, mit den in ihren Richtlinien beschriebenen Garantien: https://www.cloudflare.com/privacypolicy/ und https://policies.google.com/privacy" },
    ],
    cookiesExtra: [
      { heading: "Cookies, die du sehen kannst", text: "Einwilligung: FCCDCF und FCNEC speichern deine Auswahl (bis zu 13 Monate). Statistik: _ga und _ga_* unterscheiden Besuche (bis zu 2 Jahre). Werbung: __gads, __gpi und __eoi helfen Google, Anzeigen auszuliefern und ihre Häufigkeit zu begrenzen (bis zu 13 Monate); Google kann auch Cookies auf eigenen Domains wie IDE verwenden. Eigene Tracking-Cookies setzen wir nicht." },
    ],
    imprint: {
      title: "Impressum",
      footer: "Impressum",
      body: "Wer Orbivida betreibt und für die Inhalte verantwortlich ist.",
      sections: [
        { heading: "Betreiber", text: "Orbivida (orbivida.com) ist eine unabhängige Website, die Adem Caba als Privatperson herausgibt." },
        { heading: "Inhaltlich verantwortlich", text: "Adem Caba, Gründer und Chefredakteur." },
        { heading: "Kontakt", text: "E-Mail: {email}. Du kannst auch unsere Kontaktseite nutzen." },
        { heading: "Hosting", text: "Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, USA (Cloudflare Pages)." },
        { heading: "Werbung", text: "Die Anzeigen auf dieser Website liefert Google über Google AdSense aus. Sie sind gekennzeichnet und beeinflussen unsere Inhalte nicht." },
        { heading: "Redaktionelle Grundsätze", text: "Wie wir unsere Seiten auswählen, schreiben und prüfen, steht in unseren Redaktionsrichtlinien." },
        { heading: "Externe Links", text: "Wir prüfen Quellen, wenn wir sie zitieren, sind aber nicht für spätere Änderungen externer Websites verantwortlich." },
        { heading: "Stand", text: TRUST_UPDATED },
      ],
    },
  },
  fr: {
    about: [
      { heading: "Qui sommes-nous", text: "Orbivida est un site de biographies indépendant fondé et dirigé par Adem Caba, développeur logiciel qui a toujours aimé découvrir les personnes derrière les noms célèbres. Nous publions en anglais, espagnol, portugais, allemand et français, et chaque version est rédigée et vérifiée pour ses propres lecteurs au lieu d’être copiée mot à mot de l’anglais." },
      { heading: "Ce que nous couvrons", text: "Nous nous concentrons sur les personnes que les lecteurs recherchent dès qu’ils entendent un nom pour la première fois : youtubeurs, streamers, créateurs TikTok et Instagram, acteurs de cinéma et de télévision (y compris seconds rôles et distributions de séries et de films cultes), musiciens et sportifs. Une page répond aux questions réellement posées : âge, vrai nom, origines, débuts, relations publiques et activité actuelle." },
      { heading: "Ce que nous ne couvrons pas", text: "Nous n’écrivons pas sur des mineurs, des particuliers ou des personnes qui ne font l’actualité qu’à cause d’un crime ou d’un drame. Nous ne publions ni rumeurs, ni informations privées divulguées, ni contenu explicite, ni spéculations sur la santé, la sexualité ou la vie familiale de quiconque. Les pages consacrées à des créateurs présents aussi sur des plateformes d’abonnement pour adultes ne traitent que de leur carrière publique." },
      { heading: "D’où viennent nos informations", text: "Nous utilisons des sites officiels et des profils vérifiés, des pages de studios, de chaînes, de clubs et de ligues, des organismes qui décernent des prix, des documents d’entreprises et des articles de médias reconnus. Chaque fait renvoie à sa source dans la liste de références en bas de page, pour que vous puissiez le vérifier. Quand des sources sérieuses se contredisent, par exemple sur une date de naissance, nous le disons au lieu d’en choisir une en silence." },
      { heading: "Comment une page est vérifiée", text: "Des outils d’IA nous aident à rechercher, rédiger et traduire. Avant publication, une vérification automatique ouvre chaque source citée et la compare à chaque affirmation ; les pages contenant des affirmations fausses ou non étayées sont rejetées et réécrites. Les pages sur des sujets sensibles sont relues par notre rédacteur en chef avant publication. Chaque page indique qui l’a rédigée, qui l’a vérifiée et quand elle a été contrôlée pour la dernière fois." },
      { heading: "Comment nous tenons les pages à jour", text: "Nous revenons sur une page quand une actualité importante concerne la personne, quand des informations comme l’âge, le club ou le projet en cours changent, et quand les données de recherche montrent que les lecteurs posent une question à laquelle la page ne répond pas encore. La date de vérification de chaque page indique quand elle a été contrôlée pour la dernière fois." },
      { heading: "Photos", text: "Les photos proviennent de Wikimedia Commons et sont affichées avec le nom de l’auteur et la licence sous chaque image. Nous n’utilisons jamais de photos de paparazzi ni d’images tirées de comptes privés." },
      { heading: "Indépendance et publicité", text: "Orbivida est financé par des annonces diffusées par Google. Personne ne peut payer pour figurer sur le site, pour en être retiré ou pour modifier une page, et les annonceurs ne voient ni n’influencent ce que nous écrivons. Nous n’avons aucun lien avec les personnes, studios, clubs ou marques dont nous parlons." },
      { heading: "Corrections et demandes", text: "Si une information est fausse ou dépassée, écrivez-nous depuis la page de contact en indiquant le lien de la page. Nous corrigeons rapidement les erreurs confirmées et mettons à jour la date de vérification. Si une page vous concerne, vous pouvez aussi nous demander de la mettre à jour ou de retirer des informations personnelles sans intérêt public." },
    ],
    stats: "Orbivida compte aujourd’hui {people} biographies publiées dans cette langue, appuyées sur {sources} sources citées.",
    contact: [
      { heading: "Signaler une erreur", text: "Envoyez le lien de la page, ce qui est faux et, si possible, une source qui montre l’information exacte. Nous examinons chaque signalement et mettons à jour la page et sa date de vérification une fois la correction confirmée." },
      { heading: "Si une page vous concerne", text: "Si une biographie vous concerne, ou concerne une personne que vous représentez, vous pouvez nous demander de la corriger ou de la mettre à jour, ou de retirer des informations personnelles sans intérêt public. Écrivez depuis une adresse officielle ou indiquez un profil vérifié pour que nous puissions confirmer votre identité." },
      { heading: "Droits d’auteur et photos", text: "Pour une notification de droits d’auteur concernant un texte ou une photo, indiquez le lien de la page, l’œuvre concernée et une preuve de vos droits. Les détails figurent dans notre politique de droits d’auteur." },
      { heading: "Demandes liées à la vie privée", text: "Pour consulter, corriger ou supprimer les données personnelles que nous détenons sur vous, écrivez-nous avec l’objet « Demande de confidentialité »." },
      { heading: "Suggestions et autres messages", text: "Les suggestions de personnalités à couvrir et les remarques générales sont les bienvenues. Nous n’acceptons ni articles payants, ni biographies sponsorisées, ni liens rémunérés." },
      { heading: "Qui répond", text: "Chaque message est lu par notre rédacteur en chef, Adem Caba. Nous répondons généralement sous trois jours ouvrés, en anglais ou dans la langue de votre message." },
    ],
    privacyExtra: [
      { heading: "Responsable du traitement", text: "Ce site est exploité par Adem Caba, responsable du traitement des données personnelles décrit sur cette page. Vous pouvez lui écrire à {email}." },
      { heading: "Bases légales", text: "Nous traitons des données techniques pour diffuser et protéger le site (intérêt légitime). Les cookies de mesure d’audience et de publicité personnalisée ne sont utilisés qu’avec votre consentement lorsque la loi l’exige. Les e-mails sont traités pour répondre à votre demande." },
      { heading: "Durée de conservation", text: "Les e-mails sont supprimés une fois la demande traitée, au plus tard après 12 mois. Les données de mesure d’audience sont conservées 14 mois au maximum. Les journaux techniques de Cloudflare et les données publicitaires de Google sont conservés selon leurs propres politiques." },
      { heading: "Prestataires", text: "Nous utilisons Cloudflare (hébergement et sécurité) et Google (publicité AdSense, gestion du consentement et Analytics). Ces prestataires peuvent traiter des données hors de votre pays avec les garanties décrites dans leurs politiques : https://www.cloudflare.com/privacypolicy/ et https://policies.google.com/privacy" },
    ],
    cookiesExtra: [
      { heading: "Cookies que vous pouvez voir", text: "Consentement : FCCDCF et FCNEC enregistrent votre choix (jusqu’à 13 mois). Mesure d’audience : _ga et _ga_* distinguent les visites (jusqu’à 2 ans). Publicité : __gads, __gpi et __eoi aident Google à diffuser des annonces et à limiter leur répétition (jusqu’à 13 mois) ; Google peut aussi utiliser des cookies sur ses propres domaines, comme IDE. Nous ne déposons aucun cookie de suivi qui nous soit propre." },
    ],
    imprint: {
      title: "Mentions légales",
      footer: "Mentions légales",
      body: "Qui édite Orbivida et qui est responsable de son contenu.",
      sections: [
        { heading: "Éditeur", text: "Orbivida (orbivida.com) est un site indépendant édité par Adem Caba à titre individuel." },
        { heading: "Directeur de la publication", text: "Adem Caba, fondateur et rédacteur en chef." },
        { heading: "Contact", text: "E-mail : {email}. Vous pouvez aussi utiliser notre page de contact." },
        { heading: "Hébergement", text: "Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, États-Unis (Cloudflare Pages)." },
        { heading: "Publicité", text: "Les annonces de ce site sont diffusées par Google via Google AdSense. Elles sont signalées et n’influencent pas notre contenu." },
        { heading: "Règles éditoriales", text: "La façon dont nous choisissons, rédigeons et vérifions nos pages est décrite dans notre politique éditoriale." },
        { heading: "Liens externes", text: "Nous vérifions les sources quand nous les citons, mais nous ne sommes pas responsables des modifications ultérieures de sites externes." },
        { heading: "Dernière mise à jour", text: TRUST_UPDATED },
      ],
    },
  },
};

export function fillTrust(text: string, vars: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}
