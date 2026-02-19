export interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  lessons: LessonModule[];
  isEduMode: boolean;
}

export interface LessonModule {
  id: string;
  pathId: string;
  order: number;
  title: string;
  description: string;
  contentMarkdown: string;
  practice: PracticeScenario;
  checkpointThreshold: number;
}

export interface PracticeScenario {
  description: string;
  targetModel: string;
  hints: string[];
  examplePrompt?: string;
}

export interface ProgressRecord {
  pathId: string;
  lessonId: string;
  completed: boolean;
  bestScore: number;
  completedAt: number | null;
  attempts: number;
}
