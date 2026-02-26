import { ProviderRegistry } from "./adapter";
import { AnthropicProvider } from "./anthropic";
import { HuggingFaceProvider } from "./huggingface";

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
