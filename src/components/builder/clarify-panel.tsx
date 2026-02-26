"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
  const allAnswered = questions.every((q) => answers[q.id]?.trim());

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-1">A few quick questions</h2>
        <p className="text-sm text-muted-foreground">
          Pick a suggested answer or write your own — whatever best describes what you need.
        </p>
      </div>

      {questions.map((q) => (
        <Card key={q.id}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{q.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {q.options.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Quick picks:</p>
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
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">
                {q.options.length > 0 ? "Or describe in your own words:" : "Your answer:"}
              </p>
              <Textarea
                placeholder="Type your answer here..."
                value={answers[q.id] || ""}
                onChange={(e) => onAnswer(q.id, e.target.value)}
                rows={2}
                className="text-sm"
              />
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
