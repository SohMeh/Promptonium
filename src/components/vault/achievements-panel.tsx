"use client";

import { useState, useEffect } from "react";
import type { Achievement } from "@/lib/types/user";
import { checkAchievements } from "@/lib/services/achievements";
import { getProfile, saveProfile } from "@/lib/services/storage";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Lock } from "lucide-react";

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AchievementsPanel() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const checked = checkAchievements();
    setAchievements(checked);

    // Persist updated achievements to profile
    const profile = getProfile();
    if (profile) {
      const updated = { ...profile, achievements: checked };
      saveProfile(updated);
    }
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Achievements</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {achievements.map((achievement) => {
          const isUnlocked = achievement.unlockedAt !== null;
          return (
            <Card
              key={achievement.id}
              className={
                isUnlocked
                  ? "border-amber-500/50 bg-amber-500/5"
                  : "opacity-60"
              }
            >
              <CardContent className="pt-0">
                <div className="flex flex-col items-center text-center">
                  {isUnlocked ? (
                    <Trophy className="size-8 text-amber-500 mb-2" />
                  ) : (
                    <Lock className="size-8 text-muted-foreground mb-2" />
                  )}
                  <span className="font-medium text-sm">
                    {achievement.name}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {achievement.description}
                  </span>
                  {isUnlocked && achievement.unlockedAt !== null ? (
                    <span className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                      Unlocked {formatDate(achievement.unlockedAt)}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground mt-2">
                      Locked
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
