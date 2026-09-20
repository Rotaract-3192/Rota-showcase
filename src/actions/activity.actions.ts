"use server";

import { activityService } from '@/services/activity.service';
import type { Database } from '@/types/database.types';
import { applyWriteClubScope, requirePortalActor, assertCanAccessClubRecord } from '@/lib/portal-auth';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function createActivityAction(payload: Database['public']['Tables']['activities']['Insert']) {
  const actor = await requirePortalActor();
  const scoped = await applyWriteClubScope(actor, payload);
  const result = await activityService.create(scoped);

  try {
    const supabase = await createServerSupabaseClient();
    await supabase.from('audit_logs').insert({
      actor_id: actor.profileId,
      action: 'SUBMIT_ACTIVITY',
      table_name: 'activities',
      record_id: result.id,
      new_data: { reporter_email: actor.email },
    });
  } catch (err) {
    console.error('Failed to record activity reporter:', err);
  }

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
  await assertCanAccessClubRecord(actor, existing.club_id);
  const { club_id: _ignored, ...rest } = payload;
  return await activityService.update(id, actor.isDistrictWide ? payload : rest);
}

export async function deleteActivityAction(id: string) {
  const actor = await requirePortalActor();
  const existing = await activityService.getById(id);
  if (!existing) throw new Error('Activity not found.');
  await assertCanAccessClubRecord(actor, existing.club_id);
  return await activityService.delete(id);
}
