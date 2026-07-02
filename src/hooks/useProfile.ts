import { useAuthContext } from '@/components/providers/auth-provider';

/**
 * Hook to quickly access the authenticated user's profile and relational data.
 * Ideal for displaying avatars, names, and club details in the UI.
 */
export function useProfile() {
  const { profileData, isLoading, refreshProfile } = useAuthContext();

  return {
    profile: profileData?.profile || null,
    club: profileData?.club || null,
    district: profileData?.district || null,
    primaryRole: profileData?.primaryRole || null,
    isLoading,
    refreshProfile
  };
}
