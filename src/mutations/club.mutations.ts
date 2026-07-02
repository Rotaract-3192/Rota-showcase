import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clubService } from '@/services/club.service';
import { clubKeys } from '@/queries/club.queries';
import type { Database } from '@/types/database.types';

export function useCreateClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Database['public']['Tables']['clubs']['Insert']) => 
      clubService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clubKeys.lists() });
    },
  });
}

export function useUpdateClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Database['public']['Tables']['clubs']['Update'] }) => 
      clubService.update(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: clubKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: clubKeys.lists() });
    },
  });
}

export function useDeleteClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clubService.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: clubKeys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: clubKeys.lists() });
    },
  });
}
