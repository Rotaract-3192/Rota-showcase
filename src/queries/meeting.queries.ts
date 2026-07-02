import { useQuery } from '@tanstack/react-query';
import { meetingService } from '@/services/meeting.service';
import type { QueryOptions } from '@/types/api.types';

export const meetingKeys = {
  all: ['meeting'] as const,
  lists: () => [...meetingKeys.all, 'list'] as const,
  list: (filters: string) => [...meetingKeys.lists(), filters] as const,
  detail: (id: string) => [...meetingKeys.all, 'detail', id] as const,
};

export function useMeetingList(options: QueryOptions = {}) {
  return useQuery({
    queryKey: meetingKeys.list(JSON.stringify(options)),
    queryFn: () => meetingService.findMany(options),
  });
}

export function useMeeting(id: string) {
  return useQuery({
    queryKey: meetingKeys.detail(id),
    queryFn: () => meetingService.getById(id),
    enabled: !!id,
  });
}
