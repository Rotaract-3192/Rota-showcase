"use server";

import { createServerSupabaseClient } from '@/lib/supabase-server';

const MOCK_CLUB_ID = "d157a16b-1234-4b45-9a8b-319200000000";

/**
 * Replaces a mock club ID with a real one from the database.
 * Used for development/testing when a user's profile is incomplete.
 */
export async function getRealClubIdFallback(clubId: string | null | undefined): Promise<string> {
  if (clubId && clubId !== MOCK_CLUB_ID) return clubId;

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from('clubs').select('id').limit(1).single();
  
  if (data?.id) return data.id;
  
  throw new Error("No clubs found in the database. Please create a club first.");
}
