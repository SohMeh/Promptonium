import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email, token, password } = await request.json();

    if (!email || !token || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Find all non-expired tokens for this email
    const tokens = await db.passwordResetToken.findMany({
      where: {
        email: normalizedEmail,
        expiresAt: { gt: new Date() },
      },
    });

    if (tokens.length === 0) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
    }

    // Check if any stored hash matches the provided token
    let matchedTokenId: string | null = null;
    for (const t of tokens) {
      const isMatch = await bcrypt.compare(token, t.tokenHash);
      if (isMatch) {
        matchedTokenId = t.id;
        break;
      }
    }

    if (!matchedTokenId) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
    }

    // Hash new password and update user
    const passwordHash = await bcrypt.hash(password, 12);

    await db.user.update({
      where: { email: normalizedEmail },
      data: { passwordHash },
    });

    // Delete all reset tokens for this email
    await db.passwordResetToken.deleteMany({ where: { email: normalizedEmail } });

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
