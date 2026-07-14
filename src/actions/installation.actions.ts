"use server";

import { installationService } from '@/services/installation.service';
import type { Database } from '@/types/database.types';
import { getRealClubIdFallback } from './utils';

export async function createInstallationAction(payload: Database['public']['Tables']['installations']['Insert']) {
  payload.club_id = await getRealClubIdFallback(payload.club_id);
  return await installationService.create(payload);
}

export async function updateInstallationAction(id: string, payload: Database['public']['Tables']['installations']['Update']) {
  if (payload.club_id) {
    payload.club_id = await getRealClubIdFallback(payload.club_id);
  }
  return await installationService.update(id, payload);
}

export async function deleteInstallationAction(id: string) {
  return await installationService.delete(id);
}
