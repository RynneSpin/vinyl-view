import type { Record } from '@/types/record';
import RecordCard from './RecordCard';

interface RecordGridProps {
  records: Record[];
}

export default function RecordGrid({ records }: RecordGridProps) {
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 rounded-full bg-vinyl-800 flex items-center justify-center mb-6">
          <svg
            className="w-12 h-12 text-vinyl-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-vinyl-200 mb-2">
          No records yet
        </h3>
        <p className="text-vinyl-400 mb-6">
          Start building your collection by adding your first vinyl record
        </p>
        <a
          href="/add"
          className="px-6 py-3 bg-accent-purple hover:bg-accent-purple/90 text-white rounded-lg transition-colors shadow-lg shadow-accent-purple/30"
        >
          + Add Your First Record
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {records.map((record, index) => (
        <RecordCard key={record.id} record={record} index={index} />
      ))}
    </div>
  );
}
