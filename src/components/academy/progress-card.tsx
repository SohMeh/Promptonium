"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, PlayCircle } from "lucide-react";
import type { LessonModule, ProgressRecord } from "@/lib/types/lesson";

interface ProgressCardProps {
  lesson: LessonModule;
  progress: ProgressRecord | null;
  pathId: string;
}

export function ProgressCard({ lesson, progress, pathId }: ProgressCardProps) {
  const isCompleted = progress?.completed ?? false;
  const hasAttempts = (progress?.attempts ?? 0) > 0;

  return (
    <Link href={`/academy/${pathId}/${lesson.id}`}>
      <Card className="hover:shadow-sm transition-shadow cursor-pointer">
        <CardContent className="py-4 flex items-center gap-4">
          <div className="shrink-0">
            {isCompleted ? (
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            ) : hasAttempts ? (
              <PlayCircle className="h-6 w-6 text-blue-600" />
            ) : (
              <Circle className="h-6 w-6 text-muted-foreground/40" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-medium truncate">
                {lesson.order}. {lesson.title}
              </span>
              {isCompleted && (
                <Badge variant="default" className="text-xs shrink-0">
                  Complete
                </Badge>
              )}
              {hasAttempts && !isCompleted && (
                <Badge variant="secondary" className="text-xs shrink-0">
                  In Progress
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {lesson.description}
            </p>
          </div>
          <div className="text-right shrink-0">
            {progress && progress.bestScore > 0 && (
              <div className="text-xs text-muted-foreground">
                Best: <span className="font-semibold">{progress.bestScore}</span>
              </div>
            )}
            {progress && progress.attempts > 0 && (
              <div className="text-xs text-muted-foreground">
                {progress.attempts} attempt{progress.attempts !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
