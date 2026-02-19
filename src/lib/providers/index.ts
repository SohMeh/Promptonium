import { ProviderRegistry } from "./adapter";
import { AnthropicProvider } from "./anthropic";

export { ProviderRegistry } from "./adapter";
export { AnthropicProvider } from "./anthropic";

let registry: ProviderRegistry | null = null;

export function getProviderRegistry(): ProviderRegistry {
  if (!registry) {
    registry = new ProviderRegistry();

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicKey) {
      registry.register(new AnthropicProvider(anthropicKey));
    }
  }
  return registry;
}
