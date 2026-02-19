export interface UserProfile {
  id: string;
  displayName: string;
  createdAt: number;
  preferences: UserPreferences;
  achievements: Achievement[];
  stats: UserStats;
}

export interface UserPreferences {
  defaultModel: string;
  defaultTone: string;
  theme: "light" | "dark" | "system";
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: number | null;
}

export interface UserStats {
  totalPrompts: number;
  averageScore: number;
  challengesCompleted: number;
  lessonsCompleted: number;
}
