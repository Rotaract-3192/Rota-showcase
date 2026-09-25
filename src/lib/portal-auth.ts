import { auth, currentUser } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { emailsForProfileLink } from "@/lib/clerk-emails";
import { isDistrictRole } from "@/lib/member-sync";
import { canonicalizeZone, isDistrictWideAdminRole, isPrTeamRole, isZrrRole } from "@/lib/zones";

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
  isDistrictWide: boolean;
  isZrr: boolean;
  isPrTeam: boolean;
  zone: string | null;
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
    .select("role, club_id, zone")
    .eq("member_id", profile.id)
    .is("deleted_at", null);

  const roles = (roleRows || []).map((r) => r.role);
  const roleClubId = (roleRows || []).find((r) => r.club_id)?.club_id || null;
  // ZRR scope is only member_roles.zone (the zone they oversee). Never derive it from home club.
  const zrrZone = canonicalizeZone((roleRows || []).find((r) => isZrrRole(r.role))?.zone);
  const isDistrictWide = roles.some(isDistrictWideAdminRole);
  const isZrr = roles.some(isZrrRole);
  const isPrTeam = roles.some(isPrTeamRole);

  return {
    userId,
    profileId: profile.id,
    clubId: profile.club_id || roleClubId,
    roles,
    isDistrict: isDistrictWide || isZrr || isPrTeam,
    isDistrictWide,
    isZrr,
    isPrTeam,
    zone: isZrr ? zrrZone : null,
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

/** Full Mission Control (DRS / District Admin / Super Admin / ZRR). Not PR Team. */
export async function requireAdminActor(): Promise<PortalActor> {
  const actor = await requirePortalActor();
  if (actor.isPrTeam && !actor.isDistrictWide && !actor.isZrr) {
    throw new AuthzError("Full admin access required. PR Team can only use Publications.", 403);
  }
  if (!actor.isDistrict) {
    throw new AuthzError("Admin access required.", 403);
  }
  return actor;
}

/** Publications & bulletins readers: district admins, ZRR, and PR Team. */
export async function requirePublicationsReader(): Promise<PortalActor> {
  const actor = await requirePortalActor();
  if (!actor.isDistrict) {
    throw new AuthzError("Publications access required.", 403);
  }
  return actor;
}

async function clubZoneFor(clubId: string | null | undefined): Promise<string | null> {
  if (!clubId) return null;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("clubs")
    .select("zone")
    .eq("id", clubId)
    .is("deleted_at", null)
    .maybeSingle();
  return canonicalizeZone(data?.zone);
}

export async function assertCanAccessClubRecord(
  actor: PortalActor,
  recordClubId: string | null | undefined
) {
  if (actor.isDistrictWide) return;
  if (actor.isZrr) {
    if (!actor.zone) {
      throw new AuthzError("Your ZRR account has no zone assigned. Ask a district admin to set it on member_roles.");
    }
    const zone = await clubZoneFor(recordClubId);
    if (!zone || zone !== actor.zone) {
      throw new AuthzError("You can only access clubs in your assigned zone.");
    }
    return;
  }
  if (!actor.clubId) {
    throw new AuthzError("You are not assigned to a club.");
  }
  if (!recordClubId || recordClubId !== actor.clubId) {
    throw new AuthzError("You can only access reports for your own club.");
  }
}

export async function applyWriteClubScope<T extends { club_id?: string | null }>(
  actor: PortalActor,
  payload: T
): Promise<T> {
  if (actor.isDistrictWide) {
    if (!payload.club_id) {
      throw new AuthzError("Club is required to save this report.");
    }
    return payload;
  }
  if (actor.isZrr) {
    const clubId = payload.club_id || actor.clubId;
    if (!clubId) {
      throw new AuthzError("Select a club in your zone to save this report.");
    }
    await assertCanAccessClubRecord(actor, clubId);
    return { ...payload, club_id: clubId };
  }
  if (!actor.clubId) {
    throw new AuthzError("You must be assigned to a club to submit reports.");
  }
  return { ...payload, club_id: actor.clubId };
}

export function scopedClubId(actor: PortalActor): string | undefined {
  if (actor.isDistrictWide || actor.isZrr) return undefined;
  return actor.clubId || undefined;
}

export function scopedZone(actor: PortalActor): string | undefined {
  if (actor.isZrr && actor.zone) return actor.zone;
  return undefined;
}

export async function clubIdsInZone(zone: string): Promise<string[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("clubs")
    .select("id, zone")
    .is("deleted_at", null);
  return (data || [])
    .filter((club) => canonicalizeZone(club.zone) === zone)
    .map((club) => club.id);
}

export async function scopedClubIds(actor: PortalActor): Promise<string[] | undefined> {
  if (actor.isDistrictWide) return undefined;
  if (actor.isZrr) {
    if (!actor.zone) return [];
    return clubIdsInZone(actor.zone);
  }
  return actor.clubId ? [actor.clubId] : [];
}

export async function resolveAdminZoneFilter(requestedZone?: string | null) {
  const actor = await requireAdminActor();
  if (actor.isDistrictWide) {
    return { actor, filterZone: canonicalizeZone(requestedZone) };
  }
  if (!actor.zone) {
    throw new AuthzError(
      "Your ZRR account has no zone assigned. Ask a district admin to set member_roles.zone to Arnava, Pravaha, Taranga, Varuna, Sagara, or Samudhra.",
      403
    );
  }
  return { actor, filterZone: actor.zone };
}

/** Zone filter for Publications readers (includes PR Team as district-wide read). */
export async function resolvePublicationsZoneFilter(requestedZone?: string | null) {
  const actor = await requirePublicationsReader();
  if (actor.isDistrictWide || actor.isPrTeam) {
    return { actor, filterZone: canonicalizeZone(requestedZone) };
  }
  if (!actor.zone) {
    throw new AuthzError(
      "Your ZRR account has no zone assigned. Ask a district admin to set member_roles.zone.",
      403
    );
  }
  return { actor, filterZone: actor.zone };
}

export function jsonAuthzError(err: unknown) {
  if (err instanceof AuthzError) {
    return { body: { error: err.message }, status: err.status };
  }
  return null;
}
