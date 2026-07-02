import { useQuery } from '@tanstack/react-query';
import { activityService } from '@/services/activity.service';
import type { QueryOptions } from '@/types/api.types';

export const activityKeys = {
  all: ['activity'] as const,
  lists: () => [...activityKeys.all, 'list'] as const,
  list: (filters: string) => [...activityKeys.lists(), filters] as const,
  detail: (id: string) => [...activityKeys.all, 'detail', id] as const,
};

export function useActivityList(options: QueryOptions = {}) {
  return useQuery({
    queryKey: activityKeys.list(JSON.stringify(options)),
    queryFn: () => activityService.findMany(options),
  });
}

export function useActivity(id: string) {
  return useQuery({
    queryKey: activityKeys.detail(id),
    queryFn: () => activityService.getById(id),
    enabled: !!id,
  });
}
