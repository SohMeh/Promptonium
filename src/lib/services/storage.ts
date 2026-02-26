import type { UserProfile } from "@/lib/types/user";
import type { PromptProject } from "@/lib/types/prompt";
import type { ChallengeAttempt } from "@/lib/types/challenge";
import type { ProgressRecord } from "@/lib/types/lesson";

const STORAGE_KEYS = {
  PROFILE: "promptonium:profile",
  PROJECTS: "promptonium:projects",
  ATTEMPTS: "promptonium:attempts",
  PROGRESS: "promptonium:progress",
  BUILDER_STATE: "promptonium:builder-state",
} as const;

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setItem(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

// --- Profile ---
export function getProfile(): UserProfile | null {
  return getItem<UserProfile | null>(STORAGE_KEYS.PROFILE, null);
}

export function saveProfile(profile: UserProfile): void {
  setItem(STORAGE_KEYS.PROFILE, profile);
}

// --- Prompt Projects ---
export function getProjects(): PromptProject[] {
  return getItem<PromptProject[]>(STORAGE_KEYS.PROJECTS, []);
}

export function saveProject(project: PromptProject): void {
  const projects = getProjects();
  const idx = projects.findIndex((p) => p.id === project.id);
  if (idx >= 0) {
    projects[idx] = project;
  } else {
    projects.unshift(project);
  }
  setItem(STORAGE_KEYS.PROJECTS, projects);
}

export function deleteProject(id: string): void {
  const projects = getProjects().filter((p) => p.id !== id);
  setItem(STORAGE_KEYS.PROJECTS, projects);
}

// --- Challenge Attempts ---
export function getAttempts(): ChallengeAttempt[] {
  return getItem<ChallengeAttempt[]>(STORAGE_KEYS.ATTEMPTS, []);
}

export function saveAttempt(attempt: ChallengeAttempt): void {
  const attempts = getAttempts();
  attempts.unshift(attempt);
  setItem(STORAGE_KEYS.ATTEMPTS, attempts);
}

export function getAttemptsByChallenge(challengeId: string): ChallengeAttempt[] {
  return getAttempts().filter((a) => a.challengeId === challengeId);
}

// --- Progress Records ---
export function getProgress(): ProgressRecord[] {
  return getItem<ProgressRecord[]>(STORAGE_KEYS.PROGRESS, []);
}

export function saveProgress(record: ProgressRecord): void {
  const records = getProgress();
  const idx = records.findIndex(
    (r) => r.pathId === record.pathId && r.lessonId === record.lessonId
  );
  if (idx >= 0) {
    records[idx] = record;
  } else {
    records.push(record);
  }
  setItem(STORAGE_KEYS.PROGRESS, records);
}

export function getProgressByPath(pathId: string): ProgressRecord[] {
  return getProgress().filter((r) => r.pathId === pathId);
}

// --- Builder State Persistence ---
export function getBuilderState<T>(): T | null {
  return getItem<T | null>(STORAGE_KEYS.BUILDER_STATE, null);
}

export function saveBuilderState(state: unknown): void {
  setItem(STORAGE_KEYS.BUILDER_STATE, state);
}

export function clearBuilderState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.BUILDER_STATE);
}
