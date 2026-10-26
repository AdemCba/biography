# Step 2: first draft

Write the {{LOCALE}} biography of **{{NAME}}** for {{SITE_NAME}}.

Inputs: `docs/style-guide.md`, `person.json` (facts + sources), the target queries and the gap note
from research.

Rules:
- Use only facts present in the sources. Put `[s:source-id]` right after each factual claim.
- Answer the main search question in the summary and again, with context, in the body.
- At least three `##` sections, named for their content. Length follows how much there is to say.
- Write in the voice described in the style guide: concrete, varied rhythm, no hype or filler phrases.
- Frontmatter: title, slug, metaTitle (≤ 60 chars), metaDescription (120-160 chars), knownFor, summary
  (2-3 sentences, ≥ 25 words), targetQueries, faq (only real queries), status: draft, risk, author.

Output the complete `{{LOCALE}}.md` file.
