import type { PromptContent, BuilderIntake } from "@/lib/types/prompt";
import type { EvaluationRun, DimensionResult, RubricDimension, RubricConfig } from "@/lib/types/evaluation";
import { DEFAULT_RUBRIC_WEIGHTS } from "@/lib/types/evaluation";
import { getProviderRegistry } from "@/lib/providers";
import type { LLMProvider } from "@/lib/types/provider";
import { buildEvaluationPrompt } from "@/lib/builder/prompt-templates";
import { PE_TIPS } from "@/lib/data/pe-tips";

function generateId(): string {
  return `eval_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Get tips relevant to a dimension based on score */
function getTipsForDimension(dimension: RubricDimension, score: number) {
  const tips = PE_TIPS[dimension] || [];
  if (score >= 85) return []; // Strong — no tips needed
  if (score >= 70) return tips.slice(0, 1); // Solid — one tip
  return tips.slice(0, 2); // Developing or below — two tips
}

function checkInstructionCompliance(prompt: PromptContent, intake: BuilderIntake): DimensionResult {
  const requirements: string[] = [];
  const matched: string[] = [];
  const missing: string[] = [];

  const raw = prompt.raw.toLowerCase();

  if (intake.taskType !== "other") {
    requirements.push(`task type (${intake.taskType})`);
    if (raw.includes(intake.taskType)) matched.push(`task type (${intake.taskType})`);
    else missing.push(`task type (${intake.taskType})`);
  }

  requirements.push(`tone (${intake.tone})`);
  if (raw.includes(intake.tone)) matched.push(`tone (${intake.tone})`);
  else missing.push(`tone (${intake.tone})`);

  if (intake.audience) {
    requirements.push("audience");
    if (raw.includes(intake.audience.toLowerCase())) matched.push("audience");
    else missing.push("audience");
  }

  if (intake.constraints) {
    const constraintWords = intake.constraints.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
    const keyWords = constraintWords.slice(0, 5);
    for (const word of keyWords) {
      requirements.push(`constraint: "${word}"`);
      if (raw.includes(word)) matched.push(`constraint: "${word}"`);
      else missing.push(`constraint: "${word}"`);
    }
  }

  const hasSections = prompt.systemContext && prompt.task && prompt.outputFormat;
  requirements.push("structured sections");
  if (hasSections) matched.push("structured sections");
  else missing.push("structured sections");

  const score = requirements.length > 0 ? Math.round((matched.length / requirements.length) * 100) : 80;

  return {
    dimension: "instruction_compliance",
    score,
    weight: DEFAULT_RUBRIC_WEIGHTS.instruction_compliance,
    explanation: missing.length > 0
      ? `Your prompt covers ${matched.length} of ${requirements.length} key requirements — nice work! To strengthen it further, consider adding: ${missing.join(", ")}.`
      : `Great job! Your prompt addresses all ${requirements.length} identified requirements.`,
    suggestions: missing.map((m) => `Try adding ${m} to make your prompt more complete`),
    tips: getTipsForDimension("instruction_compliance", score),
  };
}

function checkEfficiency(prompt: PromptContent): DimensionResult {
  const raw = prompt.raw;
  const wordCount = raw.split(/\s+/).length;
  const estimatedTokens = Math.round(wordCount * 1.3);

  let score = 100;
  const suggestions: string[] = [];

  if (estimatedTokens > 2000) {
    score -= 20;
    suggestions.push("Your prompt is on the longer side. See if any instructions repeat or could be combined.");
  } else if (estimatedTokens > 1000) {
    score -= 10;
    suggestions.push("Moderate length — you might find opportunities to tighten a few sections.");
  }

  const sentences = raw.split(/[.!?]+/).map((s) => s.trim().toLowerCase()).filter((s) => s.length > 20);
  const seen = new Set<string>();
  let duplicates = 0;
  for (const s of sentences) {
    if (seen.has(s)) duplicates++;
    seen.add(s);
  }
  if (duplicates > 0) {
    score -= duplicates * 10;
    suggestions.push(`Spotted ${duplicates} repeated sentence(s) — removing these will make your prompt cleaner.`);
  }

  const whitespace = (raw.match(/\n{3,}/g) || []).length;
  if (whitespace > 2) {
    score -= 5;
    suggestions.push("A few extra blank lines can be trimmed for a cleaner layout.");
  }

  score = Math.max(0, Math.min(100, score));

  return {
    dimension: "efficiency",
    score,
    weight: DEFAULT_RUBRIC_WEIGHTS.efficiency,
    explanation: `~${estimatedTokens} tokens. ${suggestions.length === 0 ? "Nice and concise!" : "A few opportunities to tighten things up."}`,
    suggestions,
    tips: getTipsForDimension("efficiency", score),
  };
}

async function runLLMJudge(
  prompt: PromptContent,
  intake: BuilderIntake,
  provider?: LLMProvider
): Promise<DimensionResult[]> {
  const resolvedProvider = provider ?? getProviderRegistry().getDefault();
  const { system, user } = buildEvaluationPrompt(prompt, intake);

  const result = await resolvedProvider.generate(user, {
    systemPrompt: system,
    temperature: 0.2,
    maxTokens: 2048,
  });

  let cleaned = result.content.trim();
  if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
  if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
  if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);

  const parsed = JSON.parse(cleaned.trim());

  const dimensions: RubricDimension[] = ["semantic_alignment", "style_tone_fit", "robustness", "llm_judge"];
  return dimensions.map((dim) => {
    const score = parsed[dim]?.score ?? 75;
    return {
      dimension: dim,
      score,
      weight: DEFAULT_RUBRIC_WEIGHTS[dim],
      explanation: parsed[dim]?.explanation ?? "No explanation provided.",
      suggestions: parsed[dim]?.suggestions ?? [],
      tips: getTipsForDimension(dim, score),
    };
  });
}

export async function evaluatePrompt(
  prompt: PromptContent,
  intake: BuilderIntake,
  rubricConfig?: RubricConfig,
  provider?: LLMProvider
): Promise<EvaluationRun> {
  const weights = rubricConfig?.weights || DEFAULT_RUBRIC_WEIGHTS;

  const instructionResult = checkInstructionCompliance(prompt, intake);
  const efficiencyResult = checkEfficiency(prompt);

  const llmResults = await runLLMJudge(prompt, intake, provider);

  const allDimensions = [instructionResult, efficiencyResult, ...llmResults];

  for (const dim of allDimensions) {
    dim.weight = weights[dim.dimension] ?? dim.weight;
  }

  const totalWeight = allDimensions.reduce((sum, d) => sum + d.weight, 0);
  const totalScore = Math.round(
    allDimensions.reduce((sum, d) => sum + d.score * d.weight, 0) / totalWeight
  );

  const sorted = [...allDimensions].sort((a, b) => a.score - b.score);
  const topSuggestions = sorted
    .slice(0, 2)
    .flatMap((d) => d.suggestions)
    .slice(0, 3);

  const guidance = topSuggestions.length > 0
    ? `Focus areas: ${topSuggestions.join(" Also: ")}`
    : "Your prompt is looking strong! Try small tweaks in the Improve tab and re-evaluate to push your score even higher.";

  return {
    id: generateId(),
    promptVersionId: "",
    timestamp: Date.now(),
    totalScore,
    dimensions: allDimensions,
    guidance,
  };
}
