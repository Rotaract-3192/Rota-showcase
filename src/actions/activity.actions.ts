"use server";

import { activityService } from '@/services/activity.service';
import type { Database } from '@/types/database.types';

export async function createActivityAction(payload: Database['public']['Tables']['activities']['Insert']) {
  const result = await activityService.create(payload);
  
  // Try to notify admins about the new activity submission
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
  return await activityService.update(id, payload);
}

export async function deleteActivityAction(id: string) {
  return await activityService.delete(id);
}
