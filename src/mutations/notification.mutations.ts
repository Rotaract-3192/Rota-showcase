import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';
import { notificationKeys } from '@/queries/notification.queries';
import type { Database } from '@/types/database.types';

export function useCreateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Database['public']['Tables']['notifications']['Insert']) => 
      notificationService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
}

export function useUpdateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Database['public']['Tables']['notifications']['Update'] }) => 
      notificationService.update(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
}
