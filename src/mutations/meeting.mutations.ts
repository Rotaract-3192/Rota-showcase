import { useMutation, useQueryClient } from '@tanstack/react-query';
import { meetingService } from '@/services/meeting.service';
import { meetingKeys } from '@/queries/meeting.queries';
import type { Database } from '@/types/database.types';

export function useCreateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Database['public']['Tables']['meetings']['Insert']) => 
      meetingService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
    },
  });
}

export function useUpdateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Database['public']['Tables']['meetings']['Update'] }) => 
      meetingService.update(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
    },
  });
}

export function useDeleteMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => meetingService.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
    },
  });
}
