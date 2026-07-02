import { useMutation, useQueryClient } from '@tanstack/react-query';
import { leaderboardService } from '@/services/leaderboard.service';
import { leaderboardKeys } from '@/queries/leaderboard.queries';
import type { Database } from '@/types/database.types';

export function useCreateLeaderboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Database['public']['Tables']['point_ledgers']['Insert']) => 
      leaderboardService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaderboardKeys.lists() });
    },
  });
}

export function useUpdateLeaderboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Database['public']['Tables']['point_ledgers']['Update'] }) => 
      leaderboardService.update(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: leaderboardKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: leaderboardKeys.lists() });
    },
  });
}

export function useDeleteLeaderboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => leaderboardService.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: leaderboardKeys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: leaderboardKeys.lists() });
    },
  });
}
