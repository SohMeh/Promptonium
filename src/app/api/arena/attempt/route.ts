import { NextResponse } from "next/server";
import { getChallengeById } from "@/data/challenges";
import { evaluatePrompt } from "@/lib/services/evaluation-engine";
import { getProviderRegistry } from "@/lib/providers";
import { parsePromptSections } from "@/lib/builder/prompt-templates";
import type { PromptContent, BuilderIntake, TaskType, ToneType } from "@/lib/types/prompt";
import type { RubricConfig } from "@/lib/types/evaluation";
import { DEFAULT_RUBRIC_WEIGHTS } from "@/lib/types/evaluation";
import type { ChallengeAttempt } from "@/lib/types/challenge";

const CATEGORY_TO_TASK_TYPE: Record<string, TaskType> = {
  email: "email",
  summarization: "summarization",
  coding: "coding",
  education: "education",
  creative: "creative",
  analysis: "analysis",
};

const CATEGORY_TO_TONE: Record<string, ToneType> = {
  email: "professional",
  summarization: "professional",
  coding: "technical",
  education: "friendly",
  creative: "casual",
  analysis: "authoritative",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { challengeId, promptContent, startedAt, submittedAt } = body;

    if (!challengeId || !promptContent || !startedAt || !submittedAt) {
      return NextResponse.json(
        { error: "Missing required fields: challengeId, promptContent, startedAt, submittedAt" },
        { status: 400 }
      );
    }

    const challenge = getChallengeById(challengeId);
    if (!challenge) {
      return NextResponse.json(
        { error: `Challenge not found: ${challengeId}` },
        { status: 404 }
      );
    }

    // Build PromptContent from the raw text
    const parsedContent: PromptContent = parsePromptSections(promptContent);

    // Build a BuilderIntake from the challenge data
    const intake: BuilderIntake = {
      objective: challenge.description,
      taskType: CATEGORY_TO_TASK_TYPE[challenge.category] ?? "other",
      audience: "general",
      tone: CATEGORY_TO_TONE[challenge.category] ?? "professional",
      constraints: "",
      modelTarget: "claude",
    };

    // Build RubricConfig from challenge overrides
    const rubricConfig: RubricConfig | undefined = challenge.rubricOverrides
      ? {
          weights: {
            ...DEFAULT_RUBRIC_WEIGHTS,
            ...challenge.rubricOverrides,
          },
        }
      : undefined;

    // Run evaluation
    const useOpenModel = request.headers.get("X-Use-Open-Model") === "1";
    const registry = getProviderRegistry();
    const provider = useOpenModel
      ? registry.get("free") ?? registry.getDefault()
      : registry.getDefault();

    const evaluation = await evaluatePrompt(parsedContent, intake, rubricConfig, provider);

    // Create the attempt record
    const attempt: ChallengeAttempt = {
      id: `attempt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      challengeId,
      promptContent,
      evaluation,
      startedAt,
      submittedAt,
    };

    return NextResponse.json({ evaluation, attempt });
  } catch (err) {
    console.error("Arena attempt error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
