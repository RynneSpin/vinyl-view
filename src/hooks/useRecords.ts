'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Record, RecordFilters, CreateRecordInput } from '@/types/record';

export function useRecords(filters?: RecordFilters) {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.order) params.append('order', filters.order);
      if (filters?.genre) params.append('genre', filters.genre);
      if (filters?.artist) params.append('artist', filters.artist);

      const response = await fetch(`/api/records?${params.toString()}`);

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
  }, [filters]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const addRecord = async (record: CreateRecordInput): Promise<Record> => {
    const response = await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });

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
