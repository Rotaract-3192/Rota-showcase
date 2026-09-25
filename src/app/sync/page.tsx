import { currentUser } from '@clerk/nextjs/server';
import { fetchMemberRoles, isDistrictRole, linkAndLoadMemberProfile } from '@/lib/member-sync';
import { isDistrictWideAdminRole, isPrTeamRole, isZrrRole } from '@/lib/zones';
import SyncRedirect from './SyncRedirect';

export const dynamic = 'force-dynamic';

export default async function SyncPage() {
  const user = await currentUser();
  const userId = user?.id;

  if (!userId || !user) {
    return <SyncRedirect targetUrl="/sign-in" />;
  }

  const emails = user.emailAddresses.map((e) => e.emailAddress).filter(Boolean);
  if (emails.length === 0) {
    return (
      <SyncRedirect
        targetUrl="/login?error=unauthorized"
        message="No email is attached to this account."
      />
    );
  }

  try {
    const profile = await linkAndLoadMemberProfile(userId, emails);

    if (!profile) {
      return (
        <SyncRedirect
          targetUrl="/login?error=unauthorized"
          message="We could not find a district profile for this email."
        />
      );
    }

    const roles = await fetchMemberRoles(profile.id);
    const isAdmin = roles.some(isDistrictRole);
    const publicationsOnly =
      roles.some(isPrTeamRole) &&
      !roles.some(isDistrictWideAdminRole) &&
      !roles.some(isZrrRole);
    const targetPath = !isAdmin
      ? '/portal/dashboard'
      : publicationsOnly
        ? '/admin/publications'
        : '/admin/dashboard';

    return <SyncRedirect targetUrl={targetPath} message="Opening your workspace..." />;
  } catch (error: any) {
    console.error("Error during sync:", error);
    return (
      <SyncRedirect
        targetUrl="/login?error=unauthorized"
        message="Profile sync failed. Please try again or contact district support."
      />
    );
  }
}
