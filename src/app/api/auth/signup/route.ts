import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  const limited = rateLimit(request, "signup", 10, 600000);
  if (limited) return limited;

  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser?.passwordHash) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Without an email service there is no way to deliver a verification
    // code, so accounts are verified immediately in that case.
    const emailEnabled = Boolean(process.env.RESEND_API_KEY);

    const user = existingUser
      ? await db.user.update({
          where: { id: existingUser.id },
          data: {
            name: existingUser.name ?? name,
            passwordHash,
            ...(emailEnabled ? {} : { emailVerified: existingUser.emailVerified ?? new Date() }),
          },
          select: { id: true, name: true, email: true, emailVerified: true },
        })
      : await db.user.create({
          data: {
            name,
            email,
            passwordHash,
            ...(emailEnabled ? {} : { emailVerified: new Date() }),
          },
          select: { id: true, name: true, email: true, emailVerified: true },
        });

    if (emailEnabled && !user.emailVerified) {
      // Generate 6-digit code and store its hash
      const rawCode = String(crypto.randomInt(100000, 999999));
      const codeHash = await bcrypt.hash(rawCode, 10);

      // Delete any existing codes for this email, then create new one
      await db.emailVerificationCode.deleteMany({ where: { email } });
      await db.emailVerificationCode.create({
        data: {
          email,
          codeHash,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        },
      });

      // Send email (non-blocking — failure shouldn't break signup)
      try {
        await sendVerificationEmail(email, rawCode);
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        // Continue — user can request resend later
      }
    }

    return NextResponse.json(
      {
        user: { id: user.id, name: user.name, email: user.email },
        verified: Boolean(user.emailVerified),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup failed:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
