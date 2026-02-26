"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BuilderIntake, TaskType, ToneType, ModelTarget } from "@/lib/types/prompt";
import { Loader2, Zap, Globe } from "lucide-react";

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
    useOpenModel: false,
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
              <p className="text-xs text-muted-foreground">Which AI will use this prompt?</p>
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

          {/* Generation provider toggle */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Generation Engine</label>
            <p className="text-xs text-muted-foreground">
              Choose what powers the prompt builder. This is separate from the target model above.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, useOpenModel: false })}
                className={`flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors ${
                  !form.useOpenModel
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:bg-accent"
                }`}
              >
                <Zap className="h-4 w-4 shrink-0" />
                <div>
                  <div className="font-medium">Claude (API Key)</div>
                  <div className="text-xs text-muted-foreground">Higher quality, requires API key</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, useOpenModel: true })}
                className={`flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors ${
                  form.useOpenModel
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:bg-accent"
                }`}
              >
                <Globe className="h-4 w-4 shrink-0" />
                <div>
                  <div className="font-medium">Free Open Models</div>
                  <div className="text-xs text-muted-foreground">No API key needed, free open-source model</div>
                </div>
              </button>
            </div>
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
