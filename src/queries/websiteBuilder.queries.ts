import { useQuery } from '@tanstack/react-query';
import { websiteBuilderService } from '@/services/websiteBuilder.service';
import type { QueryOptions } from '@/types/api.types';

export const websiteBuilderKeys = {
  all: ['websiteBuilder'] as const,
  lists: () => [...websiteBuilderKeys.all, 'list'] as const,
  list: (filters: string) => [...websiteBuilderKeys.lists(), filters] as const,
  detail: (id: string) => [...websiteBuilderKeys.all, 'detail', id] as const,
};

export function useWebsiteBuilderList(options: QueryOptions = {}) {
  return useQuery({
    queryKey: websiteBuilderKeys.list(JSON.stringify(options)),
    queryFn: () => websiteBuilderService.findMany(options),
  });
}

export function useWebsiteBuilder(id: string) {
  return useQuery({
    queryKey: websiteBuilderKeys.detail(id),
    queryFn: () => websiteBuilderService.getById(id),
    enabled: !!id,
  });
}
