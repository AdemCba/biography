import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

export const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5-5";

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
  opts: { fetches?: number; searches?: number } = {},
): Promise<z.infer<T>> {
  const messages: Anthropic.Beta.BetaMessageParam[] = [{ role: "user", content: prompt }];
  const outputSchema = z.toJSONSchema(schema, { target: "draft-2020-12" }) as Record<string, unknown>;
  for (let continuation = 0; continuation < 5; continuation++) {
    const response = await client.beta.messages
      .stream({
        model: MODEL,
        max_tokens: 64000,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        thinking: { type: "adaptive" },
        output_config: { effort: "high", format: { type: "json_schema", schema: outputSchema } },
        tools: [
          { type: "web_fetch_20260209", name: "web_fetch", max_uses: opts.fetches ?? 12 },
          { type: "web_search_20260209", name: "web_search", max_uses: opts.searches ?? 6 },
        ],
        messages,
      })
      .finalMessage();

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
