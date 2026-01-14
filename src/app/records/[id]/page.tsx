'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { Record } from '@/types/record';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import Toast from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';

export default function RecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [record, setRecord] = useState<Record | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    fetchRecord();
  }, [resolvedParams.id]);

  const fetchRecord = async () => {
    try {
      const response = await fetch(`/api/records/${resolvedParams.id}`);

      if (!response.ok) {
        throw new Error('Record not found');
      }

      const data = await response.json();
      setRecord(data);
      setEditedNotes(data.notes || '');
    } catch (err) {
      setToast({ message: 'Failed to load record', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!record) return;

    try {
      const response = await fetch(`/api/records/${record.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: editedNotes }),
      });

      if (!response.ok) {
        throw new Error('Failed to update notes');
      }

      const updated = await response.json();
      setRecord(updated);
      setIsEditing(false);
      setToast({ message: 'Notes updated successfully', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to save notes', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!record) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${record.title}" from your collection?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/records/${record.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete record');
      }

      setToast({ message: 'Record deleted', type: 'success' });

      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (err) {
      setToast({ message: 'Failed to delete record', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="text-center py-20">
        <p className="text-vinyl-300 mb-4">Record not found</p>
        <Button onClick={() => router.push('/')}>Back to Collection</Button>
      </div>
    );
  }

  const coverImage = record.coverArtUrl || '/placeholder-vinyl.png';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto"
    >
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/')}
        className="mb-6"
      >
        ← Back to Collection
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Album Art */}
        <Card variant="elevated" className="p-0 overflow-hidden">
          <div className="relative aspect-square">
            <Image
              src={coverImage}
              alt={`${record.title} by ${record.artist}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Vinyl Disc Animation */}
          <div className="relative -mt-32 flex justify-end pr-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="w-32 h-32 rounded-full bg-gradient-to-br from-vinyl-800 via-vinyl-900 to-black border-4 border-vinyl-700 shadow-2xl"
            >
              <div className="w-full h-full rounded-full border-[6px] border-vinyl-950 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-vinyl-800" />
              </div>
            </motion.div>
          </div>
        </Card>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-vinyl-50 mb-2">
              {record.title}
            </h1>
            <p className="text-2xl text-vinyl-300">{record.artist}</p>
          </div>

          {/* Metadata Grid */}
          <Card variant="bordered">
            <div className="grid grid-cols-2 gap-4">
              {record.year && (
                <div>
                  <p className="text-sm text-vinyl-400">Year</p>
                  <p className="text-vinyl-100 font-medium">{record.year}</p>
                </div>
              )}
              {record.label && (
                <div>
                  <p className="text-sm text-vinyl-400">Label</p>
                  <p className="text-vinyl-100 font-medium">{record.label}</p>
                </div>
              )}
              {record.format && (
                <div>
                  <p className="text-sm text-vinyl-400">Format</p>
                  <p className="text-vinyl-100 font-medium">{record.format}</p>
                </div>
              )}
              {record.country && (
                <div>
                  <p className="text-sm text-vinyl-400">Country</p>
                  <p className="text-vinyl-100 font-medium">{record.country}</p>
                </div>
              )}
              {record.catno && (
                <div>
                  <p className="text-sm text-vinyl-400">Catalog #</p>
                  <p className="text-vinyl-100 font-medium">{record.catno}</p>
                </div>
              )}
              {record.speed && (
                <div>
                  <p className="text-sm text-vinyl-400">Speed</p>
                  <p className="text-vinyl-100 font-medium">{record.speed}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Genres & Styles */}
          {(record.genres.length > 0 || record.styles.length > 0) && (
            <Card variant="default">
              {record.genres.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm text-vinyl-400 mb-2">Genres</p>
                  <div className="flex flex-wrap gap-2">
                    {record.genres.map((genre) => (
                      <Badge key={genre} variant="purple">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {record.styles.length > 0 && (
                <div>
                  <p className="text-sm text-vinyl-400 mb-2">Styles</p>
                  <div className="flex flex-wrap gap-2">
                    {record.styles.map((style) => (
                      <Badge key={style} variant="blue">
                        {style}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Tracklist */}
          {record.tracklist && record.tracklist.length > 0 && (
            <Card variant="default">
              <p className="text-sm text-vinyl-400 mb-3">Tracklist</p>
              <div className="space-y-1">
                {record.tracklist.map((track, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-sm py-1.5 border-b border-vinyl-800 last:border-0"
                  >
                    <span className="text-vinyl-500 w-8 flex-shrink-0 font-mono">
                      {track.position || '-'}
                    </span>
                    <span className="text-vinyl-100 flex-1">
                      {track.title}
                    </span>
                    {track.duration && (
                      <span className="text-vinyl-500 flex-shrink-0 font-mono">
                        {track.duration}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Notes */}
          <Card variant="default">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-vinyl-300">Personal Notes</p>
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  className="w-full px-4 py-2 bg-vinyl-800 border border-vinyl-700 rounded-lg text-vinyl-50 placeholder-vinyl-400 focus:outline-none focus:ring-2 focus:ring-accent-purple resize-none"
                  rows={4}
                  placeholder="Add your notes..."
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveNotes}>
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedNotes(record.notes || '');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-vinyl-100">
                {record.notes || 'No notes yet'}
              </p>
            )}
          </Card>

          {/* Additional Info */}
          <Card variant="bordered">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-vinyl-400">Added to collection</span>
                <span className="text-vinyl-200">
                  {formatDate(record.dateAdded)}
                </span>
              </div>
              {record.discogsUrl && (
                <div className="pt-2 border-t border-vinyl-800">
                  <a
                    href={record.discogsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-purple hover:text-accent-purple/80 transition-colors inline-flex items-center gap-1"
                  >
                    View on Discogs
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </Card>

          {/* Delete Button */}
          <Button
            variant="danger"
            className="w-full"
            onClick={handleDelete}
          >
            Delete from Collection
          </Button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </motion.div>
  );
}
