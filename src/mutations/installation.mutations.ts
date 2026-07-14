import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createInstallationAction, updateInstallationAction, deleteInstallationAction } from '@/actions/installation.actions';
import { installationKeys } from '@/queries/installation.queries';
import type { Database } from '@/types/database.types';

export function useCreateInstallation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Database['public']['Tables']['installations']['Insert']) => 
      createInstallationAction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: installationKeys.lists() });
    },
  });
}

export function useUpdateInstallation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Database['public']['Tables']['installations']['Update'] }) => 
      updateInstallationAction(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: installationKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: installationKeys.lists() });
    },
  });
}

export function useDeleteInstallation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteInstallationAction(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: installationKeys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: installationKeys.lists() });
    },
  });
}
