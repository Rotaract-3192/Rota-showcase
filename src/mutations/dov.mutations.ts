import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDovAction, updateDovAction, deleteDovAction } from '@/actions/dov.actions';
import { dovKeys } from '@/queries/dov.queries';
import type { Database } from '@/types/database.types';

export function useCreateDov() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Database['public']['Tables']['dovs']['Insert']) => 
      createDovAction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dovKeys.lists() });
    },
  });
}

export function useUpdateDov() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Database['public']['Tables']['dovs']['Update'] }) => 
      updateDovAction(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: dovKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: dovKeys.lists() });
    },
  });
}

export function useDeleteDov() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDovAction(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: dovKeys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: dovKeys.lists() });
    },
  });
}
