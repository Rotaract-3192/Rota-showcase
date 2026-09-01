"use server";

import { meetingService } from '@/services/meeting.service';
import type { Database } from '@/types/database.types';
import { requirePortalActor, assertCanAccessClubRecord } from '@/lib/portal-auth';

export async function createMeetingAction(payload: Database['public']['Tables']['meetings']['Insert']) {
  const actor = await requirePortalActor();
  if (!actor.isDistrict) {
    if (!actor.clubId) throw new Error('You must be assigned to a club to submit reports.');
    payload.club_id = actor.clubId;
  } else if (!payload.club_id) {
    throw new Error('Club is required to save this report.');
  }
  return await meetingService.create(payload);
}

export async function updateMeetingAction(id: string, payload: Database['public']['Tables']['meetings']['Update']) {
  const actor = await requirePortalActor();
  const existing = await meetingService.getById(id);
  if (!existing) throw new Error('Meeting not found.');
  assertCanAccessClubRecord(actor, existing.club_id);
  if (!actor.isDistrict) {
    delete payload.club_id;
  }
  return await meetingService.update(id, payload);
}

export async function deleteMeetingAction(id: string) {
  const actor = await requirePortalActor();
  const existing = await meetingService.getById(id);
  if (!existing) throw new Error('Meeting not found.');
  assertCanAccessClubRecord(actor, existing.club_id);
  return await meetingService.delete(id);
}
