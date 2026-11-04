import { clerkClient } from "@clerk/nextjs/server";
import { generateSupabaseJWT } from "@/lib/jwt";
import { clerkInviteRedirectUrl } from "@/lib/app-url";
import { assertUniqueClubOfficerRole } from "@/lib/club-officer-roles";
import { canonicalizeZone } from "@/lib/zones";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function supabaseFetch(path: string, options: RequestInit = {}) {
  const bearerToken = await generateSupabaseJWT("service_role");
  const res = await fetch(`${supabaseUrl}/rest/v1${path}`, {
    ...options,
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${bearerToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Supabase error (${res.status}): ${errorText}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export type InvitePortalUserInput = {
  name: string;
  email: string;
  phone?: string | null;
  clubId?: string | null;
  role: string;
  zone?: string | null;
  actorId?: string | null;
};

export type InvitePortalUserResult = {
  profileId: string;
  email: string;
  role: string;
  inviteSent: boolean;
  inviteWarning: string | null;
};

function clerkErrorMessage(err: unknown): string {
  const anyErr = err as { errors?: { message?: string }[]; message?: string };
  return anyErr?.errors?.[0]?.message || anyErr?.message || String(err);
}

/** Creates/revives the district profile first, then best-effort sends a Clerk invite email. */
export async function invitePortalUser(input: InvitePortalUserInput): Promise<InvitePortalUserResult> {
  const name = String(input.name || "").trim();
  const email = String(input.email || "").trim().toLowerCase();
  const role = String(input.role || "").trim();
  const phone = String(input.phone || "").trim();
  const clubId = input.clubId || null;

  if (!name || !email || !role) {
    throw new Error("Name, email, and role are required to invite a club official.");
  }

  const assignedZone = String(role).toLowerCase() === "zrr" ? canonicalizeZone(input.zone) : null;
  if (String(role).toLowerCase() === "zrr" && !assignedZone) {
    throw new Error(
      "ZRR invites require a zone (Arnava, Pravaha, Taranga, Varuna, Sagara, or Samudhra)."
    );
  }

  // 1) Provision / revive district profile BEFORE Clerk — otherwise an existing Clerk
  //    account (common after re-invites) aborts the whole flow and leaves no access.
  const existingProfiles = await supabaseFetch(
    `/member_profiles?email=ilike.${encodeURIComponent(email)}&select=id,club_id,deleted_at,auth_id&limit=1`
  );
  let profileId = existingProfiles && existingProfiles.length > 0 ? existingProfiles[0].id : null;

  if (!profileId) {
    const names = name.split(/\s+/);
    const firstName = names[0] || "Invited";
    const lastName = names.slice(1).join(" ") || "User";

    const newProfiles = await supabaseFetch("/member_profiles", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        email,
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        club_id: clubId,
        auth_id: `pending_${email}`,
      }),
    });

    if (!newProfiles || newProfiles.length === 0) {
      throw new Error("Failed to create member profile");
    }
    profileId = newProfiles[0].id;
  } else {
    const patch: Record<string, unknown> = {
      deleted_at: null,
      email,
    };
    if (clubId) patch.club_id = clubId;
    if (phone) patch.phone = phone;
    const authId = existingProfiles[0].auth_id;
    // Keep a real Clerk user id; only reset placeholder pending_* links.
    if (!authId || String(authId).startsWith("pending_")) {
      patch.auth_id = `pending_${email}`;
    }
    await supabaseFetch(`/member_profiles?id=eq.${profileId}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  }

  const existingRolesRaw = await supabaseFetch(
    `/member_roles?member_id=eq.${profileId}&role=eq.${encodeURIComponent(role)}&select=id,club_id,deleted_at`
  );
  const existingRoles = Array.isArray(existingRolesRaw)
    ? [...existingRolesRaw].sort((a, b) => Number(!!a.deleted_at) - Number(!!b.deleted_at))
    : [];
  if (existingRoles.length === 0) {
    await assertUniqueClubOfficerRole(clubId, role, profileId);
    await supabaseFetch("/member_roles", {
      method: "POST",
      body: JSON.stringify({
        member_id: profileId,
        role,
        club_id: clubId,
        zone: assignedZone,
      }),
    });
  } else {
    const patch: Record<string, unknown> = { deleted_at: null };
    if (assignedZone) patch.zone = assignedZone;
    if (clubId) patch.club_id = clubId;
    await supabaseFetch(`/member_roles?id=eq.${existingRoles[0].id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  }

  // 2) Clerk invite is best-effort. Existing Clerk users cannot get a new invitation email —
  //    they should simply sign in; their profile is already linked/ready above.
  let inviteSent = false;
  let inviteWarning: string | null = null;
  try {
    const client = await clerkClient();
    await client.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: clerkInviteRedirectUrl(),
      ignoreExisting: true,
    });
    inviteSent = true;
  } catch (err) {
    inviteWarning = clerkErrorMessage(err);
    console.error("Clerk invite failed (district profile still provisioned):", inviteWarning);
  }

  try {
    await supabaseFetch("/audit_logs", {
      method: "POST",
      body: JSON.stringify({
        actor_id: input.actorId || null,
        action: "INVITE_USER",
        table_name: "member_profiles",
        record_id: profileId,
        old_data: null,
        new_data: JSON.stringify({ email, role, clubId, inviteSent, inviteWarning }),
      }),
    });
  } catch (err) {
    console.error("invitePortalUser audit log failed:", err);
  }

  return { profileId, email, role, inviteSent, inviteWarning };
}
