import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import type { QueryOptions } from '@/types/api.types';

export const authKeys = {
  all: ['auth'] as const,
  lists: () => [...authKeys.all, 'list'] as const,
  list: (filters: string) => [...authKeys.lists(), filters] as const,
  detail: (id: string) => [...authKeys.all, 'detail', id] as const,
};

export function useAuthList(options: QueryOptions = {}) {
  return useQuery({
    queryKey: authKeys.list(JSON.stringify(options)),
    queryFn: () => authService.findMany(options),
  });
}

export function useAuth(id: string) {
  return useQuery({
    queryKey: authKeys.detail(id),
    queryFn: () => authService.getById(id),
    enabled: !!id,
  });
}
