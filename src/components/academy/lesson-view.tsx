"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, BookOpen } from "lucide-react";
import type { LessonModule, ProgressRecord } from "@/lib/types/lesson";

interface LessonViewProps {
  lesson: LessonModule;
  progress: ProgressRecord | null;
  onStartPractice: () => void;
}

/** Simple markdown-ish renderer: handles ## headings and paragraphs */
function renderContent(markdown: string) {
  const blocks = markdown.split("\n\n");
  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("## ")) {
      return (
        <h2 key={i} className="text-lg font-semibold mt-6 mb-2">
          {trimmed.slice(3)}
        </h2>
      );
    }
    if (trimmed.startsWith("# ")) {
      return (
        <h1 key={i} className="text-xl font-bold mt-6 mb-2">
          {trimmed.slice(2)}
        </h1>
      );
    }
    return (
      <p key={i} className="text-sm text-muted-foreground leading-relaxed mb-3">
        {trimmed.split("**").map((part, j) =>
          j % 2 === 1 ? (
            <strong key={j} className="text-foreground font-medium">
              {part}
            </strong>
          ) : (
            part
          )
        )}
      </p>
    );
  });
}

export function LessonView({ lesson, progress, onStartPractice }: LessonViewProps) {
  const isCompleted = progress?.completed ?? false;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
          {isCompleted && (
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Completed
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">{lesson.description}</p>
      </div>

      <Card>
        <CardContent className="pt-6 prose-sm">
          {renderContent(lesson.contentMarkdown)}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button size="lg" onClick={onStartPractice}>
          Start Practice Exercise
        </Button>
      </div>
    </div>
  );
}
