import { NextResponse } from "next/server";
import { getLessonById } from "@/data/academy/paths";
import { evaluatePrompt } from "@/lib/services/evaluation-engine";
import { resolveProviderFromRequest } from "@/lib/providers";
import { parsePromptSections } from "@/lib/builder/prompt-templates";
import type { BuilderIntake } from "@/lib/types/prompt";

export async function POST(request: Request) {
  try {
    const { pathId, lessonId, promptContent } = (await request.json()) as {
      pathId: string;
      lessonId: string;
      promptContent: string;
    };

    if (!pathId || !lessonId || !promptContent?.trim()) {
      return NextResponse.json(
        { error: "pathId, lessonId, and promptContent are required" },
        { status: 400 }
      );
    }

    const lesson = getLessonById(pathId, lessonId);
    if (!lesson) {
      return NextResponse.json(
        { error: `Lesson not found: ${pathId}/${lessonId}` },
        { status: 404 }
      );
    }

    // Build PromptContent from user's raw text
    const parsedContent = parsePromptSections(promptContent);

    // Build a BuilderIntake from the practice scenario
    const intake: BuilderIntake = {
      objective: lesson.practice.description,
      taskType: "education",
      audience: "general",
      tone: "professional",
      constraints: "",
      modelTarget: "claude",
    };

    // Evaluate
    const provider = resolveProviderFromRequest(request);

    const evaluation = await evaluatePrompt(parsedContent, intake, undefined, provider);

    // Check if passed
    const passed = evaluation.totalScore >= lesson.checkpointThreshold;

    return NextResponse.json({
      evaluation,
      passed,
      threshold: lesson.checkpointThreshold,
    });
  } catch (error) {
    console.error("Academy progress error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate practice prompt" },
      { status: 500 }
    );
  }
}
