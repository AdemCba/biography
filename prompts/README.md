# Prompt templates

Each file is one step of the pipeline in `docs/operations.md`. They are written to be pasted into Claude
(or run by `scripts/revise.ts`) together with `docs/style-guide.md`, the person's `person.json` and,
where relevant, the article file. Placeholders look like `{{this}}`.

1. `01-research.md`: collect sources and verified facts, build `person.json`.
2. `02-draft.md`: write the first version of one language from the facts.
3. `03-localize.md`: write another language version from the same facts.
4. `04-fact-check.md`: line-by-line claim check against the sources.
5. `05-revise.md`: fix everything the quality gate reported (used by the automatic fix loop).
