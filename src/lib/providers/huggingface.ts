import type { GenerateOptions, GenerateResult } from "@/lib/types/provider";
import { BaseLLMProvider } from "./adapter";

/**
 * Free model provider using Pollinations.ai — truly free, no API key needed.
 * Uses GPT-OSS 20B (open-source reasoning model) via Pollinations' OpenAI-compatible API.
 *
 * Endpoint: https://text.pollinations.ai/openai
 */

const API_URL = "https://text.pollinations.ai/openai";
const DEFAULT_MODEL = "openai-fast";
const TIMEOUT_MS = 60_000; // 60 second timeout

export class HuggingFaceProvider extends BaseLLMProvider {
  id = "free";
  name = "Free Open Models (via Pollinations)";

  constructor() {
    super();
  }

  async generate(prompt: string, options: GenerateOptions = {}): Promise<GenerateResult> {
    const model = options.model || DEFAULT_MODEL;

    const abortCtrl = new AbortController();
    const timeout = setTimeout(() => abortCtrl.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortCtrl.signal,
        body: JSON.stringify({
          model,
          max_tokens: options.maxTokens || 4096,
          temperature: options.temperature ?? 0.7,
          // Random seed busts Pollinations' aggressive response cache
          seed: Math.floor(Math.random() * 1_000_000),
          // Disable caching to avoid stale empty responses
          cache: false,
          messages: [
            ...(options.systemPrompt
              ? [{ role: "system" as const, content: options.systemPrompt }]
              : []),
            { role: "user" as const, content: prompt },
          ],
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Free model API error (${response.status}): ${err.substring(0, 200)}`);
      }

      const data = await response.json();
      const msg = data.choices?.[0]?.message;

      // The reasoning model sometimes puts output in reasoning_content
      // instead of content. Use content first, fall back to reasoning_content.
      const content = msg?.content || msg?.reasoning_content || "";

      if (!content) {
        throw new Error("Free model returned empty response");
      }

      return {
        content,
        model: data.model || model,
        usage: {
          inputTokens: data.usage?.prompt_tokens || 0,
          outputTokens: data.usage?.completion_tokens || 0,
        },
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}
