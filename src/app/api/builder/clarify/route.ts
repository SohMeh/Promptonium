import { NextResponse } from "next/server";
import { getProviderRegistry } from "@/lib/providers";
import { buildClarifyPrompt } from "@/lib/builder/prompt-templates";
import type { BuilderIntake } from "@/lib/types/prompt";

export async function POST(request: Request) {
  try {
    const { intake, answers, refinedIntent } = (await request.json()) as {
      intake: BuilderIntake;
      answers: Record<string, string>;
      refinedIntent: Record<string, unknown>;
    };

    const registry = getProviderRegistry();
    const useOpenModel = request.headers.get("X-Use-Open-Model") === "1";
    const provider = useOpenModel
      ? registry.get("free") ?? registry.getDefault()
      : registry.getDefault();
    const { system, user } = buildClarifyPrompt(intake, refinedIntent, answers);

    const result = await provider.generate(user, {
      systemPrompt: system,
      temperature: 0.2,
      maxTokens: 2048,
    });

    let cleaned = result.content.trim();
    if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
    if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
    if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);

    const parsed = JSON.parse(cleaned.trim());

    return NextResponse.json({
      refinedIntent: parsed.refinedIntent || refinedIntent,
      ready: true,
    });
  } catch (error) {
    console.error("Builder clarify error:", error);
    return NextResponse.json(
      { error: "Failed to process clarification" },
      { status: 500 }
    );
  }
}
