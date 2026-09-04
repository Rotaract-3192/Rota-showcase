import { auth, currentUser } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { emailsForProfileLink } from "@/lib/clerk-emails";
import { isDistrictRole } from "@/lib/member-sync";

export class AuthzError extends Error {
  status: number;
  constructor(message: string, status = 403) {
    super(message);
    this.name = "AuthzError";
    this.status = status;
  }
}

export type PortalActor = {
  userId: string;
  profileId: string;
  clubId: string | null;
  roles: string[];
  isDistrict: boolean;
  email: string | null;
};

function pickActorProfile<T extends { club_id: string | null; member_roles?: { role: string }[] | null }>(
  rows: T[]
): T | null {
  if (!rows.length) return null;
  const district = rows.find((r) =>
    (r.member_roles || []).some((roleRow) => isDistrictRole(roleRow.role))
  );
  if (district) return district;
  return rows.find((r) => r.club_id) || rows[0];
}

async function withRoles<T extends { id: string }>(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  rows: T[]
): Promise<(T & { member_roles: { role: string }[] })[]> {
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const { data: roleRows } = await supabase
    .from("member_roles")
    .select("member_id, role")
    .in("member_id", ids)
    .is("deleted_at", null);
  const byMember = new Map<string, { role: string }[]>();
  for (const row of roleRows || []) {
    const list = byMember.get(row.member_id) || [];
    list.push({ role: row.role });
    byMember.set(row.member_id, list);
  }
  return rows.map((row) => ({
    ...row,
    member_roles: byMember.get(row.id) || [],
  }));
}

export async function getPortalActor(): Promise<PortalActor | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const supabase = await createServerSupabaseClient();
  const user = await currentUser();
  const emails = emailsForProfileLink(
    (user?.emailAddresses || []).map((e) => e.emailAddress).filter(Boolean)
  );

  let profile: { id: string; club_id: string | null; email?: string | null; auth_id?: string | null; member_roles?: { role: string }[] } | null = null;

  const { data: byAuthRows } = await supabase
    .from("member_profiles")
    .select("id, club_id, email, auth_id")
    .eq("auth_id", userId)
    .is("deleted_at", null);

  profile = pickActorProfile(await withRoles(supabase, byAuthRows || []));

  if (!profile && emails.length > 0) {
    const emailFilter = emails
      .map((e) => `email.ilike."${e.replace(/"/g, "")}"`)
      .join(",");
    const { data: byEmailRows } = await supabase
      .from("member_profiles")
      .select("id, club_id, auth_id, email")
      .or(emailFilter)
      .is("deleted_at", null)
      .limit(10);

    const byEmail = pickActorProfile(await withRoles(supabase, byEmailRows || []));

    if (byEmail) {
      profile = byEmail;
      if (byEmail.auth_id !== userId) {
        await supabase
          .from("member_profiles")
          .update({ auth_id: userId })
          .eq("id", byEmail.id);
      }
    }
  }

  if (!profile) return null;

  const { data: roleRows } = await supabase
    .from("member_roles")
    .select("role, club_id")
    .eq("member_id", profile.id)
    .is("deleted_at", null);

  const roles = (roleRows || []).map((r) => r.role);
  const roleClubId = (roleRows || []).find((r) => r.club_id)?.club_id || null;

  return {
    userId,
    profileId: profile.id,
    clubId: profile.club_id || roleClubId,
    roles,
    isDistrict: roles.some(isDistrictRole),
    email: emails[0] || null,
  };
}

export async function requirePortalActor(): Promise<PortalActor> {
  const actor = await getPortalActor();
  if (!actor) {
    throw new AuthzError("You must be signed in to continue.", 401);
  }
  return actor;
}

export async function requireAdminActor(): Promise<PortalActor> {
  const actor = await requirePortalActor();
  if (!actor.isDistrict) {
    throw new AuthzError("Admin access required.", 403);
  }
  return actor;
}

export function assertCanAccessClubRecord(
  actor: PortalActor,
  recordClubId: string | null | undefined
) {
  if (actor.isDistrict) return;
  if (!actor.clubId) {
    throw new AuthzError("You are not assigned to a club.");
  }
  if (!recordClubId || recordClubId !== actor.clubId) {
    throw new AuthzError("You can only access reports for your own club.");
  }
}

export function scopedClubId(actor: PortalActor): string | undefined {
  if (actor.isDistrict) return undefined;
  return actor.clubId || undefined;
}

export function jsonAuthzError(err: unknown) {
  if (err instanceof AuthzError) {
    return { body: { error: err.message }, status: err.status };
  }
  return null;
}
