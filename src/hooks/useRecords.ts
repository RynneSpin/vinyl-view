'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Record, RecordFilters, CreateRecordInput } from '@/types/record';

export function useRecords(filters?: RecordFilters) {
  const router = useRouter();
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Serialize filters to avoid object reference issues
  const filtersKey = JSON.stringify(filters ?? {});
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const currentFilters = filtersRef.current;
      const params = new URLSearchParams();
      if (currentFilters?.sortBy) params.append('sortBy', currentFilters.sortBy);
      if (currentFilters?.order) params.append('order', currentFilters.order);
      if (currentFilters?.genre) params.append('genre', currentFilters.genre);
      if (currentFilters?.artist) params.append('artist', currentFilters.artist);
      if (currentFilters?.decade) params.append('decade', currentFilters.decade);
      if (currentFilters?.country) params.append('country', currentFilters.country);

      const response = await fetch(`/api/records?${params.toString()}`);

      // Handle 401 Unauthorized
      if (response.status === 401) {
        router.push('/auth/sign-in');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch records');
      }

      const data = await response.json();
      setRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filtersKey, router]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const addRecord = async (record: CreateRecordInput): Promise<Record> => {
    const response = await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      router.push('/auth/sign-in');
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to add record');
    }

    const newRecord = await response.json();
    setRecords((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const updateRecord = async (
    id: string,
    updates: Partial<CreateRecordInput>
  ): Promise<Record> => {
    const response = await fetch(`/api/records/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      router.push('/auth/sign-in');
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      throw new Error('Failed to update record');
    }

    const updatedRecord = await response.json();
    setRecords((prev) =>
      prev.map((record) => (record.id === id ? updatedRecord : record))
    );
    return updatedRecord;
  };

  const deleteRecord = async (id: string): Promise<void> => {
    const response = await fetch(`/api/records/${id}`, {
      method: 'DELETE',
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      router.push('/auth/sign-in');
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      throw new Error('Failed to delete record');
    }

    setRecords((prev) => prev.filter((record) => record.id !== id));
  };

  return {
    records,
    loading,
    error,
    refetch: fetchRecords,
    addRecord,
    updateRecord,
    deleteRecord,
  };
}
