import { NextRequest, NextResponse } from 'next/server';
import { generateSupabaseJWT } from '@/lib/jwt';
import { clerkClient } from '@clerk/nextjs/server';
import { jsonAuthzError, requireAdminActor } from '@/lib/portal-auth';
import { publicSignInUrl } from '@/lib/app-url';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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

export async function GET() {
  try {
    await requireAdminActor();
    const requests = await supabaseFetch(
      '/access_requests?status=eq.PENDING&deleted_at=is.null&select=id,full_name,email,phone,requested_role,created_at,status,club_id,zone,clubs(name)'
    );

    if (!Array.isArray(requests) || requests.length === 0) {
      return NextResponse.json(requests || []);
    }

    const emails = requests.map((r: any) => r.email?.toLowerCase().trim()).filter(Boolean);

    let matchedMap = new Map();
    if (emails.length > 0) {
      try {
        const queryEmails = emails.map((e: string) => encodeURIComponent(e)).join(',');
        const matchedLeaders = await supabaseFetch(
          `/club_leaders_directory?email=in.(${queryEmails})&select=*`
        );
        if (Array.isArray(matchedLeaders)) {
          matchedLeaders.forEach((leader: any) => {
            matchedMap.set(leader.email.toLowerCase().trim(), leader);
          });
        }
      } catch (dirErr) {
        console.error('club_leaders_directory lookup failed:', dirErr);
      }
    }

    const enhancedRequests = requests.map((r: any) => {
      const match = matchedMap.get(r.email?.toLowerCase().trim());
      return {
        ...r,
        verifiedLeader: match ? {
          name: match.name,
          designation: match.designation,
          club_name: match.club_name
        } : null
      };
    });

    return NextResponse.json(enhancedRequests);
  } catch (err: any) {
    const authz = jsonAuthzError(err);
    if (authz) return NextResponse.json(authz.body, { status: authz.status });
    console.error('GET /api/admin/access-requests error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await requireAdminActor();

    const { requestId, action } = await req.json();

    if (!requestId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (action !== 'Approved' && action !== 'Rejected') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const requests = await supabaseFetch(`/access_requests?id=eq.${requestId}&select=*`);
    if (!requests || requests.length === 0) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }
    const request = requests[0];

    if (action === 'Approved') {
      const client = await clerkClient();
      try {
        await client.invitations.createInvitation({
          emailAddress: request.email,
          redirectUrl: publicSignInUrl(req),
          ignoreExisting: true
        });
      } catch (inviteErr: any) {
        console.error('Clerk invitation failed (continuing approval):', inviteErr);
      }

      const existingProfiles = await supabaseFetch(`/member_profiles?email=eq.${encodeURIComponent(request.email)}&select=id`);
      let profileId = existingProfiles && existingProfiles.length > 0 ? existingProfiles[0].id : null;

      if (!profileId) {
        const names = String(request.full_name || '').trim().split(/\s+/);
        const firstName = names[0] || '';
        const lastName = names.slice(1).join(' ') || '';

        const newProfiles = await supabaseFetch('/member_profiles', {
          method: 'POST',
          headers: { 'Prefer': 'return=representation' },
          body: JSON.stringify({
            email: request.email,
            first_name: firstName,
            last_name: lastName,
            phone: request.phone,
            club_id: request.club_id,
            auth_id: `pending_${request.email}`
          })
        });

        if (!newProfiles || newProfiles.length === 0) {
          throw new Error('Failed to create member profile');
        }
        profileId = newProfiles[0].id;
      }

      const existingRoles = await supabaseFetch(
        `/member_roles?member_id=eq.${profileId}&role=eq.${encodeURIComponent(request.requested_role)}&select=id`
      );
      if (!existingRoles || existingRoles.length === 0) {
        await supabaseFetch('/member_roles', {
          method: 'POST',
          body: JSON.stringify({
            member_id: profileId,
            role: request.requested_role,
            club_id: request.club_id,
            zone: request.zone || null
          })
        });
      }

      try {
        await supabaseFetch('/notifications', {
          method: 'POST',
          body: JSON.stringify({
            user_id: profileId,
            title: 'Access Request Approved',
            message: `Your request for the role ${request.requested_role} has been approved. Welcome to the portal!`,
            link: '/portal',
            is_read: false
          })
        });
      } catch (notifyErr) {
        console.error('Notification insert failed (continuing approval):', notifyErr);
      }
    }

    const newStatus = action === 'Approved' ? 'APPROVED' : 'REJECTED';
    await supabaseFetch(`/access_requests?id=eq.${requestId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    });

    try {
      await supabaseFetch('/audit_logs', {
        method: 'POST',
        body: JSON.stringify({
          actor_id: actor.profileId,
          action: action === 'Approved' ? 'APPROVE_ACCESS' : 'REJECT_ACCESS',
          table_name: 'access_requests',
          record_id: requestId,
          old_data: JSON.stringify({ status: 'PENDING' }),
          new_data: JSON.stringify({ status: newStatus, user_email: request.email, role: request.requested_role })
        })
      });
    } catch (auditErr) {
      console.error('Audit log insert failed:', auditErr);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    const authz = jsonAuthzError(err);
    if (authz) return NextResponse.json(authz.body, { status: authz.status });
    console.error('POST /api/admin/access-requests error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
