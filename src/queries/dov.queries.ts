import { useQuery } from '@tanstack/react-query';
import type { QueryOptions } from '@/types/api.types';

export const dovKeys = {
  all: ['dov'] as const,
  lists: () => [...dovKeys.all, 'list'] as const,
  list: (filters: string) => [...dovKeys.lists(), filters] as const,
  detail: (id: string) => [...dovKeys.all, 'detail', id] as const,
};

async function fetchDovs(options: QueryOptions = {}) {
  const params = new URLSearchParams();

  if (options.pagination?.page) params.set('page', String(options.pagination.page));
  if (options.pagination?.pageSize) params.set('pageSize', String(options.pagination.pageSize));
  if (options.sort?.column) {
    params.set('sortColumn', options.sort.column);
    params.set('sortAsc', String(options.sort.ascending ?? true));
  }
  if (options.search?.query) params.set('search', options.search.query);

  const res = await fetch(`/api/dov?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch dovs');
  }
  return res.json();
}

async function fetchDov(id: string) {
  const res = await fetch(`/api/dov?id=${encodeURIComponent(id)}`);
  if (!res.ok) {
    throw new Error('Failed to fetch dov');
  }
  return res.json();
}

export function useDovList(options: QueryOptions = {}) {
  return useQuery({
    queryKey: dovKeys.list(JSON.stringify(options)),
    queryFn: () => fetchDovs(options),
  });
}

export function useDov(id: string) {
  return useQuery({
    queryKey: dovKeys.detail(id),
    queryFn: () => fetchDov(id),
    enabled: !!id,
  });
}
