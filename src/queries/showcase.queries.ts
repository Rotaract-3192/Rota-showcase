import { useQuery } from '@tanstack/react-query';
import { showcaseService } from '@/services/showcase.service';
import type { QueryOptions } from '@/types/api.types';

export const showcaseKeys = {
  all: ['showcase'] as const,
  lists: () => [...showcaseKeys.all, 'list'] as const,
  list: (filters: string) => [...showcaseKeys.lists(), filters] as const,
  detail: (id: string) => [...showcaseKeys.all, 'detail', id] as const,
};

export function useShowcaseList(options: QueryOptions = {}) {
  return useQuery({
    queryKey: showcaseKeys.list(JSON.stringify(options)),
    queryFn: () => showcaseService.findMany(options),
  });
}

export function useShowcase(id: string) {
  return useQuery({
    queryKey: showcaseKeys.detail(id),
    queryFn: () => showcaseService.getById(id),
    enabled: !!id,
  });
}
