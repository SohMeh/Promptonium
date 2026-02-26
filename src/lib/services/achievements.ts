import type { Achievement } from "@/lib/types/user";
import { ACHIEVEMENT_DEFS } from "@/data/achievements";
import { getProjects } from "@/lib/services/storage";
import { getAttempts } from "@/lib/services/storage";
import { getProgress } from "@/lib/services/storage";
import { getProfile } from "@/lib/services/storage";

/**
 * Checks all achievement definitions against current user data.
 * Returns the full list of achievements with `unlockedAt` set for
 * any that are newly or previously unlocked.
 */
export function checkAchievements(): Achievement[] {
  const projects = getProjects();
  const attempts = getAttempts();
  const progress = getProgress();
  const profile = getProfile();

  const previousAchievements = profile?.achievements ?? [];
  const previousMap = new Map<string, Achievement>();
  for (const a of previousAchievements) {
    previousMap.set(a.id, a);
  }

  const data = { projects, attempts, progress };

  return ACHIEVEMENT_DEFS.map((def) => {
    const prev = previousMap.get(def.id);
    const isUnlocked = def.check(data);

    if (isUnlocked) {
      return {
        id: def.id,
        name: def.name,
        description: def.description,
        unlockedAt: prev?.unlockedAt ?? Date.now(),
      };
    }

    return {
      id: def.id,
      name: def.name,
      description: def.description,
      unlockedAt: prev?.unlockedAt ?? null,
    };
  });
}

/**
 * Returns achievements that are now unlocked but were not previously.
 */
export function getNewlyUnlocked(
  previous: Achievement[],
  current: Achievement[]
): Achievement[] {
  const prevUnlocked = new Set(
    previous.filter((a) => a.unlockedAt !== null).map((a) => a.id)
  );

  return current.filter(
    (a) => a.unlockedAt !== null && !prevUnlocked.has(a.id)
  );
}
