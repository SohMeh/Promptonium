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

    const provider = getProviderRegistry().getDefault();
    const { system, user } = buildIntakeAnalysisPrompt(intake);

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
  } catch (error) {
    console.error("Builder intake error:", error);
    return NextResponse.json(
      { error: "Failed to analyze intake" },
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
