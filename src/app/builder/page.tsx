"use client";

import { useReducer, useCallback, useEffect, useRef, useState } from "react";
import { BuilderSidebar } from "@/components/builder/builder-sidebar";
import { IntakeForm } from "@/components/builder/intake-form";
import { ClarifyPanel } from "@/components/builder/clarify-panel";
import { GeneratePanel } from "@/components/builder/generate-panel";
import { EvaluatePanel } from "@/components/builder/evaluate-panel";
import { ImprovePanel } from "@/components/builder/improve-panel";
import { AnalyzeExistingPanel } from "@/components/builder/analyze-existing-panel";
import { builderReducer } from "@/lib/builder/actions";
import { INITIAL_STATE, type BuilderStep, type BuilderState } from "@/lib/builder/state";
import { parsePromptSections } from "@/lib/builder/prompt-templates";
import type { BuilderIntake, PromptContent } from "@/lib/types/prompt";
import { saveProject, getBuilderState, saveBuilderState, clearBuilderState } from "@/lib/services/storage";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { RotateCcw, CheckCircle2, ExternalLink } from "lucide-react";

function loadPersistedState(): BuilderState {
  const saved = getBuilderState<BuilderState>();
  if (!saved) return INITIAL_STATE;
  // Always reset transient fields
  return { ...saved, isLoading: false, error: null, streamingContent: "" };
}

export default function BuilderPage() {
  const [state, dispatch] = useReducer(builderReducer, INITIAL_STATE, loadPersistedState);
  const [savedToVault, setSavedToVault] = useState(false);
  const isFirstRender = useRef(true);

  // Persist state to localStorage on every change (skip first render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // Don't persist streaming content (too noisy) or loading state
    const toPersist = { ...state, isLoading: false, streamingContent: "", error: null };
    saveBuilderState(toPersist);
  }, [state]);

  const handleStartNew = useCallback(() => {
    clearBuilderState();
    dispatch({ type: "RESET" });
  }, []);

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
        if (!res.ok) {
          const errBody = await res.json().catch(() => null);
          throw new Error(errBody?.error || "Generation failed");
        }

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
        if (!res.ok) {
          const errBody = await res.json().catch(() => null);
          throw new Error(errBody?.error || "Intake analysis failed");
        }
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
      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.error || "Clarification failed");
      }
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
    setSavedToVault(true);
  }, [state.generatedPrompt, state.intake, state.evaluation]);

  const handleStepClick = useCallback((step: BuilderStep) => {
    dispatch({ type: "SET_STEP", step });
  }, []);

  const hasProgress = state.currentStep !== "intake" || state.intake !== null;

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-3.5rem)]">
      <BuilderSidebar
        currentStep={state.currentStep}
        isLoading={state.isLoading}
        onStepClick={handleStepClick}
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl w-full relative z-10">
        <div className="mb-8 pt-2">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            Prompt Studio
          </h1>
          <p className="text-muted-foreground font-light">Craft, refine, and perfect your AI prompts with intelligent orchestration.</p>
        </div>

        {hasProgress && (
          <div className="flex justify-end mb-6">
            <Button variant="outline" size="sm" onClick={handleStartNew} className="glass-card border-violet-500/20 hover:bg-violet-500/10 hover:border-violet-500/50 hover:text-violet-100 transition-all shadow-[0_0_15px_-5px_rgba(139,92,246,0.2)]">
              <RotateCcw className="mr-2 h-4 w-4 text-violet-400" />
              Start New Prompt
            </Button>
          </div>
        )}

        {state.error && (
          <div className="mb-6 rounded-xl glass-card border border-destructive/30 bg-destructive/5 p-5 shadow-[0_0_20px_-5px_rgba(239,68,68,0.2)] animate-in fade-in duration-300">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="font-semibold text-destructive mb-3">{state.error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => {
                    dispatch({ type: "SET_ERROR", error: null });
                    // Retry from the current step
                    if (state.currentStep === "intake" || state.currentStep === "clarify") {
                      dispatch({ type: "SET_STEP", step: state.intake ? "clarify" : "intake" });
                    } else if (state.currentStep === "generate" && state.intake && state.refinedIntent) {
                      handleGenerate(state.intake, state.refinedIntent);
                    } else if (state.currentStep === "evaluate" && state.generatedPrompt && state.intake) {
                      handleEvaluate(state.generatedPrompt, state.intake);
                    }
                  }}
                >
                  <RotateCcw className="mr-2 h-3.5 w-3.5" />
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}

        {savedToVault && (
          <div className="mb-6 rounded-xl glass-card border border-emerald-500/30 bg-emerald-500/5 p-5 shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)] animate-in fade-in duration-300">
            <div className="flex items-center gap-3 text-emerald-400 mb-3">
              <div className="p-1 rounded-full bg-emerald-500/20">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
              </div>
              <span className="font-bold text-lg">Saved to Vault!</span>
            </div>
            <div className="flex items-center gap-3 pl-11">
              <Button asChild className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-50 border border-emerald-500/50 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]">
                <Link href="/vault">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View in Vault
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSavedToVault(false)} className="text-muted-foreground hover:text-white">
                Dismiss
              </Button>
            </div>
          </div>
        )}

        <div className="glass-card rounded-2xl p-6 relative">
          {state.currentStep === "intake" && (
            <Tabs defaultValue="build" className="space-y-6 animate-in fade-in duration-500">
              <TabsList className="grid w-full grid-cols-2 max-w-md bg-background/50 border border-white/5 h-12 p-1">
                <TabsTrigger value="build" className="rounded-lg data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-100 data-[state=active]:shadow-[0_0_15px_-3px_rgba(139,92,246,0.3)] transition-all">Build New Prompt</TabsTrigger>
                <TabsTrigger value="analyze" className="rounded-lg data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-100 data-[state=active]:shadow-[0_0_15px_-3px_rgba(139,92,246,0.3)] transition-all">Analyze Existing Prompt</TabsTrigger>
              </TabsList>

              <TabsContent value="build" className="mt-0 outline-none">
                <IntakeForm onSubmit={handleIntakeSubmit} isLoading={state.isLoading} />
              </TabsContent>

              <TabsContent value="analyze" className="mt-0 outline-none">
                <AnalyzeExistingPanel />
              </TabsContent>
            </Tabs>
          )}

          {state.currentStep === "clarify" && (
            <div className="animate-in slide-in-from-right-4 fade-in duration-500">
              <ClarifyPanel
                questions={state.clarifyingQuestions}
                answers={state.answers}
                onAnswer={(id, answer) =>
                  dispatch({ type: "ANSWER_QUESTION", questionId: id, answer })
                }
                onSubmit={handleClarifySubmit}
                isLoading={state.isLoading}
              />
            </div>
          )}

          {state.currentStep === "generate" && (
            <div className="animate-in slide-in-from-right-4 fade-in duration-500">
              <GeneratePanel
                streamingContent={state.streamingContent}
                isLoading={state.isLoading}
              />
            </div>
          )}

          {state.currentStep === "evaluate" && state.evaluation && (
            <div className="animate-in slide-in-from-right-4 fade-in duration-500">
              <EvaluatePanel evaluation={state.evaluation} />
            </div>
          )}

          {state.currentStep === "improve" && state.generatedPrompt && (
            <div className="animate-in slide-in-from-right-4 fade-in duration-500">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
