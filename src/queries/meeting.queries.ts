import { useQuery } from '@tanstack/react-query';
import type { QueryOptions } from '@/types/api.types';

const BASE_URL = '/api/meetings';

export const meetingKeys = {
  all: ['meeting'] as const,
  lists: () => [...meetingKeys.all, 'list'] as const,
  list: (filters: string) => [...meetingKeys.lists(), filters] as const,
  detail: (id: string) => [...meetingKeys.all, 'detail', id] as const,
};

async function fetchMeetingList(options: QueryOptions = {}) {
  const params = new URLSearchParams();

  if (options.pagination) {
    params.set('page', String(options.pagination.page));
    params.set('pageSize', String(options.pagination.pageSize));
  }
  if (options.sort && options.sort.column) {
    params.set('sortColumn', options.sort.column);
    params.set('sortAsc', String(options.sort.ascending));
  }
  if (options.search && options.search.query) {
    params.set('search', options.search.query);
  }

  const res = await fetch(`${BASE_URL}?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch meetings: ${res.statusText}`);
  }
  return res.json();
}

async function fetchMeetingById(id: string) {
  const res = await fetch(`${BASE_URL}?id=${encodeURIComponent(id)}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch meeting ${id}: ${res.statusText}`);
  }
  return res.json();
}

export function useMeetingList(options: QueryOptions = {}) {
  return useQuery({
    queryKey: meetingKeys.list(JSON.stringify(options)),
    queryFn: () => fetchMeetingList(options),
  });
}

export function useMeeting(id: string) {
  return useQuery({
    queryKey: meetingKeys.detail(id),
    queryFn: () => fetchMeetingById(id),
    enabled: !!id,
  });
}
