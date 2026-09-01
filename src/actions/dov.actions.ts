"use server";

import { dovService } from '@/services/dov.service';
import type { Database } from '@/types/database.types';
import { requirePortalActor, assertCanAccessClubRecord } from '@/lib/portal-auth';

export async function createDovAction(payload: Database['public']['Tables']['dovs']['Insert']) {
  const actor = await requirePortalActor();
  if (!actor.isDistrict) {
    if (!actor.clubId) throw new Error('You must be assigned to a club to submit reports.');
    payload.club_id = actor.clubId;
  } else if (!payload.club_id) {
    throw new Error('Club is required to save this report.');
  }
  return await dovService.create(payload);
}

export async function updateDovAction(id: string, payload: Database['public']['Tables']['dovs']['Update']) {
  const actor = await requirePortalActor();
  const existing = await dovService.getById(id);
  if (!existing) throw new Error('DOV report not found.');
  assertCanAccessClubRecord(actor, existing.club_id);
  if (!actor.isDistrict) {
    delete payload.club_id;
  }
  return await dovService.update(id, payload);
}

export async function deleteDovAction(id: string) {
  const actor = await requirePortalActor();
  const existing = await dovService.getById(id);
  if (!existing) throw new Error('DOV report not found.');
  assertCanAccessClubRecord(actor, existing.club_id);
  return await dovService.delete(id);
}
