"use client";

import { createAuthClient } from "@neondatabase/auth";
import { BetterAuthReactAdapter } from "@neondatabase/auth/react/adapters";

// Trim the URL to remove any whitespace/newlines from environment variables
const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").trim();

export const authClient = createAuthClient(
  baseUrl,
  {
    adapter: BetterAuthReactAdapter(),
  }
);

export const { useSession } = authClient;
