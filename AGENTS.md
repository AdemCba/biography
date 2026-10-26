<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project rules for agents

- Content lives in `content/` as files; read `docs/style-guide.md` before writing or editing any biography and follow `prompts/`.
- Never invent facts, sources or URLs. Every fact needs `[s:source-id]` and a source in `person.json`.
- Never set `reviewer` or move an article to `approved`/`published` by hand: only the review agent (`scripts/review.ts`) or the human editor approves. Leave finished drafts in status `review`.
- Run `npm run check`, `npm test` and `npm run typecheck` before pushing.
- The brand name comes only from `NEXT_PUBLIC_SITE_NAME`; do not hardcode it.
