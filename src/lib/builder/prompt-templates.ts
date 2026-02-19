import type { BuilderIntake, PromptContent } from "@/lib/types/prompt";

export function buildIntakeAnalysisPrompt(intake: BuilderIntake): { system: string; user: string } {
  return {
    system: `You are a prompt engineering expert. Analyze the user's request and:
1. Extract a structured intent (what they really want the AI to do).
2. Identify any ambiguities or missing details that would improve the prompt.
3. Generate 2-4 clarifying questions for the ambiguous parts.

Respond with valid JSON only:
{
  "refinedIntent": {
    "goal": "string - clear statement of what the prompt should achieve",
    "keyRequirements": ["string - specific things the prompt must include"],
    "context": "string - relevant background",
    "outputExpectations": "string - what good output looks like"
  },
  "clarifyingQuestions": [
    {
      "id": "q1",
      "field": "string - what aspect this clarifies",
      "question": "string - the question to ask",
      "options": ["string - option1", "string - option2", "string - option3"]
    }
  ]
}

If the request is already clear enough, return an empty clarifyingQuestions array.`,
    user: `Objective: ${intake.objective}
Task type: ${intake.taskType}
Target audience: ${intake.audience || "Not specified"}
Tone: ${intake.tone}
Constraints: ${intake.constraints || "None specified"}
Target AI model: ${intake.modelTarget}`,
  };
}

export function buildClarifyPrompt(
  intake: BuilderIntake,
  refinedIntent: Record<string, unknown>,
  answers: Record<string, string>
): { system: string; user: string } {
  return {
    system: `You are a prompt engineering expert. The user has answered clarifying questions about their prompt request. Merge their answers into a final refined intent.

Respond with valid JSON only:
{
  "refinedIntent": {
    "goal": "string",
    "keyRequirements": ["string"],
    "context": "string",
    "outputExpectations": "string",
    "clarifiedDetails": {}
  }
}`,
    user: `Original request:
Objective: ${intake.objective}
Task type: ${intake.taskType}
Audience: ${intake.audience || "Not specified"}
Tone: ${intake.tone}
Constraints: ${intake.constraints || "None"}

Previous analysis: ${JSON.stringify(refinedIntent)}

User's answers to clarifying questions:
${Object.entries(answers).map(([q, a]) => `Q: ${q}\nA: ${a}`).join("\n\n")}`,
  };
}

const MODEL_TIPS: Record<string, string> = {
  claude: "Use XML tags like <context>, <task>, <constraints> for structure. Claude responds well to explicit role-setting and thinking step-by-step instructions.",
  gpt: "Use markdown headers (##) for sections. GPT works well with numbered instructions and explicit output format examples.",
  gemini: "Use clear section breaks and bullet points. Gemini works well with concise, direct instructions and explicit output formatting.",
};

export function buildPromptGenerationPrompt(
  intake: BuilderIntake,
  refinedIntent: Record<string, unknown>
): { system: string; user: string } {
  return {
    system: `You are an expert prompt engineer. Generate a high-quality, production-ready prompt based on the user's refined requirements.

The prompt MUST have exactly these 5 sections, clearly labeled:

=== SYSTEM CONTEXT ===
(Role and background for the AI)

=== TASK ===
(Clear instructions for what to do)

=== CONSTRAINTS ===
(Rules, limits, things to avoid)

=== OUTPUT FORMAT ===
(Expected structure and format of the response)

=== EXAMPLES ===
(1-2 brief examples of good output, or "N/A" if not applicable)

Target model: ${intake.modelTarget}
Model-specific tip: ${MODEL_TIPS[intake.modelTarget] || ""}

Write only the prompt text. Do not add commentary or explanation outside the sections.`,
    user: `Create a prompt for this request:

Goal: ${(refinedIntent as Record<string, string>).goal || intake.objective}
Key requirements: ${JSON.stringify((refinedIntent as Record<string, string[]>).keyRequirements || [])}
Context: ${(refinedIntent as Record<string, string>).context || ""}
Output expectations: ${(refinedIntent as Record<string, string>).outputExpectations || ""}
Task type: ${intake.taskType}
Audience: ${intake.audience || "General"}
Tone: ${intake.tone}
Constraints: ${intake.constraints || "None"}`,
  };
}

export function buildEvaluationPrompt(
  promptContent: PromptContent,
  intake: BuilderIntake
): { system: string; user: string } {
  return {
    system: `You are a prompt quality evaluator. Score the given prompt on these 4 dimensions. Each score is 0-100.

Respond with valid JSON only:
{
  "semantic_alignment": {
    "score": number,
    "explanation": "string - how well does the prompt capture the user's intent?",
    "suggestions": ["string - specific improvements"]
  },
  "style_tone_fit": {
    "score": number,
    "explanation": "string - does the prompt enforce the requested tone?",
    "suggestions": ["string - specific improvements"]
  },
  "robustness": {
    "score": number,
    "explanation": "string - would rephrasing produce similar results?",
    "suggestions": ["string - specific improvements"]
  },
  "llm_judge": {
    "score": number,
    "explanation": "string - overall quality assessment",
    "suggestions": ["string - specific improvements"]
  }
}

Be honest and critical. A score of 70-80 is good. 90+ is excellent. Below 60 needs significant work.`,
    user: `Original user request:
Objective: ${intake.objective}
Task type: ${intake.taskType}
Audience: ${intake.audience || "Not specified"}
Tone: ${intake.tone}
Constraints: ${intake.constraints || "None"}

Generated prompt to evaluate:
${promptContent.raw}`,
  };
}

export function parsePromptSections(raw: string): PromptContent {
  const sections: PromptContent = {
    systemContext: "",
    task: "",
    constraints: "",
    outputFormat: "",
    examples: "",
    raw,
  };

  const sectionPatterns: { key: keyof Omit<PromptContent, "raw">; pattern: RegExp }[] = [
    { key: "systemContext", pattern: /===\s*SYSTEM CONTEXT\s*===\s*\n([\s\S]*?)(?====|$)/ },
    { key: "task", pattern: /===\s*TASK\s*===\s*\n([\s\S]*?)(?====|$)/ },
    { key: "constraints", pattern: /===\s*CONSTRAINTS\s*===\s*\n([\s\S]*?)(?====|$)/ },
    { key: "outputFormat", pattern: /===\s*OUTPUT FORMAT\s*===\s*\n([\s\S]*?)(?====|$)/ },
    { key: "examples", pattern: /===\s*EXAMPLES\s*===\s*\n([\s\S]*?)(?====|$)/ },
  ];

  for (const { key, pattern } of sectionPatterns) {
    const match = raw.match(pattern);
    if (match) {
      sections[key] = match[1].trim();
    }
  }

  return sections;
}
