"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronDown,
  Swords,
} from "lucide-react";
import Link from "next/link";
import type { PracticeScenario } from "@/lib/types/lesson";
import type { EvaluationRun, DimensionResult } from "@/lib/types/evaluation";

interface PracticePanelProps {
  practice: PracticeScenario;
  lessonId: string;
  pathId: string;
  checkpointThreshold: number;
  onComplete: (passed: boolean, score: number) => void;
}

function scoreColor(score: number): string {
  if (score >= 85) return "text-green-600";
  if (score >= 70) return "text-blue-600";
  if (score >= 55) return "text-amber-600";
  return "text-orange-600";
}

export function PracticePanel({
  practice,
  lessonId,
  pathId,
  checkpointThreshold,
  onComplete,
}: PracticePanelProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationRun | null>(null);
  const [passed, setPassed] = useState<boolean | null>(null);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [showExample, setShowExample] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/academy/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pathId, lessonId, promptContent: prompt }),
      });

      if (!res.ok) throw new Error("Evaluation failed");

      const data = await res.json();
      setEvaluation(data.evaluation);
      setPassed(data.passed);
      onComplete(data.passed, data.evaluation.totalScore);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, pathId, lessonId, onComplete]);

  const handleRevealHint = () => {
    if (hintsRevealed < practice.hints.length) {
      setHintsRevealed(hintsRevealed + 1);
    }
  };

  return (
    <div className="space-y-4" id="practice">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Practice Exercise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{practice.description}</p>

          <Textarea
            placeholder="Write your prompt here..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={8}
            className="font-mono text-sm"
          />

          {/* Hints */}
          {practice.hints.length > 0 && (
            <div className="space-y-2">
              {hintsRevealed > 0 &&
                practice.hints.slice(0, hintsRevealed).map((hint, i) => (
                  <div
                    key={i}
                    className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/20 rounded-md p-2 border border-amber-200 dark:border-amber-900"
                  >
                    <span className="font-medium">Hint {i + 1}:</span> {hint}
                  </div>
                ))}
              {hintsRevealed < practice.hints.length && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRevealHint}
                  className="text-xs"
                >
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Show Hint {hintsRevealed + 1}/{practice.hints.length}
                </Button>
              )}
            </div>
          )}

          {/* Example prompt */}
          {practice.examplePrompt && (
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowExample(!showExample)}
                className="text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                {showExample ? "Hide Example" : "See Example"}
              </Button>
              {showExample && (
                <pre className="mt-2 text-xs bg-muted rounded-md p-3 whitespace-pre-wrap overflow-x-auto">
                  {practice.examplePrompt}
                </pre>
              )}
            </div>
          )}

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-md p-2">
              {error}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isLoading || !prompt.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Evaluating...
              </>
            ) : (
              "Submit & Evaluate"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {evaluation && passed !== null && (
        <Card
          className={
            passed
              ? "border-green-300 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20"
              : "border-amber-300 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20"
          }
        >
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-3">
              {passed ? (
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              ) : (
                <XCircle className="h-8 w-8 text-amber-600" />
              )}
              <div>
                <h3 className="font-semibold text-lg">
                  {passed ? "Lesson Complete!" : "Almost there!"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {passed
                    ? `You scored ${evaluation.totalScore} (needed ${checkpointThreshold}). Great work!`
                    : `You scored ${evaluation.totalScore} — need ${checkpointThreshold} to pass. Try refining your prompt!`}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Overall Score</span>
                <span className={`font-bold text-lg ${scoreColor(evaluation.totalScore)}`}>
                  {evaluation.totalScore}
                </span>
              </div>
              <Progress value={evaluation.totalScore} className="h-3" />
            </div>

            <div className="grid gap-2">
              {evaluation.dimensions.map((dim: DimensionResult) => (
                <div key={dim.dimension} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground capitalize">
                    {dim.dimension.replace(/_/g, " ")}
                  </span>
                  <div className="flex items-center gap-2">
                    <Progress value={dim.score} className="h-1.5 w-20" />
                    <span className={`font-medium ${scoreColor(dim.score)}`}>
                      {dim.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {evaluation.guidance && (
              <p className="text-xs text-muted-foreground italic">
                {evaluation.guidance}
              </p>
            )}

            {passed && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 pt-2 border-t">
                <span className="text-xs text-muted-foreground">Ready for a challenge?</span>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/arena">
                    <Swords className="h-3.5 w-3.5 mr-1.5" />
                    Try the Arena
                  </Link>
                </Button>
              </div>
            )}

            {!passed && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEvaluation(null);
                  setPassed(null);
                }}
              >
                Try Again
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
