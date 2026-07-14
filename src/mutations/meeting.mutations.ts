import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createMeetingAction, updateMeetingAction, deleteMeetingAction } from '@/actions/meeting.actions';
import { meetingKeys } from '@/queries/meeting.queries';
import type { Database } from '@/types/database.types';

export function useCreateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Database['public']['Tables']['meetings']['Insert']) => 
      createMeetingAction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
    },
  });
}

export function useUpdateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Database['public']['Tables']['meetings']['Update'] }) => 
      updateMeetingAction(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
    },
  });
}

export function useDeleteMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMeetingAction(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: meetingKeys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
    },
  });
}
