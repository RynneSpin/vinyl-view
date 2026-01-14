import type { DiscogsRelease, DiscogsSearchResult } from '@/types/discogs';
import type { CreateRecordInput } from '@/types/record';

/**
 * Convert a Discogs release to our Record format
 */
export function discogsReleaseToRecord(release: DiscogsRelease): CreateRecordInput {
  // Extract primary artist
  const artist = release.artists?.[0]?.name || release.artists_sort || 'Unknown Artist';

  // Extract label
  const label = release.labels?.[0]?.name;

  // Extract catalog number
  const catno = release.labels?.[0]?.catno;

  // Extract format details
  const format = release.formats?.[0]?.name;
  const formatDescriptions = release.formats?.[0]?.descriptions || [];
  const formatText = release.formats?.[0]?.text;

  // Build format description
  let formatDesc = format || '';
  if (formatDescriptions.length > 0) {
    formatDesc += `, ${formatDescriptions.join(', ')}`;
  }
  if (formatText) {
    formatDesc += ` (${formatText})`;
  }

  // Extract speed (usually in format descriptions like "33 ⅓ RPM")
  const speed = formatDescriptions.find(desc => desc.includes('RPM'));

  // Extract UPC from identifiers
  const upc = release.identifiers?.find(
    id => id.type === 'Barcode'
  )?.value;

  // Extract cover art
  const coverArtUrl = release.images?.[0]?.uri || release.thumb;
  const thumbnailUrl = release.images?.[0]?.uri150 || release.thumb;

  // Extract tracklist (filter out headings/sub-tracks without titles)
  const tracklist = release.tracklist
    ?.filter(track => track.title && track.type_ !== 'heading')
    .map(track => ({
      position: track.position || '',
      title: track.title,
      duration: track.duration || '',
    }));

  return {
    title: release.title,
    artist,
    label,
    year: release.year,
    discogsId: release.id.toString(),
    discogsUrl: release.uri,
    upc,
    catno,
    format,
    formatDesc: formatDesc || undefined,
    speed,
    genres: release.genres || [],
    styles: release.styles || [],
    tracklist,
    coverArtUrl,
    thumbnailUrl,
    country: release.country,
    released: release.released,
  };
}

/**
 * Convert a Discogs search result to a preview format
 */
export function discogsSearchResultToPreview(result: DiscogsSearchResult) {
  return {
    discogsId: result.id.toString(),
    title: result.title,
    year: result.year,
    coverImage: result.cover_image,
    thumbnail: result.thumb,
    format: result.format?.[0],
    label: result.label?.[0],
    genre: result.genre?.[0],
    country: result.country,
  };
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

/**
 * Format a relative date (e.g., "2 days ago")
 */
export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Truncate text to a maximum length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Class name helper for conditional classes
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
