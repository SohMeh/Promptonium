export interface GenerateOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface GenerateResult {
  content: string;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface LLMProvider {
  id: string;
  name: string;
  generate(prompt: string, options: GenerateOptions): Promise<GenerateResult>;
}

export interface ProviderConfig {
  providerId: string;
  apiKey: string;
  defaultModel: string;
  isConfigured: boolean;
}
