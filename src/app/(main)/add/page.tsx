'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDiscogs } from '@/hooks/useDiscogs';
import { useRecords } from '@/hooks/useRecords';
import { discogsReleaseToRecord } from '@/lib/utils';
import Tabs, { Tab } from '@/components/ui/Tabs';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import BarcodeScanner from '@/components/scanner/BarcodeScanner';
import Toast from '@/components/ui/Toast';
import Spinner from '@/components/ui/Spinner';
import Image from 'next/image';
import type { DiscogsSearchResult, DiscogsRelease } from '@/types/discogs';

export default function AddRecordPage() {
  const router = useRouter();
  const { searchByQuery, searchByBarcode, getRelease, loading } = useDiscogs();
  const { records: collection, addRecord } = useRecords();

  // Create a Set of owned discogsIds for quick lookup
  const ownedDiscogsIds = new Set(
    collection
      .filter((r) => r.discogsId)
      .map((r) => r.discogsId)
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DiscogsSearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<DiscogsSearchResult | null>(null);
  const [fullRelease, setFullRelease] = useState<DiscogsRelease | null>(null);
  const [loadingRelease, setLoadingRelease] = useState(false);
  const [notes, setNotes] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Search by artist/album
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    try {
      const response = await searchByQuery(searchQuery);
      setSearchResults(response.results || []);

      if (response.results.length === 0) {
        setToast({ message: 'No results found', type: 'info' });
      }
    } catch (err) {
      setToast({ message: 'Search failed', type: 'error' });
    }
  };

  // Handle barcode scan
  const handleBarcodeScan = async (barcode: string) => {
    try {
      setToast({ message: `Searching for barcode: ${barcode}`, type: 'info' });
      const response = await searchByBarcode(barcode);

      if (response.results.length > 0) {
        setSearchResults(response.results);
        setToast({ message: 'Found matching records!', type: 'success' });
      } else {
        setToast({ message: 'No records found for this barcode', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Barcode search failed', type: 'error' });
    }
  };

  // Handle selecting a record from search results
  const handleSelectRecord = async (result: DiscogsSearchResult) => {
    setSelectedResult(result);
    setFullRelease(null);
    setLoadingRelease(true);
    setNotes('');

    try {
      const release = await getRelease(result.id.toString());
      setFullRelease(release);
    } catch (err) {
      setToast({ message: 'Failed to load record details', type: 'error' });
      setSelectedResult(null);
    } finally {
      setLoadingRelease(false);
    }
  };

  // Close the modal
  const handleCloseModal = () => {
    setSelectedResult(null);
    setFullRelease(null);
    setNotes('');
  };

  // Add record to collection
  const handleAddRecord = async () => {
    if (!fullRelease) return;

    try {
      // Convert to our record format
      const recordData = discogsReleaseToRecord(fullRelease);

      // Add notes if any
      if (notes.trim()) {
        recordData.notes = notes;
      }

      // Save to database
      await addRecord(recordData);

      setToast({ message: 'Record added to your collection!', type: 'success' });

      // Navigate back to collection after a delay
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add record';
      setToast({ message: errorMessage, type: 'error' });
    }
  };

  const tabs: Tab[] = [
    {
      id: 'search',
      label: 'Search',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
      content: (
        <div className="space-y-4 sm:space-y-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search artist, album..."
              className="flex-1"
            />
            <Button type="submit" isLoading={loading} className="w-full sm:w-auto">
              Search
            </Button>
          </form>

          {loading && <Spinner />}

          {searchResults.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              {searchResults.map((result) => {
                const isOwned = ownedDiscogsIds.has(result.id.toString());
                return (
                  <Card
                    key={result.id}
                    variant={selectedResult?.id === result.id ? 'bordered' : 'default'}
                    className="cursor-pointer hover:border-accent-purple transition-all p-2 sm:p-4"
                    onClick={() => handleSelectRecord(result)}
                  >
                    <div className="space-y-2 sm:space-y-3">
                      {result.cover_image && (
                        <div className="relative aspect-square overflow-hidden rounded-lg">
                          <Image
                            src={result.cover_image}
                            alt={result.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          />
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs sm:text-sm font-medium text-vinyl-100 line-clamp-2">
                          {result.title}
                        </h4>
                        <div className="flex items-center justify-between gap-1 sm:gap-2 mt-1">
                          <p className="text-xs text-vinyl-400 truncate">
                            {result.year}
                            {result.format && <span className="hidden sm:inline"> • {result.format[0]}</span>}
                          </p>
                          {isOwned && (
                            <Badge variant="green" className="text-xs px-1.5 py-0.5">Owned</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'scan',
      label: 'Scan Barcode',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
          />
        </svg>
      ),
      content: (
        <div className="space-y-4 sm:space-y-6">
          <BarcodeScanner
            onScan={handleBarcodeScan}
            onError={(err) => setToast({ message: err, type: 'error' })}
          />

          {searchResults.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              {searchResults.map((result) => {
                const isOwned = ownedDiscogsIds.has(result.id.toString());
                return (
                  <Card
                    key={result.id}
                    variant={selectedResult?.id === result.id ? 'bordered' : 'default'}
                    className="cursor-pointer hover:border-accent-purple transition-all p-2 sm:p-4"
                    onClick={() => handleSelectRecord(result)}
                  >
                    <div className="space-y-2 sm:space-y-3">
                      {result.cover_image && (
                        <div className="relative aspect-square overflow-hidden rounded-lg">
                          <Image
                            src={result.cover_image}
                            alt={result.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          />
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs sm:text-sm font-medium text-vinyl-100 line-clamp-2">
                          {result.title}
                        </h4>
                        <div className="flex items-center justify-between gap-1 sm:gap-2 mt-1">
                          <p className="text-xs text-vinyl-400 truncate">
                            {result.year}
                            {result.format && <span className="hidden sm:inline"> • {result.format[0]}</span>}
                          </p>
                          {isOwned && (
                            <Badge variant="green" className="text-xs px-1.5 py-0.5">Owned</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-vinyl-50 mb-1 sm:mb-2">Add Record</h1>
        <p className="text-sm sm:text-base text-vinyl-400">
          Search for a vinyl or scan its barcode to add to your collection
        </p>
      </div>

      <Card variant="elevated" className="p-3 sm:p-6">
        <Tabs tabs={tabs} />
      </Card>

      {/* Selected Record Modal */}
      <Modal
        isOpen={!!selectedResult}
        onClose={handleCloseModal}
        title="Add to Collection"
        size="lg"
      >
        {loadingRelease ? (
          <div className="flex items-center justify-center py-8 sm:py-12">
            <Spinner size="lg" />
          </div>
        ) : fullRelease ? (
          <div className="space-y-3 sm:space-y-4">
            {/* Header with album art and basic info */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
              {/* Album Art */}
              {(fullRelease.images?.[0]?.uri || fullRelease.thumb) && (
                <div className="relative w-24 h-24 sm:w-40 sm:h-40 flex-shrink-0 mx-auto sm:mx-0">
                  <Image
                    src={fullRelease.images?.[0]?.uri || fullRelease.thumb || ''}
                    alt={fullRelease.title}
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 640px) 96px, 160px"
                  />
                </div>
              )}

              {/* Details */}
              <div className="flex-1 text-center sm:text-left">
                <h4 className="text-lg sm:text-2xl font-bold text-vinyl-50 line-clamp-2">
                  {fullRelease.title}
                </h4>
                <p className="text-base sm:text-lg text-vinyl-200 mt-0.5 sm:mt-1">
                  {fullRelease.artists?.[0]?.name || 'Unknown Artist'}
                </p>
                <p className="text-sm sm:text-base text-vinyl-400 mt-0.5 sm:mt-1">
                  {fullRelease.year}
                  {fullRelease.country && ` • ${fullRelease.country}`}
                </p>
                {fullRelease.labels?.[0] && (
                  <p className="text-xs sm:text-sm text-vinyl-400 mt-1 sm:mt-2">
                    <span className="text-vinyl-500">Label:</span>{' '}
                    {fullRelease.labels[0].name}
                    {fullRelease.labels[0].catno && ` (${fullRelease.labels[0].catno})`}
                  </p>
                )}
                {fullRelease.genres && fullRelease.genres.length > 0 && (
                  <p className="text-xs sm:text-sm text-vinyl-400 mt-1">
                    {fullRelease.genres.join(', ')}
                  </p>
                )}
                {fullRelease.community?.rating?.average != null && fullRelease.community.rating.average > 0 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                            star <= Math.round(fullRelease.community!.rating.average)
                              ? 'text-accent-gold'
                              : 'text-vinyl-600'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs sm:text-sm text-vinyl-200 font-medium">
                      {fullRelease.community.rating.average.toFixed(1)}
                    </span>
                    <span className="text-xs text-vinyl-400">
                      ({fullRelease.community.rating.count.toLocaleString()} ratings)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Tracklist */}
            {fullRelease.tracklist && fullRelease.tracklist.length > 0 && (
              <div className="border-t border-vinyl-700 pt-3 sm:pt-4">
                <h5 className="text-xs sm:text-sm font-medium text-vinyl-300 mb-2">Tracklist</h5>
                <div className="max-h-36 sm:max-h-48 overflow-y-auto space-y-0.5 sm:space-y-1">
                  {fullRelease.tracklist.map((track, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm py-0.5 sm:py-1"
                    >
                      <span className="text-vinyl-500 w-6 sm:w-8 flex-shrink-0 font-mono">
                        {track.position || '-'}
                      </span>
                      <span className="text-vinyl-100 flex-1 truncate">
                        {track.title}
                      </span>
                      {track.duration && (
                        <span className="text-vinyl-500 flex-shrink-0 font-mono text-xs">
                          {track.duration}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes input */}
            <div className="border-t border-vinyl-700 pt-3 sm:pt-4">
              <Input
                label="Notes (optional)"
                placeholder="Add notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-sm"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
              <Button variant="ghost" onClick={handleCloseModal} className="sm:order-1">
                Cancel
              </Button>
              <Button onClick={handleAddRecord} isLoading={loading} className="flex-1 sm:order-2">
                Add to Collection
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
