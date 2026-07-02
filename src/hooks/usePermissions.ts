import { useAuthContext } from '@/components/providers/auth-provider';

/**
 * Hook for granular permission checking based on user roles.
 */
export function usePermissions() {
  const { profileData } = useAuthContext();

  const roleNames = profileData?.roles.map(r => r.role) || [];
  const primaryRole = profileData?.primaryRole || 'Guest';

  // Base role checks
  const isSuperAdmin = roleNames.includes('Super Admin');
  const isDistrict = roleNames.includes('District') || isSuperAdmin;
  const isPresident = roleNames.includes('President') || isDistrict;
  const isBoardMember = roleNames.some(r => r.includes('Board')) || isPresident;
  const isClubMember = !!profileData?.profile?.club_id;

  // Specific Permission Helpers
  const canEditClubDetails = () => isPresident;
  const canSubmitActivity = () => isBoardMember;
  const canApproveActivity = () => isDistrict;
  const canManageUsers = () => isPresident;

  return {
    roles: roleNames,
    primaryRole,
    isSuperAdmin,
    isDistrict,
    isPresident,
    isBoardMember,
    isClubMember,
    canEditClubDetails,
    canSubmitActivity,
    canApproveActivity,
    canManageUsers
  };
}
