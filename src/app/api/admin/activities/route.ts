import { NextRequest, NextResponse } from 'next/server';
import { generateSupabaseJWT } from '@/lib/jwt';
import { currentUser } from '@clerk/nextjs/server';

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

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    // 1. Fetch member profile
    const profiles = await supabaseFetch(`/member_profiles?email=eq.${encodeURIComponent(email)}&select=id`);
    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }
    const profileId = profiles[0].id;

    // 2. Fetch roles
    const roles = await supabaseFetch(`/member_roles?member_id=eq.${profileId}&select=role,zone&deleted_at=is.null`);
    if (!roles) {
      return NextResponse.json({ error: "Failed to verify user roles" }, { status: 500 });
    }

    const zrrRole = roles.find((r: any) => r.role === 'ZRR');
    const isSuperAdmin = roles.some((r: any) =>
      ['District Admin', 'District Core Team', 'Super Admin', 'Admin'].includes(r.role)
    );

    const isAuthorized = isSuperAdmin || !!zrrRole;
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized: Admins only" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const selectedZone = searchParams.get('zone');
    const userZone = zrrRole?.zone;
    const filterZone = (!isSuperAdmin && userZone) ? userZone : selectedZone;

    let path = '/activities?select=id,title,status,created_at,type,start_time,description,venue,clubs!inner(name,zone)&deleted_at=is.null';
    if (filterZone && filterZone !== 'All') {
      path += `&clubs.zone=eq.${encodeURIComponent(filterZone)}`;
    }

    const data = await supabaseFetch(path);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('GET /api/admin/activities error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { activityId, action } = await req.json();

    if (!activityId || !action) {
      return NextResponse.json({ error: 'Missing activityId or action' }, { status: 400 });
    }

    const newStatus = action === 'Approved' ? 'PUBLISHED' : 'CANCELLED';

    // Update status in activities table
    await supabaseFetch(`/activities?id=eq.${activityId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('POST /api/admin/activities error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
