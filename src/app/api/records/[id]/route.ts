import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/helpers';
import { z } from 'zod';

const updateRecordSchema = z.object({
  title: z.string().optional(),
  artist: z.string().optional(),
  label: z.string().optional(),
  year: z.number().optional(),
  notes: z.string().optional(),
  genres: z.array(z.string()).optional(),
  styles: z.array(z.string()).optional(),
});

/**
 * GET /api/records/[id]
 * Fetch a single record by ID (user must own it)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require authentication
  const { user, response } = await requireAuth(request);
  if (response) return response;

  try {
    const { id } = await params;

    // Find record and verify ownership
    const record = await prisma.record.findFirst({
      where: {
        id,
        userId: user!.id, // Verify user owns this record
      },
    });

    if (!record) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error fetching record:', error);
    return NextResponse.json(
      { error: 'Failed to fetch record' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/records/[id]
 * Update a record (user must own it)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require authentication
  const { user, response } = await requireAuth(request);
  if (response) return response;

  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateRecordSchema.parse(body);

    // Verify ownership before update
    const existing = await prisma.record.findFirst({
      where: {
        id,
        userId: user!.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }

    const record = await prisma.record.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json(record);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid record data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating record:', error);
    return NextResponse.json(
      { error: 'Failed to update record' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/records/[id]
 * Delete a record (user must own it)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require authentication
  const { user, response } = await requireAuth(request);
  if (response) return response;

  try {
    const { id } = await params;

    // Verify ownership before delete
    const existing = await prisma.record.findFirst({
      where: {
        id,
        userId: user!.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }

    await prisma.record.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting record:', error);
    return NextResponse.json(
      { error: 'Failed to delete record' },
      { status: 500 }
    );
  }
}
