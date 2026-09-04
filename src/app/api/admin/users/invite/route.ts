import { NextRequest, NextResponse } from 'next/server';
import { generateSupabaseJWT } from '@/lib/jwt';
import { clerkClient } from '@clerk/nextjs/server';
import { publicSignInUrl } from '@/lib/app-url';
import { jsonAuthzError, requireAdminActor } from '@/lib/portal-auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Helper to call Supabase REST API
async function supabaseFetch(path: string, options: RequestInit = {}) {
  const bearerToken = await generateSupabaseJWT('service_role');
  const headers = {
    'apikey': apiKey,
    'Authorization': `Bearer ${bearerToken}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const res = await fetch(`${supabaseUrl}/rest/v1${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Supabase error (${res.status}): ${errorText}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function POST(req: NextRequest) {
  try {
    const actor = await requireAdminActor();
    const actorId = actor.profileId;

    const { name, email, phone, clubId, role } = await req.json();

    if (!name || !email || !role) {
      return NextResponse.json({ error: 'Missing required fields (name, email, role)' }, { status: 400 });
    }

    // 1. Create Clerk Invitation
    // When switching to Clerk Production environment, Clerk automatically sends a real email to the invitee.
    const client = await clerkClient();
    await client.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: publicSignInUrl(req),
      ignoreExisting: true
    });

    // 2. Check if a profile with the email already exists in Supabase
    const existingProfiles = await supabaseFetch(`/member_profiles?email=eq.${encodeURIComponent(email)}&select=id`);
    let profileId = existingProfiles && existingProfiles.length > 0 ? existingProfiles[0].id : null;

    if (!profileId) {
      const names = name.trim().split(/\s+/);
      const firstName = names[0] || 'Invited';
      const lastName = names.slice(1).join(' ') || 'User';

      const newProfiles = await supabaseFetch('/member_profiles', {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify({
          email: email,
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
          club_id: clubId || null,
          auth_id: `pending_${email}`
        })
      });

      if (!newProfiles || newProfiles.length === 0) {
        throw new Error('Failed to create member profile');
      }
      profileId = newProfiles[0].id;
    }

    // 3. Check if user already has this role to prevent duplicate entries
    const existingRoles = await supabaseFetch(`/member_roles?member_id=eq.${profileId}&role=eq.${encodeURIComponent(role)}&select=id`);
    if (!existingRoles || existingRoles.length === 0) {
      await supabaseFetch('/member_roles', {
        method: 'POST',
        body: JSON.stringify({
          member_id: profileId,
          role: role,
          club_id: clubId || null
        })
      });
    }

    // 4. Log the admin action to audit logs
    // actorId is dynamically fetched above, or null if not found
    await supabaseFetch('/audit_logs', {
      method: 'POST',
      body: JSON.stringify({
        actor_id: actorId,
        action: 'INVITE_USER',
        table_name: 'member_profiles',
        record_id: profileId,
        old_data: null,
        new_data: JSON.stringify({ email, role, clubId })
      })
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    const authz = jsonAuthzError(err);
    if (authz) return NextResponse.json(authz.body, { status: authz.status });
    console.error('POST /api/admin/users/invite error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
