import { NextRequest, NextResponse } from 'next/server';
import { generateSupabaseJWT } from '@/lib/jwt';
import { canonicalizeZone, isZrrRole } from '@/lib/zones';
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

export async function GET() {
  try {
    await requireAdminActor();
    const data = await supabaseFetch(
      '/member_profiles?select=id,first_name,last_name,email,phone,created_at,club_id,auth_id,clubs(name,zone),member_roles(role,zone,club_id)'
    );
    return NextResponse.json(data);
  } catch (err: any) {
    const authz = jsonAuthzError(err);
    if (authz) return NextResponse.json(authz.body, { status: authz.status });
    console.error('GET /api/admin/users error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdminActor();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    // This will cascade delete member_roles if foreign keys are set up, 
    // but just to be safe, we delete roles first if needed, or just let Supabase handle it if CASCADE is enabled.
    await supabaseFetch(`/member_profiles?id=eq.${id}`, { method: 'DELETE' });
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    const authz = jsonAuthzError(err);
    if (authz) return NextResponse.json(authz.body, { status: authz.status });
    console.error('DELETE /api/admin/users error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdminActor();
    const body = await req.json();
    const { id, first_name, last_name, phone, club_id, role, zone } = body;

    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const assignedZone = isZrrRole(role || '') ? canonicalizeZone(zone) : null;
    if (isZrrRole(role || '') && !assignedZone) {
      return NextResponse.json({
        error: 'ZRR accounts need an assigned zone (the zone they oversee), not their home club zone.',
      }, { status: 400 });
    }

    await supabaseFetch(`/member_profiles?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ first_name, last_name, phone, club_id }),
    });

    if (role) {
      await supabaseFetch(`/member_roles?member_id=eq.${id}`, { method: 'DELETE' });
      await supabaseFetch('/member_roles', {
        method: 'POST',
        body: JSON.stringify({
          member_id: id,
          role,
          club_id: club_id || null,
          zone: assignedZone,
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    const authz = jsonAuthzError(err);
    if (authz) return NextResponse.json(authz.body, { status: authz.status });
    console.error('PATCH /api/admin/users error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
