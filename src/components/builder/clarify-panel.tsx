"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClarifyingQuestion } from "@/lib/types/prompt";
import { Loader2 } from "lucide-react";

interface ClarifyPanelProps {
  questions: ClarifyingQuestion[];
  answers: Record<string, string>;
  onAnswer: (questionId: string, answer: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function ClarifyPanel({ questions, answers, onAnswer, onSubmit, isLoading }: ClarifyPanelProps) {
  const allAnswered = questions.every((q) => answers[q.id]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-1">A few quick questions</h2>
        <p className="text-sm text-muted-foreground">
          These will help generate a more targeted prompt.
        </p>
      </div>

      {questions.map((q) => (
        <Card key={q.id}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{q.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {q.options.map((opt) => (
                <Button
                  key={opt}
                  variant={answers[q.id] === opt ? "default" : "outline"}
                  size="sm"
                  onClick={() => onAnswer(q.id, opt)}
                >
                  {opt}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Button onClick={onSubmit} disabled={!allAnswered || isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Continue to Generate"
        )}
      </Button>
    </div>
  );
}
