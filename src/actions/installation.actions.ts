"use server";

import { installationService } from '@/services/installation.service';
import type { Database } from '@/types/database.types';
import { requirePortalActor, assertCanAccessClubRecord } from '@/lib/portal-auth';

export async function createInstallationAction(payload: Database['public']['Tables']['installations']['Insert']) {
  const actor = await requirePortalActor();
  if (!actor.isDistrict) {
    if (!actor.clubId) throw new Error('You must be assigned to a club to submit reports.');
    payload.club_id = actor.clubId;
  } else if (!payload.club_id) {
    throw new Error('Club is required to save this report.');
  }
  return await installationService.create(payload);
}

export async function updateInstallationAction(id: string, payload: Database['public']['Tables']['installations']['Update']) {
  const actor = await requirePortalActor();
  const existing = await installationService.getById(id);
  if (!existing) throw new Error('Installation not found.');
  assertCanAccessClubRecord(actor, existing.club_id);
  if (!actor.isDistrict) {
    delete payload.club_id;
  }
  return await installationService.update(id, payload);
}

export async function deleteInstallationAction(id: string) {
  const actor = await requirePortalActor();
  const existing = await installationService.getById(id);
  if (!existing) throw new Error('Installation not found.');
  assertCanAccessClubRecord(actor, existing.club_id);
  return await installationService.delete(id);
}
