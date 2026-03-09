import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: Request) {
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

    const user = existingUser
      ? await db.user.update({
          where: { id: existingUser.id },
          data: { name: existingUser.name ?? name, passwordHash },
          select: { id: true, name: true, email: true },
        })
      : await db.user.create({
          data: { name, email, passwordHash },
          select: { id: true, name: true, email: true },
        });

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
      if (!process.env.RESEND_API_KEY) {
        console.log(`[DEV] Verification code for ${email}: ${rawCode}`);
      }
      // Continue — user can request resend later
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Signup failed:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
