import { NextRequest, NextResponse } from "next/server";
import { authServer } from "./server";
import { prisma } from "@/lib/prisma";

/**
 * Get authenticated user from request
 * Returns user data or null if not authenticated
 */
export async function getAuthUser(request: NextRequest) {
  try {
    const { data: session } = await authServer.getSession();

    if (!session?.user) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    };
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

/**
 * Ensure user exists in Prisma User table
 * Creates user if they don't exist (auto-sync from Neon Auth)
 */
async function ensureUserExists(authUser: {
  id: string;
  email: string;
  name?: string | null;
}) {
  try {
    // Check if user exists in database
    let user = await prisma.user.findUnique({
      where: { id: authUser.id },
    });

    // If user doesn't exist, create them
    if (!user) {
      console.log(`Creating new user record for: ${authUser.email} (${authUser.id})`);
      user = await prisma.user.create({
        data: {
          id: authUser.id,
          email: authUser.email,
          name: authUser.name,
        },
      });
      console.log(`✓ User created successfully`);
    }

    return user;
  } catch (error) {
    console.error("Error ensuring user exists:", error);
    throw error;
  }
}

/**
 * Require authentication in API route
 * Returns user or sends 401 response
 * Automatically creates user record if it doesn't exist
 */
export async function requireAuth(request: NextRequest) {
  const authUser = await getAuthUser(request);

  if (!authUser) {
    return {
      user: null,
      response: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  try {
    // Ensure user exists in database (auto-create if needed)
    await ensureUserExists(authUser);

    return { user: authUser, response: null };
  } catch (error) {
    console.error("Error in requireAuth:", error);
    return {
      user: null,
      response: NextResponse.json(
        { error: "Failed to authenticate user" },
        { status: 500 }
      ),
    };
  }
}
