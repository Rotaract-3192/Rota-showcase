import { useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';
import { analyticsKeys } from '@/queries/analytics.queries';
import type { Database } from '@/types/database.types';

export function useCreateAnalytics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Database['public']['Tables']['analytics_events']['Insert']) => 
      analyticsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.lists() });
    },
  });
}

export function useUpdateAnalytics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Database['public']['Tables']['analytics_events']['Update'] }) => 
      analyticsService.update(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: analyticsKeys.lists() });
    },
  });
}

export function useDeleteAnalytics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => analyticsService.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: analyticsKeys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: analyticsKeys.lists() });
    },
  });
}
