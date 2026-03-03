import { NextResponse } from "next/server";

// Sign-out is handled client-side via next-auth/react signOut().
// This route is kept for backwards compatibility but is a no-op.
export async function POST() {
  return NextResponse.json({ ok: true });
}
