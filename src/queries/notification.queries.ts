import { useQuery } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';
import type { QueryOptions } from '@/types/api.types';

export const notificationKeys = {
  all: ['notification'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters: string) => [...notificationKeys.lists(), filters] as const,
  detail: (id: string) => [...notificationKeys.all, 'detail', id] as const,
};

export function useNotificationList(options: QueryOptions = {}) {
  return useQuery({
    queryKey: notificationKeys.list(JSON.stringify(options)),
    queryFn: () => notificationService.findMany(options),
  });
}

export function useNotification(id: string) {
  return useQuery({
    queryKey: notificationKeys.detail(id),
    queryFn: () => notificationService.getById(id),
    enabled: !!id,
  });
}
