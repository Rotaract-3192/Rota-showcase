"use server";

import { createServerSupabaseClient } from '@/lib/supabase-server';
import { AuthzError, requireAdminActor } from '@/lib/portal-auth';

export interface DistrictSettings {
  id: string;
  general: any;
  branding: any;
  security: any;
  notifications: any;
  updated_at: string;
}

export async function getDistrictSettings(): Promise<DistrictSettings | null> {
  await requireAdminActor();
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('district_settings')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching district_settings:", error);
    return null;
  }
  return data as DistrictSettings;
}

export async function updateDistrictSettings(
  section: 'general' | 'branding' | 'security' | 'notifications',
  payload: any
): Promise<boolean> {
  try {
    await requireAdminActor();
  } catch (err) {
    if (err instanceof AuthzError) return false;
    throw err;
  }

  const supabase = await createServerSupabaseClient();
  
  const { data: current } = await supabase
    .from('district_settings')
    .select('id')
    .limit(1)
    .single() as { data: { id: string } | null, error: any };
    
  if (!current?.id) return false;

  const { error } = await (supabase as any)
    .from('district_settings')
    .update({ 
      [section]: payload,
      updated_at: new Date().toISOString()
    })
    .eq('id', current.id);

  if (error) {
    console.error(`Error updating district_settings [${section}]:`, error);
    return false;
  }
  
  return true;
}
