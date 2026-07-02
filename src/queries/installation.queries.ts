import { useQuery } from '@tanstack/react-query';
import { installationService } from '@/services/installation.service';
import type { QueryOptions } from '@/types/api.types';

export const installationKeys = {
  all: ['installation'] as const,
  lists: () => [...installationKeys.all, 'list'] as const,
  list: (filters: string) => [...installationKeys.lists(), filters] as const,
  detail: (id: string) => [...installationKeys.all, 'detail', id] as const,
};

export function useInstallationList(options: QueryOptions = {}) {
  return useQuery({
    queryKey: installationKeys.list(JSON.stringify(options)),
    queryFn: () => installationService.findMany(options),
  });
}

export function useInstallation(id: string) {
  return useQuery({
    queryKey: installationKeys.detail(id),
    queryFn: () => installationService.getById(id),
    enabled: !!id,
  });
}
