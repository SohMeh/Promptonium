"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, GraduationCap } from "lucide-react";
import { LEARNING_PATHS } from "@/data/academy/paths";
import { getProgressByPath } from "@/lib/services/storage";
import type { LearningPath } from "@/lib/types/lesson";

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-blue-100 text-blue-800",
  advanced: "bg-orange-100 text-orange-800",
};

function PathCard({ path }: { path: LearningPath }) {
  const progress = useMemo(() => getProgressByPath(path.id), [path.id]);
  const completedCount = progress.filter((p) => p.completed).length;
  const totalLessons = path.lessons.length;
  const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <Link href={`/academy/${path.id}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between mb-1">
            <Badge className={DIFFICULTY_COLORS[path.difficulty] || ""} variant="secondary">
              {path.difficulty}
            </Badge>
            {path.isEduMode && (
              <Badge variant="outline" className="gap-1">
                <GraduationCap className="h-3 w-3" />
                Edu Mode
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg">{path.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{path.description}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <BookOpen className="h-3.5 w-3.5" />
            <span>
              {completedCount}/{totalLessons} lessons completed
            </span>
          </div>
          <Progress value={pct} className="h-2" />
        </CardContent>
      </Card>
    </Link>
  );
}

export function PathBrowser() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {LEARNING_PATHS.map((path) => (
        <PathCard key={path.id} path={path} />
      ))}
    </div>
  );
}
