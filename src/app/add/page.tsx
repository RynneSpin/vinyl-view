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
import BarcodeScanner from '@/components/scanner/BarcodeScanner';
import Toast from '@/components/ui/Toast';
import Spinner from '@/components/ui/Spinner';
import Image from 'next/image';
import type { DiscogsSearchResult } from '@/types/discogs';

export default function AddRecordPage() {
  const router = useRouter();
  const { searchByQuery, searchByBarcode, getRelease, loading } = useDiscogs();
  const { addRecord } = useRecords();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DiscogsSearchResult[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<DiscogsSearchResult | null>(null);
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

  // Add record to collection
  const handleAddRecord = async () => {
    if (!selectedRecord) return;

    try {
      // Get full release details from Discogs
      const release = await getRelease(selectedRecord.id.toString());

      // Convert to our record format
      const recordData = discogsReleaseToRecord(release);

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
        <div className="space-y-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by artist, album, or catalog number..."
              className="flex-1"
            />
            <Button type="submit" isLoading={loading}>
              Search
            </Button>
          </form>

          {loading && <Spinner />}

          {searchResults.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((result) => (
                <Card
                  key={result.id}
                  variant={selectedRecord?.id === result.id ? 'bordered' : 'default'}
                  className="cursor-pointer hover:border-accent-purple transition-all"
                  onClick={() => setSelectedRecord(result)}
                >
                  <div className="space-y-3">
                    {result.cover_image && (
                      <div className="relative aspect-square overflow-hidden rounded-lg">
                        <Image
                          src={result.cover_image}
                          alt={result.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-vinyl-100 line-clamp-2">
                        {result.title}
                      </h4>
                      <p className="text-sm text-vinyl-400 mt-1">
                        {result.year}
                        {result.format && ` • ${result.format[0]}`}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
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
        <div className="space-y-6">
          <BarcodeScanner
            onScan={handleBarcodeScan}
            onError={(err) => setToast({ message: err, type: 'error' })}
          />

          {searchResults.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((result) => (
                <Card
                  key={result.id}
                  variant={selectedRecord?.id === result.id ? 'bordered' : 'default'}
                  className="cursor-pointer hover:border-accent-purple transition-all"
                  onClick={() => setSelectedRecord(result)}
                >
                  <div className="space-y-3">
                    {result.cover_image && (
                      <div className="relative aspect-square overflow-hidden rounded-lg">
                        <Image
                          src={result.cover_image}
                          alt={result.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-vinyl-100 line-clamp-2">
                        {result.title}
                      </h4>
                      <p className="text-sm text-vinyl-400 mt-1">
                        {result.year}
                        {result.format && ` • ${result.format[0]}`}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-vinyl-50 mb-2">Add Record</h1>
        <p className="text-vinyl-400">
          Search for a vinyl or scan its barcode to add to your collection
        </p>
      </div>

      <Card variant="elevated" className="p-6">
        <Tabs tabs={tabs} />
      </Card>

      {/* Selected Record Preview */}
      {selectedRecord && (
        <Card variant="bordered" className="mt-6 p-6">
          <h3 className="text-xl font-semibold text-vinyl-50 mb-4">
            Selected Record
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              {selectedRecord.cover_image && (
                <div className="relative aspect-square overflow-hidden rounded-lg">
                  <Image
                    src={selectedRecord.cover_image}
                    alt={selectedRecord.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-2xl font-bold text-vinyl-50">
                  {selectedRecord.title}
                </h4>
                <p className="text-vinyl-300 mt-1">
                  {selectedRecord.year}
                  {selectedRecord.country && ` • ${selectedRecord.country}`}
                </p>
                {selectedRecord.genre && selectedRecord.genre.length > 0 && (
                  <p className="text-sm text-vinyl-400 mt-2">
                    {selectedRecord.genre.join(', ')}
                  </p>
                )}
              </div>

              <Input
                label="Notes (optional)"
                placeholder="Add personal notes about this record..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <div className="flex gap-3">
                <Button onClick={handleAddRecord} isLoading={loading} className="flex-1">
                  Add to Collection
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedRecord(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

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
