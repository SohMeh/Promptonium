"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getPathById } from "@/data/academy/paths";
import { getProgressByPath } from "@/lib/services/storage";
import { ProgressCard } from "@/components/academy/progress-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-blue-100 text-blue-800",
  advanced: "bg-orange-100 text-orange-800",
};

export default function PathPage() {
  const params = useParams();
  const pathId = params.pathId as string;
  const path = getPathById(pathId);

  const progressRecords = useMemo(
    () => (path ? getProgressByPath(path.id) : []),
    [path]
  );

  if (!path) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Path Not Found</h1>
        <Button asChild>
          <Link href="/academy">Back to Academy</Link>
        </Button>
      </div>
    );
  }

  const completedCount = progressRecords.filter((p) => p.completed).length;
  const totalLessons = path.lessons.length;
  const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/academy">
          <ArrowLeft className="h-4 w-4 mr-1" />
          All Paths
        </Link>
      </Button>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">{path.title}</h1>
          <Badge className={DIFFICULTY_COLORS[path.difficulty] || ""} variant="secondary">
            {path.difficulty}
          </Badge>
        </div>
        <p className="text-muted-foreground mb-4">{path.description}</p>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {completedCount}/{totalLessons} lessons
          </span>
          <Progress value={pct} className="h-2 flex-1 max-w-xs" />
          <span className="text-sm font-medium">{pct}%</span>
        </div>
      </div>

      <div className="space-y-3">
        {path.lessons.map((lesson) => {
          const progress =
            progressRecords.find((p) => p.lessonId === lesson.id) ?? null;
          return (
            <ProgressCard
              key={lesson.id}
              lesson={lesson}
              progress={progress}
              pathId={path.id}
            />
          );
        })}
      </div>
    </div>
  );
}
