import type { PromptProject } from "@/lib/types/prompt";
import type { ChallengeAttempt } from "@/lib/types/challenge";
import type { ProgressRecord } from "@/lib/types/lesson";

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  check: (data: {
    projects: PromptProject[];
    attempts: ChallengeAttempt[];
    progress: ProgressRecord[];
  }) => boolean;
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: "first_prompt",
    name: "First Prompt",
    description: "Save your first prompt",
    check: ({ projects }) => projects.length >= 1,
  },
  {
    id: "perfectionist",
    name: "Perfectionist",
    description: "Score 90+ on any prompt",
    check: ({ projects }) =>
      projects.some((p) =>
        p.versions.some((v) => v.evaluation !== null && v.evaluation.totalScore >= 90)
      ),
  },
  {
    id: "speed_demon",
    name: "Speed Demon",
    description: "Complete a challenge in under 2 minutes",
    check: ({ attempts }) =>
      attempts.some((a) => a.submittedAt - a.startedAt <= 120000),
  },
  {
    id: "five_star",
    name: "Five Star",
    description: "Save 5 prompts to your vault",
    check: ({ projects }) => projects.length >= 5,
  },
  {
    id: "scholar",
    name: "Scholar",
    description: "Complete all lessons in a learning path",
    check: ({ progress }) => {
      if (progress.length === 0) return false;
      const byPath = new Map<string, ProgressRecord[]>();
      for (const record of progress) {
        const existing = byPath.get(record.pathId) ?? [];
        existing.push(record);
        byPath.set(record.pathId, existing);
      }
      for (const records of byPath.values()) {
        if (records.length > 0 && records.every((r) => r.completed)) {
          return true;
        }
      }
      return false;
    },
  },
  {
    id: "challenger",
    name: "Challenger",
    description: "Complete 5 arena challenges",
    check: ({ attempts }) => {
      const uniqueChallengeIds = new Set(attempts.map((a) => a.challengeId));
      return uniqueChallengeIds.size >= 5;
    },
  },
  {
    id: "multi_model",
    name: "Multi-Model",
    description: "Create prompts for 3 different target models",
    check: ({ projects }) => {
      const models = new Set(projects.map((p) => p.modelTarget));
      return models.size >= 3;
    },
  },
  {
    id: "improver",
    name: "Improver",
    description: "Create 2+ versions of the same project",
    check: ({ projects }) =>
      projects.some((p) => p.versions.length >= 2),
  },
];
