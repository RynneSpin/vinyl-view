import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const syncUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("User sync request body:", body);
    const validated = syncUserSchema.parse(body);

    // Create or update user in our application database
    const user = await prisma.user.upsert({
      where: { id: validated.id },
      update: {
        email: validated.email,
        name: validated.name,
      },
      create: {
        id: validated.id,
        email: validated.email,
        name: validated.name,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid user data", details: error.issues },
        { status: 400 }
      );
    }

    console.error("User sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync user" },
      { status: 500 }
    );
  }
}
