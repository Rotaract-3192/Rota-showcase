import { useQuery } from '@tanstack/react-query';
import { clubService } from '@/services/club.service';
import type { QueryOptions } from '@/types/api.types';

export const clubKeys = {
  all: ['club'] as const,
  lists: () => [...clubKeys.all, 'list'] as const,
  list: (filters: string) => [...clubKeys.lists(), filters] as const,
  detail: (id: string) => [...clubKeys.all, 'detail', id] as const,
};

export function useClubList(options: QueryOptions = {}) {
  return useQuery({
    queryKey: clubKeys.list(JSON.stringify(options)),
    queryFn: () => clubService.findMany(options),
  });
}

export function useClub(id: string) {
  return useQuery({
    queryKey: clubKeys.detail(id),
    queryFn: () => clubService.getById(id),
    enabled: !!id,
  });
}
