import { NextRequest, NextResponse } from 'next/server';
import { getDiscogsClient } from '@/lib/discogs';
import { z } from 'zod';

const barcodeSchema = z.object({
  barcode: z.string().min(1, 'Barcode is required'),
});

/**
 * GET /api/discogs/barcode
 * Search Discogs database by UPC barcode
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const barcode = searchParams.get('barcode');

    const validated = barcodeSchema.parse({ barcode });

    const client = getDiscogsClient();
    const results = await client.searchByBarcode(validated.barcode);

    return NextResponse.json(results);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid barcode parameter', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error searching Discogs by barcode:', error);
    return NextResponse.json(
      { error: 'Failed to search by barcode' },
      { status: 500 }
    );
  }
}
