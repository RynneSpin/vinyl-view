/**
 * Type definitions for vinyl records
 */

export interface Record {
  id: string;
  title: string;
  artist: string;
  label?: string | null;
  year?: number | null;
  discogsId?: string | null;
  discogsUrl?: string | null;
  upc?: string | null;
  catno?: string | null;
  format?: string | null;
  formatDesc?: string | null;
  speed?: string | null;
  genres: string[];
  styles: string[];
  coverArtUrl?: string | null;
  thumbnailUrl?: string | null;
  country?: string | null;
  released?: string | null;
  notes?: string | null;
  dateAdded: Date;
  dateUpdated: Date;
}

export interface CreateRecordInput {
  title: string;
  artist: string;
  label?: string;
  year?: number;
  discogsId?: string;
  discogsUrl?: string;
  upc?: string;
  catno?: string;
  format?: string;
  formatDesc?: string;
  speed?: string;
  genres?: string[];
  styles?: string[];
  coverArtUrl?: string;
  thumbnailUrl?: string;
  country?: string;
  released?: string;
  notes?: string;
}

export interface UpdateRecordInput {
  title?: string;
  artist?: string;
  label?: string;
  year?: number;
  notes?: string;
}

export interface RecordFilters {
  genre?: string;
  artist?: string;
  year?: number;
  sortBy?: 'dateAdded' | 'artist' | 'title' | 'year';
  order?: 'asc' | 'desc';
}
