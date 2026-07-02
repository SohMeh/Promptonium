"use client";

import { useState, useEffect, useCallback } from "react";
import type { UserProfile } from "@/lib/types/user";
import {
  getProfile,
  saveProfile,
  getProjects,
  getAttempts,
  getProgress,
} from "@/lib/services/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, FileText, Target, BookOpen, TrendingUp } from "lucide-react";

function createDefaultProfile(): UserProfile {
  return {
    id: crypto.randomUUID(),
    displayName: "Prompt Engineer",
    createdAt: Date.now(),
    preferences: {
      defaultModel: "claude",
      defaultTone: "professional",
      theme: "system",
    },
    achievements: [],
    stats: {
      totalPrompts: 0,
      averageScore: 0,
      challengesCompleted: 0,
      lessonsCompleted: 0,
    },
  };
}

export function ProfilePanel() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const computeStats = useCallback(() => {
    const projects = getProjects();
    const attempts = getAttempts();
    const progress = getProgress();

    const totalPrompts = projects.length;

    // Compute average score from all evaluations
    const allScores: number[] = [];
    for (const project of projects) {
      for (const version of project.versions) {
        if (version.evaluation) {
          allScores.push(version.evaluation.totalScore);
        }
      }
    }
    const averageScore =
      allScores.length > 0
        ? allScores.reduce((sum, s) => sum + s, 0) / allScores.length
        : 0;

    // Unique challenges completed
    const uniqueChallengeIds = new Set(attempts.map((a) => a.challengeId));
    const challengesCompleted = uniqueChallengeIds.size;

    // Lessons completed
    const lessonsCompleted = progress.filter((r) => r.completed).length;

    return { totalPrompts, averageScore, challengesCompleted, lessonsCompleted };
  }, []);

  useEffect(() => {
    let p = getProfile();
    if (!p) {
      p = createDefaultProfile();
      saveProfile(p);
    }

    const stats = computeStats();
    const updated = { ...p, stats };
    saveProfile(updated);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage hydration must run post-mount
    setProfile(updated);
    setDisplayName(updated.displayName);
  }, [computeStats]);

  const handleSaveName = () => {
    if (!profile) return;
    const trimmed = displayName.trim();
    if (!trimmed) return;
    const updated = { ...profile, displayName: trimmed };
    saveProfile(updated);
    setProfile(updated);
    setIsEditing(false);
  };

  if (!profile) return null;

  const statCards = [
    {
      label: "Total Prompts",
      value: profile.stats.totalPrompts,
      icon: FileText,
    },
    {
      label: "Average Score",
      value: Math.round(profile.stats.averageScore),
      icon: TrendingUp,
    },
    {
      label: "Challenges Completed",
      value: profile.stats.challengesCompleted,
      icon: Target,
    },
    {
      label: "Lessons Completed",
      value: profile.stats.lessonsCompleted,
      icon: BookOpen,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="max-w-xs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") {
                      setDisplayName(profile.displayName);
                      setIsEditing(false);
                    }
                  }}
                  autoFocus
                />
                <Button size="sm" onClick={handleSaveName}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setDisplayName(profile.displayName);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <span className="text-lg font-medium">
                  {profile.displayName}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              </>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Member since{" "}
            {new Date(profile.createdAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-0">
                <div className="flex flex-col items-center text-center">
                  <Icon className="size-5 text-muted-foreground mb-2" />
                  <span className="text-3xl font-bold">{stat.value}</span>
                  <span className="text-sm text-muted-foreground mt-1">
                    {stat.label}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
