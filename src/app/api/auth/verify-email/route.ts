import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const limited = rateLimit(request, "verify-email", 10, 600000);
  if (limited) return limited;

  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.user.emailVerified) {
      return NextResponse.json({ message: "Already verified" });
    }

    const { code } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const email = session.user.email.toLowerCase();

    const storedCodes = await db.emailVerificationCode.findMany({
      where: {
        email,
        expiresAt: { gt: new Date() },
      },
    });

    if (storedCodes.length === 0) {
      return NextResponse.json({ error: "Code expired or not found. Please request a new one." }, { status: 400 });
    }

    let matched = false;
    for (const stored of storedCodes) {
      if (await bcrypt.compare(code, stored.codeHash)) {
        matched = true;
        break;
      }
    }

    if (!matched) {
      return NextResponse.json({ error: "Invalid code. Please try again." }, { status: 400 });
    }

    // Mark user as verified
    await db.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    // Clean up codes
    await db.emailVerificationCode.deleteMany({ where: { email } });

    return NextResponse.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
