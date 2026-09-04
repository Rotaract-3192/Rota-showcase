import { createServerSupabaseClient } from '@/lib/supabase-server';
import { handleSupabaseError } from '@/lib/supabase';
import { authRepository } from '@/repositories/auth.repository';
import type { Database } from '@/types/database.types';
import { isDistrictRole } from '@/lib/member-sync';

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
      const supabase = await createServerSupabaseClient();

      const { data: profileRows } = await supabase
        .from('member_profiles')
        .select('*')
        .eq('auth_id', authId)
        .is('deleted_at', null);

      const profileList = profileRows || [];
      if (profileList.length === 0) return null;

      const profileWithRoles = await Promise.all(
        profileList.map(async (p) => {
          const { data: roleRows } = await supabase
            .from('member_roles')
            .select('*')
            .eq('member_id', p.id)
            .is('deleted_at', null);
          return { profile: p, roles: roleRows || [] };
        })
      );

      const districtMatch = profileWithRoles.find((row) =>
        row.roles.some((r) => isDistrictRole(r.role))
      );
      const chosen = districtMatch || profileWithRoles.find((row) => row.profile.club_id) || profileWithRoles[0];
      const profile = chosen.profile;
      const roles = chosen.roles;

      // Fetch Club & District context if member belongs to a club
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
      const districtNamed = roleNames.find((r) => isDistrictRole(r));

      if (roleNames.includes('Super Admin')) primaryRole = 'Super Admin';
      else if (districtNamed) primaryRole = districtNamed;
      else if (roleNames.includes('ZRR')) primaryRole = 'ZRR';
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

  // Delegate standard CRUD operations to the underlying repository
  async findById(id: string) {
    return authRepository.findById(id);
  }

  async findMany(options: any = {}) {
    return authRepository.findMany(options);
  }

  async create(payload: Database['public']['Tables']['member_profiles']['Insert']) {
    return authRepository.create(payload);
  }

  async update(id: string, payload: Database['public']['Tables']['member_profiles']['Update']) {
    return authRepository.update(id, payload);
  }

  async delete(id: string) {
    return authRepository.softDelete(id);
  }
}

// Ensure authRepository was scaffolded in Sprint 2.5
// We extend the general repository with specific auth logic
export const authService = new AuthService();
