import Anthropic from "@anthropic-ai/sdk";
import type { GenerateOptions, GenerateResult } from "@/lib/types/provider";
import { BaseLLMProvider } from "./adapter";

export class AnthropicProvider extends BaseLLMProvider {
  id = "anthropic";
  name = "Anthropic Claude";
  private client: Anthropic;

  constructor(apiKey: string) {
    super();
    this.client = new Anthropic({ apiKey });
  }

  async generate(prompt: string, options: GenerateOptions = {}): Promise<GenerateResult> {
    const response = await this.client.messages.create({
      model: options.model || "claude-opus-4-8",
      max_tokens: options.maxTokens || 4096,
      system: options.systemPrompt || "",
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = response.content.find((b) => b.type === "text");

    return {
      content: textBlock?.text || "",
      model: response.model,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  }
}
