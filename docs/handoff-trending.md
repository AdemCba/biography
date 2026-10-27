# Handoff: Gündem (trending topics) section — in progress

Adem chose (2026-10-27): write people AND non-person trending topics, every 3 hours, from
https://trends.google.com/trending?hours=4 across several countries. Keep topic articles few
(1-2 per run) until AdSense approval; drop deaths, accidents, crime and politics.

Done on branch `claude/project-thread-lguv61` (not merged yet):
- `topicSchema` in src/lib/schema.ts: content/topics/<id>/topic.json (id, people[], trendingIn[], image?, sources[]) + <locale>.md (same frontmatter as biographies).
- src/lib/content.ts: generic `readEntries` loader, `store.topics`, `liveTopics()`, `topicPath()` (/<locale>/trending/<slug>/), "trending" reserved.
- src/lib/quality.ts: `checkTopicArticle` (≥400 words, ≥2 sections, ≥2 cited sources, reviewer/author, style).
- scripts/schedule.ts and scripts/check-content.ts handle topics.

Still to do:
1. Pages: src/app/[locale]/trending/page.tsx (list) and src/app/[locale]/trending/[slug]/page.tsx
   (copy the biography page; Article JSON-LD with isoDateTime dates; PersonCard list of topic.data.people).
2. Nav link + labels (en Trending, es Tendencias, de Aktuell, fr Tendances, pt Em alta); "Trending" block on the home page.
3. Sitemap: list page + live topics (src/app/sitemap.ts).
4. Trend scan: parse RSS <pubDate>, add a "last 4 hours" topics section to data/trend-candidates/latest.md.
5. writer.yml: cron every 3 hours ("40 */3 * * *"); prompt: also write 1-2 topics from the last-4-hours list, in all 5 languages, under content/topics.
6. `npm run -s check -- --strict` and `npm run build`, PR, merge when CI is green.
