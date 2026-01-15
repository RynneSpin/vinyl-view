import type { Record } from '@/types/record';
import Card from '../ui/Card';

interface RecordStatsProps {
  records: Record[];
}

export default function RecordStats({ records }: RecordStatsProps) {
  const totalRecords = records.length;
  const uniqueGenres = new Set(records.flatMap((r) => r.genres)).size;
  const uniqueArtists = new Set(records.map((r) => r.artist)).size;

  // Get most recent addition
  const latestRecord = records.length > 0 ? records[0] : null;

  const stats = [
    {
      label: 'Total Records',
      value: totalRecords,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
        </svg>
      ),
    },
    {
      label: 'Artists',
      value: uniqueArtists,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
    },
    {
      label: 'Genres',
      value: uniqueGenres,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="mb-6 sm:mb-8">
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} variant="elevated" className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4 text-center sm:text-left">
              <div className="p-2 sm:p-3 rounded-lg bg-accent-purple/20 text-accent-purple">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                  {stat.icon.props.children}
                </svg>
              </div>
              <div>
                <p className="text-xl sm:text-3xl font-bold text-vinyl-50">{stat.value}</p>
                <p className="text-xs sm:text-sm text-vinyl-400">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {latestRecord && (
        <Card variant="bordered" className="mt-3 sm:mt-4">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-accent-gold flex-shrink-0 mt-0.5 sm:mt-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <p className="text-xs sm:text-sm text-vinyl-300">
              <span className="sm:inline">Latest: </span>
              <span className="font-medium text-vinyl-100">
                {latestRecord.title}
              </span>{' '}
              <span className="hidden sm:inline">by </span>
              <span className="block sm:inline text-vinyl-400">{latestRecord.artist}</span>
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
