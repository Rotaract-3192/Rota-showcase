'use client';

import { usePermissions } from '@/hooks/usePermissions';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthContext } from '@/components/providers/auth-provider';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireClub?: boolean;
  requireDistrict?: boolean;
}

export function RoleGuard({ children, allowedRoles, requireClub, requireDistrict }: RoleGuardProps) {
  const { roles, primaryRole, isClubMember, isDistrict } = usePermissions();
  const { isLoading, session } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !session) return;

    let isAuthorized = true;

    if (allowedRoles && allowedRoles.length > 0) {
      const hasAllowedRole = allowedRoles.some(role => roles.includes(role) || primaryRole === role);
      if (!hasAllowedRole) isAuthorized = false;
    }

    if (requireClub && !isClubMember) isAuthorized = false;
    if (requireDistrict && !isDistrict) isAuthorized = false;

    if (!isAuthorized) {
      // Redirect to a safe fallback (e.g., their primary dashboard)
      router.replace('/portal/dashboard'); 
    }
  }, [isLoading, session, allowedRoles, requireClub, requireDistrict, roles, primaryRole, isClubMember, isDistrict, router]);

  if (isLoading) return null; // Let ProtectedRoute handle the loading UI if stacked

  // During evaluation or before redirecting, hide content
  let isAuthorized = true;
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAllowedRole = allowedRoles.some(role => roles.includes(role) || primaryRole === role);
    if (!hasAllowedRole) isAuthorized = false;
  }
  if (requireClub && !isClubMember) isAuthorized = false;
  if (requireDistrict && !isDistrict) isAuthorized = false;

  if (!isAuthorized) return null;

  return <>{children}</>;
}
