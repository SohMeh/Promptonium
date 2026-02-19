export interface EvaluationRun {
  id: string;
  promptVersionId: string;
  timestamp: number;
  totalScore: number;
  dimensions: DimensionResult[];
  guidance: string;
}

export interface DimensionResult {
  dimension: RubricDimension;
  score: number;
  weight: number;
  explanation: string;
  suggestions: string[];
}

export type RubricDimension =
  | "instruction_compliance"
  | "semantic_alignment"
  | "style_tone_fit"
  | "efficiency"
  | "robustness"
  | "llm_judge";

export interface RubricConfig {
  weights: Record<RubricDimension, number>;
  context?: string;
}

export const DEFAULT_RUBRIC_WEIGHTS: Record<RubricDimension, number> = {
  instruction_compliance: 0.2,
  semantic_alignment: 0.25,
  style_tone_fit: 0.15,
  efficiency: 0.15,
  robustness: 0.15,
  llm_judge: 0.1,
};
