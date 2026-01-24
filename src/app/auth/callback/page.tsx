"use client";

import { useEffect, useState, useRef, Component, ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useSession } from "@/lib/auth/client";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";

// Error boundary to catch JSON parsing errors from useSession
class SessionErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Session error caught by boundary:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending, error: sessionError } = useSession();
  const [error, setError] = useState<string | null>(null);
  const hasRedirected = useRef(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const errorParam = searchParams.get("error");

  useEffect(() => {
    if (errorParam) {
      setError(`Authentication failed: ${errorParam}`);
    }
  }, [errorParam]);

  useEffect(() => {
    if (isPending) return;
    if (hasRedirected.current) return;

    if (sessionError) {
      console.error("Session error:", sessionError);
      setError("Failed to establish session. Please try signing in again.");
      return;
    }

    if (session?.user) {
      hasRedirected.current = true;
      fetch("/api/user/sync-current", { method: "POST" })
        .catch((e) => console.error("User sync error:", e))
        .finally(() => {
          router.replace(callbackUrl);
        });
    } else if (!isPending) {
      const timeout = setTimeout(() => {
        if (!hasRedirected.current && !session?.user) {
          setError("Failed to establish session. Please try signing in again.");
        }
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [session, isPending, sessionError, router, callbackUrl]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <Card variant="elevated" className="w-full max-w-md p-5 sm:p-8 text-center">
          <div className="text-red-400 mb-4">{error}</div>
          <button
            onClick={() => router.push("/auth/sign-in")}
            className="px-4 py-2 bg-accent-purple text-white rounded-lg hover:bg-accent-purple/90"
          >
            Back to Sign In
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <Card variant="elevated" className="w-full max-w-md p-5 sm:p-8 text-center">
        <Spinner size="lg" className="mx-auto mb-4" />
        <p className="text-vinyl-300">Completing sign-in...</p>
      </Card>
    </div>
  );
}

function ErrorFallback() {
  const router = useRouter();

  // Auto-retry once after a short delay
  useEffect(() => {
    const timeout = setTimeout(() => {
      window.location.reload();
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <Card variant="elevated" className="w-full max-w-md p-5 sm:p-8 text-center">
        <Spinner size="lg" className="mx-auto mb-4" />
        <p className="text-vinyl-300">Completing sign-in...</p>
      </Card>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center px-4 py-8">
          <Card variant="elevated" className="w-full max-w-md p-5 sm:p-8 text-center">
            <Spinner size="lg" className="mx-auto mb-4" />
            <p className="text-vinyl-300">Loading...</p>
          </Card>
        </div>
      }
    >
      <SessionErrorBoundary fallback={<ErrorFallback />}>
        <CallbackHandler />
      </SessionErrorBoundary>
    </Suspense>
  );
}
