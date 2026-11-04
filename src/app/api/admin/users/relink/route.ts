import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { generateSupabaseJWT } from "@/lib/jwt";
import { clerkInviteRedirectUrl } from "@/lib/app-url";
import { jsonAuthzError, requireAdminActor } from "@/lib/portal-auth";

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
    throw new Error(`Supabase error (${res.status}): ${await res.text()}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/**
 * Clears a stale Clerk auth_id and re-sends the invite so the person can sign in again
 * with the email stored on their district profile.
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdminActor();
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    }

    const rows = await supabaseFetch(
      `/member_profiles?id=eq.${id}&select=id,email,first_name,last_name,deleted_at`
    );
    const profile = Array.isArray(rows) ? rows[0] : null;
    if (!profile?.email) {
      return NextResponse.json({ error: "User not found or has no email." }, { status: 404 });
    }

    const email = String(profile.email).trim().toLowerCase();
    await supabaseFetch(`/member_profiles?id=eq.${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        auth_id: `pending_${email}`,
        email,
        deleted_at: null,
      }),
    });

    const client = await clerkClient();
    await client.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: clerkInviteRedirectUrl(),
      ignoreExisting: true,
    });

    return NextResponse.json({
      success: true,
      email,
      message: `Invite re-sent to ${email}. Ask them to open the email and sign in with that exact address.`,
    });
  } catch (err: any) {
    const authz = jsonAuthzError(err);
    if (authz) return NextResponse.json(authz.body, { status: authz.status });
    console.error("POST /api/admin/users/relink error:", err);
    return NextResponse.json({ error: err.message || "Failed to relink user" }, { status: 500 });
  }
}
