"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy } from "lucide-react";
import { getAttempts } from "@/lib/services/storage";
import { CHALLENGES } from "@/data/challenges";
import type { ChallengeCategory } from "@/lib/types/challenge";

const CATEGORY_LABELS: Record<ChallengeCategory, string> = {
  email: "Email",
  summarization: "Summarization",
  coding: "Coding",
  education: "Education",
  creative: "Creative",
  analysis: "Analysis",
};

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDuration(startedAt: number, submittedAt: number): string {
  const seconds = Math.round((submittedAt - startedAt) / 1000);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function scoreColor(score: number): string {
  if (score >= 85) return "text-green-600";
  if (score >= 70) return "text-blue-600";
  if (score >= 55) return "text-amber-600";
  return "text-orange-600";
}

function getChallengeTitle(id: string): string {
  const challenge = CHALLENGES.find((c) => c.id === id);
  return challenge?.title ?? "Unknown Challenge";
}

function getChallengeCategory(id: string): ChallengeCategory | null {
  const challenge = CHALLENGES.find((c) => c.id === id);
  return challenge?.category ?? null;
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState("all");

  const attempts = useMemo(() => getAttempts(), []);

  // All attempts sorted by score (descending), only ones with evaluations
  const scoredAttempts = useMemo(() => {
    return attempts
      .filter((a) => a.evaluation !== null)
      .sort((a, b) => b.evaluation!.totalScore - a.evaluation!.totalScore);
  }, [attempts]);

  // Group by category, show top score per challenge
  const byCategory = useMemo(() => {
    const categories = new Map<
      ChallengeCategory,
      { challengeId: string; title: string; bestScore: number }[]
    >();

    for (const challenge of CHALLENGES) {
      const cat = challenge.category;
      if (!categories.has(cat)) {
        categories.set(cat, []);
      }
      const challengeAttempts = scoredAttempts.filter(
        (a) => a.challengeId === challenge.id
      );
      const best =
        challengeAttempts.length > 0
          ? Math.max(...challengeAttempts.map((a) => a.evaluation!.totalScore))
          : 0;
      categories.get(cat)!.push({
        challengeId: challenge.id,
        title: challenge.title,
        bestScore: best,
      });
    }

    return categories;
  }, [scoredAttempts]);

  const isEmpty = scoredAttempts.length === 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/arena">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Arena
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
        <p className="text-muted-foreground">
          Track your performance across all arena challenges.
        </p>
      </div>

      {isEmpty ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h2 className="text-lg font-semibold mb-1">No Attempts Yet</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Complete some arena challenges to see your scores here.
            </p>
            <Button asChild>
              <Link href="/arena">Browse Challenges</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All Challenges</TabsTrigger>
            <TabsTrigger value="category">By Category</TabsTrigger>
          </TabsList>

          {/* All Attempts Tab */}
          <TabsContent value="all" className="mt-4">
            <Card>
              <CardContent className="pt-4 pb-2">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-2 font-medium text-muted-foreground">
                          #
                        </th>
                        <th className="pb-2 font-medium text-muted-foreground pl-3">
                          Challenge
                        </th>
                        <th className="pb-2 font-medium text-muted-foreground pl-3">
                          Score
                        </th>
                        <th className="pb-2 font-medium text-muted-foreground pl-3">
                          Time
                        </th>
                        <th className="pb-2 font-medium text-muted-foreground pl-3">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {scoredAttempts.map((attempt, index) => {
                        const category = getChallengeCategory(
                          attempt.challengeId
                        );
                        return (
                          <tr
                            key={attempt.id}
                            className="border-b last:border-0"
                          >
                            <td className="py-2.5 text-muted-foreground">
                              {index + 1}
                            </td>
                            <td className="py-2.5 pl-3">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {getChallengeTitle(attempt.challengeId)}
                                </span>
                                {category && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {CATEGORY_LABELS[category]}
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 pl-3">
                              <span
                                className={`font-bold ${scoreColor(
                                  attempt.evaluation!.totalScore
                                )}`}
                              >
                                {attempt.evaluation!.totalScore}
                              </span>
                            </td>
                            <td className="py-2.5 pl-3 text-muted-foreground">
                              {formatDuration(
                                attempt.startedAt,
                                attempt.submittedAt
                              )}
                            </td>
                            <td className="py-2.5 pl-3 text-muted-foreground">
                              {formatDate(attempt.submittedAt)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* By Category Tab */}
          <TabsContent value="category" className="mt-4">
            <div className="grid gap-6">
              {Array.from(byCategory.entries()).map(
                ([category, challenges]) => (
                  <div key={category}>
                    <h3 className="text-sm font-semibold mb-3">
                      {CATEGORY_LABELS[category]}
                    </h3>
                    <div className="grid gap-2">
                      {challenges.map((ch) => (
                        <Card key={ch.challengeId}>
                          <CardContent className="py-3 flex items-center justify-between">
                            <Link
                              href={`/arena/${ch.challengeId}`}
                              className="font-medium text-sm hover:text-primary transition-colors"
                            >
                              {ch.title}
                            </Link>
                            {ch.bestScore > 0 ? (
                              <div className="flex items-center gap-2">
                                <Trophy className="h-3.5 w-3.5 text-amber-500" />
                                <span
                                  className={`text-sm font-bold ${scoreColor(
                                    ch.bestScore
                                  )}`}
                                >
                                  {ch.bestScore}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                Not attempted
                              </span>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
