import { useQuery } from '@tanstack/react-query';
import type { QueryOptions } from '@/types/api.types';

export const activityKeys = {
  all: ['activity'] as const,
  lists: () => [...activityKeys.all, 'list'] as const,
  list: (filters: string) => [...activityKeys.lists(), filters] as const,
  detail: (id: string) => [...activityKeys.all, 'detail', id] as const,
};

async function fetchActivities(options: QueryOptions = {}) {
  const params = new URLSearchParams();
  
  if (options.pagination?.page) params.set('page', String(options.pagination.page));
  if (options.pagination?.pageSize) params.set('pageSize', String(options.pagination.pageSize));
  if (options.sort?.column) {
    params.set('sortColumn', options.sort.column);
    params.set('sortAsc', String(options.sort.ascending ?? true));
  }
  if (options.search?.query) params.set('search', options.search.query);
  if (options.filters?.club_id) params.set('club_id', String(options.filters.club_id));

  const res = await fetch(`/api/activities?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch activities');
  }
  return res.json();
}

async function fetchActivity(id: string) {
  const res = await fetch(`/api/activities?id=${encodeURIComponent(id)}`);
  if (!res.ok) {
    throw new Error('Failed to fetch activity');
  }
  return res.json();
}

export function useActivityList(options: QueryOptions = {}) {
  return useQuery({
    queryKey: activityKeys.list(JSON.stringify(options)),
    queryFn: () => fetchActivities(options),
  });
}

export function useActivity(id: string) {
  return useQuery({
    queryKey: activityKeys.detail(id),
    queryFn: () => fetchActivity(id),
    enabled: !!id,
  });
}
