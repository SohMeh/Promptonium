# Phase 2: Builder Vertical Slice — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the complete Prompt Builder mode end-to-end: intake form, clarification flow, streaming prompt generation, hybrid rubric evaluation, improve loop, and save to vault.

**Architecture:** Sidebar stepper + main content area. useReducer for state. 4 API routes calling Claude via provider adapter. Streaming via ReadableStream. Hybrid eval engine (deterministic + single LLM batch call).

**Tech Stack:** Next.js 15, React 19, shadcn/ui, Anthropic Claude SDK, ReadableStream API

---

### Task 1: Builder State & Reducer

**Files:**
- Create: `src/lib/builder/state.ts`
- Create: `src/lib/builder/actions.ts`

**Step 1: Create builder state types and reducer**

```typescript
// src/lib/builder/state.ts
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
};
```

**Step 2: Create reducer actions**

```typescript
// src/lib/builder/actions.ts
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
        currentStep: "evaluate",
        isLoading: false,
      };
    case "EVALUATION_COMPLETE":
      return {
        ...state,
        evaluation: action.evaluation,
        currentStep: "improve",
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
      return { ...state, ...{ currentStep: "intake", intake: null, refinedIntent: null, clarifyingQuestions: [], answers: {}, generatedPrompt: null, evaluation: null, isLoading: false, error: null, streamingContent: "" } };
    default:
      return state;
  }
}
```

**Step 3: Verify compiles**

```bash
npx tsc --noEmit
```

**Step 4: Commit**

```bash
git add -A && git commit -m "feat(builder): add state types and reducer"
```

---

### Task 2: Builder Sidebar Component

**Files:**
- Create: `src/components/builder/builder-sidebar.tsx`

**Step 1: Create sidebar**

```tsx
// src/components/builder/builder-sidebar.tsx
"use client";

import { cn } from "@/lib/utils";
import type { BuilderStep } from "@/lib/builder/state";
import { Check, Circle, Loader2 } from "lucide-react";

const STEPS: { key: BuilderStep; label: string }[] = [
  { key: "intake", label: "Describe Your Prompt" },
  { key: "clarify", label: "Clarify Intent" },
  { key: "generate", label: "Generate Prompt" },
  { key: "evaluate", label: "Evaluate Quality" },
  { key: "improve", label: "Review & Improve" },
];

const STEP_ORDER: BuilderStep[] = ["intake", "clarify", "generate", "evaluate", "improve"];

interface BuilderSidebarProps {
  currentStep: BuilderStep;
  isLoading: boolean;
  onStepClick: (step: BuilderStep) => void;
}

export function BuilderSidebar({ currentStep, isLoading, onStepClick }: BuilderSidebarProps) {
  const currentIndex = STEP_ORDER.indexOf(currentStep);

  return (
    <nav className="w-64 border-r bg-muted/30 p-6 hidden lg:block">
      <h2 className="text-sm font-semibold text-muted-foreground mb-6 uppercase tracking-wider">
        Builder Steps
      </h2>
      <ol className="space-y-2">
        {STEPS.map((step, index) => {
          const isActive = step.key === currentStep;
          const isCompleted = index < currentIndex;
          const isFuture = index > currentIndex;

          return (
            <li key={step.key}>
              <button
                onClick={() => isCompleted && onStepClick(step.key)}
                disabled={isFuture}
                className={cn(
                  "flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm transition-colors",
                  isActive && "bg-primary/10 text-primary font-medium",
                  isCompleted && "text-foreground hover:bg-muted cursor-pointer",
                  isFuture && "text-muted-foreground/50 cursor-not-allowed"
                )}
              >
                <span className="flex-shrink-0">
                  {isActive && isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isCompleted ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Circle className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground/40")} />
                  )}
                </span>
                {step.label}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

**Step 2: Verify compiles, commit**

```bash
npx tsc --noEmit
git add -A && git commit -m "feat(builder): add sidebar step indicator component"
```

---

### Task 3: Intake Form Component

**Files:**
- Create: `src/components/builder/intake-form.tsx`

**Step 1: Create intake form**

```tsx
// src/components/builder/intake-form.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BuilderIntake, TaskType, ToneType, ModelTarget } from "@/lib/types/prompt";
import { Loader2 } from "lucide-react";

