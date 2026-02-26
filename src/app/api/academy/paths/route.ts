import { NextResponse } from "next/server";
import { LEARNING_PATHS } from "@/data/academy/paths";

export async function GET() {
  // Return paths without full contentMarkdown for list view
  const summary = LEARNING_PATHS.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    difficulty: p.difficulty,
    isEduMode: p.isEduMode,
    lessonCount: p.lessons.length,
    lessons: p.lessons.map((l) => ({
      id: l.id,
      order: l.order,
      title: l.title,
      description: l.description,
      checkpointThreshold: l.checkpointThreshold,
    })),
  }));

  return NextResponse.json({ paths: summary });
}
