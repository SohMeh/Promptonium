import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Endpoints that spend AI credits. Everything else in the app is free to
// use without an account. These require EITHER a signed-in user OR the
// user's own Anthropic API key sent via the x-user-api-key header.
const AI_ENDPOINT_PREFIXES = ["/api/builder/", "/api/arena/attempt", "/api/academy/progress"];

const BYOK_HEADER = "x-user-api-key";

// When no email service is configured, accounts are auto-verified at
// signup, so this check only bites when verification emails actually send.
const EMAIL_VERIFICATION_ENABLED = Boolean(process.env.RESEND_API_KEY);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!AI_ENDPOINT_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Users bringing their own API key can use AI features without an account.
  if (request.headers.get(BYOK_HEADER)?.trim()) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  if (!token) {
    return NextResponse.json(
      {
        error:
          "Sign in to use AI features, or add your own Anthropic API key in the AI Engine settings.",
        code: "AUTH_REQUIRED",
      },
      { status: 401 }
    );
  }

  if (EMAIL_VERIFICATION_ENABLED && !token.emailVerified) {
    return NextResponse.json(
      {
        error: "Verify your email to use AI features. Check your inbox for the code.",
        code: "VERIFY_REQUIRED",
      },
      { status: 403 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/builder/:path*", "/api/arena/:path*", "/api/academy/:path*"],
};
