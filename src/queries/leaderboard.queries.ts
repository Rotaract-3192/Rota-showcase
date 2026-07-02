import { useQuery } from '@tanstack/react-query';
import { leaderboardService } from '@/services/leaderboard.service';
import type { QueryOptions } from '@/types/api.types';

export const leaderboardKeys = {
  all: ['leaderboard'] as const,
  lists: () => [...leaderboardKeys.all, 'list'] as const,
  list: (filters: string) => [...leaderboardKeys.lists(), filters] as const,
  detail: (id: string) => [...leaderboardKeys.all, 'detail', id] as const,
};

export function useLeaderboardList(options: QueryOptions = {}) {
  return useQuery({
    queryKey: leaderboardKeys.list(JSON.stringify(options)),
    queryFn: () => leaderboardService.findMany(options),
  });
}

export function useLeaderboard(id: string) {
  return useQuery({
    queryKey: leaderboardKeys.detail(id),
    queryFn: () => leaderboardService.getById(id),
    enabled: !!id,
  });
}
