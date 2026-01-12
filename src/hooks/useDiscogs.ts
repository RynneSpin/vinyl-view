'use client';

import { useState } from 'react';
import type { DiscogsSearchResponse, DiscogsRelease } from '@/types/discogs';

export function useDiscogs() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchByQuery = async (query: string): Promise<DiscogsSearchResponse> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/discogs/search?query=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error('Failed to search Discogs');
      }

      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Search failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchByBarcode = async (barcode: string): Promise<DiscogsSearchResponse> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/discogs/barcode?barcode=${encodeURIComponent(barcode)}`
      );

      if (!response.ok) {
        throw new Error('Failed to search by barcode');
      }

      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Barcode search failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getRelease = async (releaseId: string): Promise<DiscogsRelease> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/discogs/release/${releaseId}`);

      if (!response.ok) {
        throw new Error('Failed to get release details');
      }

      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get release';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    searchByQuery,
    searchByBarcode,
    getRelease,
  };
}
