import type { RubricDimension } from "./evaluation";
import type { EvaluationRun } from "./evaluation";

export type ChallengeCategory =
  | "email"
  | "summarization"
  | "coding"
  | "education"
  | "creative"
  | "analysis";

export type DifficultyLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  difficulty: DifficultyLevel;
  timeLimit: number;
  targetModel: string;
  rubricOverrides?: Partial<Record<RubricDimension, number>>;
}

export interface ChallengeAttempt {
  id: string;
  challengeId: string;
  promptContent: string;
  evaluation: EvaluationRun | null;
  startedAt: number;
  submittedAt: number;
}
