"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { update } = useSession();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed");
        return;
      }

      setSuccess(true);
      // Refresh JWT so emailVerified is updated in session
      await update({ refreshEmailVerified: true });
      router.push("/builder");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    setResendStatus("sending");
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      setResendStatus(res.ok ? "sent" : "failed");
    } catch {
      setResendStatus("failed");
    }
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>
            Enter the 6-digit code we sent to your email address. The code expires in 15 minutes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <p className="text-sm text-green-600 font-medium">Email verified! Redirecting…</p>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="code" className="text-sm font-medium">Verification code</label>
                <Input
                  id="code"
                  name="code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  required
                />
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <Button type="submit" className="w-full" disabled={isSubmitting || code.length !== 6}>
                {isSubmitting ? "Verifying…" : "Verify email"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendStatus === "sending" || resendStatus === "sent"}
                  className="text-sm text-primary hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  {resendStatus === "sending"
                    ? "Sending…"
                    : resendStatus === "sent"
                      ? "Code sent!"
                      : resendStatus === "failed"
                        ? "Sending failed — tap to retry"
                        : "Resend code"}
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
