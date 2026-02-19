import type { GenerateOptions, GenerateResult, LLMProvider } from "@/lib/types/provider";

export abstract class BaseLLMProvider implements LLMProvider {
  abstract id: string;
  abstract name: string;
  abstract generate(prompt: string, options: GenerateOptions): Promise<GenerateResult>;
}

export class ProviderRegistry {
  private providers = new Map<string, LLMProvider>();

  register(provider: LLMProvider) {
    this.providers.set(provider.id, provider);
  }

  get(id: string): LLMProvider | undefined {
    return this.providers.get(id);
  }

  getDefault(): LLMProvider {
    const provider = this.providers.get("anthropic");
    if (!provider) {
      throw new Error("No default provider configured. Set ANTHROPIC_API_KEY.");
    }
    return provider;
  }

  list(): LLMProvider[] {
    return Array.from(this.providers.values());
  }
}
