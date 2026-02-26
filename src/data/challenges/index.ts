import type { Challenge } from "@/lib/types/challenge";

export const CHALLENGES: Challenge[] = [
  // --- Email (2) ---
  {
    id: "ch_email_1",
    title: "Welcome Email Draft",
    description:
      "Write a prompt that instructs an AI to compose a warm welcome email for new SaaS customers. The email should introduce the product, highlight three key features, and include a clear call-to-action to complete onboarding.",
    category: "email",
    difficulty: "beginner",
    timeLimit: 300,
    targetModel: "claude",
  },
  {
    id: "ch_email_2",
    title: "Difficult Conversation Email",
    description:
      "Craft a prompt that guides an AI to write a professional email delivering bad news to a client about a project delay. The email must acknowledge the issue, explain the reason, propose a revised timeline, and maintain the business relationship.",
    category: "email",
    difficulty: "intermediate",
    timeLimit: 240,
    targetModel: "claude",
    rubricOverrides: {
      style_tone_fit: 0.25,
      robustness: 0.2,
    },
  },

  // --- Summarization (2) ---
  {
    id: "ch_summarize_1",
    title: "Article Summarizer",
    description:
      "Write a prompt that tells an AI to summarize a long news article into a concise 3-paragraph summary. The summary should capture the main argument, supporting evidence, and implications while staying under 200 words.",
    category: "summarization",
    difficulty: "beginner",
    timeLimit: 300,
    targetModel: "claude",
  },
  {
    id: "ch_summarize_2",
    title: "Technical Paper Distiller",
    description:
      "Create a prompt that instructs an AI to distill a dense technical research paper into an executive summary for non-technical stakeholders. It should extract key findings, methodology highlights, and business implications without jargon.",
    category: "summarization",
    difficulty: "advanced",
    timeLimit: 180,
    targetModel: "claude",
    rubricOverrides: {
      semantic_alignment: 0.3,
      efficiency: 0.2,
    },
  },

  // --- Coding (2) ---
  {
    id: "ch_coding_1",
    title: "Code Review Assistant",
    description:
      "Write a prompt that instructs an AI to review a pull request for a web application. The AI should check for bugs, suggest performance improvements, flag security concerns, and provide constructive feedback in a numbered list.",
    category: "coding",
    difficulty: "intermediate",
    timeLimit: 240,
    targetModel: "claude",
    rubricOverrides: {
      instruction_compliance: 0.25,
      robustness: 0.2,
    },
  },
  {
    id: "ch_coding_2",
    title: "Algorithm Explainer",
    description:
      "Craft a prompt that guides an AI to explain a complex algorithm step-by-step to a junior developer. The explanation should include pseudocode, time/space complexity analysis, a real-world analogy, and at least one worked example with concrete input/output.",
    category: "coding",
    difficulty: "advanced",
    timeLimit: 180,
    targetModel: "claude",
    rubricOverrides: {
      semantic_alignment: 0.3,
      instruction_compliance: 0.25,
    },
  },

  // --- Creative (2) ---
  {
    id: "ch_creative_1",
    title: "Story Starter Generator",
    description:
      "Write a prompt that instructs an AI to generate an engaging opening paragraph for a mystery short story. The opening should establish setting, introduce the protagonist, and create an immediate hook that compels the reader to continue.",
    category: "creative",
    difficulty: "beginner",
    timeLimit: 300,
    targetModel: "claude",
  },
  {
    id: "ch_creative_2",
    title: "Multi-Voice Dialogue Crafter",
    description:
      "Create a prompt that instructs an AI to write a dialogue scene between three characters with distinct voices, backgrounds, and conflicting motivations. Each character must be distinguishable by speech patterns alone, and the scene must advance a central plot conflict without narration.",
    category: "creative",
    difficulty: "expert",
    timeLimit: 120,
    targetModel: "claude",
    rubricOverrides: {
      style_tone_fit: 0.3,
      semantic_alignment: 0.25,
      robustness: 0.2,
    },
  },

  // --- Analysis (1) ---
  {
    id: "ch_analysis_1",
    title: "Data Insight Extractor",
    description:
      "Write a prompt that instructs an AI to analyze a dataset of quarterly sales figures and produce a report with trends, anomalies, and three actionable recommendations. The report should include both quantitative observations and qualitative business context.",
    category: "analysis",
    difficulty: "intermediate",
    timeLimit: 240,
    targetModel: "claude",
    rubricOverrides: {
      instruction_compliance: 0.25,
      semantic_alignment: 0.25,
    },
  },

  // --- Education (1) ---
  {
    id: "ch_education_1",
    title: "Adaptive Lesson Planner",
    description:
      "Craft a prompt that instructs an AI to create a lesson plan for teaching a complex topic to students with varying skill levels. The plan should include learning objectives, differentiated activities for beginners and advanced learners, assessment criteria, and estimated time allocations.",
    category: "education",
    difficulty: "advanced",
    timeLimit: 180,
    targetModel: "claude",
    rubricOverrides: {
      instruction_compliance: 0.25,
      robustness: 0.2,
      semantic_alignment: 0.25,
    },
  },
];

export function getChallengeById(id: string): Challenge | undefined {
  return CHALLENGES.find((c) => c.id === id);
}
