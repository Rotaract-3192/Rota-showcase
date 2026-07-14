"use server";

import { dovService } from '@/services/dov.service';
import type { Database } from '@/types/database.types';
import { getRealClubIdFallback } from './utils';

export async function createDovAction(payload: Database['public']['Tables']['dovs']['Insert']) {
  payload.club_id = await getRealClubIdFallback(payload.club_id);
  return await dovService.create(payload);
}

export async function updateDovAction(id: string, payload: Database['public']['Tables']['dovs']['Update']) {
  if (payload.club_id) {
    payload.club_id = await getRealClubIdFallback(payload.club_id);
  }
  return await dovService.update(id, payload);
}

export async function deleteDovAction(id: string) {
  return await dovService.delete(id);
}
