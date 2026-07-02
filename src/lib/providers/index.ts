import { ProviderRegistry } from "./adapter";
import { AnthropicProvider } from "./anthropic";
import { HuggingFaceProvider } from "./huggingface";
import type { LLMProvider } from "@/lib/types/provider";

export { ProviderRegistry } from "./adapter";
export { AnthropicProvider } from "./anthropic";
export { HuggingFaceProvider } from "./huggingface";

let registry: ProviderRegistry | null = null;

export function getProviderRegistry(): ProviderRegistry {
  if (!registry) {
    registry = new ProviderRegistry();

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicKey) {
      registry.register(new AnthropicProvider(anthropicKey));
    }

    // Free model provider (Pollinations.ai) — always available, no key required.
    registry.register(new HuggingFaceProvider());
  }
  return registry;
}

/** Header carrying the user's own Anthropic API key (never stored server-side). */
export const BYOK_HEADER = "x-user-api-key";
/** Header selecting the free open-model provider. */
export const OPEN_MODEL_HEADER = "x-use-open-model";

/**
 * Pick the provider for an incoming AI request.
 *
 * Priority:
 * 1. Free provider when the client explicitly asks for it.
 * 2. The user's own Anthropic key (BYOK header) — works without an account.
 * 3. The server-configured Anthropic key, if any.
 * 4. Free provider as the final fallback so signed-in users always get a result.
 */
export function resolveProviderFromRequest(request: Request): LLMProvider {
  const reg = getProviderRegistry();
  const headers = request.headers;

  if (headers.get(OPEN_MODEL_HEADER) === "1") {
    return reg.get("free")!;
  }

  const userKey = headers.get(BYOK_HEADER)?.trim();
  if (userKey) {
    return new AnthropicProvider(userKey);
  }

  return reg.get("anthropic") ?? reg.get("free")!;
}

/** True when the request explicitly targets the free provider (used for retry policy). */
export function isOpenModelRequest(request: Request): boolean {
  return request.headers.get(OPEN_MODEL_HEADER) === "1";
}

/** The user's own Anthropic key from the request, if provided. */
export function getUserApiKey(request: Request): string | null {
  const key = request.headers.get(BYOK_HEADER)?.trim();
  return key || null;
}
