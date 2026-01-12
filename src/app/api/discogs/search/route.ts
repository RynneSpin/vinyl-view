import { NextRequest, NextResponse } from 'next/server';
import { getDiscogsClient } from '@/lib/discogs';
import { z } from 'zod';

const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  type: z.enum(['release', 'master']).optional(),
});

/**
 * GET /api/discogs/search
 * Search Discogs database by artist and/or album name
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const type = searchParams.get('type') as 'release' | 'master' | null;

    const validated = searchSchema.parse({
      query,
      type: type || 'release',
    });

    const client = getDiscogsClient();
    const results = await client.searchReleases(
      validated.query,
      validated.type
    );

    return NextResponse.json(results);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error searching Discogs:', error);
    return NextResponse.json(
      { error: 'Failed to search Discogs' },
      { status: 500 }
    );
  }
}
