"use server";

import { activityService } from '@/services/activity.service';
import type { Database } from '@/types/database.types';
import { requirePortalActor, assertCanAccessClubRecord } from '@/lib/portal-auth';

function assignClubId<T extends { club_id?: string | null }>(payload: T, clubId: string | null, isDistrict: boolean): T {
  if (isDistrict) {
    if (!payload.club_id) {
      throw new Error('Club is required to save this report.');
    }
    return payload;
  }
  if (!clubId) {
    throw new Error('You must be assigned to a club to submit reports.');
  }
  return { ...payload, club_id: clubId };
}

export async function createActivityAction(payload: Database['public']['Tables']['activities']['Insert']) {
  const actor = await requirePortalActor();
  const scoped = assignClubId(payload, actor.clubId, actor.isDistrict);
  const result = await activityService.create(scoped);
  
  try {
    const { notifyRoleAction } = await import('@/actions/notification.actions');
    await Promise.all([
      notifyRoleAction('DISTRICT_ADMIN', 'New Project Report', `A new activity "${payload.title}" was submitted.`, '/admin/projects'),
      notifyRoleAction('SUPER_ADMIN', 'New Project Report', `A new activity "${payload.title}" was submitted.`, '/admin/projects'),
    ]);
  } catch (err) {
    console.error('Failed to dispatch new activity notification:', err);
  }

  return result;
}

export async function updateActivityAction(id: string, payload: Database['public']['Tables']['activities']['Update']) {
  const actor = await requirePortalActor();
  const existing = await activityService.getById(id);
  if (!existing) throw new Error('Activity not found.');
  assertCanAccessClubRecord(actor, existing.club_id);
  const { club_id: _ignored, ...rest } = payload;
  return await activityService.update(id, actor.isDistrict ? payload : rest);
}

export async function deleteActivityAction(id: string) {
  const actor = await requirePortalActor();
  const existing = await activityService.getById(id);
  if (!existing) throw new Error('Activity not found.');
  assertCanAccessClubRecord(actor, existing.club_id);
  return await activityService.delete(id);
}
