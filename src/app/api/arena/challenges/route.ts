import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CHALLENGES } from "@/data/challenges";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category");
  const difficulty = searchParams.get("difficulty");

  let results = CHALLENGES;

  if (category) {
    results = results.filter((c) => c.category === category);
  }

  if (difficulty) {
    results = results.filter((c) => c.difficulty === difficulty);
  }

  return NextResponse.json({ challenges: results });
}
