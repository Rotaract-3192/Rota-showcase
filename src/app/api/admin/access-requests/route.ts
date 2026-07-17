import { NextRequest, NextResponse } from 'next/server';
import { generateSupabaseJWT } from '@/lib/jwt';
import { clerkClient } from '@clerk/nextjs/server';

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

  // Handle representation returns
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function GET() {
  try {
    const requests = await supabaseFetch(
      '/access_requests?status=eq.PENDING&deleted_at=is.null&select=id,full_name,email,phone,requested_role,created_at,status,club_id,clubs(name)'
    );

    if (Array.isArray(requests) && requests.length > 0) {
      const emails = requests.map((r: any) => r.email.toLowerCase().trim()).filter(Boolean);
      
      if (emails.length > 0) {
        // Query the directory for matching emails
        const queryEmails = emails.map((e: string) => encodeURIComponent(e)).join(',');
        const matchedLeaders = await supabaseFetch(
          `/club_leaders_directory?email=in.(${queryEmails})&select=*`
        );

        const matchedMap = new Map();
        if (Array.isArray(matchedLeaders)) {
          matchedLeaders.forEach((leader: any) => {
            matchedMap.set(leader.email.toLowerCase().trim(), leader);
          });
        }

        // Merge matching leaders into request objects
        const enhancedRequests = requests.map((r: any) => {
          const match = matchedMap.get(r.email.toLowerCase().trim());
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
      }
    }

    return NextResponse.json(requests);
  } catch (err: any) {
    console.error('GET /api/admin/access-requests error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { requestId, action } = await req.json();

    if (!requestId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (action !== 'Approved' && action !== 'Rejected') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // 1. Fetch access request details
    const requests = await supabaseFetch(`/access_requests?id=eq.${requestId}&select=*`);
    if (!requests || requests.length === 0) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }
    const request = requests[0];

    if (action === 'Approved') {
      // 2. Create Clerk Invitation
      const client = await clerkClient();
      await client.invitations.createInvitation({
        emailAddress: request.email,
        redirectUrl: `${req.nextUrl.origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/sign-in`,
        ignoreExisting: true
      });

      // 3. Check if profile with email exists
      const existingProfiles = await supabaseFetch(`/member_profiles?email=eq.${request.email}&select=id`);
      let profileId = existingProfiles && existingProfiles.length > 0 ? existingProfiles[0].id : null;

      if (!profileId) {
        // Create new profile with pending auth_id
        const names = request.full_name.trim().split(/\s+/);
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

      // 4. Add role in member_roles
      await supabaseFetch('/member_roles', {
        method: 'POST',
        body: JSON.stringify({
          member_id: profileId,
          role: request.requested_role,
          club_id: request.club_id
        })
      });
    }

    // 5. Update status in access_requests
    const newStatus = action === 'Approved' ? 'APPROVED' : 'REJECTED';
    await supabaseFetch(`/access_requests?id=eq.${requestId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    });

    // 6. Log action in audit_logs
    const actorId = '5057e100-0000-4000-8000-000000000001'; // Default system actor ID
    await supabaseFetch('/audit_logs', {
      method: 'POST',
      body: JSON.stringify({
        actor_id: actorId,
        action: action === 'Approved' ? 'APPROVE_ACCESS' : 'REJECT_ACCESS',
        table_name: 'access_requests',
        record_id: requestId,
        old_data: JSON.stringify({ status: 'PENDING' }),
        new_data: JSON.stringify({ status: newStatus, user_email: request.email, role: request.requested_role })
      })
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('POST /api/admin/access-requests error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
