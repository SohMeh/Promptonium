import { NextResponse } from "next/server";
import type { PromptProject } from "@/lib/types/prompt";

// Vault save is currently handled client-side via localStorage.
// This route exists for API consistency and future server-side storage.
export async function POST(request: Request) {
  try {
    const { project } = (await request.json()) as { project: PromptProject };

    if (!project?.id) {
      return NextResponse.json({ error: "Project data is required" }, { status: 400 });
    }

    // In the future, this would persist to a database.
    // For now, client handles localStorage saving.
    return NextResponse.json({ saved: true, projectId: project.id });
  } catch (error) {
    console.error("Vault save error:", error);
    return NextResponse.json(
      { error: "Failed to save project" },
      { status: 500 }
    );
  }
}
