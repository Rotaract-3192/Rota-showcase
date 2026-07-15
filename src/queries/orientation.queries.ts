import { useQuery } from '@tanstack/react-query';
import type { QueryOptions } from '@/types/api.types';

export const orientationKeys = {
  all: ['orientation'] as const,
  lists: () => [...orientationKeys.all, 'list'] as const,
  list: (filters: string) => [...orientationKeys.lists(), filters] as const,
  detail: (id: string) => [...orientationKeys.all, 'detail', id] as const,
};

async function fetchOrientations(options: QueryOptions = {}) {
  const params = new URLSearchParams();

  if (options.pagination?.page) params.set('page', String(options.pagination.page));
  if (options.pagination?.pageSize) params.set('pageSize', String(options.pagination.pageSize));
  if (options.sort?.column) {
    params.set('sortColumn', options.sort.column);
    params.set('sortAsc', String(options.sort.ascending ?? true));
  }
  if (options.search?.query) params.set('search', options.search.query);

  const res = await fetch(`/api/orientations?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch orientations');
  }
  return res.json();
}

async function fetchOrientation(id: string) {
  const res = await fetch(`/api/orientations?id=${encodeURIComponent(id)}`);
  if (!res.ok) {
    throw new Error('Failed to fetch orientation');
  }
  return res.json();
}

export function useOrientationList(options: QueryOptions = {}) {
  return useQuery({
    queryKey: orientationKeys.list(JSON.stringify(options)),
    queryFn: () => fetchOrientations(options),
  });
}

export function useOrientation(id: string) {
  return useQuery({
    queryKey: orientationKeys.detail(id),
    queryFn: () => fetchOrientation(id),
    enabled: !!id,
  });
}
