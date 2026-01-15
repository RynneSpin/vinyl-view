'use client';

import { useState } from 'react';
import { useRecords } from '@/hooks/useRecords';
import RecordStats from '@/components/records/RecordStats';
import VinylFingerprint from '@/components/records/VinylFingerprint';
import RecordFilters from '@/components/records/RecordFilters';
import RecordGrid from '@/components/records/RecordGrid';
import Spinner from '@/components/ui/Spinner';

export default function Home() {
  const [filters, setFilters] = useState({
    sortBy: 'dateAdded' as 'dateAdded' | 'artist' | 'title' | 'year',
    order: 'desc' as 'asc' | 'desc',
    genre: undefined as string | undefined,
  });

  const { records, loading, error } = useRecords(filters);

  const handleFilterChange = (
    sortBy: string,
    order: string,
    genre?: string
  ) => {
    setFilters({
      sortBy: sortBy as 'dateAdded' | 'artist' | 'title' | 'year',
      order: order as 'asc' | 'desc',
      genre,
    });
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

      <RecordStats records={records} />

      {records.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <VinylFingerprint records={records} />
        </div>
      )}

      {records.length > 0 && (
        <RecordFilters records={records} onFilterChange={handleFilterChange} />
      )}

      <RecordGrid records={records} />
    </div>
  );
}
