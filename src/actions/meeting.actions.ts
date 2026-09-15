"use server";

import { meetingService } from '@/services/meeting.service';
import type { Database } from '@/types/database.types';
import { applyWriteClubScope, requirePortalActor, assertCanAccessClubRecord } from '@/lib/portal-auth';

export async function createMeetingAction(payload: Database['public']['Tables']['meetings']['Insert']) {
  const actor = await requirePortalActor();
  const scoped = await applyWriteClubScope(actor, payload);
  return await meetingService.create(scoped);
}

export async function updateMeetingAction(id: string, payload: Database['public']['Tables']['meetings']['Update']) {
  const actor = await requirePortalActor();
  const existing = await meetingService.getById(id);
  if (!existing) throw new Error('Meeting not found.');
  await assertCanAccessClubRecord(actor, existing.club_id);
  if (!actor.isDistrictWide) {
    delete payload.club_id;
  }
  return await meetingService.update(id, payload);
}

export async function deleteMeetingAction(id: string) {
  const actor = await requirePortalActor();
  const existing = await meetingService.getById(id);
  if (!existing) throw new Error('Meeting not found.');
  await assertCanAccessClubRecord(actor, existing.club_id);
  return await meetingService.delete(id);
}
