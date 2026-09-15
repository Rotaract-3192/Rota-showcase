"use server";

import { dovService } from '@/services/dov.service';
import type { Database } from '@/types/database.types';
import { applyWriteClubScope, requirePortalActor, assertCanAccessClubRecord } from '@/lib/portal-auth';

export async function createDovAction(payload: Database['public']['Tables']['dovs']['Insert']) {
  const actor = await requirePortalActor();
  const scoped = await applyWriteClubScope(actor, payload);
  return await dovService.create(scoped);
}

export async function updateDovAction(id: string, payload: Database['public']['Tables']['dovs']['Update']) {
  const actor = await requirePortalActor();
  const existing = await dovService.getById(id);
  if (!existing) throw new Error('DOV report not found.');
  await assertCanAccessClubRecord(actor, existing.club_id);
  if (!actor.isDistrictWide) {
    delete payload.club_id;
  }
  return await dovService.update(id, payload);
}

export async function deleteDovAction(id: string) {
  const actor = await requirePortalActor();
  const existing = await dovService.getById(id);
  if (!existing) throw new Error('DOV report not found.');
  await assertCanAccessClubRecord(actor, existing.club_id);
  return await dovService.delete(id);
}
