'use client';

import { useState } from 'react';
import type { Record } from '@/types/record';

interface RecordFiltersProps {
  records: Record[];
  onFilterChange: (sortBy: string, order: string, genre?: string) => void;
}

export default function RecordFilters({
  records,
  onFilterChange,
}: RecordFiltersProps) {
  const [sortBy, setSortBy] = useState('dateAdded');
  const [order, setOrder] = useState('desc');
  const [selectedGenre, setSelectedGenre] = useState<string>('');

  // Get unique genres from all records
  const genres = Array.from(new Set(records.flatMap((r) => r.genres))).sort();

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    onFilterChange(newSortBy, order, selectedGenre || undefined);
  };

  const handleOrderChange = (newOrder: string) => {
    setOrder(newOrder);
    onFilterChange(sortBy, newOrder, selectedGenre || undefined);
  };

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
    onFilterChange(sortBy, order, genre || undefined);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-vinyl-900 rounded-lg border border-vinyl-800">
      {/* Sort By */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-vinyl-300">Sort by:</label>
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="px-3 py-1.5 bg-vinyl-800 border border-vinyl-700 rounded-lg text-vinyl-100 text-sm focus:outline-none focus:ring-2 focus:ring-accent-purple"
        >
          <option value="dateAdded">Date Added</option>
          <option value="artist">Artist</option>
          <option value="title">Title</option>
          <option value="year">Year</option>
        </select>
      </div>

      {/* Order */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-vinyl-300">Order:</label>
        <select
          value={order}
          onChange={(e) => handleOrderChange(e.target.value)}
          className="px-3 py-1.5 bg-vinyl-800 border border-vinyl-700 rounded-lg text-vinyl-100 text-sm focus:outline-none focus:ring-2 focus:ring-accent-purple"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {/* Genre Filter */}
      {genres.length > 0 && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-vinyl-300">Genre:</label>
          <select
            value={selectedGenre}
            onChange={(e) => handleGenreChange(e.target.value)}
            className="px-3 py-1.5 bg-vinyl-800 border border-vinyl-700 rounded-lg text-vinyl-100 text-sm focus:outline-none focus:ring-2 focus:ring-accent-purple"
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Results Count */}
      <div className="ml-auto text-sm text-vinyl-400">
        {records.length} {records.length === 1 ? 'record' : 'records'}
      </div>
    </div>
  );
}
