import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createRecordSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  artist: z.string().min(1, 'Artist is required'),
  label: z.string().optional(),
  year: z.number().optional(),
  discogsId: z.string().optional(),
  discogsUrl: z.string().optional(),
  upc: z.string().optional(),
  catno: z.string().optional(),
  format: z.string().optional(),
  formatDesc: z.string().optional(),
  speed: z.string().optional(),
  genres: z.array(z.string()).default([]),
  styles: z.array(z.string()).default([]),
  coverArtUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  country: z.string().optional(),
  released: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * GET /api/records
 * Fetch all records with optional filtering and sorting
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = (searchParams.get('sortBy') as 'dateAdded' | 'artist' | 'title' | 'year') || 'dateAdded';
    const order = (searchParams.get('order') as 'asc' | 'desc') || 'desc';
    const genre = searchParams.get('genre');
    const artist = searchParams.get('artist');

    // Build where clause
    const where: any = {};
    if (genre) {
      where.genres = {
        has: genre,
      };
    }
    if (artist) {
      where.artist = {
        contains: artist,
        mode: 'insensitive',
      };
    }

    const records = await prisma.record.findMany({
      where,
      orderBy: {
        [sortBy]: order,
      },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch records' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/records
 * Create a new record
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createRecordSchema.parse(body);

    // Check if record with same Discogs ID already exists
    if (validated.discogsId) {
      const existing = await prisma.record.findUnique({
        where: { discogsId: validated.discogsId },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Record with this Discogs ID already exists in your collection' },
          { status: 409 }
        );
      }
    }

    const record = await prisma.record.create({
      data: validated,
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid record data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating record:', error);
    return NextResponse.json(
      { error: 'Failed to create record' },
      { status: 500 }
    );
  }
}
