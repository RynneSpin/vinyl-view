import type { Record } from '@/types/record';
import RecordCard from './RecordCard';

interface RecordGridProps {
  records: Record[];
}

export default function RecordGrid({ records }: RecordGridProps) {
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center px-4">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-vinyl-800 flex items-center justify-center mb-4 sm:mb-6">
          <svg
            className="w-10 h-10 sm:w-12 sm:h-12 text-vinyl-500"
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
        <h3 className="text-xl sm:text-2xl font-semibold text-vinyl-200 mb-1 sm:mb-2">
          No records yet
        </h3>
        <p className="text-sm sm:text-base text-vinyl-400 mb-4 sm:mb-6">
          Start building your collection by adding your first vinyl record
        </p>
        <a
          href="/add"
          className="px-4 sm:px-6 py-2.5 sm:py-3 bg-accent-purple hover:bg-accent-purple/90 text-white rounded-lg transition-colors shadow-lg shadow-accent-purple/30 text-sm sm:text-base"
        >
          + Add Your First Record
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
      {records.map((record, index) => (
        <RecordCard key={record.id} record={record} index={index} />
      ))}
    </div>
  );
}
