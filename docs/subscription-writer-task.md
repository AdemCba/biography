# Twice-daily writer task (runs on the owner's Claude subscription)

The Writer workflow (`.github/workflows/writer.yml`) runs this with Claude Code at 08:00 and 16:00
(Europe/Istanbul), on the owner's own Claude subscription through the `CLAUDE_CODE_OAUTH_TOKEN` secret
(made with `claude setup-token`). Set the repository variable `WRITER_ENABLED=false` to pause it. It writes 5 new people in all five
languages, fact-checks them and publishes them. No Anthropic API key is used: every step is done by the task
itself and its Haiku subagents, through the subscription modes of `scripts/write.ts` and `scripts/review.ts`.

## 1. Set up

```
git fetch origin main && git checkout -B claude/writer-$(date -u +%Y%m%d-%H%M) origin/main && npm ci
```

## 2. Pick 5 people

Always check Google searches first: who is being searched right now. Use WebFetch on Google Trends
(https://trends.google.com/trending?geo=US, and geo=ES, BR, DE, FR, GB, TR) and WebSearch for "trending"
plus YouTube, streaming and football news of the last few days. Prefer people trending in several countries. Focus: YouTubers, streamers, influencers, footballers, then other people in the news.
Also see `npx tsx scripts/write.ts --candidates 8` (latest trend scan and `content/queue.json`).

Skip anyone already in `content/people/` or `data/writer-skipped.json`, and anyone who is:

- under 18, or a private individual (a person known only from one viral moment),
- known mainly for a crime, a death, an accident or a scandal,
- known mainly for adult or sexual content (AdSense restricts such pages). A creator who also works on
  OnlyFans is fine only when major outlets cover them for mainstream reasons, and the page stays free of
  explicit content.

Category is one of `athletes`, `business`, `artists`, `creators`.

## 3. Write each person (one Haiku subagent per person, in parallel)

Give each subagent this brief, with NAME, CATEGORY and a scratch folder:

1. `npx tsx scripts/write.ts --prompt research "<NAME>" <CATEGORY>`. Research with WebSearch and WebFetch, open
   every source it lists, write the JSON answer to a file, then
   `npx tsx scripts/write.ts --record research "<NAME>" <CATEGORY> <file>`. It prints the person id, or "skipped".
2. `npx tsx scripts/write.ts --prompt draft <id>`. Write the English JSON (every factual sentence ends with
   `[s:source-id]` (never a Wikipedia source), at least the word count the brief gives, no hype words, no em dashes), then
   `npx tsx scripts/write.ts --record draft <id> <file>`.
3. For es, pt, de, fr: `--prompt localize <id> <locale>`, write natively in that language at the same
   length, and `--record localize <id> <locale> <file>`.
4. `npm run -s check 2>&1 | grep -A6 "<id>/"`: fix every ERROR and style warning in the `.md` files and
   expand any page with a `short-for-importance` warning using more sourced facts, until all five pass.
5. Never invent a fact, quote, number or URL. Never commit or push (the task does that).

## 4. Photos

`npm run images` adds a free-licensed Wikimedia Commons photo with credit for each new person.

## 5. Fact-check (another Haiku subagent per article)

`npx tsx scripts/review.ts --queue` lists the articles ready for review. For each key:
`npx tsx scripts/review.ts --prompt <key>`, give the full output to a Haiku subagent that opens the sources with
WebFetch and returns only the JSON verdict, then
`npx tsx scripts/review.ts --record <key> <file> --model claude-haiku-5-5`. The code decides approval.
For a rejected article, fix exactly what the reasons list (change or remove the claim, never invent a
source), run the check again and record a new verdict. Leave it in review if it still fails.

## 6. Publish

```
npx tsx scripts/schedule.ts --per-day 8
```

Commit `content/ data/ public/images/` ("content: <names>"), push, open a PR to main, wait for the `check`
CI run to pass, and squash-merge it (the owner authorized automatic merges). The merge runs the Publish
workflow: build, deploy to Cloudflare Pages and IndexNow ping (Bing, Yandex). Google finds new pages through
`sitemap.xml`, which is submitted in Search Console.

## 7. Report

Finish with a short summary in Turkish: who was written, which languages went live with their links, and
anything skipped or left in review and why.
