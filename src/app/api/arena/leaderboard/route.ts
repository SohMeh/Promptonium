import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Leaderboard data is managed client-side via localStorage.
// This route exists for API consistency and future server-side storage.
export async function GET(request: NextRequest) {
  const challengeId = request.nextUrl.searchParams.get("challengeId");

  // Return a 200 with instructions — actual data comes from client-side localStorage
  return NextResponse.json({
    message: "Leaderboard data is stored client-side. Use getAttempts() from storage service.",
    challengeId: challengeId || "all",
  });
}
