/**
 * Type definitions for Discogs API responses
 */

export interface DiscogsSearchResult {
  id: number;
  type: string;
  title: string;
  master_id?: number;
  master_url?: string;
  uri: string;
  resource_url: string;
  thumb: string;
  cover_image: string;
  country?: string;
  year?: string;
  format?: string[];
  label?: string[];
  genre?: string[];
  style?: string[];
  barcode?: string[];
  catno?: string;
}

export interface DiscogsSearchResponse {
  pagination: {
    page: number;
    pages: number;
    per_page: number;
    items: number;
    urls: {
      last?: string;
      next?: string;
    };
  };
  results: DiscogsSearchResult[];
}

export interface DiscogsArtist {
  name: string;
  anv?: string;
  join?: string;
  role?: string;
  tracks?: string;
  id: number;
  resource_url: string;
}

export interface DiscogsLabel {
  name: string;
  catno: string;
  entity_type: string;
  id: number;
  resource_url: string;
}

export interface DiscogsFormat {
  name: string;
  qty: string;
  text?: string;
  descriptions?: string[];
}

export interface DiscogsTrack {
  position: string;
  type_: string;
  title: string;
  duration: string;
}

export interface DiscogsVideo {
  uri: string;
  title: string;
  description: string;
  duration: number;
  embed: boolean;
}

export interface DiscogsImage {
  type: string;
  uri: string;
  resource_url: string;
  uri150: string;
  width: number;
  height: number;
}

export interface DiscogsCommunity {
  have: number;
  want: number;
  rating: {
    count: number;
    average: number;
  };
  submitter: {
    username: string;
    resource_url: string;
  };
  contributors: Array<{
    username: string;
    resource_url: string;
  }>;
  data_quality: string;
  status: string;
}

export interface DiscogsRelease {
  id: number;
  status: string;
  year: number;
  resource_url: string;
  uri: string;
  artists: DiscogsArtist[];
  artists_sort: string;
  labels: DiscogsLabel[];
  formats: DiscogsFormat[];
  genres: string[];
  styles: string[];
  title: string;
  country: string;
  released: string;
  notes?: string;
  released_formatted?: string;
  identifiers?: Array<{
    type: string;
    value: string;
  }>;
  videos?: DiscogsVideo[];
  images?: DiscogsImage[];
  thumb?: string;
  tracklist?: DiscogsTrack[];
  extraartists?: DiscogsArtist[];
  master_id?: number;
  master_url?: string;
  community?: DiscogsCommunity;
  estimated_weight?: number;
  data_quality?: string;
}

/**
 * Helper type for converting Discogs release to our Record type
 */
export interface DiscogsToRecordMapping {
  title: string;
  artist: string;
  label?: string;
  year?: number;
  discogsId: string;
  discogsUrl: string;
  upc?: string;
  catno?: string;
  format?: string;
  formatDesc?: string;
  speed?: string;
  genres: string[];
  styles: string[];
  coverArtUrl?: string;
  thumbnailUrl?: string;
  country?: string;
  released?: string;
}
