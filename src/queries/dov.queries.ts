import { useQuery } from '@tanstack/react-query';
import { dovService } from '@/services/dov.service';
import type { QueryOptions } from '@/types/api.types';

export const dovKeys = {
  all: ['dov'] as const,
  lists: () => [...dovKeys.all, 'list'] as const,
  list: (filters: string) => [...dovKeys.lists(), filters] as const,
  detail: (id: string) => [...dovKeys.all, 'detail', id] as const,
};

export function useDovList(options: QueryOptions = {}) {
  return useQuery({
    queryKey: dovKeys.list(JSON.stringify(options)),
    queryFn: () => dovService.findMany(options),
  });
}

export function useDov(id: string) {
  return useQuery({
    queryKey: dovKeys.detail(id),
    queryFn: () => dovService.getById(id),
    enabled: !!id,
  });
}
