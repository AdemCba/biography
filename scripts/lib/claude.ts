import fs from "node:fs";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

/** The fact-check model. Sonnet keeps the daily cost low; set ANTHROPIC_MODEL=claude-opus-5-5 for a stricter check. */
export const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
/** Research, writing, translation and rewrites: the cheapest model, since everything it writes is fact-checked. */
export const WRITER_MODEL = process.env.ANTHROPIC_WRITER_MODEL || "claude-haiku-5-5";

/** Hard cap on API spend per UTC day, across every run of the day. */
export const DAILY_BUDGET_USD = Number(process.env.DAILY_BUDGET_USD || 2);
const SPEND_DIR = "data/spend";

/** $ per million tokens [input, output]; Haiku's long-prompt rate applies above 100K input tokens. */
const PRICES: Record<string, { in: number; out: number; longIn?: number; longOut?: number }> = {
  "claude-haiku-5-5": { in: 0.1, out: 0.5, longIn: 0.5, longOut: 2.5 },
  "claude-sonnet-5-5": { in: 2, out: 10 },
  "claude-opus-5-5": { in: 4, out: 20 },
};
const WEB_SEARCH_USD = 0.01;

export class BudgetExceededError extends Error {}

function spendFile(): string {
  return `${SPEND_DIR}/${new Date().toISOString().slice(0, 10)}.json`;
}

/** Today's API spend so far (USD), as recorded by every agent run of the day. */
export function spentToday(): number {
  const f = spendFile();
  return fs.existsSync(f) ? (JSON.parse(fs.readFileSync(f, "utf8")) as { usd: number }).usd : 0;
}

function recordSpend(model: string, usage: Anthropic.Beta.BetaUsage) {
  const p = PRICES[model] ?? PRICES["claude-opus-5-5"];
  const input = usage.input_tokens + (usage.cache_creation_input_tokens ?? 0) * 1.25 + (usage.cache_read_input_tokens ?? 0) * 0.1;
  const long = usage.input_tokens + (usage.cache_read_input_tokens ?? 0) > 100_000 && p.longIn;
  const usd =
    (input * (long ? p.longIn! : p.in) + usage.output_tokens * (long ? p.longOut! : p.out)) / 1e6 +
    (usage.server_tool_use?.web_search_requests ?? 0) * WEB_SEARCH_USD;
  const f = spendFile();
  const prev = fs.existsSync(f) ? (JSON.parse(fs.readFileSync(f, "utf8")) as { usd: number; calls: number }) : { usd: 0, calls: 0 };
  fs.mkdirSync(SPEND_DIR, { recursive: true });
  fs.writeFileSync(f, `${JSON.stringify({ usd: Math.round((prev.usd + usd) * 10000) / 10000, calls: prev.calls + 1 }, null, 2)}\n`);
}

/** Errors no retry can fix (bad key, no credit left, monthly spend limit reached): the agents stop at once instead of burning attempts. */
export function isApiUnavailable(e: unknown): boolean {
  return (
    e instanceof BudgetExceededError ||
    e instanceof Anthropic.AuthenticationError ||
    e instanceof Anthropic.PermissionDeniedError ||
    (e instanceof Anthropic.BadRequestError && /credit balance|usage limits/i.test(e.message))
  );
}

/**
 * Entry-point error handler for the agents. When the API is unusable the agent step is skipped with a
 * visible warning, so the rest of the run (scheduling, build, deploy) still publishes what is ready.
 */
export function exitOnError(step: string) {
  return (e: unknown) => {
    if (!isApiUnavailable(e)) {
      console.error(e);
      process.exit(1);
    }
    const msg = e instanceof BudgetExceededError ? `${step} stopped: ${e.message}` : `${step} stopped: Anthropic API unavailable (${(e as Error).message})`;
    console.log(`::error title=Anthropic API unavailable::${msg}`);
    if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### ${step}\n\n⚠️ ${msg}\n`);
  };
}

export function hasApiKey(): boolean {
  return !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

/**
 * One structured-output request with web fetch/search, so the model can open the cited sources.
 * Handles pause_turn (server tool loop cap) and refusals; returns the parsed, validated JSON.
 */
export async function askStructured<T extends z.ZodType>(
  client: Anthropic,
  prompt: string,
  schema: T,
  opts: { fetches?: number; searches?: number; model?: string; effort?: "low" | "medium" | "high" } = {},
): Promise<z.infer<T>> {
  const messages: Anthropic.Beta.BetaMessageParam[] = [{ role: "user", content: prompt }];
  const outputSchema = z.toJSONSchema(schema, { target: "draft-2020-12" }) as Record<string, unknown>;
  const model = opts.model ?? MODEL;
  const haiku = model.startsWith("claude-haiku");
  for (let continuation = 0; continuation < 5; continuation++) {
    if (spentToday() >= DAILY_BUDGET_USD) {
      throw new BudgetExceededError(`daily budget of $${DAILY_BUDGET_USD} reached ($${spentToday().toFixed(2)} spent today)`);
    }
    const response = await client.beta.messages
      .stream({
        model,
        max_tokens: 64000,
        // Haiku has no server-side refusal fallback and takes the basic web tool versions.
        ...(haiku ? {} : { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const }),
        thinking: { type: "adaptive" },
        output_config: { effort: opts.effort ?? "high", format: { type: "json_schema", schema: outputSchema } },
        tools: haiku
          ? [
              // Haiku's cheap rate holds only up to 100K prompt tokens, so its pages are capped tighter.
              { type: "web_fetch_20250910", name: "web_fetch", max_uses: opts.fetches ?? 6, max_content_tokens: 8000 },
              { type: "web_search_20250305", name: "web_search", max_uses: opts.searches ?? 3 },
            ]
          : [
              // Fetched pages are most of the bill: cap each one, the facts we cite sit near the top of a profile page.
              { type: "web_fetch_20260209", name: "web_fetch", max_uses: opts.fetches ?? 6, max_content_tokens: 15000 },
              { type: "web_search_20260209", name: "web_search", max_uses: opts.searches ?? 3 },
            ],
        messages,
      })
      .finalMessage();
    recordSpend(model, response.usage);

    if (response.stop_reason === "pause_turn") {
      // Server-side tool loop hit its iteration cap; resend so it resumes where it stopped.
      messages.splice(1, messages.length - 1, { role: "assistant", content: response.content });
      continue;
    }
    if (response.stop_reason === "refusal") throw new Error(`Model refused: ${response.stop_details?.explanation ?? "no details"}`);
    if (response.stop_reason === "max_tokens") throw new Error("Response hit max_tokens");
    const text = response.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
    return schema.parse(JSON.parse(text));
  }
  throw new Error("Too many pause_turn continuations");
}
