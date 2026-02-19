"use client";

import { useReducer, useCallback } from "react";
import { BuilderSidebar } from "@/components/builder/builder-sidebar";
import { IntakeForm } from "@/components/builder/intake-form";
import { ClarifyPanel } from "@/components/builder/clarify-panel";
import { GeneratePanel } from "@/components/builder/generate-panel";
import { EvaluatePanel } from "@/components/builder/evaluate-panel";
import { ImprovePanel } from "@/components/builder/improve-panel";
import { builderReducer } from "@/lib/builder/actions";
import { INITIAL_STATE, type BuilderStep } from "@/lib/builder/state";
import { parsePromptSections } from "@/lib/builder/prompt-templates";
import type { BuilderIntake, PromptContent } from "@/lib/types/prompt";
import { saveProject } from "@/lib/services/storage";

export default function BuilderPage() {
  const [state, dispatch] = useReducer(builderReducer, INITIAL_STATE);

  const handleEvaluate = useCallback(
    async (prompt: PromptContent, intake: BuilderIntake) => {
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
    },
    []
  );

  const handleGenerate = useCallback(
    async (intake: BuilderIntake, refinedIntent: Record<string, unknown>) => {
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
    },
    [handleEvaluate]
  );

  const handleIntakeSubmit = useCallback(
    async (intake: BuilderIntake) => {
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
    },
    [handleGenerate]
  );

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
  }, [state.intake, state.answers, state.refinedIntent, handleGenerate]);

  const handleReEvaluate = useCallback(async () => {
    if (!state.generatedPrompt || !state.intake) return;
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
            onAnswer={(id, answer) =>
              dispatch({ type: "ANSWER_QUESTION", questionId: id, answer })
            }
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
