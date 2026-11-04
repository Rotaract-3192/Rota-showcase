import { generateSupabaseJWT } from "@/lib/jwt";
import { canonicalizeZone, isZrrRole } from "@/lib/zones";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Exactly one of these roles per club. */
export const UNIQUE_CLUB_OFFICER_ROLES = new Set(["President", "Vice President"]);

/** Secretaries may be several; soft-cap keeps boards tidy. */
export const MAX_SECRETARIES_PER_CLUB = 3;

/** ZRRs are district-wide by zone, not by club. */
export const MAX_ZRRS_PER_ZONE = 2;

export function isUniqueClubOfficerRole(role: string) {
  return UNIQUE_CLUB_OFFICER_ROLES.has(String(role || "").trim());
}

async function supabaseFetch(path: string) {
  const bearerToken = await generateSupabaseJWT("service_role");
  const res = await fetch(`${supabaseUrl}/rest/v1${path}`, {
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${bearerToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Supabase error (${res.status}): ${await res.text()}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export type ExistingClubOfficer = {
  roleId: string;
  memberId: string;
  name: string;
  email: string | null;
};

function displayName(profile: any) {
  return `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "Another member";
}

/**
 * Finds another active unique officer (President / Vice President) for the same club.
 * Matches role.club_id or the member's home club_id when role.club_id is empty.
 */
export async function findExistingClubOfficer(
  clubId: string,
  role: string,
  excludeMemberId?: string | null
): Promise<ExistingClubOfficer | null> {
  if (!clubId || !isUniqueClubOfficerRole(role)) return null;

  const rows = await supabaseFetch(
    `/member_roles?role=eq.${encodeURIComponent(role)}&deleted_at=is.null` +
      `&select=id,member_id,club_id,member_profiles(id,first_name,last_name,email,club_id,deleted_at)`
  );
  if (!Array.isArray(rows)) return null;

  for (const row of rows) {
    const profile = row.member_profiles;
    if (!profile || profile.deleted_at) continue;
    if (excludeMemberId && row.member_id === excludeMemberId) continue;

    const scopedClub = row.club_id || profile.club_id;
    if (scopedClub !== clubId) continue;

    return {
      roleId: row.id,
      memberId: row.member_id,
      name: displayName(profile),
      email: profile.email || null,
    };
  }
  return null;
}

async function countSecretariesInClub(clubId: string, excludeMemberId?: string | null) {
  const rows = await supabaseFetch(
    `/member_roles?role=eq.Secretary&deleted_at=is.null` +
      `&select=id,member_id,club_id,member_profiles(id,club_id,deleted_at,first_name,last_name,email)`
  );
  if (!Array.isArray(rows)) return { count: 0, holders: [] as ExistingClubOfficer[] };

  const holders: ExistingClubOfficer[] = [];
  for (const row of rows) {
    const profile = row.member_profiles;
    if (!profile || profile.deleted_at) continue;
    if (excludeMemberId && row.member_id === excludeMemberId) continue;
    const scopedClub = row.club_id || profile.club_id;
    if (scopedClub !== clubId) continue;
    holders.push({
      roleId: row.id,
      memberId: row.member_id,
      name: displayName(profile),
      email: profile.email || null,
    });
  }
  return { count: holders.length, holders };
}

async function countZrrsInZone(zone: string, excludeMemberId?: string | null) {
  const rows = await supabaseFetch(
    `/member_roles?role=eq.ZRR&deleted_at=is.null&zone=eq.${encodeURIComponent(zone)}` +
      `&select=id,member_id,zone,member_profiles(id,deleted_at,first_name,last_name,email)`
  );
  if (!Array.isArray(rows)) return { count: 0, holders: [] as ExistingClubOfficer[] };

  const holders: ExistingClubOfficer[] = [];
  for (const row of rows) {
    const profile = row.member_profiles;
    if (!profile || profile.deleted_at) continue;
    if (excludeMemberId && row.member_id === excludeMemberId) continue;
    holders.push({
      roleId: row.id,
      memberId: row.member_id,
      name: displayName(profile),
      email: profile.email || null,
    });
  }
  return { count: holders.length, holders };
}

/** Throws if assigning this role would break district limits. */
export async function assertRoleAssignmentLimits(options: {
  role: string;
  clubId?: string | null;
  zone?: string | null;
  excludeMemberId?: string | null;
}) {
  const role = String(options.role || "").trim();
  const clubId = options.clubId || null;
  const excludeMemberId = options.excludeMemberId || null;

  if (isUniqueClubOfficerRole(role)) {
    if (!clubId) {
      throw new Error(`${role} requires a club affiliation.`);
    }
    const existing = await findExistingClubOfficer(clubId, role, excludeMemberId);
    if (existing) {
      const who = existing.email ? `${existing.name} (${existing.email})` : existing.name;
      throw new Error(
        `This club already has a ${role}: ${who}. Change or remove that person first — each club may only have one ${role}.`
      );
    }
    return;
  }

  if (role === "Secretary") {
    if (!clubId) {
      throw new Error("Secretary requires a club affiliation.");
    }
    const { count, holders } = await countSecretariesInClub(clubId, excludeMemberId);
    if (count >= MAX_SECRETARIES_PER_CLUB) {
      const names = holders
        .slice(0, 3)
        .map((h) => (h.email ? `${h.name} (${h.email})` : h.name))
        .join(", ");
      throw new Error(
        `This club already has ${count} Secretaries (${names}). Max ${MAX_SECRETARIES_PER_CLUB} Secretaries per club.`
      );
    }
    return;
  }

  if (isZrrRole(role)) {
    const zone = canonicalizeZone(options.zone);
    if (!zone) {
      throw new Error(
        "ZRR requires a zone (Arnava, Pravaha, Taranga, Varuna, Sagara, or Samudhra)."
      );
    }
    const { count, holders } = await countZrrsInZone(zone, excludeMemberId);
    if (count >= MAX_ZRRS_PER_ZONE) {
      const names = holders
        .map((h) => (h.email ? `${h.name} (${h.email})` : h.name))
        .join(", ");
      throw new Error(
        `${zone} already has ${count} ZRRs (${names}). Max ${MAX_ZRRS_PER_ZONE} ZRRs per zone.`
      );
    }
  }

  // DRS / District Admin / Super Admin / PR Team — no numeric cap.
}

/** @deprecated Use assertRoleAssignmentLimits */
export async function assertUniqueClubOfficerRole(
  clubId: string | null | undefined,
  role: string,
  excludeMemberId?: string | null
) {
  await assertRoleAssignmentLimits({ role, clubId, excludeMemberId });
}
