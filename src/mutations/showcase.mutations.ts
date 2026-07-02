import { useMutation, useQueryClient } from '@tanstack/react-query';
import { showcaseService } from '@/services/showcase.service';
import { showcaseKeys } from '@/queries/showcase.queries';
import type { Database } from '@/types/database.types';

export function useCreateShowcase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Database['public']['Tables']['showcase_features']['Insert']) => 
      showcaseService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: showcaseKeys.lists() });
    },
  });
}

export function useUpdateShowcase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Database['public']['Tables']['showcase_features']['Update'] }) => 
      showcaseService.update(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: showcaseKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: showcaseKeys.lists() });
    },
  });
}

export function useDeleteShowcase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => showcaseService.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: showcaseKeys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: showcaseKeys.lists() });
    },
  });
}
