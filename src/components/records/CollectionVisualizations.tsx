'use client';

import { useState } from 'react';
import type { Record, FingerprintFilter } from '@/types/record';
import VinylFingerprint from './VinylFingerprint';
import FestivalPoster from './FestivalPoster';

interface CollectionVisualizationsProps {
  records: Record[];
  activeFilters?: FingerprintFilter[];
  onSegmentClick?: (filter: FingerprintFilter) => void;
}

interface Visualization {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const VISUALIZATIONS: Visualization[] = [
  {
    id: 'fingerprint',
    name: 'Vinyl Fingerprint',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.7" />
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    ),
    description: 'Your collection by genre, decade & country',
  },
  {
    id: 'festival',
    name: 'Festival Poster',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h8v2H8V8zm0 4h8v1H8v-1zm0 2h6v1H8v-1z" />
      </svg>
    ),
    description: 'Top artists as a concert lineup',
  },
];

export default function CollectionVisualizations({
  records,
  activeFilters = [],
  onSegmentClick,
}: CollectionVisualizationsProps) {
  const [activeViz, setActiveViz] = useState<string>('fingerprint');

  if (records.length === 0) return null;

  return (
    <div>
      {/* Visualization Selector */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {VISUALIZATIONS.map((viz) => (
          <button
            key={viz.id}
            onClick={() => setActiveViz(viz.id)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
              transition-all duration-200
              ${activeViz === viz.id
                ? 'bg-accent-purple text-white shadow-lg shadow-accent-purple/25'
                : 'bg-vinyl-800 text-vinyl-300 hover:bg-vinyl-700 hover:text-vinyl-100'
              }
            `}
          >
            <span className={activeViz === viz.id ? 'text-white' : 'text-vinyl-400'}>
              {viz.icon}
            </span>
            <span className="hidden sm:inline">{viz.name}</span>
          </button>
        ))}
      </div>

      {/* Active Visualization */}
      <div>
        {activeViz === 'fingerprint' && (
          <VinylFingerprint
            records={records}
            activeFilters={activeFilters}
            onSegmentClick={onSegmentClick}
          />
        )}
        {activeViz === 'festival' && (
          <FestivalPoster records={records} />
        )}
      </div>
    </div>
  );
}
