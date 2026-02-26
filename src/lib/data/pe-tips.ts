import type { RubricDimension, PromptEngineeringTip } from "@/lib/types/evaluation";

/**
 * Prompt engineering tips mapped to evaluation dimensions.
 * Each dimension has tips that surface when that area has room to grow.
 * topicId fields are reserved for future cross-referencing with
 * Prompt Academy lessons and Prompt Arena challenges.
 */
export const PE_TIPS: Record<RubricDimension, PromptEngineeringTip[]> = {
  instruction_compliance: [
    {
      title: "Be Specific About Requirements",
      description:
        "List every requirement explicitly. AI models respond best when each constraint is stated directly rather than implied. Try using a numbered list of requirements.",
      topicId: "academy:specificity",
    },
    {
      title: "Use Structured Sections",
      description:
        "Break your prompt into clear sections (context, task, constraints, output format). This helps the model understand and address each part systematically.",
      topicId: "academy:structure",
    },
    {
      title: "Include Keywords From Your Goal",
      description:
        "Make sure the key terms from your objective appear in the prompt. If you want a 'professional email', those exact words should be in the task description.",
      topicId: "arena:keyword-matching",
    },
  ],
  semantic_alignment: [
    {
      title: "State Your Goal Upfront",
      description:
        "Put the main objective in the first 1-2 sentences. Models pay special attention to the beginning of prompts, so lead with what matters most.",
      topicId: "academy:goal-framing",
    },
    {
      title: "Add Context About Why",
      description:
        "Explain the purpose behind the task. 'Write a summary' is okay, but 'Write a summary for executives who need to make a quick budget decision' is much better.",
      topicId: "academy:context-setting",
    },
    {
      title: "Define Success Criteria",
      description:
        "Tell the model what a great response looks like. Include a brief example of ideal output or describe the qualities you're looking for.",
      topicId: "arena:output-quality",
    },
  ],
  style_tone_fit: [
    {
      title: "Set the Tone Explicitly",
      description:
        "Don't just say 'professional' \u2014 describe what that means for your use case. 'Write in a warm but professional tone, as if advising a respected colleague' is more effective.",
      topicId: "academy:tone-control",
    },
    {
      title: "Provide a Voice Example",
      description:
        "Give a short sample of the writing style you want. Even one sentence example of the desired voice helps the model calibrate its output.",
      topicId: "academy:few-shot",
    },
  ],
  efficiency: [
    {
      title: "Trim Redundant Instructions",
      description:
        "Check if you're saying the same thing in different ways. Each instruction should add new information. Concise prompts often perform better than long ones.",
      topicId: "academy:conciseness",
    },
    {
      title: "Focus on What Matters",
      description:
        "Every sentence in your prompt uses tokens. Ask yourself: does this instruction meaningfully change the output? If not, consider removing it.",
      topicId: "arena:token-efficiency",
    },
  ],
  robustness: [
    {
      title: "Add Edge Case Guidance",
      description:
        "Think about unusual inputs. What should the model do if information is missing or ambiguous? Adding 'If X is unclear, then Y' makes your prompt more resilient.",
      topicId: "academy:edge-cases",
    },
    {
      title: "Use Negative Constraints",
      description:
        "Tell the model what NOT to do. 'Do not include personal opinions' or 'Avoid jargon' helps prevent common failure modes.",
      topicId: "academy:negative-constraints",
    },
  ],
  llm_judge: [
    {
      title: "Iterate and Refine",
      description:
        "Great prompts rarely come from a first draft. Use the evaluation feedback to identify weak spots, make targeted edits, and re-evaluate. Small changes can have big impact.",
      topicId: "academy:iteration",
    },
    {
      title: "Test With Different Inputs",
      description:
        "A strong prompt works well across variations of the same task. If your prompt is too narrowly tailored, consider making the instructions slightly more general.",
      topicId: "arena:robustness-challenge",
    },
  ],
};

/** Get tips for dimensions that scored below the threshold */
export function getTipsForWeakDimensions(
  dimensions: { dimension: RubricDimension; score: number }[],
  threshold = 80
): PromptEngineeringTip[] {
  const weakDims = dimensions
    .filter((d) => d.score < threshold)
    .sort((a, b) => a.score - b.score);

  const tips: PromptEngineeringTip[] = [];
  for (const dim of weakDims) {
    const dimTips = PE_TIPS[dim.dimension] || [];
    // Take the first tip from each weak dimension (most relevant)
    if (dimTips.length > 0) {
      tips.push(dimTips[0]);
    }
  }
  return tips;
}
