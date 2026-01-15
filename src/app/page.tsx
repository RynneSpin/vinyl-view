'use client';

import { useState, useMemo } from 'react';
import { useRecords } from '@/hooks/useRecords';
import type { FingerprintFilter } from '@/types/record';
import RecordStats from '@/components/records/RecordStats';
import VinylFingerprint from '@/components/records/VinylFingerprint';
import RecordFilters from '@/components/records/RecordFilters';
import ActiveFingerprintFilter from '@/components/records/ActiveFingerprintFilter';
import RecordGrid from '@/components/records/RecordGrid';
import Spinner from '@/components/ui/Spinner';

export default function Home() {
  const [sortBy, setSortBy] = useState<'dateAdded' | 'artist' | 'title' | 'year'>('dateAdded');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [dropdownGenre, setDropdownGenre] = useState<string | undefined>(undefined);
  const [fingerprintFilters, setFingerprintFilters] = useState<FingerprintFilter[]>([]);

  // Memoize sort filters to prevent unnecessary refetches
  const sortFilters = useMemo(() => ({ sortBy, order }), [sortBy, order]);

  // Fetch all records with sorting only
  const { records: allRecords, loading, error } = useRecords(sortFilters);

  // Filter records client-side based on fingerprint filters or dropdown genre
  const filteredRecords = useMemo(() => {
    let result = allRecords;

    if (fingerprintFilters.length > 0) {
      // Group filters by type
      const genreFilters = fingerprintFilters.filter((f) => f.type === 'genre');
      const decadeFilters = fingerprintFilters.filter((f) => f.type === 'decade');
      const countryFilters = fingerprintFilters.filter((f) => f.type === 'country');

      // Apply OR within each type, AND across types
      if (genreFilters.length > 0) {
        result = result.filter((r) =>
          genreFilters.some((f) => r.genres.includes(f.value))
        );
      }

      if (decadeFilters.length > 0) {
        result = result.filter((r) =>
          decadeFilters.some((f) => {
            const decadeStart = parseInt(f.value.replace('s', ''), 10);
            return r.year && r.year >= decadeStart && r.year < decadeStart + 10;
          })
        );
      }

      if (countryFilters.length > 0) {
        result = result.filter((r) =>
          countryFilters.some((f) => r.country === f.value)
        );
      }
    } else if (dropdownGenre) {
      result = result.filter((r) => r.genres.includes(dropdownGenre));
    }

    return result;
  }, [allRecords, fingerprintFilters, dropdownGenre]);

  const handleFilterChange = (
    newSortBy: string,
    newOrder: string,
    genre?: string
  ) => {
    setSortBy(newSortBy as 'dateAdded' | 'artist' | 'title' | 'year');
    setOrder(newOrder as 'asc' | 'desc');
    setDropdownGenre(genre);
    // Clear fingerprint filters when using dropdown
    setFingerprintFilters([]);
  };

  const handleFingerprintClick = (filter: FingerprintFilter) => {
    setFingerprintFilters((prev) => {
      // Check if this filter already exists
      const existingIndex = prev.findIndex(
        (f) => f.type === filter.type && f.value === filter.value
      );

      if (existingIndex >= 0) {
        // Remove it (toggle off)
        return prev.filter((_, i) => i !== existingIndex);
      } else {
        // Add it (toggle on)
        return [...prev, filter];
      }
    });
    // Clear dropdown genre to avoid confusion
    setDropdownGenre(undefined);
  };

  const handleRemoveFilter = (filter: FingerprintFilter) => {
    setFingerprintFilters((prev) =>
      prev.filter((f) => !(f.type === filter.type && f.value === filter.value))
    );
  };

  const handleClearAllFilters = () => {
    setFingerprintFilters([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-accent-purple text-white rounded-lg hover:bg-accent-purple/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-vinyl-50 mb-1 sm:mb-2">
          Your Vinyl Collection
        </h1>
        <p className="text-sm sm:text-base text-vinyl-400">
          Browse and manage your vinyl records
        </p>
      </div>

      <RecordStats records={filteredRecords} />

      {allRecords.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <VinylFingerprint
            records={allRecords}
            activeFilters={fingerprintFilters}
            onSegmentClick={handleFingerprintClick}
          />
        </div>
      )}

      {fingerprintFilters.length > 0 && (
        <ActiveFingerprintFilter
          filters={fingerprintFilters}
          recordCount={filteredRecords.length}
          onRemoveFilter={handleRemoveFilter}
          onClearAll={handleClearAllFilters}
        />
      )}

      {fingerprintFilters.length === 0 && allRecords.length > 0 && (
        <RecordFilters records={allRecords} onFilterChange={handleFilterChange} />
      )}

      <RecordGrid records={filteredRecords} />
    </div>
  );
}
