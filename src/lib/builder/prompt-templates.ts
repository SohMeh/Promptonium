import type { BuilderIntake, PromptContent } from "@/lib/types/prompt";

export function buildIntakeAnalysisPrompt(intake: BuilderIntake): { system: string; user: string } {
  return {
    system: `You are a prompt engineering expert. Analyze the user's request and:
1. Extract a structured intent (what they really want the AI to do).
2. Dig into the DEEPER PURPOSE — understand WHY they need this prompt, what problem they are solving, and what outcome they hope to achieve. This is critical for generating a truly useful prompt.
3. Identify any ambiguities or missing details that would improve the prompt.
4. Generate 3-5 clarifying questions. The FIRST question must ALWAYS ask about the user's underlying purpose or motivation (e.g. "What's the main problem you're trying to solve?" or "What outcome are you hoping to achieve with this?"). The remaining questions should address specific ambiguities. Each question should have 2-4 suggested options, but keep in mind the user can also write a free-text response.

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
      "id": "purpose",
      "field": "purpose",
      "question": "string - ALWAYS ask about the deeper purpose/motivation first",
      "options": ["string - suggested purpose option 1", "string - option 2", "string - option 3"]
    },
    {
      "id": "q2",
      "field": "string - what aspect this clarifies",
      "question": "string - the question to ask",
      "options": ["string - option1", "string - option2", "string - option3"]
    }
  ]
}

IMPORTANT: Always include at least the purpose question, even if the request seems clear. Understanding WHY helps generate dramatically better prompts.`,
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
    system: `You are a prompt engineering expert. The user has answered clarifying questions about their prompt request, including their deeper purpose and motivation. Merge their answers into a final refined intent.

Pay special attention to the user's stated PURPOSE — use it to inform every aspect of the refined intent. The goal, requirements, and output expectations should all reflect WHY the user needs this, not just WHAT they asked for on the surface.

Respond with valid JSON only:
{
  "refinedIntent": {
    "goal": "string - incorporate the user's deeper purpose into the goal statement",
    "keyRequirements": ["string - requirements informed by the user's purpose"],
    "context": "string - include purpose/motivation as context",
    "outputExpectations": "string - what good output looks like given their purpose",
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
    system: `You are a supportive prompt engineering coach. Your job is to help the user understand the strengths of their prompt and gently identify areas where it could be improved.

Score the prompt on these 4 dimensions. Each score is 0-100.

Scoring guidelines:
- 85-100: Strong — the prompt handles this well
- 70-84: Solid — works well with minor room for improvement
- 55-69: Developing — functional but has clear opportunities to improve
- Below 55: Getting started — significant room for growth, which is totally normal!

Be encouraging and constructive. Focus suggestions on the ONE most impactful change for each dimension. Frame feedback as opportunities, not failures.

Respond with valid JSON only:
{
  "semantic_alignment": {
    "score": number,
    "explanation": "string - how well does the prompt capture what the user wants to achieve? Start with what's working well.",
    "suggestions": ["string - one specific, actionable improvement"]
  },
  "style_tone_fit": {
    "score": number,
    "explanation": "string - how well does the prompt guide the AI toward the right tone and style? Acknowledge what's already set up.",
    "suggestions": ["string - one specific, actionable improvement"]
  },
  "robustness": {
    "score": number,
    "explanation": "string - how consistently would this prompt produce good results? Note its strengths first.",
    "suggestions": ["string - one specific, actionable improvement"]
  },
  "llm_judge": {
    "score": number,
    "explanation": "string - overall quality and usability. Lead with the positives.",
    "suggestions": ["string - one specific, actionable improvement"]
  }
}`,
    user: `User's original goal:
Objective: ${intake.objective}
Task type: ${intake.taskType}
Audience: ${intake.audience || "Not specified"}
Tone: ${intake.tone}
Constraints: ${intake.constraints || "None"}

Prompt to review:
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
