import { NextRequest, NextResponse } from 'next/server';
import { getDiscogsClient } from '@/lib/discogs';

/**
 * GET /api/discogs/release/[id]
 * Get full release details from Discogs by release ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Release ID is required' },
        { status: 400 }
      );
    }

    const client = getDiscogsClient();
    const release = await client.getRelease(id);

    return NextResponse.json(release);
  } catch (error) {
    console.error('Error fetching Discogs release:', error);
    return NextResponse.json(
      { error: 'Failed to fetch release details' },
      { status: 500 }
    );
  }
}
