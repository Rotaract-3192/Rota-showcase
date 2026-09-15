"use server";

import { installationService } from '@/services/installation.service';
import type { Database } from '@/types/database.types';
import { applyWriteClubScope, requirePortalActor, assertCanAccessClubRecord } from '@/lib/portal-auth';

export async function createInstallationAction(payload: Database['public']['Tables']['installations']['Insert']) {
  const actor = await requirePortalActor();
  const scoped = await applyWriteClubScope(actor, payload);
  return await installationService.create(scoped);
}

export async function updateInstallationAction(id: string, payload: Database['public']['Tables']['installations']['Update']) {
  const actor = await requirePortalActor();
  const existing = await installationService.getById(id);
  if (!existing) throw new Error('Installation not found.');
  await assertCanAccessClubRecord(actor, existing.club_id);
  if (!actor.isDistrictWide) {
    delete payload.club_id;
  }
  return await installationService.update(id, payload);
}

export async function deleteInstallationAction(id: string) {
  const actor = await requirePortalActor();
  const existing = await installationService.getById(id);
  if (!existing) throw new Error('Installation not found.');
  await assertCanAccessClubRecord(actor, existing.club_id);
  return await installationService.delete(id);
}
