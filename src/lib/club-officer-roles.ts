import { generateSupabaseJWT } from "@/lib/jwt";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Club offices that must be unique per club. */
export const UNIQUE_CLUB_OFFICER_ROLES = new Set(["President", "Secretary"]);

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

/**
 * Finds another active President/Secretary for the same club (if any).
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
      name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Another member",
      email: profile.email || null,
    };
  }
  return null;
}

/** Throws if this club already has someone in President/Secretary. */
export async function assertUniqueClubOfficerRole(
  clubId: string | null | undefined,
  role: string,
  excludeMemberId?: string | null
) {
  if (!clubId || !isUniqueClubOfficerRole(role)) return;

  const existing = await findExistingClubOfficer(clubId, role, excludeMemberId);
  if (!existing) return;

  const who = existing.email ? `${existing.name} (${existing.email})` : existing.name;
  throw new Error(
    `This club already has a ${role}: ${who}. Change or remove that person first — each club may only have one ${role}.`
  );
}
