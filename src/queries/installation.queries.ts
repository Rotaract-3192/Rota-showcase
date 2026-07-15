import { useQuery } from '@tanstack/react-query';
import type { QueryOptions } from '@/types/api.types';

export const installationKeys = {
  all: ['installation'] as const,
  lists: () => [...installationKeys.all, 'list'] as const,
  list: (filters: string) => [...installationKeys.lists(), filters] as const,
  detail: (id: string) => [...installationKeys.all, 'detail', id] as const,
};

async function fetchInstallations(options: QueryOptions = {}) {
  const params = new URLSearchParams();

  if (options.pagination?.page) params.set('page', String(options.pagination.page));
  if (options.pagination?.pageSize) params.set('pageSize', String(options.pagination.pageSize));
  if (options.sort?.column) {
    params.set('sortColumn', options.sort.column);
    params.set('sortAsc', String(options.sort.ascending ?? true));
  }
  if (options.search?.query) params.set('search', options.search.query);

  const res = await fetch(`/api/installations?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch installations');
  }
  return res.json();
}

async function fetchInstallation(id: string) {
  const res = await fetch(`/api/installations?id=${encodeURIComponent(id)}`);
  if (!res.ok) {
    throw new Error('Failed to fetch installation');
  }
  return res.json();
}

export function useInstallationList(options: QueryOptions = {}) {
  return useQuery({
    queryKey: installationKeys.list(JSON.stringify(options)),
    queryFn: () => fetchInstallations(options),
  });
}

export function useInstallation(id: string) {
  return useQuery({
    queryKey: installationKeys.detail(id),
    queryFn: () => fetchInstallation(id),
    enabled: !!id,
  });
}
