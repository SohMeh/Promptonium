import { NextResponse } from "next/server";
import { evaluatePrompt } from "@/lib/services/evaluation-engine";
import { resolveProviderFromRequest } from "@/lib/providers";
import type { PromptContent, BuilderIntake } from "@/lib/types/prompt";

export async function POST(request: Request) {
  try {
    const { promptContent, intake } = (await request.json()) as {
      promptContent: PromptContent;
      intake: BuilderIntake;
    };

    if (!promptContent?.raw) {
      return NextResponse.json({ error: "Prompt content is required" }, { status: 400 });
    }

    const provider = resolveProviderFromRequest(request);

    const evaluation = await evaluatePrompt(promptContent, intake, undefined, provider);
    return NextResponse.json(evaluation);
  } catch (error) {
    console.error("Builder evaluate error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate prompt" },
      { status: 500 }
    );
  }
}
