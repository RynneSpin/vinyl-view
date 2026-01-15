import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/helpers';
import { z } from 'zod';

const trackSchema = z.object({
  position: z.string().optional().default(''),
  title: z.string(),
  duration: z.string().optional().default(''),
});

const createRecordSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  artist: z.string().min(1, 'Artist is required'),
  label: z.string().nullable().optional(),
  year: z.number().nullable().optional(),
  discogsId: z.string().nullable().optional(),
  discogsUrl: z.string().nullable().optional(),
  upc: z.string().nullable().optional(),
  catno: z.string().nullable().optional(),
  format: z.string().nullable().optional(),
  formatDesc: z.string().nullable().optional(),
  speed: z.string().nullable().optional(),
  genres: z.array(z.string()).default([]),
  styles: z.array(z.string()).default([]),
  tracklist: z.array(trackSchema).nullable().optional(),
  coverArtUrl: z.string().nullable().optional(),
  thumbnailUrl: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  released: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

/**
 * GET /api/records
 * Fetch all records for authenticated user with optional filtering and sorting
 */
export async function GET(request: NextRequest) {
  // Require authentication
  const { user, response } = await requireAuth(request);
  if (response) return response;

  try {
    const { searchParams } = new URL(request.url);
    const sortBy = (searchParams.get('sortBy') as 'dateAdded' | 'artist' | 'title' | 'year') || 'dateAdded';
    const order = (searchParams.get('order') as 'asc' | 'desc') || 'desc';
    const genre = searchParams.get('genre');
    const artist = searchParams.get('artist');
    const decade = searchParams.get('decade');
    const country = searchParams.get('country');

    // Build where clause with userId filter
    const where: any = {
      userId: user!.id, // Filter by authenticated user
    };

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
    if (decade) {
      // Parse "1980s" → year range 1980-1989
      const decadeStart = parseInt(decade.replace('s', ''), 10);
      if (!isNaN(decadeStart)) {
        where.year = {
          gte: decadeStart,
          lt: decadeStart + 10,
        };
      }
    }
    if (country) {
      where.country = country;
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
 * Create a new record for authenticated user
 */
export async function POST(request: NextRequest) {
  // Require authentication
  const { user, response } = await requireAuth(request);
  if (response) return response;

  try {
    const body = await request.json();
    const validated = createRecordSchema.parse(body);

    // Check if record with same Discogs ID already exists for this user
    if (validated.discogsId) {
      const existing = await prisma.record.findFirst({
        where: {
          discogsId: validated.discogsId,
          userId: user!.id, // Check within user's collection only
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Record with this Discogs ID already exists in your collection' },
          { status: 409 }
        );
      }
    }

    // Create record with userId
    console.log(`Creating record for user: ${user!.id} (${user!.email})`);

    // Transform null tracklist to undefined for Prisma
    const { tracklist, ...rest } = validated;
    const record = await prisma.record.create({
      data: {
        ...rest,
        tracklist: tracklist ?? undefined,
        userId: user!.id, // Associate with authenticated user
      },
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
    console.error('User attempting to create record:', user);
    return NextResponse.json(
      { error: 'Failed to create record' },
      { status: 500 }
    );
  }
}
