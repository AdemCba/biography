import { absoluteUrl, site } from "@/config/site";
import { isoDateTime, liveTopics, topicPath } from "@/lib/content";

export const dynamic = "force-static";

/** Google News only reads articles published in the last two days. */
const WINDOW_DAYS = 2;

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * News sitemap for the trending topics, rebuilt on every deploy. Google fetches news sitemaps far more
 * often than the main sitemap, so a fresh topic is found within minutes to hours instead of days.
 */
export function GET() {
  const now = new Date();
  const since = new Date(now.getTime() - WINDOW_DAYS * 86400e3).toISOString().slice(0, 10);
  const urls: string[] = [];
  for (const locale of site.locales) {
    for (const { article } of liveTopics(locale)) {
      const published = article.meta.publishedAt;
      if (article.meta.noindex || !published || published < since) continue;
      // Date-only frontmatter would read as 08:00 Istanbul; never claim a time later than this build.
      const stamp = isoDateTime(published)!;
      const date = Date.parse(stamp) > now.getTime() ? now.toISOString() : stamp;
      urls.push(
        [
          "<url>",
          `<loc>${esc(absoluteUrl(topicPath(locale, article.meta.slug)))}</loc>`,
          "<news:news>",
          `<news:publication><news:name>${esc(site.name)}</news:name><news:language>${locale}</news:language></news:publication>`,
          `<news:publication_date>${date}</news:publication_date>`,
          `<news:title>${esc(article.meta.title)}</news:title>`,
          "</news:news>",
          "</url>",
        ].join(""),
      );
    }
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n${urls.join("\n")}\n</urlset>\n`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
