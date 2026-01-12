'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Record } from '@/types/record';
import Badge from '../ui/Badge';

interface RecordCardProps {
  record: Record;
  index: number;
}

export default function RecordCard({ record, index }: RecordCardProps) {
  const coverImage = record.coverArtUrl || '/placeholder-vinyl.png';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/records/${record.id}`}>
        <div className="group relative bg-vinyl-900 rounded-lg overflow-hidden border border-vinyl-800 hover:border-accent-purple transition-all duration-300 hover:shadow-xl hover:shadow-accent-purple/20 hover:-translate-y-1">
          {/* Album Art */}
          <div className="relative aspect-square overflow-hidden bg-vinyl-800">
            <Image
              src={coverImage}
              alt={`${record.title} by ${record.artist}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <p className="text-vinyl-100 text-sm font-medium">View Details →</p>
            </div>
          </div>

          {/* Info */}
          <div className="p-4">
            <h3 className="font-semibold text-vinyl-50 line-clamp-1 group-hover:text-accent-purple transition-colors">
              {record.title}
            </h3>
            <p className="text-sm text-vinyl-300 line-clamp-1 mt-1">
              {record.artist}
            </p>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2 text-xs text-vinyl-400">
                {record.year && <span>{record.year}</span>}
                {record.format && (
                  <>
                    <span>•</span>
                    <span>{record.format}</span>
                  </>
                )}
              </div>
              {record.genres.length > 0 && (
                <Badge variant="purple" className="text-xs">
                  {record.genres[0]}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
