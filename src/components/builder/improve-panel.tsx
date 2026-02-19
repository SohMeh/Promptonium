"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { PromptContent } from "@/lib/types/prompt";
import type { EvaluationRun } from "@/lib/types/evaluation";
import { EvaluatePanel } from "./evaluate-panel";
import { Loader2, Save, RefreshCw } from "lucide-react";

const SECTION_LABELS: Record<string, string> = {
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
  const sections = Object.entries(SECTION_LABELS) as [string, string][];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Review & Improve</h2>
        <p className="text-sm text-muted-foreground">
          Edit any section below, then re-evaluate to see your score change.
        </p>
      </div>

      {sections.map(([key, label]) => (
        <Card key={key}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{label}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={prompt[key as keyof PromptContent] || ""}
              onChange={(e) => onUpdateSection(key as keyof PromptContent, e.target.value)}
              rows={key === "task" ? 6 : 3}
              className="font-mono text-sm"
            />
          </CardContent>
        </Card>
      ))}

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

      {evaluation && <EvaluatePanel evaluation={evaluation} />}
    </div>
  );
}
