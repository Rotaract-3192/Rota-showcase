"use server";

import { orientationService } from '@/services/orientation.service';
import type { Database } from '@/types/database.types';
import { getRealClubIdFallback } from './utils';

export async function createOrientationAction(payload: Database['public']['Tables']['orientations']['Insert']) {
  payload.club_id = await getRealClubIdFallback(payload.club_id);
  return await orientationService.create(payload);
}

export async function updateOrientationAction(id: string, payload: Database['public']['Tables']['orientations']['Update']) {
  if (payload.club_id) {
    payload.club_id = await getRealClubIdFallback(payload.club_id);
  }
  return await orientationService.update(id, payload);
}

export async function deleteOrientationAction(id: string) {
  return await orientationService.delete(id);
}
