"use client";

import { Card, CardContent } from "@/components/ui/card";
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
