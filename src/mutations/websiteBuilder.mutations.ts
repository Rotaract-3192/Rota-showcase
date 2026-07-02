import { useMutation, useQueryClient } from '@tanstack/react-query';
import { websiteBuilderService } from '@/services/websiteBuilder.service';
import { websiteBuilderKeys } from '@/queries/websiteBuilder.queries';
import type { Database } from '@/types/database.types';

export function useCreateWebsiteBuilder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Database['public']['Tables']['club_website_configs']['Insert']) => 
      websiteBuilderService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: websiteBuilderKeys.lists() });
    },
  });
}

export function useUpdateWebsiteBuilder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Database['public']['Tables']['club_website_configs']['Update'] }) => 
      websiteBuilderService.update(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: websiteBuilderKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: websiteBuilderKeys.lists() });
    },
  });
}

export function useDeleteWebsiteBuilder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => websiteBuilderService.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: websiteBuilderKeys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: websiteBuilderKeys.lists() });
    },
  });
}
