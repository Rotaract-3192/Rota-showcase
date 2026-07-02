import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { authKeys } from '@/queries/auth.queries';
import type { Database } from '@/types/database.types';

export function useCreateAuth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Database['public']['Tables']['member_profiles']['Insert']) => 
      authService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.lists() });
    },
  });
}

export function useUpdateAuth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Database['public']['Tables']['member_profiles']['Update'] }) => 
      authService.update(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: authKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: authKeys.lists() });
    },
  });
}

export function useDeleteAuth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => authService.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: authKeys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: authKeys.lists() });
    },
  });
}
