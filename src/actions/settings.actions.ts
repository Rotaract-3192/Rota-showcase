"use server";

import { createServerSupabaseClient } from '@/lib/supabase-server';

// Generic setting interface based on the table we created
export interface DistrictSettings {
  id: string;
  general: any;
  branding: any;
  security: any;
  notifications: any;
  updated_at: string;
}

/**
 * Retrieves the global district settings row.
 */
export async function getDistrictSettings(): Promise<DistrictSettings | null> {
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

/**
 * Updates a specific section in the global district settings.
 * Valid sections: 'general', 'branding', 'security', 'notifications'.
 */
export async function updateDistrictSettings(section: 'general' | 'branding' | 'security' | 'notifications', payload: any): Promise<boolean> {
  const supabase = await createServerSupabaseClient();
  
  // Get the current row ID since it's a single-row config table
  const { data: current } = await supabase
    .from('district_settings')
    .select('id')
    .limit(1)
    .single();
    
  if (!current?.id) return false;

  const updateData: any = {
  	[section]: payload,
  	updated_at: new Date().toISOString(),
};
	
  const { error } = await supabase
	.from("district_settings")
	.update(updateData)
	.eq("id", current.id);

  if (error) {
    console.error(`Error updating district_settings [${section}]:`, error);
    return false;
  }
  
  return true;
}
