"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Try email-otp verification endpoint
      const response = await fetch("/api/auth/email-otp/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: code,
          code: code // Try both field names
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        console.error("Verification error:", response.status, data);
        setError(data.error || data.message || `Verification failed (${response.status})`);
        setLoading(false);
        return;
      }

      // Success
      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/sign-in?verified=true");
      }, 2000);
    } catch (err) {
      console.error("Verification error:", err);
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/email-otp/send-verification-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Resend OTP error:", response.status, errorData);
        setError(errorData.message || `Failed to resend verification code (${response.status})`);
      } else {
        setError(null);
        alert("Verification code sent! Check your email.");
      }
    } catch (err) {
      console.error("Resend OTP exception:", err);
      setError("Failed to resend verification code");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card variant="elevated" className="w-full max-w-md p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-vinyl-50 mb-2">
              Email Verified!
            </h1>
            <p className="text-vinyl-400">
              Redirecting you to sign in...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card variant="elevated" className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-vinyl-50 mb-2">
            Verify Your Email
          </h1>
          <p className="text-vinyl-400">
            We sent a verification code to{" "}
            <span className="text-vinyl-200 font-medium">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            label="Verification Code"
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            maxLength={6}
            autoComplete="off"
          />

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" isLoading={loading}>
            Verify Email
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={loading}
            className="text-vinyl-400 hover:text-vinyl-200 text-sm transition-colors"
          >
            Didn't receive a code? Resend
          </button>

          <p className="text-vinyl-400 text-sm">
            <Link
              href="/auth/sign-up"
              className="text-accent-purple hover:text-accent-purple/80 transition-colors"
            >
              Back to sign up
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center px-4">
          <Card variant="elevated" className="w-full max-w-md p-8">
            <div className="text-center">
              <p className="text-vinyl-400">Loading...</p>
            </div>
          </Card>
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
