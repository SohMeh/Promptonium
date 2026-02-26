"use client";

import { useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getPathById, getLessonById } from "@/data/academy/paths";
import { getProgressByPath, saveProgress } from "@/lib/services/storage";
import { LessonView } from "@/components/academy/lesson-view";
import { PracticePanel } from "@/components/academy/practice-panel";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ProgressRecord } from "@/lib/types/lesson";

export default function LessonPage() {
  const params = useParams();
  const pathId = params.pathId as string;
  const lessonId = params.lessonId as string;

  const path = getPathById(pathId);
  const lesson = getLessonById(pathId, lessonId);

  const progressRecords = useMemo(
    () => (path ? getProgressByPath(path.id) : []),
    [path]
  );

  const currentProgress = useMemo(
    () => progressRecords.find((p) => p.lessonId === lessonId) ?? null,
    [progressRecords, lessonId]
  );

  const [showPractice, setShowPractice] = useState(false);
  const [localProgress, setLocalProgress] = useState<ProgressRecord | null>(
    currentProgress
  );

  const handlePracticeComplete = useCallback(
    (passed: boolean, score: number) => {
      const existing = localProgress;
      const updated: ProgressRecord = {
        pathId,
        lessonId,
        completed: passed || (existing?.completed ?? false),
        bestScore: Math.max(score, existing?.bestScore ?? 0),
        completedAt: passed ? Date.now() : existing?.completedAt ?? null,
        attempts: (existing?.attempts ?? 0) + 1,
      };
      saveProgress(updated);
      setLocalProgress(updated);
    },
    [pathId, lessonId, localProgress]
  );

  if (!path || !lesson) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Lesson Not Found</h1>
        <Button asChild>
          <Link href="/academy">Back to Academy</Link>
        </Button>
      </div>
    );
  }

  const currentIndex = path.lessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? path.lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < path.lessons.length - 1
      ? path.lessons[currentIndex + 1]
      : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href={`/academy/${pathId}`}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          {path.title}
        </Link>
      </Button>

      <LessonView
        lesson={lesson}
        progress={localProgress}
        onStartPractice={() => {
          setShowPractice(true);
          setTimeout(() => {
            document.getElementById("practice")?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }}
      />

      {showPractice && (
        <div className="mt-8">
          <PracticePanel
            practice={lesson.practice}
            lessonId={lessonId}
            pathId={pathId}
            checkpointThreshold={lesson.checkpointThreshold}
            onComplete={handlePracticeComplete}
          />
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t">
        {prevLesson ? (
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/academy/${pathId}/${prevLesson.id}`}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              {prevLesson.title}
            </Link>
          </Button>
        ) : (
          <div />
        )}
        {nextLesson ? (
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/academy/${pathId}/${nextLesson.id}`}>
              {nextLesson.title}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/academy/${pathId}`}>Back to Path Overview</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
