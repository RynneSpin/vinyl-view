import { RateLimiter } from './rate-limit';
import type { DiscogsSearchResponse, DiscogsRelease } from '@/types/discogs';

const DISCOGS_API_BASE = 'https://api.discogs.com';
const USER_AGENT = 'VinylView/1.0';

// Rate limiter: 60 requests per minute for authenticated users
const rateLimiter = new RateLimiter(60, 60000);

/**
 * Discogs API client
 * Handles all communication with the Discogs database API
 */
export class DiscogsClient {
  private token: string;

  constructor(token: string) {
    if (!token) {
      throw new Error('Discogs API token is required');
    }
    this.token = token;
  }

  /**
   * Make a request to the Discogs API
   */
  private async request<T>(endpoint: string): Promise<T> {
    // Wait for rate limiter
    await rateLimiter.acquire();

    const response = await fetch(`${DISCOGS_API_BASE}${endpoint}`, {
      headers: {
        'Authorization': `Discogs token=${this.token}`,
        'User-Agent': USER_AGENT,
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Discogs API error (${response.status}): ${error}`);
    }

    return response.json();
  }

  /**
   * Search for releases by artist and/or album name
   */
  async searchReleases(
    query: string,
    type: 'release' | 'master' = 'release'
  ): Promise<DiscogsSearchResponse> {
    const encodedQuery = encodeURIComponent(query);
    return this.request<DiscogsSearchResponse>(
      `/database/search?q=${encodedQuery}&type=${type}&format=vinyl`
    );
  }

  /**
   * Get full details for a specific release
   */
  async getRelease(releaseId: string): Promise<DiscogsRelease> {
    return this.request<DiscogsRelease>(`/releases/${releaseId}`);
  }

  /**
   * Search for releases by barcode/UPC
   */
  async searchByBarcode(barcode: string): Promise<DiscogsSearchResponse> {
    return this.request<DiscogsSearchResponse>(
      `/database/search?barcode=${barcode}&type=release`
    );
  }

  /**
   * Get a master release (canonical version of a release)
   */
  async getMaster(masterId: string): Promise<any> {
    return this.request(`/masters/${masterId}`);
  }
}

/**
 * Get the Discogs client instance
 * Uses the server-side API token
 */
export function getDiscogsClient(): DiscogsClient {
  const token = process.env.DISCOGS_USER_TOKEN;
  if (!token) {
    throw new Error('DISCOGS_USER_TOKEN environment variable is not set');
  }
  return new DiscogsClient(token);
}
