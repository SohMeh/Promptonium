"use client";

import { useMemo } from "react";
import { PathBrowser } from "@/components/academy/path-browser";
import { getProgress } from "@/lib/services/storage";
import { LEARNING_PATHS } from "@/data/academy/paths";
import { BookOpen, CheckCircle2 } from "lucide-react";

export default function AcademyPage() {
  const progress = useMemo(() => getProgress(), []);
  const totalLessons = LEARNING_PATHS.reduce((sum, p) => sum + p.lessons.length, 0);
  const completedLessons = progress.filter((p) => p.completed).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
      <div className="mb-10 text-center md:text-left pt-6">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
          Prompt Academy
        </h1>
        <p className="text-lg text-muted-foreground mb-6 max-w-2xl font-light">
          Master the fundamentals of prompt engineering from basic interactions to advanced model orchestration through structured, hands-on lessons.
        </p>

        <div className="glass-card inline-flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium rounded-2xl px-6 py-3 border border-white/5 shadow-[0_0_20px_-5px_rgba(52,211,153,0.2)]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <BookOpen className="h-4 w-4" />
            </div>
            <span>{totalLessons} lessons total</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-border md:block hidden" />
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <span>{completedLessons} completed</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm font-medium">Ready to test your skills?</p>
        <p className="text-xs text-muted-foreground">Put your knowledge to the test with timed Arena challenges.</p>
      </div>

      <PathBrowser />
    </div>
  );
}
