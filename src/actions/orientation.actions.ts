"use server";

import { orientationService } from '@/services/orientation.service';
import type { Database } from '@/types/database.types';
import { requirePortalActor, assertCanAccessClubRecord } from '@/lib/portal-auth';

export async function createOrientationAction(payload: Database['public']['Tables']['orientations']['Insert']) {
  const actor = await requirePortalActor();
  if (!actor.isDistrict) {
    if (!actor.clubId) throw new Error('You must be assigned to a club to submit reports.');
    payload.club_id = actor.clubId;
  } else if (!payload.club_id) {
    throw new Error('Club is required to save this report.');
  }
  return await orientationService.create(payload);
}

export async function updateOrientationAction(id: string, payload: Database['public']['Tables']['orientations']['Update']) {
  const actor = await requirePortalActor();
  const existing = await orientationService.getById(id);
  if (!existing) throw new Error('Orientation not found.');
  assertCanAccessClubRecord(actor, existing.club_id);
  if (!actor.isDistrict) {
    delete payload.club_id;
  }
  return await orientationService.update(id, payload);
}

export async function deleteOrientationAction(id: string) {
  const actor = await requirePortalActor();
  const existing = await orientationService.getById(id);
  if (!existing) throw new Error('Orientation not found.');
  assertCanAccessClubRecord(actor, existing.club_id);
  return await orientationService.delete(id);
}
