# Editorial style guide

This guide is read by the editors and by every AI step in the pipeline (`prompts/`). It is the single
source of truth for how a biography should read. When it and a prompt disagree, this guide wins.

## What a page is for

A reader typed a question into Google: *how old is X, where is X from, how did X get rich, who is X's
coach*. The page must answer that question in the first screen, then tell the story behind it better
than the other ten results. If we cannot add something the top results lack (a clearer timeline, a
primary source they skipped, a fact they got wrong, context they did not explain), we do not publish.

## Facts

- Every date, age, figure, title, ownership stake, club, award and net-worth estimate has a citation
  `[s:source-id]` pointing at a source in `person.json`.
- Prefer primary sources: official athlete/club/federation profiles, award bodies, company filings and
  investor pages, the person's own verified site, books and on-record interviews. Press is fine for
  context and quotes. Wikipedia is a research lead, never a citation.
- Net worth: only from a named estimate (Forbes, Bloomberg) with its date (`asOf`). Say it is an estimate.
- Private life (partners, children, health, religion, addresses, rumours): only what the person made
  public themselves or what a reliable outlet reported on the record, and only if it matters to the story.
  Never speculate. Never repeat gossip "reports".
- When sources disagree, say so and cite both. Do not pick the more exciting number.
- If a fact cannot be verified, leave it out. A shorter true page beats a longer padded one.

## Shape

- Length follows substance, not a template. A niche player might get 350 words; a global star 1,500.
- At least three `##` sections, named for what they contain ("Move to Barcelona", "The 2019 cup run"),
  not generic labels ("Career", "Personal life") unless that really is the best name.
- Open with the most interesting true thing, not "X is a Y born in Z". The summary field already does
  the dictionary definition.
- FAQ: only questions people actually search (from `targetQueries` / Search Console). Answer in one or
  two sentences each, with the number in the answer. No FAQ is better than invented questions.
- Link to other biographies on the site with `[Name](person:their-id)` where it helps the reader.

## Voice: write like a person, not a press release

- Concrete over abstract. "She trained at six every morning on the Douro" beats "her unwavering dedication".
- Vary sentence length. Short sentences land a point. Longer ones carry context and the reader through
  a sequence of events. Mix them.
- No hype words: iconic, legendary, meteoric, trailblazer, unwavering, testament, tapestry, delve,
  journey, realm, game-changer, "rose to prominence", "needs no introduction", "left an indelible mark".
  The checker flags these in every language (`src/lib/style.ts`).
- No summary paragraph that repeats the article ("In conclusion…"). Stop when the story stops.
- No em dashes as a rhythm device. Commas, full stops and parentheses do the job.
- No "not only… but also", no rhetorical questions to open sections, no exclamation marks.
- Quote people when a quote says something only they could say, and cite it.
- Opinions belong to named people ("analysts rated him…" needs a source), not to us.

## Localising (not translating)

Each language version is written for its readers, from the facts in `person.json`:

- Research the queries people use in that language (`targetQueries`). A German reader searches
  "Vermögen", a Brazilian "patrimônio", a Spaniard "patrimonio"; the title and FAQ follow them.
- Use local conventions: dates, number formats, club and competition names as locals say them,
  Brazilian Portuguese for `pt`.
- Add context the local reader needs (who a foreign club is) and drop context they do not.
- Prefer sources in the reader's language when they are as good as the English ones.
- A language version that is a sentence-by-sentence translation of another fails review.

## Risk levels

- `low`: retired or historical figures, uncontroversial careers.
- `medium` (default): living people, current careers.
- `high`: money (net worth, deals), legal cases, health, minors, politics, anything defamatory if wrong.
  High-risk pages need a full fact check (`reviewedAt`) and are never re-approved automatically.
