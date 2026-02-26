"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { EvaluationRun, DimensionResult } from "@/lib/types/evaluation";
import { Lightbulb, BookOpen, ArrowRight, Swords, GraduationCap } from "lucide-react";

const DIMENSION_LABELS: Record<string, string> = {
  instruction_compliance: "Instruction Coverage",
  semantic_alignment: "Goal Alignment",
  style_tone_fit: "Tone & Style",
  efficiency: "Conciseness",
  robustness: "Consistency",
  llm_judge: "Overall Quality",
};

const DIMENSION_DESCRIPTIONS: Record<string, string> = {
  instruction_compliance: "How well your prompt covers all the requirements you specified",
  semantic_alignment: "How closely the prompt captures your actual intent and goals",
  style_tone_fit: "How effectively the prompt guides the AI toward the right voice",
  efficiency: "How concise and focused your prompt is (less waste = better results)",
  robustness: "How consistently this prompt would produce good results across uses",
  llm_judge: "Overall quality and usability of the prompt",
};

function scoreColor(score: number): string {
  if (score >= 85) return "text-green-600";
  if (score >= 70) return "text-blue-600";
  if (score >= 55) return "text-amber-600";
  return "text-orange-600";
}

function scoreBadge(score: number): { label: string; variant: "default" | "secondary" | "outline" | "destructive" } {
  if (score >= 85) return { label: "Strong", variant: "default" };
  if (score >= 70) return { label: "Solid", variant: "secondary" };
  if (score >= 55) return { label: "Developing", variant: "outline" };
  return { label: "Getting Started", variant: "outline" };
}

function overallMessage(score: number): string {
  if (score >= 85) return "Your prompt is in great shape! Fine-tune in the Improve tab if you want to push it further.";
  if (score >= 70) return "Solid foundation! A few targeted improvements could take this to the next level.";
  if (score >= 55) return "Good start! Check the tips below for the most impactful improvements you can make.";
  return "Every expert was once a beginner! The tips below will help you level up your prompt quickly.";
}

interface EvaluatePanelProps {
  evaluation: EvaluationRun;
}

export function EvaluatePanel({ evaluation }: EvaluatePanelProps) {
  const badge = scoreBadge(evaluation.totalScore);
  const hasTips = evaluation.dimensions.some((d) => d.tips && d.tips.length > 0);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-1">Prompt Health Check</h2>
        <p className="text-sm text-muted-foreground">
          Here&apos;s how your prompt looks across key quality dimensions.
        </p>
      </div>

      {/* Overall Score */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <span className="text-lg font-semibold">Overall Score</span>
            <div className="flex items-center gap-2">
              <span className={`text-3xl font-bold ${scoreColor(evaluation.totalScore)}`}>
                {evaluation.totalScore}
              </span>
              <Badge variant={badge.variant}>{badge.label}</Badge>
            </div>
          </div>
          <Progress value={evaluation.totalScore} className="h-3 mb-3" />
          <p className="text-sm text-muted-foreground">{overallMessage(evaluation.totalScore)}</p>
        </CardContent>
      </Card>

      {/* Per-dimension breakdown */}
      <div className="grid gap-3">
        {evaluation.dimensions.map((dim: DimensionResult) => {
          const dimBadge = scoreBadge(dim.score);
          return (
            <Card key={dim.dimension}>
              <CardContent className="pt-4 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <div className="min-w-0">
                    <span className="text-sm font-medium">
                      {DIMENSION_LABELS[dim.dimension] || dim.dimension}
                    </span>
                    <p className="text-xs text-muted-foreground/70">
                      {DIMENSION_DESCRIPTIONS[dim.dimension]}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-sm font-bold ${scoreColor(dim.score)}`}>
                      {dim.score}
                    </span>
                    <Badge variant={dimBadge.variant} className="text-xs">
                      {dimBadge.label}
                    </Badge>
                  </div>
                </div>
                <Progress value={dim.score} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground">{dim.explanation}</p>
                {dim.suggestions.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {dim.suggestions.map((s, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <Lightbulb className="h-3 w-3 mt-0.5 shrink-0 text-amber-500" />
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Coaching guidance */}
      {evaluation.guidance && (
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm font-medium mb-1">Next Steps</p>
            <p className="text-sm text-muted-foreground">{evaluation.guidance}</p>
          </CardContent>
        </Card>
      )}

      {/* Prompt Engineering Tips */}
      {hasTips && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Prompt Engineering Tips</h3>
          </div>
          <div className="grid gap-2">
            {evaluation.dimensions
              .filter((d) => d.tips && d.tips.length > 0)
              .flatMap((d) => d.tips)
              .map((tip, i) => (
                <Card key={i} className="border-dashed">
                  <CardContent className="py-3 px-4">
                    <p className="text-sm font-medium">{tip.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{tip.description}</p>
                    {tip.topicId && (
                      <Link
                        href={tip.topicId.startsWith("academy:") ? "/academy" : "/arena"}
                        className="inline-flex items-center gap-1 text-xs text-primary mt-1.5 hover:underline"
                      >
                        {tip.topicId.startsWith("academy:") ? (
                          <GraduationCap className="h-3 w-3" />
                        ) : (
                          <Swords className="h-3 w-3" />
                        )}
                        {tip.topicId.startsWith("academy:") ? "Practice in Academy" : "Try in Arena"}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
