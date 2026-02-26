"use client";

import { use, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Play, Send, Loader2, Clock } from "lucide-react";
import { Timer } from "@/components/arena/timer";
import { ChallengeResult } from "@/components/arena/challenge-result";
import { getChallengeById } from "@/data/challenges";
import { saveAttempt, getAttemptsByChallenge } from "@/lib/services/storage";
import type { EvaluationRun } from "@/lib/types/evaluation";
import type { ChallengeAttempt } from "@/lib/types/challenge";

type ChallengeState = "idle" | "active" | "submitting" | "complete";

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  intermediate: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  advanced: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  expert: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ChallengePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const challenge = getChallengeById(id);

  const [state, setState] = useState<ChallengeState>("idle");
  const [promptText, setPromptText] = useState("");
  const [startedAt, setStartedAt] = useState<number>(0);
  const [evaluation, setEvaluation] = useState<EvaluationRun | null>(null);
  const [attempt, setAttempt] = useState<ChallengeAttempt | null>(null);
  const [personalBest, setPersonalBest] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isSubmittingRef = useRef(false);

  const handleSubmit = useCallback(
    async (text?: string) => {
      if (!challenge || isSubmittingRef.current) return;
      isSubmittingRef.current = true;

      const content = text ?? promptText;
      if (!content.trim()) {
        setError("Please write something before submitting.");
        isSubmittingRef.current = false;
        return;
      }

      setState("submitting");
      setError(null);
      const submittedAt = Date.now();

      try {
        const response = await fetch("/api/arena/attempt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            challengeId: challenge.id,
            promptContent: content,
            startedAt,
            submittedAt,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to evaluate prompt");
        }

        const data = await response.json();
        const evalResult = data.evaluation as EvaluationRun;
        const attemptResult = data.attempt as ChallengeAttempt;

        // Save attempt to localStorage
        saveAttempt(attemptResult);

        // Calculate personal best (excluding current attempt)
        const previousAttempts = getAttemptsByChallenge(challenge.id);
        const previousBests = previousAttempts
          .filter(
            (a) => a.evaluation !== null && a.id !== attemptResult.id
          )
          .map((a) => a.evaluation!.totalScore);
        const best = previousBests.length > 0 ? Math.max(...previousBests) : null;

        setEvaluation(evalResult);
        setAttempt(attemptResult);
        setPersonalBest(best);
        setState("complete");
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setState("active");
      } finally {
        isSubmittingRef.current = false;
      }
    },
    [challenge, promptText, startedAt]
  );

  const handleStart = useCallback(() => {
    setStartedAt(Date.now());
    setState("active");
    setError(null);
  }, []);

  const handleExpire = useCallback(() => {
    if (state === "active") {
      handleSubmit(promptText);
    }
  }, [state, promptText, handleSubmit]);

  // 404 state
  if (!challenge) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h1 className="text-3xl font-bold">Challenge Not Found</h1>
          <p className="text-muted-foreground">
            The challenge you are looking for does not exist.
          </p>
          <Button variant="outline" asChild>
            <Link href="/arena">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Challenges
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Completed state - show results
  if (state === "complete" && evaluation && attempt) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <ChallengeResult
            evaluation={evaluation}
            challenge={challenge}
            attempt={attempt}
            personalBest={personalBest}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back link */}
        <Link
          href="/arena"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Challenges
        </Link>

        {/* Challenge Info */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-xl font-bold">{challenge.title}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {challenge.category.charAt(0).toUpperCase() +
                      challenge.category.slice(1)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-xs border-0 ${DIFFICULTY_COLORS[challenge.difficulty]}`}
                  >
                    {challenge.difficulty.charAt(0).toUpperCase() +
                      challenge.difficulty.slice(1)}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatTime(challenge.timeLimit)}
                  </span>
                </div>
              </div>

              {/* Timer */}
              {state === "active" && (
                <Timer
                  timeLimit={challenge.timeLimit}
                  onExpire={handleExpire}
                  isRunning={state === "active"}
                />
              )}
            </div>

            <Separator />

            <p className="text-sm text-muted-foreground">
              {challenge.description}
            </p>
          </CardContent>
        </Card>

        {/* Prompt Writing Area */}
        <div className="space-y-3">
          {state === "idle" ? (
            <div className="rounded-lg border border-dashed p-8 text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Read the challenge description above, then start the timer when
                you are ready. You will have{" "}
                {formatTime(challenge.timeLimit)} to write your prompt.
              </p>
              <Button onClick={handleStart} size="lg">
                <Play className="h-4 w-4 mr-2" />
                Start Challenge
              </Button>
            </div>
          ) : (
            <>
              <Textarea
                placeholder="Write your prompt here..."
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                disabled={state === "submitting"}
                className="min-h-[240px] resize-y font-mono text-sm"
              />

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}

              <Button
                onClick={() => handleSubmit()}
                disabled={
                  state === "submitting" || promptText.trim().length === 0
                }
                className="w-full"
                size="lg"
              >
                {state === "submitting" ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Prompt
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
