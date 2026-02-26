"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EvaluatePanel } from "./evaluate-panel";
import { parsePromptSections } from "@/lib/builder/prompt-templates";
import type { EvaluationRun } from "@/lib/types/evaluation";
import type { BuilderIntake, ModelTarget, TaskType, ToneType } from "@/lib/types/prompt";
import { Loader2, RotateCcw } from "lucide-react";

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

export function AnalyzeExistingPanel() {
  const [promptText, setPromptText] = useState("");
  const [intake, setIntake] = useState<BuilderIntake>({
    objective: "",
    taskType: "other",
    audience: "",
    tone: "professional",
    constraints: "",
    modelTarget: "claude",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationRun | null>(null);

  const canSubmit = useMemo(
    () => promptText.trim().length > 0 && intake.objective.trim().length > 0,
    [promptText, intake.objective]
  );

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    setError(null);

    try {
      const promptContent = parsePromptSections(promptText.trim());
      const res = await fetch("/api/builder/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptContent, intake }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.error || "Evaluation failed");
      }

      const data = (await res.json()) as EvaluationRun;
      setEvaluation(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPromptText("");
    setIntake({
      objective: "",
      taskType: "other",
      audience: "",
      tone: "professional",
      constraints: "",
      modelTarget: "claude",
    });
    setEvaluation(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analyze an Existing Prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAnalyze} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Prompt *</label>
              <Textarea
                placeholder="Paste the prompt you want to evaluate..."
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                rows={8}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Objective *</label>
              <Textarea
                placeholder="What is this prompt supposed to achieve?"
                value={intake.objective}
                onChange={(e) => setIntake({ ...intake, objective: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Task Type</label>
                <Select
                  value={intake.taskType}
                  onValueChange={(v) => setIntake({ ...intake, taskType: v as TaskType })}
                >
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
                <Select
                  value={intake.modelTarget}
                  onValueChange={(v) => setIntake({ ...intake, modelTarget: v as ModelTarget })}
                >
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
                  placeholder="Who is this for?"
                  value={intake.audience}
                  onChange={(e) => setIntake({ ...intake, audience: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tone</label>
                <Select
                  value={intake.tone}
                  onValueChange={(v) => setIntake({ ...intake, tone: v as ToneType })}
                >
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
                placeholder="Any requirements or restrictions this prompt must follow?"
                value={intake.constraints}
                onChange={(e) => setIntake({ ...intake, constraints: e.target.value })}
                rows={2}
              />
            </div>

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={!canSubmit || isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  "Analyze Prompt"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={handleReset}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {evaluation && <EvaluatePanel evaluation={evaluation} />}
    </div>
  );
}