const TASK_TYPES: { value: TaskType; label: string }[] = [
  { value: "email", label: "Email / Message" },
  { value: "summarization", label: "Summarization" },
  { value: "coding", label: "Coding / Technical" },
  { value: "education", label: "Education / Teaching" },
  { value: "creative", label: "Creative Writing" },
  { value: "analysis", label: "Analysis / Research" },
  { value: "other", label: "Other" },
];

const TONE_TYPES: { value: ToneType; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "technical", label: "Technical" },
  { value: "friendly", label: "Friendly" },
  { value: "authoritative", label: "Authoritative" },
];

const MODEL_TARGETS: { value: ModelTarget; label: string }[] = [
  { value: "claude", label: "Claude (Anthropic)" },
  { value: "gpt", label: "GPT (OpenAI)" },
  { value: "gemini", label: "Gemini (Google)" },
];

interface IntakeFormProps {
  onSubmit: (intake: BuilderIntake) => void;
  isLoading: boolean;
}

export function IntakeForm({ onSubmit, isLoading }: IntakeFormProps) {
  const [form, setForm] = useState<BuilderIntake>({
    objective: "",
    taskType: "other",
    audience: "",
    tone: "professional",
    constraints: "",
    modelTarget: "claude",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.objective.trim()) return;
    onSubmit(form);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>What do you need a prompt for?</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Objective *</label>
            <Textarea
              placeholder="Describe what you want the AI to do. Be as specific as you can..."
              value={form.objective}
              onChange={(e) => setForm({ ...form, objective: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Task Type</label>
              <Select value={form.taskType} onValueChange={(v) => setForm({ ...form, taskType: v as TaskType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TASK_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Target Model</label>
              <Select value={form.modelTarget} onValueChange={(v) => setForm({ ...form, modelTarget: v as ModelTarget })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MODEL_TARGETS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Audience</label>
              <Input
                placeholder="Who will receive the AI output?"
                value={form.audience}
                onChange={(e) => setForm({ ...form, audience: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tone</label>
              <Select value={form.tone} onValueChange={(v) => setForm({ ...form, tone: v as ToneType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TONE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Constraints (optional)</label>
            <Textarea
              placeholder="Any specific requirements, limits, or things to avoid?"
              value={form.constraints}
              onChange={(e) => setForm({ ...form, constraints: e.target.value })}
              rows={2}
            />
          </div>

          <Button type="submit" disabled={isLoading || !form.objective.trim()} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze & Continue"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

**Step 2: Verify compiles, commit**

```bash
npx tsc --noEmit
git add -A && git commit -m "feat(builder): add intake form component"
```

---

### Task 4: Prompt Templates

**Files:**
- Create: `src/lib/builder/prompt-templates.ts`

**Step 1: Create all 4 prompt templates**

```typescript
// src/lib/builder/prompt-templates.ts
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
```

**Step 2: Verify compiles, commit**

```bash
npx tsc --noEmit
git add -A && git commit -m "feat(builder): add prompt templates for intake, clarify, generate, evaluate"
```

---

### Task 5: Implement /api/builder/intake Route

**Files:**
- Modify: `src/app/api/builder/intake/route.ts`

**Step 1: Implement the route**

```typescript
// src/app/api/builder/intake/route.ts
import { NextResponse } from "next/server";
import { getProviderRegistry } from "@/lib/providers";
import { buildIntakeAnalysisPrompt } from "@/lib/builder/prompt-templates";
import type { BuilderIntake } from "@/lib/types/prompt";

export async function POST(request: Request) {
  try {
    const intake: BuilderIntake = await request.json();

    if (!intake.objective?.trim()) {
      return NextResponse.json({ error: "Objective is required" }, { status: 400 });
    }

    const provider = getProviderRegistry().getDefault();
    const { system, user } = buildIntakeAnalysisPrompt(intake);

    const result = await provider.generate(user, {
      systemPrompt: system,
      temperature: 0.3,
      maxTokens: 2048,
    });

    const parsed = JSON.parse(cleanJsonResponse(result.content));

    return NextResponse.json({
      clarifyingQuestions: parsed.clarifyingQuestions || [],
      refinedIntent: parsed.refinedIntent || {},
    });
  } catch (error) {
    console.error("Builder intake error:", error);
    return NextResponse.json(
      { error: "Failed to analyze intake" },
      { status: 500 }
    );
  }
}

function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
  if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
  if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
  return cleaned.trim();
}
```

**Step 2: Verify compiles, commit**

```bash
npx tsc --noEmit
git add -A && git commit -m "feat(builder): implement intake analysis API route"
```

---

### Task 6: Implement /api/builder/clarify Route

**Files:**
- Modify: `src/app/api/builder/clarify/route.ts`

**Step 1: Implement the route**

```typescript
// src/app/api/builder/clarify/route.ts
import { NextResponse } from "next/server";
import { getProviderRegistry } from "@/lib/providers";
import { buildClarifyPrompt } from "@/lib/builder/prompt-templates";
import type { BuilderIntake } from "@/lib/types/prompt";

export async function POST(request: Request) {
  try {
    const { intake, answers, refinedIntent } = (await request.json()) as {
      intake: BuilderIntake;
      answers: Record<string, string>;
      refinedIntent: Record<string, unknown>;
    };

    const provider = getProviderRegistry().getDefault();
    const { system, user } = buildClarifyPrompt(intake, refinedIntent, answers);

    const result = await provider.generate(user, {
      systemPrompt: system,
      temperature: 0.2,
      maxTokens: 2048,
    });

    let cleaned = result.content.trim();
    if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
    if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
    if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);

    const parsed = JSON.parse(cleaned.trim());

    return NextResponse.json({
      refinedIntent: parsed.refinedIntent || refinedIntent,
      ready: true,
    });
  } catch (error) {
    console.error("Builder clarify error:", error);
    return NextResponse.json(
      { error: "Failed to process clarification" },
      { status: 500 }
    );
  }
}
```

**Step 2: Verify compiles, commit**

```bash
npx tsc --noEmit
git add -A && git commit -m "feat(builder): implement clarify API route"
```

---

### Task 7: Implement Streaming /api/builder/generate Route

**Files:**
- Modify: `src/app/api/builder/generate/route.ts`

**Step 1: Implement streaming route**

```typescript
// src/app/api/builder/generate/route.ts
import { getProviderRegistry } from "@/lib/providers";
import { buildPromptGenerationPrompt } from "@/lib/builder/prompt-templates";
import type { BuilderIntake } from "@/lib/types/prompt";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: Request) {
  try {
    const { intake, refinedIntent } = (await request.json()) as {
      intake: BuilderIntake;
      refinedIntent: Record<string, unknown>;
    };

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const client = new Anthropic({ apiKey });
    const { system, user } = buildPromptGenerationPrompt(intake, refinedIntent);

    const stream = await client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system,
      messages: [{ role: "user", content: user }],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Builder generate error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate prompt" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
```

**Step 2: Verify compiles, commit**

```bash
npx tsc --noEmit
git add -A && git commit -m "feat(builder): implement streaming prompt generation API route"
```

---

### Task 8: Implement Evaluation Engine

**Files:**
- Create: `src/lib/services/evaluation-engine.ts`

**Step 1: Create evaluation engine**

```typescript
// src/lib/services/evaluation-engine.ts
import type { PromptContent, BuilderIntake } from "@/lib/types/prompt";
import type { EvaluationRun, DimensionResult, RubricDimension, RubricConfig } from "@/lib/types/evaluation";
import { DEFAULT_RUBRIC_WEIGHTS } from "@/lib/types/evaluation";
import { getProviderRegistry } from "@/lib/providers";
import { buildEvaluationPrompt } from "@/lib/builder/prompt-templates";

function generateId(): string {
  return `eval_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// --- Deterministic Checks ---

function checkInstructionCompliance(prompt: PromptContent, intake: BuilderIntake): DimensionResult {
  const requirements: string[] = [];
  const matched: string[] = [];
  const missing: string[] = [];

  const raw = prompt.raw.toLowerCase();

  // Check task type mentioned
  if (intake.taskType !== "other") {
    requirements.push(`task type (${intake.taskType})`);
    if (raw.includes(intake.taskType)) matched.push(`task type (${intake.taskType})`);
    else missing.push(`task type (${intake.taskType})`);
  }

  // Check tone mentioned
  requirements.push(`tone (${intake.tone})`);
  if (raw.includes(intake.tone)) matched.push(`tone (${intake.tone})`);
  else missing.push(`tone (${intake.tone})`);

  // Check audience if specified
  if (intake.audience) {
    requirements.push("audience");
    if (raw.includes(intake.audience.toLowerCase())) matched.push("audience");
    else missing.push("audience");
  }

  // Check constraints mentioned
  if (intake.constraints) {
    const constraintWords = intake.constraints.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
    const keyWords = constraintWords.slice(0, 5);
    for (const word of keyWords) {
      requirements.push(`constraint: "${word}"`);
      if (raw.includes(word)) matched.push(`constraint: "${word}"`);
      else missing.push(`constraint: "${word}"`);
    }
  }

  // Check sections present
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
      ? `Prompt addresses ${matched.length}/${requirements.length} requirements. Missing: ${missing.join(", ")}.`
      : `Prompt addresses all ${requirements.length} identified requirements.`,
    suggestions: missing.map((m) => `Include ${m} in the prompt`),
  };
}

function checkEfficiency(prompt: PromptContent): DimensionResult {
  const raw = prompt.raw;
  const wordCount = raw.split(/\s+/).length;
  const estimatedTokens = Math.round(wordCount * 1.3);

  let score = 100;
  const suggestions: string[] = [];

  // Penalize excessive length
  if (estimatedTokens > 2000) {
    score -= 20;
    suggestions.push("Prompt is very long. Consider trimming redundant instructions.");
  } else if (estimatedTokens > 1000) {
    score -= 10;
    suggestions.push("Prompt is moderately long. Look for opportunities to be more concise.");
  }

  // Check for redundancy (repeated phrases)
  const sentences = raw.split(/[.!?]+/).map((s) => s.trim().toLowerCase()).filter((s) => s.length > 20);
  const seen = new Set<string>();
  let duplicates = 0;
  for (const s of sentences) {
    if (seen.has(s)) duplicates++;
    seen.add(s);
  }
  if (duplicates > 0) {
    score -= duplicates * 10;
    suggestions.push(`Found ${duplicates} repeated sentence(s). Remove duplicates.`);
  }

  // Check whitespace ratio
  const whitespace = (raw.match(/\n{3,}/g) || []).length;
  if (whitespace > 2) {
    score -= 5;
    suggestions.push("Reduce excessive blank lines.");
  }

  score = Math.max(0, Math.min(100, score));

  return {
    dimension: "efficiency",
    score,
    weight: DEFAULT_RUBRIC_WEIGHTS.efficiency,
    explanation: `Estimated ${estimatedTokens} tokens. ${suggestions.length === 0 ? "Good token economy." : "Some efficiency improvements possible."}`,
    suggestions,
  };
}

// --- LLM Judge ---

async function runLLMJudge(
  prompt: PromptContent,
  intake: BuilderIntake
): Promise<DimensionResult[]> {
  const provider = getProviderRegistry().getDefault();
  const { system, user } = buildEvaluationPrompt(prompt, intake);

  const result = await provider.generate(user, {
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
  return dimensions.map((dim) => ({
    dimension: dim,
    score: parsed[dim]?.score ?? 70,
    weight: DEFAULT_RUBRIC_WEIGHTS[dim],
    explanation: parsed[dim]?.explanation ?? "No explanation provided.",
    suggestions: parsed[dim]?.suggestions ?? [],
  }));
}

// --- Orchestrator ---

export async function evaluatePrompt(
  prompt: PromptContent,
  intake: BuilderIntake,
  rubricConfig?: RubricConfig
): Promise<EvaluationRun> {
  const weights = rubricConfig?.weights || DEFAULT_RUBRIC_WEIGHTS;

  // Phase 1: Deterministic (instant)
  const instructionResult = checkInstructionCompliance(prompt, intake);
  const efficiencyResult = checkEfficiency(prompt);

  // Phase 2: LLM Judge (single batched call)
  const llmResults = await runLLMJudge(prompt, intake);

  // Combine
  const allDimensions = [instructionResult, efficiencyResult, ...llmResults];

  // Apply config weights
  for (const dim of allDimensions) {
    dim.weight = weights[dim.dimension] ?? dim.weight;
  }

  // Composite score
  const totalWeight = allDimensions.reduce((sum, d) => sum + d.weight, 0);
  const totalScore = Math.round(
    allDimensions.reduce((sum, d) => sum + d.score * d.weight, 0) / totalWeight
  );

  // Guidance: lowest 2 dimensions
  const sorted = [...allDimensions].sort((a, b) => a.score - b.score);
  const guidance = sorted
    .slice(0, 2)
    .flatMap((d) => d.suggestions)
    .slice(0, 4)
    .join(" ");

  return {
    id: generateId(),
    promptVersionId: "",
    timestamp: Date.now(),
    totalScore,
    dimensions: allDimensions,
    guidance: guidance || "Your prompt looks good! Consider minor refinements to reach a higher score.",
  };
}
```

**Step 2: Verify compiles, commit**

```bash
npx tsc --noEmit
git add -A && git commit -m "feat(builder): implement hybrid evaluation engine"
```

---

### Task 9: Implement /api/builder/evaluate Route

**Files:**
- Modify: `src/app/api/builder/evaluate/route.ts`

**Step 1: Implement the route**

```typescript
// src/app/api/builder/evaluate/route.ts
import { NextResponse } from "next/server";
import { evaluatePrompt } from "@/lib/services/evaluation-engine";
import type { PromptContent, BuilderIntake } from "@/lib/types/prompt";

export async function POST(request: Request) {
  try {
    const { promptContent, intake } = (await request.json()) as {
      promptContent: PromptContent;
      intake: BuilderIntake;
    };

    if (!promptContent?.raw) {
      return NextResponse.json({ error: "Prompt content is required" }, { status: 400 });
    }

    const evaluation = await evaluatePrompt(promptContent, intake);
    return NextResponse.json(evaluation);
  } catch (error) {
    console.error("Builder evaluate error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate prompt" },
      { status: 500 }
    );
  }
}
```

**Step 2: Verify compiles, commit**

```bash
npx tsc --noEmit
git add -A && git commit -m "feat(builder): implement evaluation API route"
```

---

### Task 10: ClarifyPanel Component

**Files:**
- Create: `src/components/builder/clarify-panel.tsx`

**Step 1: Create clarify panel**

```tsx
// src/components/builder/clarify-panel.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClarifyingQuestion } from "@/lib/types/prompt";
import { Loader2 } from "lucide-react";

interface ClarifyPanelProps {
  questions: ClarifyingQuestion[];
  answers: Record<string, string>;
  onAnswer: (questionId: string, answer: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function ClarifyPanel({ questions, answers, onAnswer, onSubmit, isLoading }: ClarifyPanelProps) {
  const allAnswered = questions.every((q) => answers[q.id]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-1">A few quick questions</h2>
        <p className="text-sm text-muted-foreground">
          These will help generate a more targeted prompt.
        </p>
      </div>

      {questions.map((q) => (
        <Card key={q.id}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{q.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {q.options.map((opt) => (
                <Button
                  key={opt}
                  variant={answers[q.id] === opt ? "default" : "outline"}
                  size="sm"
                  onClick={() => onAnswer(q.id, opt)}
                >
                  {opt}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Button onClick={onSubmit} disabled={!allAnswered || isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Continue to Generate"
        )}
      </Button>
    </div>
  );
}
```

**Step 2: Verify compiles, commit**

```bash
npx tsc --noEmit
git add -A && git commit -m "feat(builder): add clarifying questions panel"
```

---

### Task 11: GeneratePanel Component (with streaming)

**Files:**
- Create: `src/components/builder/generate-panel.tsx`

**Step 1: Create generate panel with streaming display**

```tsx
// src/components/builder/generate-panel.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface GeneratePanelProps {
  streamingContent: string;
  isLoading: boolean;
}

export function GeneratePanel({ streamingContent, isLoading }: GeneratePanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-1">Generating Your Prompt</h2>
        <p className="text-sm text-muted-foreground">
          Claude is crafting an optimized prompt based on your requirements.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? "Generating..." : "Generated Prompt"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap text-sm font-mono bg-muted/50 rounded-md p-4 min-h-[200px]">
            {streamingContent || (isLoading ? "Starting generation..." : "")}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 2: Verify compiles, commit**

```bash
npx tsc --noEmit
git add -A && git commit -m "feat(builder): add streaming generate panel"
```

---

### Task 12: EvaluatePanel Component (Score Visualization)

**Files:**
- Create: `src/components/builder/evaluate-panel.tsx`

**Step 1: Create evaluation panel with score bars**

```tsx
// src/components/builder/evaluate-panel.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { EvaluationRun, DimensionResult } from "@/lib/types/evaluation";

const DIMENSION_LABELS: Record<string, string> = {
  instruction_compliance: "Instruction Compliance",
  semantic_alignment: "Semantic Alignment",
  style_tone_fit: "Style & Tone Fit",
  efficiency: "Token Efficiency",
  robustness: "Robustness",
  llm_judge: "Overall Quality",
};

function scoreColor(score: number): string {
  if (score >= 85) return "text-green-600";
  if (score >= 70) return "text-yellow-600";
  return "text-red-600";
}

function scoreBadge(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "Needs Work";
}

interface EvaluatePanelProps {
  evaluation: EvaluationRun;
}

export function EvaluatePanel({ evaluation }: EvaluatePanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-1">Prompt Evaluation</h2>
        <p className="text-sm text-muted-foreground">
          Your prompt has been scored across 6 quality dimensions.
        </p>
      </div>

      {/* Overall Score */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-semibold">Overall Score</span>
            <div className="flex items-center gap-2">
              <span className={`text-3xl font-bold ${scoreColor(evaluation.totalScore)}`}>
                {evaluation.totalScore}
              </span>
              <Badge variant={evaluation.totalScore >= 70 ? "default" : "destructive"}>
                {scoreBadge(evaluation.totalScore)}
              </Badge>
            </div>
          </div>
          <Progress value={evaluation.totalScore} className="h-3" />
        </CardContent>
      </Card>

      {/* Per-dimension breakdown */}
      <div className="grid gap-3">
        {evaluation.dimensions.map((dim: DimensionResult) => (
          <Card key={dim.dimension}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">
                  {DIMENSION_LABELS[dim.dimension] || dim.dimension}
                </span>
                <span className={`text-sm font-bold ${scoreColor(dim.score)}`}>
                  {dim.score}/100
                </span>
              </div>
              <Progress value={dim.score} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground">{dim.explanation}</p>
              {dim.suggestions.length > 0 && (
                <ul className="mt-1 text-xs text-muted-foreground list-disc list-inside">
                  {dim.suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Guidance */}
      {evaluation.guidance && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm font-medium mb-1">What to improve next</p>
            <p className="text-sm text-muted-foreground">{evaluation.guidance}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

**Step 2: Verify compiles, commit**

```bash
npx tsc --noEmit
git add -A && git commit -m "feat(builder): add evaluation score panel with per-dimension breakdown"
```

---

### Task 13: ImprovePanel Component (Edit + Re-evaluate)

**Files:**
- Create: `src/components/builder/improve-panel.tsx`

**Step 1: Create improve panel**

```tsx
// src/components/builder/improve-panel.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { PromptContent } from "@/lib/types/prompt";
import type { EvaluationRun } from "@/lib/types/evaluation";
import { EvaluatePanel } from "./evaluate-panel";
import { Loader2, Save, RefreshCw } from "lucide-react";

const SECTION_LABELS: Record<keyof Omit<PromptContent, "raw">, string> = {
  systemContext: "System Context",
  task: "Task",
  constraints: "Constraints",
  outputFormat: "Output Format",
  examples: "Examples",
};

interface ImprovePanelProps {
  prompt: PromptContent;
  evaluation: EvaluationRun | null;
  isLoading: boolean;
  onUpdateSection: (section: keyof PromptContent, value: string) => void;
  onReEvaluate: () => void;
  onSave: () => void;
}

export function ImprovePanel({
  prompt,
  evaluation,
  isLoading,
  onUpdateSection,
  onReEvaluate,
  onSave,
}: ImprovePanelProps) {
  const sections = Object.entries(SECTION_LABELS) as [keyof Omit<PromptContent, "raw">, string][];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Review & Improve</h2>
        <p className="text-sm text-muted-foreground">
          Edit any section below, then re-evaluate to see your score change.
        </p>
      </div>

      {/* Editable sections */}
      {sections.map(([key, label]) => (
        <Card key={key}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{label}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={prompt[key]}
              onChange={(e) => onUpdateSection(key, e.target.value)}
              rows={key === "task" ? 6 : 3}
              className="font-mono text-sm"
            />
          </CardContent>
        </Card>
      ))}

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button onClick={onReEvaluate} disabled={isLoading} variant="outline" className="flex-1">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Evaluating...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Re-evaluate
            </>
          )}
        </Button>
        <Button onClick={onSave} className="flex-1">
          <Save className="mr-2 h-4 w-4" />
          Save to Vault
        </Button>
      </div>

      {/* Current evaluation */}
      {evaluation && <EvaluatePanel evaluation={evaluation} />}
    </div>
  );
}
```

**Step 2: Verify compiles, commit**

```bash
npx tsc --noEmit
git add -A && git commit -m "feat(builder): add improve panel with editable sections and re-evaluate"
```

---

### Task 14: Wire Up Builder Page (Full Integration)

**Files:**
- Modify: `src/app/builder/page.tsx`

**Step 1: Replace stub with full Builder page**

```tsx
// src/app/builder/page.tsx
"use client";

import { useReducer, useCallback } from "react";
import { BuilderSidebar } from "@/components/builder/builder-sidebar";
import { IntakeForm } from "@/components/builder/intake-form";
import { ClarifyPanel } from "@/components/builder/clarify-panel";
import { GeneratePanel } from "@/components/builder/generate-panel";
import { EvaluatePanel } from "@/components/builder/evaluate-panel";
import { ImprovePanel } from "@/components/builder/improve-panel";
import { builderReducer, type BuilderAction } from "@/lib/builder/actions";
import { INITIAL_STATE, type BuilderStep } from "@/lib/builder/state";
import { parsePromptSections } from "@/lib/builder/prompt-templates";
import type { BuilderIntake, PromptContent } from "@/lib/types/prompt";
import { saveProject } from "@/lib/services/storage";

export default function BuilderPage() {
  const [state, dispatch] = useReducer(builderReducer, INITIAL_STATE);

  const handleIntakeSubmit = useCallback(async (intake: BuilderIntake) => {
    dispatch({ type: "SET_LOADING", loading: true });
    try {
      const res = await fetch("/api/builder/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(intake),
      });
      if (!res.ok) throw new Error("Intake analysis failed");
      const data = await res.json();
      dispatch({
        type: "INTAKE_SUBMITTED",
        intake,
        clarifyingQuestions: data.clarifyingQuestions,
        refinedIntent: data.refinedIntent,
      });

      // If no questions, auto-trigger generate
      if (data.clarifyingQuestions.length === 0) {
        handleGenerate(intake, data.refinedIntent);
      }
    } catch (err) {
      dispatch({ type: "SET_ERROR", error: (err as Error).message });
    }
  }, []);

  const handleClarifySubmit = useCallback(async () => {
    if (!state.intake || !state.refinedIntent) return;
    dispatch({ type: "SET_LOADING", loading: true });
    try {
      const res = await fetch("/api/builder/clarify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intake: state.intake,
          answers: state.answers,
          refinedIntent: state.refinedIntent,
        }),
      });
      if (!res.ok) throw new Error("Clarification failed");
      const data = await res.json();
      dispatch({ type: "CLARIFY_COMPLETED", refinedIntent: data.refinedIntent });
      handleGenerate(state.intake, data.refinedIntent);
    } catch (err) {
      dispatch({ type: "SET_ERROR", error: (err as Error).message });
    }
  }, [state.intake, state.answers, state.refinedIntent]);

  const handleGenerate = useCallback(async (intake: BuilderIntake, refinedIntent: Record<string, unknown>) => {
    dispatch({ type: "SET_LOADING", loading: true });
    dispatch({ type: "SET_STEP", step: "generate" });
    try {
      const res = await fetch("/api/builder/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intake, refinedIntent }),
      });
      if (!res.ok) throw new Error("Generation failed");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          const data = line.slice(6);
          if (data === "[DONE]") break;
          try {
            const { text: chunk } = JSON.parse(data);
            fullContent += chunk;
            dispatch({ type: "STREAM_CHUNK", chunk });
          } catch {
            // skip malformed chunks
          }
        }
      }

      const prompt = parsePromptSections(fullContent);
      dispatch({ type: "PROMPT_GENERATED", prompt });

      // Auto-trigger evaluation
      handleEvaluate(prompt, intake);
    } catch (err) {
      dispatch({ type: "SET_ERROR", error: (err as Error).message });
    }
  }, []);

  const handleEvaluate = useCallback(async (prompt: PromptContent, intake: BuilderIntake) => {
    dispatch({ type: "SET_LOADING", loading: true });
    dispatch({ type: "SET_STEP", step: "evaluate" });
    try {
      const res = await fetch("/api/builder/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptContent: prompt, intake }),
      });
      if (!res.ok) throw new Error("Evaluation failed");
      const evaluation = await res.json();
      dispatch({ type: "EVALUATION_COMPLETE", evaluation });
    } catch (err) {
      dispatch({ type: "SET_ERROR", error: (err as Error).message });
    }
  }, []);

  const handleReEvaluate = useCallback(async () => {
    if (!state.generatedPrompt || !state.intake) return;
    // Rebuild raw from sections
    const raw = [
      "=== SYSTEM CONTEXT ===",
      state.generatedPrompt.systemContext,
      "=== TASK ===",
      state.generatedPrompt.task,
      "=== CONSTRAINTS ===",
      state.generatedPrompt.constraints,
      "=== OUTPUT FORMAT ===",
      state.generatedPrompt.outputFormat,
      "=== EXAMPLES ===",
      state.generatedPrompt.examples,
    ].join("\n\n");
    const updated = { ...state.generatedPrompt, raw };
    handleEvaluate(updated, state.intake);
  }, [state.generatedPrompt, state.intake, handleEvaluate]);

  const handleSave = useCallback(() => {
    if (!state.generatedPrompt || !state.intake) return;
    const id = `proj_${Date.now()}`;
    const versionId = `ver_${Date.now()}`;
    saveProject({
      id,
      title: state.intake.objective.slice(0, 60),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      versions: [
        {
          id: versionId,
          projectId: id,
          content: state.generatedPrompt,
          evaluation: state.evaluation,
          createdAt: Date.now(),
        },
      ],
      tags: [state.intake.taskType],
      modelTarget: state.intake.modelTarget,
      sourceMode: "builder",
    });
    alert("Saved to vault!");
  }, [state.generatedPrompt, state.intake, state.evaluation]);

  const handleStepClick = useCallback((step: BuilderStep) => {
    dispatch({ type: "SET_STEP", step });
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <BuilderSidebar
        currentStep={state.currentStep}
        isLoading={state.isLoading}
        onStepClick={handleStepClick}
      />

      <div className="flex-1 p-6 lg:p-8 max-w-3xl">
        {state.error && (
          <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
            {state.error}
          </div>
        )}

        {state.currentStep === "intake" && (
          <IntakeForm onSubmit={handleIntakeSubmit} isLoading={state.isLoading} />
        )}

        {state.currentStep === "clarify" && (
          <ClarifyPanel
            questions={state.clarifyingQuestions}
            answers={state.answers}
            onAnswer={(id, answer) => dispatch({ type: "ANSWER_QUESTION", questionId: id, answer })}
            onSubmit={handleClarifySubmit}
            isLoading={state.isLoading}
          />
        )}

        {state.currentStep === "generate" && (
          <GeneratePanel
            streamingContent={state.streamingContent}
            isLoading={state.isLoading}
          />
        )}

        {state.currentStep === "evaluate" && state.evaluation && (
          <EvaluatePanel evaluation={state.evaluation} />
        )}

        {state.currentStep === "improve" && state.generatedPrompt && (
          <ImprovePanel
            prompt={state.generatedPrompt}
            evaluation={state.evaluation}
            isLoading={state.isLoading}
            onUpdateSection={(section, value) =>
              dispatch({ type: "UPDATE_PROMPT_SECTION", section, value })
            }
            onReEvaluate={handleReEvaluate}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
}
```

**Step 2: Verify compiles, commit**

```bash
npx tsc --noEmit
git add -A && git commit -m "feat(builder): wire up full Builder page with all steps integrated"
```

---

### Task 15: Build Check & Lint

**Step 1: Full build**

```bash
npm run build
```
Expected: All routes compile, no errors.

**Step 2: Lint**

```bash
npm run lint
```
Expected: 0 errors, few warnings acceptable.

**Step 3: Fix any issues and commit**

```bash
git add -A && git commit -m "chore: fix lint/build issues from Phase 2"
```

---

## Phase 2 Complete Checklist

After all 15 tasks:
- [x] Builder state + reducer
- [x] Sidebar stepper component
- [x] Intake form with all fields
- [x] Prompt templates (4 templates)
- [x] /api/builder/intake — Claude-powered intent extraction
- [x] /api/builder/clarify — answer merge
- [x] /api/builder/generate — streaming prompt generation
- [x] Evaluation engine (2 deterministic + 1 LLM batch call)
- [x] /api/builder/evaluate — hybrid rubric scoring
- [x] ClarifyPanel component
- [x] GeneratePanel with streaming display
- [x] EvaluatePanel with per-dimension scores
- [x] ImprovePanel with editable sections
- [x] Full Builder page wired up end-to-end
- [x] Clean build + lint

**Next:** Phase 3 — Arena challenges + scoring + leaderboard.
