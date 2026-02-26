import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await request.json();
    return NextResponse.json(
      { error: "Use NextAuth sign-in flow at /api/auth/signin or the login page." },
      { status: 410 }
    );
  } catch (error) {
    console.error("Login failed:", error);
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}
