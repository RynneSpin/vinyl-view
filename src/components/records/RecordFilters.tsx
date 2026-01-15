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
    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-vinyl-900 rounded-lg border border-vinyl-800">
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4">
        {/* Mobile: Sort and Order in one row */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Sort By */}
          <div className="flex items-center gap-2 flex-1 sm:flex-none">
            <label className="text-xs sm:text-sm font-medium text-vinyl-300 whitespace-nowrap">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 bg-vinyl-800 border border-vinyl-700 rounded-lg text-vinyl-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent-purple"
            >
              <option value="dateAdded">Date Added</option>
              <option value="artist">Artist</option>
              <option value="title">Title</option>
              <option value="year">Year</option>
            </select>
          </div>

          {/* Order */}
          <div className="flex items-center gap-2 flex-1 sm:flex-none">
            <label className="text-xs sm:text-sm font-medium text-vinyl-300 hidden sm:inline">Order:</label>
            <select
              value={order}
              onChange={(e) => handleOrderChange(e.target.value)}
              className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 bg-vinyl-800 border border-vinyl-700 rounded-lg text-vinyl-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent-purple"
            >
              <option value="asc">↑ Asc</option>
              <option value="desc">↓ Desc</option>
            </select>
          </div>
        </div>

        {/* Genre Filter - full width on mobile */}
        {genres.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-xs sm:text-sm font-medium text-vinyl-300">Genre:</label>
            <select
              value={selectedGenre}
              onChange={(e) => handleGenreChange(e.target.value)}
              className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 bg-vinyl-800 border border-vinyl-700 rounded-lg text-vinyl-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent-purple"
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
        <div className="sm:ml-auto text-xs sm:text-sm text-vinyl-400">
          {records.length} {records.length === 1 ? 'record' : 'records'}
        </div>
      </div>
    </div>
  );
}
