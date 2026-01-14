"use client";

import { createAuthClient } from "@neondatabase/auth";
import { BetterAuthReactAdapter } from "@neondatabase/auth/react/adapters";

// Use current origin on client, fall back to env var for SSR
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").trim();
};

export const authClient = createAuthClient(
  getBaseUrl(),
  {
    adapter: BetterAuthReactAdapter(),
  }
);

export const { useSession } = authClient;
