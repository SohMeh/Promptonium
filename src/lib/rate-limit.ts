import { NextResponse } from "next/server";

/**
 * Fixed-window in-memory rate limiter. Suitable for a single-instance
 * deployment; swap for a shared store (Redis/Upstash) when scaling out.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

const MAX_BUCKETS = 10_000;

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "local";
}

/**
 * Returns a 429 response when the caller exceeded `limit` requests within
 * `windowMs` for the given route name, or null when the request may proceed.
 */
export function rateLimit(
  request: Request,
  name: string,
  limit: number,
  windowMs: number
): NextResponse | null {
  const now = Date.now();
  const key = `${name}:${clientIp(request)}`;

  // Opportunistic cleanup so the map cannot grow without bound.
  if (buckets.size > MAX_BUCKETS) {
    for (const [k, v] of buckets) {
      if (v.resetAt <= now) buckets.delete(k);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }
  return null;
}
