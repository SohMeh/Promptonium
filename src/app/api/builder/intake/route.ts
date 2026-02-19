import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await request.json();
  return NextResponse.json(
    { error: "Not implemented", phase: "P2" },
    { status: 501 }
  );
}
