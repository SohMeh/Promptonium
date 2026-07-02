import type { BuilderIntake, ClarifyingQuestion, PromptContent } from "@/lib/types/prompt";
import type { EvaluationRun } from "@/lib/types/evaluation";

export type BuilderStep = "intake" | "clarify" | "generate" | "evaluate" | "improve";

export interface BuilderState {
  currentStep: BuilderStep;
  intake: BuilderIntake | null;
  refinedIntent: Record<string, unknown> | null;
  clarifyingQuestions: ClarifyingQuestion[];
  answers: Record<string, string>;
  generatedPrompt: PromptContent | null;
  evaluation: EvaluationRun | null;
  isLoading: boolean;
  error: string | null;
  streamingContent: string;
  /** Vault project being edited; saves append a new version to it. */
  projectId: string | null;
}

export const INITIAL_STATE: BuilderState = {
  currentStep: "intake",
  intake: null,
  refinedIntent: null,
  clarifyingQuestions: [],
  answers: {},
  generatedPrompt: null,
  evaluation: null,
  isLoading: false,
  error: null,
  streamingContent: "",
  projectId: null,
};
