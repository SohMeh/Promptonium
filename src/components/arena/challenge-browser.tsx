"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Trophy } from "lucide-react";
import { CHALLENGES } from "@/data/challenges";
import { getAttemptsByChallenge } from "@/lib/services/storage";
import type { ChallengeCategory, DifficultyLevel } from "@/lib/types/challenge";

const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  beginner: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  intermediate: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  advanced: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  expert: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const CATEGORY_LABELS: Record<ChallengeCategory, string> = {
  email: "Email",
  summarization: "Summarization",
  coding: "Coding",
  education: "Education",
  creative: "Creative",
  analysis: "Analysis",
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getPersonalBest(challengeId: string): number | null {
  const attempts = getAttemptsByChallenge(challengeId);
  if (attempts.length === 0) return null;
  return Math.max(
    ...attempts
      .filter((a) => a.evaluation !== null)
      .map((a) => a.evaluation!.totalScore)
  );
}

export function ChallengeBrowser() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  const filteredChallenges = useMemo(() => {
    return CHALLENGES.filter((c) => {
      if (categoryFilter !== "all" && c.category !== categoryFilter) return false;
      if (difficultyFilter !== "all" && c.difficulty !== difficultyFilter) return false;
      return true;
    });
  }, [categoryFilter, difficultyFilter]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Category</span>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="summarization">Summarization</SelectItem>
              <SelectItem value="coding">Coding</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="creative">Creative</SelectItem>
              <SelectItem value="analysis">Analysis</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Difficulty</span>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Difficulties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Challenge Grid */}
      {filteredChallenges.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          No challenges match the selected filters.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredChallenges.map((challenge) => {
            const best = getPersonalBest(challenge.id);
            return (
              <Link
                key={challenge.id}
                href={`/arena/${challenge.id}`}
                className="group"
              >
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="pt-5 pb-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors">
                        {challenge.title}
                      </h3>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {challenge.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {CATEGORY_LABELS[challenge.category]}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs border-0 ${DIFFICULTY_COLORS[challenge.difficulty]}`}
                      >
                        {challenge.difficulty.charAt(0).toUpperCase() +
                          challenge.difficulty.slice(1)}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(challenge.timeLimit)}</span>
                      </div>
                      {best !== null && (
                        <div className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                          <Trophy className="h-3 w-3" />
                          <span>Best: {best}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
