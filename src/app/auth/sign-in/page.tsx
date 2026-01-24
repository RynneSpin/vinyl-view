"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setOauthLoading(true);
    setError(null);
    try {
      // Use callback page to handle OAuth completion, then redirect to final destination
      const oauthCallbackUrl = `/auth/callback?callbackUrl=${encodeURIComponent(callbackUrl)}`;

      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: oauthCallbackUrl,
      });
      if (result?.error) {
        setError(result.error.message || "Google sign-in failed");
        setOauthLoading(false);
      } else if (result?.data?.redirect && result?.data?.url) {
        // Redirect to OAuth provider
        window.location.href = result.data.url;
      }
    } catch (err) {
      console.error("OAuth error:", err);
      setError("Failed to sign in with Google");
      setOauthLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await authClient.signIn.email({
        email,
        password,
        callbackURL: callbackUrl,
      });

      if (authError) {
        setError(authError.message || "Sign in failed");
        setLoading(false);
        return;
      }

      // Wait a moment for session to be established
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get session and sync user to application database
      const sessionResponse = await fetch("/api/auth/get-session");
      const sessionData = await sessionResponse.json();

      if (sessionData?.user) {
        await fetch("/api/user/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: sessionData.user.id,
            email: sessionData.user.email,
            name: sessionData.user.name,
          }),
        });
      }

      // Success - redirect
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <Card variant="elevated" className="w-full max-w-md p-5 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-vinyl-50 mb-1 sm:mb-2">
            Welcome Back
          </h1>
          <p className="text-sm sm:text-base text-vinyl-400">Sign in to your vinyl collection</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <Input
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" isLoading={loading}>
            Sign In
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-vinyl-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-vinyl-800 text-vinyl-400">or continue with</span>
          </div>
        </div>

        {/* Google Sign In */}
        <Button
          type="button"
          variant="secondary"
          className="w-full flex items-center justify-center gap-3"
          onClick={handleGoogleSignIn}
          isLoading={oauthLoading}
          disabled={loading}
        >
          {!oauthLoading && (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          Continue with Google
        </Button>

        <div className="mt-6 text-center">
          <p className="text-vinyl-400 text-sm">
            Don't have an account?{" "}
            <Link
              href="/auth/sign-up"
              className="text-accent-purple hover:text-accent-purple/80 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center px-4 py-8">
          <Card variant="elevated" className="w-full max-w-md p-5 sm:p-8">
            <div className="text-center">
              <p className="text-sm sm:text-base text-vinyl-400">Loading...</p>
            </div>
          </Card>
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
