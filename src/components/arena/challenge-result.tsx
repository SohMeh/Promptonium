"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Trophy, ArrowLeft, RotateCcw, Lightbulb, Star, GraduationCap } from "lucide-react";
import type { EvaluationRun, DimensionResult } from "@/lib/types/evaluation";
import type { Challenge, ChallengeAttempt } from "@/lib/types/challenge";

const DIMENSION_LABELS: Record<string, string> = {
  instruction_compliance: "Instruction Coverage",
  semantic_alignment: "Goal Alignment",
  style_tone_fit: "Tone & Style",
  efficiency: "Conciseness",
  robustness: "Consistency",
  llm_judge: "Overall Quality",
};

function scoreColor(score: number): string {
  if (score >= 85) return "text-green-600";
  if (score >= 70) return "text-blue-600";
  if (score >= 55) return "text-amber-600";
  return "text-orange-600";
}

function scoreBadge(score: number): {
  label: string;
  variant: "default" | "secondary" | "outline" | "destructive";
} {
  if (score >= 85) return { label: "Strong", variant: "default" };
  if (score >= 70) return { label: "Solid", variant: "secondary" };
  if (score >= 55) return { label: "Developing", variant: "outline" };
  return { label: "Getting Started", variant: "outline" };
}

interface ChallengeResultProps {
  evaluation: EvaluationRun;
  challenge: Challenge;
  attempt: ChallengeAttempt;
  personalBest: number | null;
}

export function ChallengeResult({
  evaluation,
  challenge,
  attempt,
  personalBest,
}: ChallengeResultProps) {
  const badge = scoreBadge(evaluation.totalScore);
  const timeTaken = Math.round((attempt.submittedAt - attempt.startedAt) / 1000);
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;

  const isNewBest =
    personalBest === null || evaluation.totalScore > personalBest;
  const diffFromBest =
    personalBest !== null ? personalBest - evaluation.totalScore : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Challenge Complete!</h2>
        <p className="text-sm text-muted-foreground">{challenge.title}</p>
      </div>

      {/* Score Card */}
      <Card>
        <CardContent className="pt-6 text-center space-y-3">
          <div
            className={`text-5xl font-bold ${scoreColor(evaluation.totalScore)}`}
          >
            {evaluation.totalScore}
          </div>
          <Badge variant={badge.variant} className="text-sm">
            {badge.label}
          </Badge>

          <div className="text-sm text-muted-foreground">
            Completed in {minutes}:{seconds.toString().padStart(2, "0")}
          </div>

          {/* Personal best comparison */}
          {isNewBest ? (
            <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 font-medium">
              <Star className="h-4 w-4 fill-current" />
              <span>New Personal Best!</span>
              <Star className="h-4 w-4 fill-current" />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span>
                {diffFromBest} point{diffFromBest !== 1 ? "s" : ""} from your
                best ({personalBest})
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Dimension Breakdown */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Score Breakdown</h3>
        <div className="grid gap-3">
          {evaluation.dimensions.map((dim: DimensionResult) => {
            const dimBadge = scoreBadge(dim.score);
            return (
              <Card key={dim.dimension}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">
                      {DIMENSION_LABELS[dim.dimension] || dim.dimension}
                    </span>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <span
                        className={`text-sm font-bold ${scoreColor(dim.score)}`}
                      >
                        {dim.score}
                      </span>
                      <Badge variant={dimBadge.variant} className="text-xs">
                        {dimBadge.label}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={dim.score} className="h-2 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    {dim.explanation}
                  </p>
                  {dim.suggestions.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {dim.suggestions.map((s, i) => (
                        <li
                          key={i}
                          className="text-xs text-muted-foreground flex items-start gap-1.5"
                        >
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
      </div>

      {/* Guidance */}
      {evaluation.guidance && (
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm font-medium mb-1">Next Steps</p>
            <p className="text-sm text-muted-foreground">
              {evaluation.guidance}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Cross-mode link to Academy */}
      {evaluation.totalScore < 80 && (
        <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="h-4 w-4 text-emerald-600" />
              <p className="text-sm font-medium">Want to improve your skills?</p>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              The Prompt Academy has guided lessons on prompt engineering techniques that can help boost your scores.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/academy">
                <GraduationCap className="h-3.5 w-3.5 mr-1.5" />
                Browse Academy Lessons
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <Button
          variant="default"
          onClick={() => window.location.reload()}
          className="flex-1 w-full sm:w-auto"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
        <Button variant="outline" asChild className="flex-1 w-full sm:w-auto">
          <Link href="/arena">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Challenges
          </Link>
        </Button>
      </div>
    </div>
  );
}
