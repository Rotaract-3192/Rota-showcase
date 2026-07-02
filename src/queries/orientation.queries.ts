import { useQuery } from '@tanstack/react-query';
import { orientationService } from '@/services/orientation.service';
import type { QueryOptions } from '@/types/api.types';

export const orientationKeys = {
  all: ['orientation'] as const,
  lists: () => [...orientationKeys.all, 'list'] as const,
  list: (filters: string) => [...orientationKeys.lists(), filters] as const,
  detail: (id: string) => [...orientationKeys.all, 'detail', id] as const,
};

export function useOrientationList(options: QueryOptions = {}) {
  return useQuery({
    queryKey: orientationKeys.list(JSON.stringify(options)),
    queryFn: () => orientationService.findMany(options),
  });
}

export function useOrientation(id: string) {
  return useQuery({
    queryKey: orientationKeys.detail(id),
    queryFn: () => orientationService.getById(id),
    enabled: !!id,
  });
}
