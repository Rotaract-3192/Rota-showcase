import { supabase, handleSupabaseError } from '@/lib/supabase';
import { authRepository } from '@/repositories/auth.repository';
import type { Database } from '@/types/database.types';

type MemberProfile = Database['public']['Tables']['member_profiles']['Row'];
type MemberRole = Database['public']['Tables']['member_roles']['Row'];
type Club = Database['public']['Tables']['clubs']['Row'];
type District = Database['public']['Tables']['districts']['Row'];

export interface AuthUserProfile {
  profile: MemberProfile;
  roles: MemberRole[];
  club: Club | null;
  district: District | null;
  primaryRole: string;
}

export class AuthService {
  /**
   * Fetches the complete contextual profile for an authenticated Supabase User ID
   */
  async getFullUserProfile(authId: string): Promise<AuthUserProfile | null> {
    try {
      // 1. Fetch Profile
      const { data: profile, error: profileErr } = await supabase
        .from('member_profiles')
        .select('*')
        .eq('auth_id', authId)
        .is('deleted_at', null)
        .single();

      if (profileErr || !profile) return null;

      // 2. Fetch Roles
      const { data: roles, error: rolesErr } = await supabase
        .from('member_roles')
        .select('*')
        .eq('member_id', profile.id)
        .is('deleted_at', null);

      if (rolesErr) throw rolesErr;

      // 3. Fetch Club & District context if member belongs to a club
      let club: Club | null = null;
      let district: District | null = null;

      if (profile.club_id) {
        const { data: clubData } = await supabase
          .from('clubs')
          .select('*')
          .eq('id', profile.club_id)
          .is('deleted_at', null)
          .single();
        club = clubData as Club | null;

        if (club?.district_id) {
          const { data: distData } = await supabase
            .from('districts')
            .select('*')
            .eq('id', club.district_id)
            .is('deleted_at', null)
            .single();
          district = distData as District | null;
        }
      }

      // Determine Primary Role for routing logic
      const roleNames = (roles || []).map(r => r.role);
      let primaryRole = 'General Member';
      
      if (roleNames.includes('Super Admin')) primaryRole = 'Super Admin';
      else if (roleNames.includes('District')) primaryRole = 'District';
      else if (roleNames.includes('President')) primaryRole = 'President';
      else if (roleNames.some(r => r.includes('Board'))) primaryRole = 'Board Member';

      return {
        profile,
        roles: roles || [],
        club,
        district,
        primaryRole
      };
    } catch (err) {
      handleSupabaseError(err, 'AuthService.getFullUserProfile');
      return null;
    }
  }
}

// Ensure authRepository was scaffolded in Sprint 2.5
// We extend the general repository with specific auth logic
export const authService = new AuthService();
