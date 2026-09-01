import { generateSupabaseJWT } from "@/lib/jwt";

const FETCH_TIMEOUT_MS = 12000;

type MemberProfileRow = {
  id: string;
  auth_id: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  club_id: string | null;
};

function restHeaders(bearerToken: string, apiKey: string) {
  return {
    apikey: apiKey,
    Authorization: `Bearer ${bearerToken}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

async function restFetch(url: string, init: RequestInit = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal, cache: "no-store" });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function getBearer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const bearerToken = await generateSupabaseJWT("service_role");
  return { supabaseUrl, apiKey, bearerToken, headers: restHeaders(bearerToken, apiKey) };
}

/**
 * Finds the member profile for a Clerk user and links auth_id when needed.
 * Never creates a new profile — missing rows must be provisioned by admins.
 */
export async function linkAndLoadMemberProfile(
  userId: string,
  emails: string[]
): Promise<MemberProfileRow | null> {
  const { supabaseUrl, headers } = await getBearer();
  const uniqueEmails = [...new Set(emails.map((e) => e.trim()).filter(Boolean))];

  const byAuth = await restFetch(
    `${supabaseUrl}/rest/v1/member_profiles?auth_id=eq.${encodeURIComponent(userId)}&select=id,auth_id,first_name,last_name,email,club_id&deleted_at=is.null`,
    { headers }
  );

  if (byAuth.ok) {
    const rows = (await byAuth.json()) as MemberProfileRow[];
    const best = pickBestProfile(rows);
    if (best) return best;
  }

  const matches: MemberProfileRow[] = [];
  for (const email of uniqueEmails) {
    const res = await restFetch(
      `${supabaseUrl}/rest/v1/member_profiles?email=ilike.${encodeURIComponent(email)}&select=id,auth_id,first_name,last_name,email,club_id&deleted_at=is.null`,
      { headers }
    );
    if (!res.ok) continue;
    const rows = (await res.json()) as MemberProfileRow[];
    matches.push(...rows);
  }

  const profile = pickBestProfile(matches);
  if (!profile) return null;

  if (profile.auth_id !== userId) {
    await restFetch(`${supabaseUrl}/rest/v1/member_profiles?id=eq.${profile.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ auth_id: userId }),
    });

    for (const email of uniqueEmails) {
      await restFetch(
        `${supabaseUrl}/rest/v1/notifications?user_id=eq.${encodeURIComponent(`pending_${email}`)}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ user_id: userId }),
        }
      );
    }
  }

  return { ...profile, auth_id: userId };
}

export async function fetchMemberRoles(memberId: string): Promise<string[]> {
  const { supabaseUrl, headers } = await getBearer();
  const res = await restFetch(
    `${supabaseUrl}/rest/v1/member_roles?member_id=eq.${memberId}&select=role&deleted_at=is.null`,
    { headers }
  );
  if (!res.ok) return [];
  const roles = await res.json();
  return Array.isArray(roles) ? roles.map((r: { role: string }) => r.role) : [];
}

export function isDistrictRole(role: string): boolean {
  return [
    "District Admin",
    "District Core Team",
    "Super Admin",
    "Admin",
    "ZRR",
    "District",
  ].includes(role);
}

function pickBestProfile(rows: MemberProfileRow[]): MemberProfileRow | null {
  if (!rows.length) return null;
  const unique = new Map<string, MemberProfileRow>();
  for (const row of rows) unique.set(row.id, row);
  const list = [...unique.values()];
  return list.find((r) => r.club_id) || list[0];
}
