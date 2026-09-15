"use server";

import { orientationService } from '@/services/orientation.service';
import type { Database } from '@/types/database.types';
import { applyWriteClubScope, requirePortalActor, assertCanAccessClubRecord } from '@/lib/portal-auth';

export async function createOrientationAction(payload: Database['public']['Tables']['orientations']['Insert']) {
  const actor = await requirePortalActor();
  const scoped = await applyWriteClubScope(actor, payload);
  return await orientationService.create(scoped);
}

export async function updateOrientationAction(id: string, payload: Database['public']['Tables']['orientations']['Update']) {
  const actor = await requirePortalActor();
  const existing = await orientationService.getById(id);
  if (!existing) throw new Error('Orientation not found.');
  await assertCanAccessClubRecord(actor, existing.club_id);
  if (!actor.isDistrictWide) {
    delete payload.club_id;
  }
  return await orientationService.update(id, payload);
}

export async function deleteOrientationAction(id: string) {
  const actor = await requirePortalActor();
  const existing = await orientationService.getById(id);
  if (!existing) throw new Error('Orientation not found.');
  await assertCanAccessClubRecord(actor, existing.club_id);
  return await orientationService.delete(id);
}
