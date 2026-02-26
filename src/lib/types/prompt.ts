import type { EvaluationRun } from "./evaluation";

export type TaskType =
  | "email"
  | "summarization"
  | "coding"
  | "education"
  | "creative"
  | "analysis"
  | "other";

export type ToneType =
  | "professional"
  | "casual"
  | "technical"
  | "friendly"
  | "authoritative";

export type ModelTarget = "claude" | "gpt" | "gemini";

export interface PromptProject {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  versions: PromptVersion[];
  tags: string[];
  modelTarget: ModelTarget;
  sourceMode: "builder" | "arena";
}

export interface PromptVersion {
  id: string;
  projectId: string;
  content: PromptContent;
  evaluation: EvaluationRun | null;
  createdAt: number;
}

export interface PromptContent {
  systemContext: string;
  task: string;
  constraints: string;
  outputFormat: string;
  examples: string;
  raw: string;
}

export interface BuilderIntake {
  objective: string;
  taskType: TaskType;
  audience: string;
  tone: ToneType;
  constraints: string;
  modelTarget: ModelTarget;
  /** When true, use free open models (via HuggingFace) for generation instead of Anthropic API */
  useOpenModel?: boolean;
}

export interface ClarifyingQuestion {
  id: string;
  field: string;
  question: string;
  options: string[];
  answer?: string;
}
