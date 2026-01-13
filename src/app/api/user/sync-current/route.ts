import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authServer } from "@/lib/auth/server";

export async function POST(request: NextRequest) {
  try {
    // Get current session
    const { data: session } = await authServer.getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    console.log("Syncing current user:", session.user);

    // Create or update user in our application database
    const user = await prisma.user.upsert({
      where: { id: session.user.id },
      update: {
        email: session.user.email,
        name: session.user.name || null,
      },
      create: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || null,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("User sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync user", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
