import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';
import type { QueryOptions } from '@/types/api.types';

export const analyticsKeys = {
  all: ['analytics'] as const,
  lists: () => [...analyticsKeys.all, 'list'] as const,
  list: (filters: string) => [...analyticsKeys.lists(), filters] as const,
  detail: (id: string) => [...analyticsKeys.all, 'detail', id] as const,
};

export function useAnalyticsList(options: QueryOptions = {}) {
  return useQuery({
    queryKey: analyticsKeys.list(JSON.stringify(options)),
    queryFn: () => analyticsService.findMany(options),
  });
}

export function useAnalytics(id: string) {
  return useQuery({
    queryKey: analyticsKeys.detail(id),
    queryFn: () => analyticsService.getById(id),
    enabled: !!id,
  });
}
