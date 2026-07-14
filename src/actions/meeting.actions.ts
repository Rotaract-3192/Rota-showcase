"use server";

import { meetingService } from '@/services/meeting.service';
import type { Database } from '@/types/database.types';
import { getRealClubIdFallback } from './utils';

export async function createMeetingAction(payload: Database['public']['Tables']['meetings']['Insert']) {
  payload.club_id = await getRealClubIdFallback(payload.club_id);
  return await meetingService.create(payload);
}

export async function updateMeetingAction(id: string, payload: Database['public']['Tables']['meetings']['Update']) {
  if (payload.club_id) {
    payload.club_id = await getRealClubIdFallback(payload.club_id);
  }
  return await meetingService.update(id, payload);
}

export async function deleteMeetingAction(id: string) {
  return await meetingService.delete(id);
}
