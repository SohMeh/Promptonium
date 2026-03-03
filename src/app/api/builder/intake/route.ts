import { NextResponse } from "next/server";
import { getProviderRegistry } from "@/lib/providers";
import { buildIntakeAnalysisPrompt } from "@/lib/builder/prompt-templates";
import type { BuilderIntake } from "@/lib/types/prompt";

export async function POST(request: Request) {
  try {
    const intake: BuilderIntake = await request.json();

    if (!intake.objective?.trim()) {
      return NextResponse.json({ error: "Objective is required" }, { status: 400 });
    }

    const registry = getProviderRegistry();
    const useOpenModel = request.headers.get("X-Use-Open-Model") === "1";
    const provider = useOpenModel
      ? registry.get("free") ?? registry.getDefault()
      : registry.getDefault();

    const { system, user } = buildIntakeAnalysisPrompt(intake);

    // Retry up to 3 times for free model (can be flaky)
    const maxAttempts = useOpenModel ? 3 : 1;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await provider.generate(user, {
          systemPrompt: system,
          temperature: 0.3,
          maxTokens: 2048,
        });

        const parsed = JSON.parse(cleanJsonResponse(result.content));

        return NextResponse.json({
          clarifyingQuestions: parsed.clarifyingQuestions || [],
          refinedIntent: parsed.refinedIntent || {},
        });
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.error(`Builder intake attempt ${attempt}/${maxAttempts} failed:`, lastError.message);
        if (attempt < maxAttempts) {
          // Wait a bit before retrying
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
    }

    // All attempts failed — return detailed error to help debug
    return NextResponse.json(
      { error: `Intake analysis failed: ${lastError?.message || "Unknown error"}` },
      { status: 500 }
    );
  } catch (error) {
    console.error("Builder intake error:", error);
    return NextResponse.json(
      { error: `Failed to analyze intake: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
  if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
  if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
  return cleaned.trim();
}
