import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.user.emailVerified) {
      return NextResponse.json({ message: "Already verified" });
    }

    const email = session.user.email.toLowerCase();

    const rawCode = String(crypto.randomInt(100000, 999999));
    const codeHash = await bcrypt.hash(rawCode, 10);

    await db.emailVerificationCode.deleteMany({ where: { email } });
    await db.emailVerificationCode.create({
      data: {
        email,
        codeHash,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    await sendVerificationEmail(email, rawCode);

    return NextResponse.json({ message: "Verification code sent" });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json({ error: "Failed to send code" }, { status: 500 });
  }
}
