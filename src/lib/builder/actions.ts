import type { BuilderState, BuilderStep } from "./state";
import type { BuilderIntake, ClarifyingQuestion, PromptContent } from "@/lib/types/prompt";
import type { EvaluationRun } from "@/lib/types/evaluation";

export type BuilderAction =
  | { type: "SET_STEP"; step: BuilderStep }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "INTAKE_SUBMITTED"; intake: BuilderIntake; clarifyingQuestions: ClarifyingQuestion[]; refinedIntent: Record<string, unknown> }
  | { type: "ANSWER_QUESTION"; questionId: string; answer: string }
  | { type: "CLARIFY_COMPLETED"; refinedIntent: Record<string, unknown> }
  | { type: "STREAM_CHUNK"; chunk: string }
  | { type: "PROMPT_GENERATED"; prompt: PromptContent }
  | { type: "EVALUATION_COMPLETE"; evaluation: EvaluationRun }
  | { type: "UPDATE_PROMPT_SECTION"; section: keyof PromptContent; value: string }
  | { type: "RESET" };

export function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.step };
    case "SET_LOADING":
      return { ...state, isLoading: action.loading, error: null };
    case "SET_ERROR":
      return { ...state, error: action.error, isLoading: false };
    case "INTAKE_SUBMITTED":
      return {
        ...state,
        intake: action.intake,
        clarifyingQuestions: action.clarifyingQuestions,
        refinedIntent: action.refinedIntent,
        currentStep: action.clarifyingQuestions.length > 0 ? "clarify" : "generate",
        isLoading: false,
      };
    case "ANSWER_QUESTION":
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.answer },
      };
    case "CLARIFY_COMPLETED":
      return {
        ...state,
        refinedIntent: action.refinedIntent,
        currentStep: "generate",
        isLoading: false,
      };
    case "STREAM_CHUNK":
      return { ...state, streamingContent: state.streamingContent + action.chunk };
    case "PROMPT_GENERATED":
      return {
        ...state,
        generatedPrompt: action.prompt,
        streamingContent: "",
        isLoading: false,
        // step stays "generate" — handleEvaluate transitions to "evaluate"
      };
    case "EVALUATION_COMPLETE":
      return {
        ...state,
        evaluation: action.evaluation,
        currentStep: "evaluate",
        isLoading: false,
      };
    case "UPDATE_PROMPT_SECTION":
      if (!state.generatedPrompt) return state;
      return {
        ...state,
        generatedPrompt: { ...state.generatedPrompt, [action.section]: action.value },
        evaluation: null,
      };
    case "RESET":
      return {
        ...state,
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
      };
    default:
      return state;
  }
}
