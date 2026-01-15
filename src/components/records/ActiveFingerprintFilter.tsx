'use client';

import type { FingerprintFilter } from '@/types/record';
import Badge from '../ui/Badge';

interface ActiveFingerprintFilterProps {
  filters: FingerprintFilter[];
  recordCount: number;
  onRemoveFilter: (filter: FingerprintFilter) => void;
  onClearAll: () => void;
}

const filterTypeColors: Record<string, 'purple' | 'pink' | 'blue'> = {
  genre: 'purple',
  decade: 'pink',
  country: 'blue',
};

const filterTypeLabels: Record<string, string> = {
  genre: 'Genre',
  decade: 'Decade',
  country: 'Country',
};

export default function ActiveFingerprintFilter({
  filters,
  recordCount,
  onRemoveFilter,
  onClearAll,
}: ActiveFingerprintFilterProps) {
  return (
    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-vinyl-900 rounded-lg border border-vinyl-800">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs sm:text-sm text-vinyl-400">Filtered by:</span>
          {filters.map((filter) => (
            <button
              key={`${filter.type}-${filter.value}`}
              onClick={() => onRemoveFilter(filter)}
              className="group inline-flex items-center gap-1.5"
            >
              <Badge variant={filterTypeColors[filter.type]} className="pr-1.5">
                {filterTypeLabels[filter.type]}: {filter.value}
                <svg
                  className="w-3 h-3 ml-1 opacity-60 group-hover:opacity-100"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Badge>
            </button>
          ))}
          <span className="text-xs sm:text-sm text-vinyl-400">
            ({recordCount} {recordCount === 1 ? 'record' : 'records'})
          </span>
        </div>
        {filters.length > 1 && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm bg-vinyl-800 hover:bg-vinyl-700 text-vinyl-300 hover:text-vinyl-100 rounded-lg transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}
