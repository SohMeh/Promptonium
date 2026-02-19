import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Not implemented", phase: "P4" },
    { status: 501 }
  );
}
