import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Paths that need a verified session (logged in + emailVerified set)
const VERIFIED_API_PREFIXES = ["/api/builder/", "/api/arena/", "/api/academy/"];

// Paths that need any login (not necessarily verified)
const LOGIN_REQUIRED_PREFIXES = ["/vault"];

// Always public
function isAlwaysPublic(pathname: string): boolean {
  if (pathname.startsWith("/api/auth/")) return true;
  if (pathname.startsWith("/_next/")) return true;
  if (pathname === "/favicon.ico") return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isAlwaysPublic(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });

  // Gate AI API routes: require verified session
  if (VERIFIED_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!token.emailVerified) {
      return NextResponse.json({ error: "Email verification required" }, { status: 403 });
    }
    return NextResponse.next();
  }

  // Gate login-required pages
  if (LOGIN_REQUIRED_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/builder/:path*",
    "/api/arena/:path*",
    "/api/academy/:path*",
    "/vault/:path*",
  ],
};
